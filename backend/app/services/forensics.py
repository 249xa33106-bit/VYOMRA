import re
import math
import ipaddress
import urllib.parse
from typing import Optional, Tuple
import tldextract

from app.models.schemas import Finding, SeverityLevel, UrlComponents

# Sensitive query parameters to redact
SENSITIVE_PARAM_NAMES = {
    "password", "pass", "pwd", "token", "access_token", "auth", 
    "api_key", "apikey", "secret", "session", "session_id", "jwt", "ssn", "pin"
}

# Suspicious executable extensions
EXECUTABLE_EXTENSIONS = {
    ".exe", ".scr", ".bat", ".cmd", ".vbs", ".vbe", ".js", ".jse", 
    ".wsf", ".wsh", ".ps1", ".iso", ".img", ".apk", ".dmg", ".jar", ".hta", ".msi"
}

# Suspicious redirect parameter names
REDIRECT_PARAM_NAMES = {
    "url", "redirect", "redirect_url", "redirect_uri", "dest", "destination",
    "next", "target", "return", "return_to", "return_url", "goto", "link", "r", "u"
}

# Common Unicode confusables (Cyrillic, Greek, lookalikes)
CONFUSABLE_MAP = {
    'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y', 'і': 'i',
    'ј': 'j', 'ѕ': 's', 'ԁ': 'd', 'ԛ': 'q', 'ԝ': 'w',
    'α': 'a', 'β': 'b', 'γ': 'y', 'ε': 'e', 'ι': 'i', 'κ': 'k', 'ν': 'v', 'ο': 'o', 'ρ': 'p', 'τ': 't'
}

def calculate_shannon_entropy(data: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not data:
        return 0.0
    entropy = 0.0
    length = len(data)
    frequencies = {c: data.count(c) for c in set(data)}
    for count in frequencies.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 3)

def normalize_and_parse_url(raw_input: str) -> Tuple[UrlComponents, list[Finding]]:
    """
    Safely process, validate, normalize, and parse a submitted URL.
    Returns parsed UrlComponents and initial input-validation findings.
    """
    findings: list[Finding] = []
    cleaned_input = raw_input.strip()

    # Prepend scheme if missing
    has_explicit_scheme = bool(re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*://', cleaned_input))
    url_to_parse = cleaned_input if has_explicit_scheme else f"http://{cleaned_input}"

    parsed = urllib.parse.urlsplit(url_to_parse)
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc
    path = parsed.path or "/"
    query_string = parsed.query
    fragment = parsed.fragment

    # Extract userinfo if present (e.g. user:pass@host)
    user_info = None
    hostname_with_port = netloc
    if "@" in netloc:
        user_info, hostname_with_port = netloc.split("@", 1)
        findings.append(Finding(
            detector_id="DET-URL-CRED-01",
            name="Embedded Authority Credentials",
            severity=SeverityLevel.HIGH,
            evidence=f"Authority contained userinfo: '{user_info}'",
            rationale="Legitimate web links rarely contain embedded user credentials. Attackers use this to spoof preceding hostnames.",
            recommended_action="Treat destination as suspicious. Never submit credentials into forms on this target.",
            source_type="DIRECT_OBSERVATION",
            weight=4.0
        ))

    # Parse hostname and port
    hostname = hostname_with_port
    port: Optional[int] = None
    if ":" in hostname_with_port:
        parts = hostname_with_port.split(":")
        hostname = parts[0]
        try:
            port = int(parts[1])
        except ValueError:
            port = None

    # Handle IDN & Punycode conversions
    punycode_hostname = hostname
    unicode_hostname = hostname
    is_idn = False

    try:
        if hostname.startswith("xn--") or ".xn--" in hostname:
            is_idn = True
            unicode_hostname = hostname.encode("ascii").decode("idna")
        else:
            punycode_hostname = hostname.encode("idna").decode("ascii")
            if punycode_hostname != hostname:
                is_idn = True
                unicode_hostname = hostname
    except Exception:
        # Fallback if invalid IDNA
        pass

    # Check for IP address host
    is_ipv4 = False
    is_ipv6 = False
    try:
        ip_obj = ipaddress.ip_address(hostname)
        if ip_obj.version == 4:
            is_ipv4 = True
        elif ip_obj.version == 6:
            is_ipv6 = True
    except ValueError:
        pass

    # Extract Registrable Domain using PSL
    extracted = tldextract.extract(punycode_hostname)
    registrable_domain = f"{extracted.domain}.{extracted.suffix}" if extracted.domain and extracted.suffix else hostname
    subdomain = extracted.subdomain
    suffix = extracted.suffix

    # Parse and redact query parameters
    raw_query_params = urllib.parse.parse_qs(query_string, keep_blank_values=True)
    sanitized_params: dict[str, str] = {}
    for k, v in raw_query_params.items():
        val = v[0] if v else ""
        if k.lower() in SENSITIVE_PARAM_NAMES:
            sanitized_params[k] = "[REDACTED_SENSITIVE_VALUE]"
        else:
            sanitized_params[k] = val

    # Build normalized URL
    normalized_netloc = hostname
    if port and not ((scheme == "http" and port == 80) or (scheme == "https" and port == 443)):
        normalized_netloc += f":{port}"
    
    clean_query = urllib.parse.urlencode([(k, v) for k, v in sanitized_params.items()])
    normalized_url = urllib.parse.urlunsplit((scheme, normalized_netloc, path, clean_query, fragment))

    url_components = UrlComponents(
        submitted_url=cleaned_input,
        normalized_url=normalized_url,
        scheme=scheme,
        hostname=hostname,
        unicode_hostname=unicode_hostname,
        punycode_hostname=punycode_hostname,
        port=port,
        path=path,
        query_params=sanitized_params,
        fragment=fragment,
        user_info=user_info,
        registrable_domain=registrable_domain,
        subdomain=subdomain,
        suffix=suffix,
        is_ipv4=is_ipv4,
        is_ipv6=is_ipv6
    )

    return url_components, findings

def run_url_forensics(components: UrlComponents) -> list[Finding]:
    """
    Run deterministic, multi-layer heuristic forensic tests on parsed components.
    """
    findings: list[Finding] = []
    host = components.hostname.lower()
    path = components.path.lower()

    # 1. IP Address Host Check
    if components.is_ipv4 or components.is_ipv6:
        findings.append(Finding(
            detector_id="DET-URL-IPHOST-01",
            name="Raw IP Address Host",
            severity=SeverityLevel.HIGH,
            evidence=f"Destination hostname is a direct IP address: {components.hostname}",
            rationale="Legitimate consumer services rely on human-readable domain names. Raw IP destinations are frequently used to bypass domain reputation blocklists.",
            recommended_action="Block automatic connection. Inspect network ownership and hosting provider.",
            source_type="DIRECT_OBSERVATION",
            weight=4.0
        ))

    # 2. Unusual Port Check
    if components.port:
        standard_ports = {80, 443}
        if components.port not in standard_ports:
            findings.append(Finding(
                detector_id="DET-URL-PORT-01",
                name=f"Non-Standard Port {components.port}",
                severity=SeverityLevel.MEDIUM,
                evidence=f"URL specifies custom port {components.port} instead of standard HTTP/HTTPS ports (80/443)",
                rationale="Non-standard ports are often used to host temporary malware staging servers or bypass egress firewall filtering.",
                recommended_action="Verify service protocol running on port before allowing outbound traffic.",
                source_type="DIRECT_OBSERVATION",
                weight=2.0
            ))

    # 3. Unicode Confusables / Punycode
    if components.hostname.startswith("xn--") or ".xn--" in components.hostname or components.unicode_hostname != components.punycode_hostname:
        findings.append(Finding(
            detector_id="DET-URL-PUNY-01",
            name="Internationalized Domain (IDN / Punycode) Detected",
            severity=SeverityLevel.HIGH,
            evidence=f"ASCII Punycode: '{components.punycode_hostname}' resolves to Unicode: '{components.unicode_hostname}'",
            rationale="Punycode is frequently abused for homograph attacks where Cyrillic or Greek characters visually imitate trusted Latin domain names.",
            recommended_action="Inspect Unicode characters closely against standard ASCII character sets.",
            source_type="DIRECT_OBSERVATION",
            weight=4.5
        ))

    # 4. Excessive Hostname Depth
    subdomain_parts = [p for p in components.subdomain.split(".") if p]
    if len(subdomain_parts) >= 3:
        findings.append(Finding(
            detector_id="DET-URL-DEPTH-01",
            name="Excessive Subdomain Depth",
            severity=SeverityLevel.MEDIUM,
            evidence=f"Hostname contains {len(subdomain_parts)} subdomain levels: '{components.subdomain}'",
            rationale="Deep subdomain trees are commonly used by dynamic DNS or phishing kits to obscure the actual registrable domain.",
            recommended_action="Focus security review on the root registrable domain rather than the prefixed subdomains.",
            source_type="HEURISTIC_RULE",
            weight=2.0
        ))

    # 5. Misleading Subdomains (e.g. paypal.com in subdomain)
    common_targets = ["paypal", "google", "microsoft", "apple", "amazon", "netflix", "chase", "bankofamerica", "wellsfargo", "login", "verify", "secure", "update", "signin"]
    for target in common_targets:
        if target in components.subdomain.lower() and target not in components.registrable_domain.lower():
            findings.append(Finding(
                detector_id="DET-URL-MISLEAD-01",
                name=f"Misleading Target Keyword in Subdomain: '{target}'",
                severity=SeverityLevel.HIGH,
                evidence=f"Keyword '{target}' present in subdomain '{components.subdomain}', while actual domain is '{components.registrable_domain}'",
                rationale="Phishing campaigns frequently prefix trusted brand names into subdomains on throwaway domains to deceive mobile browser users.",
                recommended_action="Warn user immediately of likely domain impersonation.",
                source_type="HEURISTIC_RULE",
                weight=4.5
            ))
            break

    # 6. Suspicious Executable Extensions in Path
    for ext in EXECUTABLE_EXTENSIONS:
        if path.endswith(ext) or f"{ext}?" in components.normalized_url.lower():
            findings.append(Finding(
                detector_id="DET-URL-EXEC-01",
                name=f"Direct Executable Download Pattern ({ext})",
                severity=SeverityLevel.CRITICAL,
                evidence=f"Path targets an executable or installer payload format: '{ext}'",
                rationale="Direct links targeting binaries, scripts, or disk images pose immediate drive-by download and malware dropper hazards.",
                recommended_action="Halt execution; analyze file in a sandboxed malware analysis environment.",
                source_type="DIRECT_OBSERVATION",
                weight=6.0
            ))
            break

    # 7. Nested Redirect / Open Redirect Parameters
    nested_url_detected = False
    for param_name, param_val in components.query_params.items():
        if param_name.lower() in REDIRECT_PARAM_NAMES and any(prefix in param_val.lower() for prefix in ["http://", "https://", "www.", "%2f%2f", "//"]):
            nested_url_detected = True
            findings.append(Finding(
                detector_id="DET-URL-NESTED-01",
                name=f"Potential Open Redirect / Nested URL Parameter: '{param_name}'",
                severity=SeverityLevel.MEDIUM,
                evidence=f"Parameter '{param_name}' contains embedded destination: '{param_val[:60]}...'",
                rationale="Attackers exploit open redirects on trusted websites to bounce victims to credential harvesters.",
                recommended_action="Inspect the nested URL destination to ensure it does not deviate to an untrusted third party.",
                source_type="DIRECT_OBSERVATION",
                weight=2.5
            ))
            break

    # 8. High Shannon Entropy / Obfuscation
    host_entropy = calculate_shannon_entropy(components.hostname)
    if host_entropy > 4.2 and len(components.hostname) > 15:
        findings.append(Finding(
            detector_id="DET-URL-ENTROPY-01",
            name="High Hostname Shannon Entropy (DGA Suspicion)",
            severity=SeverityLevel.MEDIUM,
            evidence=f"Hostname character entropy is {host_entropy} bits/char (threshold 4.2)",
            rationale="High randomness in domain labels is characteristic of Domain Generation Algorithms (DGA) used by botnets and bulletproof hosting.",
            recommended_action="Correlate with DNS query frequency and newly registered domain telemetry.",
            source_type="HEURISTIC_RULE",
            weight=2.0
        ))

    # 9. Excessive Length
    if len(components.normalized_url) > 150:
        findings.append(Finding(
            detector_id="DET-URL-LENGTH-01",
            name="Excessive URL Length",
            severity=SeverityLevel.LOW,
            evidence=f"URL total length is {len(components.normalized_url)} characters (typical < 80)",
            rationale="Unusually long URLs often contain serialized payloads, obfuscated redirects, or tracking markers used to evade perimeter gateways.",
            recommended_action="Inspect decomposed parameter tokens.",
            source_type="DIRECT_OBSERVATION",
            weight=1.0
        ))

    # 10. Hyphen Density in Hostname
    hyphen_count = components.hostname.count("-")
    if hyphen_count >= 3:
        findings.append(Finding(
            detector_id="DET-URL-HYPHEN-01",
            name="High Hyphen Density in Hostname",
            severity=SeverityLevel.LOW,
            evidence=f"Hostname contains {hyphen_count} hyphens: '{components.hostname}'",
            rationale="Excessive hyphenation is commonly seen in typosquatted domains and disposable phishing infrastructure.",
            recommended_action="Review brand similarity and domain age.",
            source_type="HEURISTIC_RULE",
            weight=1.5
        ))

    return findings
