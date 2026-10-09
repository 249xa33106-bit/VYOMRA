import socket
import ipaddress
import urllib.parse
from datetime import datetime, timezone
from typing import Optional, Tuple
import httpx
from app.config import settings
from app.models.schemas import RedirectHop, Finding, SeverityLevel

def is_ip_prohibited_for_ssrf(ip_str: str) -> Tuple[bool, str]:
    """
    Strictly check if an IP address violates SSRF policy.
    Blocks: loopback, private RFC1918, link-local, cloud metadata, multicast, reserved.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return True, "Invalid IP representation"

    # Specific AWS/GCP/Azure IMDS metadata IP check
    if str(ip) in ("169.254.169.254", "fd00:ec2::254"):
        return True, "SSRF Block: Cloud Instance Metadata Service (IMDS) address"

    if ip.is_loopback:
        return True, "SSRF Block: Loopback address (127.0.0.0/8 or ::1)"
    if ip.is_link_local:
        return True, "SSRF Block: Link-local address (169.254.0.0/16 or fe80::/10)"
    if ip.is_private:
        return True, "SSRF Block: Private RFC1918 internal address space"
    if ip.is_multicast:
        return True, "SSRF Block: Multicast address (224.0.0.0/4 or ff00::/8)"
    if ip.is_reserved:
        return True, "SSRF Block: Reserved address range"

    return False, "Safe public IP"

def resolve_and_verify_destination(hostname: str, port: int) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Resolve DNS for destination host and ensure it does not resolve to a prohibited IP.
    Returns: (is_allowed, resolved_ip, denial_reason)
    """
    # Reject custom internal ports
    if port not in (80, 443, 8080, 8443):
        return False, None, f"Security Policy: Port {port} blocked. Only standard web ports permitted."

    # If hostname itself is a raw IP:
    try:
        ip_obj = ipaddress.ip_address(hostname)
        is_prohibited, reason = is_ip_prohibited_for_ssrf(str(ip_obj))
        if is_prohibited:
            return False, str(ip_obj), reason
        return True, str(ip_obj), None
    except ValueError:
        pass

    # Resolve hostname via standard DNS resolver
    try:
        addrinfo = socket.getaddrinfo(hostname, port, proto=socket.IPPROTO_TCP)
        if not addrinfo:
            return False, None, "DNS Resolution Failed: No records returned"

        for entry in addrinfo:
            resolved_ip = entry[4][0]
            is_prohibited, reason = is_ip_prohibited_for_ssrf(resolved_ip)
            if is_prohibited:
                return False, resolved_ip, f"DNS Rebinding / SSRF defense: Host resolved to prohibited address ({resolved_ip}) - {reason}"

        # Use first resolved IP
        first_ip = addrinfo[0][4][0]
        return True, first_ip, None
    except socket.gaierror as e:
        return False, None, f"DNS Resolution Error: {str(e)}"
    except Exception as e:
        return False, None, f"Resolution Error: {str(e)}"

async def follow_redirect_chain_safely(initial_url: str) -> Tuple[list[RedirectHop], list[Finding]]:
    """
    Follow redirect hops with strict SSRF re-validation at each hop.
    """
    findings: list[Finding] = []
    hops: list[RedirectHop] = []

    if not settings.allow_active_redirect_fetching:
        findings.append(Finding(
            detector_id="DET-REDIR-DISABLED-01",
            name="Active Redirect Inspection Disabled",
            severity=SeverityLevel.INFO,
            evidence="System configuration set ALLOW_ACTIVE_REDIRECT_FETCHING=false",
            rationale="Active network egress is restricted in current isolation policy. Using passive URL forensics.",
            recommended_action="Enable in trusted environments if egress scanning is required.",
            source_type="DIRECT_OBSERVATION",
            weight=0.0
        ))
        return hops, findings

    current_url = initial_url
    visited_urls = set()

    for hop_idx in range(1, settings.max_redirect_hops + 1):
        parsed = urllib.parse.urlsplit(current_url)

        # 1. Reject non-HTTP schemes
        if parsed.scheme.lower() not in ("http", "https"):
            hops.append(RedirectHop(
                hop_number=hop_idx,
                url=current_url,
                hostname=parsed.hostname or "",
                timestamp=datetime.now(timezone.utc).isoformat(),
                blocked_reason=f"Blocked scheme: '{parsed.scheme}'. Only HTTP and HTTPS allowed."
            ))
            break

        # 2. Reject credentials in authority
        if "@" in parsed.netloc:
            hops.append(RedirectHop(
                hop_number=hop_idx,
                url=current_url,
                hostname=parsed.hostname or "",
                timestamp=datetime.now(timezone.utc).isoformat(),
                blocked_reason="Embedded user credentials in URL authority rejected."
            ))
            break

        hostname = parsed.hostname or ""
        port = parsed.port or (443 if parsed.scheme.lower() == "https" else 80)

        # 3. Verify destination IP before connection
        is_safe, resolved_ip, denial_reason = resolve_and_verify_destination(hostname, port)
        if not is_safe:
            hops.append(RedirectHop(
                hop_number=hop_idx,
                url=current_url,
                hostname=hostname,
                ip=resolved_ip,
                timestamp=datetime.now(timezone.utc).isoformat(),
                blocked_reason=denial_reason
            ))
            findings.append(Finding(
                detector_id="DET-SSRF-BLOCKED-01",
                name="Security Violation: SSRF / Private Target Blocked",
                severity=SeverityLevel.CRITICAL,
                evidence=f"Redirect target '{current_url}' blocked: {denial_reason}",
                rationale="Redirect leads to restricted or internal network address, indicating an SSRF exploit attempt or internal metadata probe.",
                recommended_action="Block request and inspect source referring service.",
                source_type="DIRECT_OBSERVATION",
                weight=6.0
            ))
            break

        visited_urls.add(current_url)

        # 4. Perform single request without automatic redirect following
        try:
            async with httpx.AsyncClient(
                verify=True,
                follow_redirects=False,
                timeout=settings.redirect_timeout_seconds,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PhantomX-Security-Scanner/1.0"}
            ) as client:
                response = await client.get(current_url)
                status_code = response.status_code

                is_cross_domain = False
                if hops:
                    is_cross_domain = (hostname != hops[-1].hostname)

                hops.append(RedirectHop(
                    hop_number=hop_idx,
                    url=current_url,
                    hostname=hostname,
                    ip=resolved_ip,
                    status_code=status_code,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    is_cross_domain=is_cross_domain
                ))

                # If status code indicates redirect (301, 302, 303, 307, 308)
                if status_code in (301, 302, 303, 307, 308):
                    location = response.headers.get("location")
                    if not location:
                        break
                    # Join relative URLs
                    next_url = urllib.parse.urljoin(current_url, location)
                    if next_url in visited_urls:
                        findings.append(Finding(
                            detector_id="DET-REDIR-LOOP-01",
                            name="Redirect Loop Detected",
                            severity=SeverityLevel.MEDIUM,
                            evidence=f"URL redirected back to previously visited URL: {next_url}",
                            rationale="Circular redirect loops are sometimes used to stall security automated crawlers.",
                            recommended_action="Cease automated crawling on target.",
                            source_type="DIRECT_OBSERVATION",
                            weight=2.0
                        ))
                        break
                    current_url = next_url
                else:
                    # Final destination reached
                    break

        except (httpx.ConnectTimeout, httpx.ReadTimeout):
            hops.append(RedirectHop(
                hop_number=hop_idx,
                url=current_url,
                hostname=hostname,
                ip=resolved_ip,
                timestamp=datetime.now(timezone.utc).isoformat(),
                blocked_reason="Connection timed out."
            ))
            break
        except httpx.ConnectError as e:
            hops.append(RedirectHop(
                hop_number=hop_idx,
                url=current_url,
                hostname=hostname,
                ip=resolved_ip,
                timestamp=datetime.now(timezone.utc).isoformat(),
                blocked_reason=f"Connection error: Host unreachable ({str(e)[:100]})"
            ))
            break
        except Exception as e:
            hops.append(RedirectHop(
                hop_number=hop_idx,
                url=current_url,
                hostname=hostname,
                ip=resolved_ip,
                timestamp=datetime.now(timezone.utc).isoformat(),
                blocked_reason=f"Analysis halted: {str(e)[:100]}"
            ))
            break

    # Analyze redirect chain characteristics
    if len(hops) > 1:
        cross_domain_hops = [h for h in hops if h.is_cross_domain]
        if cross_domain_hops:
            findings.append(Finding(
                detector_id="DET-REDIR-CROSS-01",
                name=f"Cross-Domain Redirect Chain ({len(cross_domain_hops)} boundary crossings)",
                severity=SeverityLevel.HIGH if len(cross_domain_hops) >= 2 else SeverityLevel.MEDIUM,
                evidence=f"Redirect hopped across {len(cross_domain_hops)} different domain boundaries: from '{hops[0].hostname}' to '{hops[-1].hostname}'",
                rationale="Multi-hop cross-domain redirects are a primary evasion technique used by phishing campaigns to bypass static link reputation filters.",
                recommended_action="Inspect intermediate forwarding services and destination domain ownership.",
                source_type="DIRECT_OBSERVATION",
                weight=3.5
            ))

    return hops, findings
