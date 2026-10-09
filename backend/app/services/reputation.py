import hashlib
from datetime import datetime, timezone
from typing import Optional, Tuple
import httpx
from app.config import settings
from app.models.schemas import ProviderFinding, ProviderStatus, Finding, SeverityLevel

# In-memory local TTL cache for intelligence queries to avoid redundant requests
INTEL_CACHE: dict[str, ProviderFinding] = {}

# Local verified threat feed indicator list for zero-latency local validation
KNOWN_LOCAL_MALICIOUS_DOMAINS = {
    "malicious-test-phishing.org": {"threat": "PHISHING_CREDENTIAL_HARVESTER", "actor": "Simulated Actor"},
    "evil-bank-login.xyz": {"threat": "BANKING_TROJAN_DROPPER", "actor": "FIN-Group-Mock"},
    "stealth-ransom-download.top": {"threat": "MALWARE_DROPPER", "actor": "RansomSim"},
    "update-microsoft-critical-patch.biz": {"threat": "CREDENTIAL_PHISH", "actor": "Storm-0554-Sim"}
}

async def query_google_safe_browsing(target_url: str) -> Tuple[ProviderFinding, list[Finding]]:
    """
    Query Google Safe Browsing v4 ThreatLookup API.
    If API key is missing, explicitly report status as UNAVAILABLE (never assume safe).
    """
    now = datetime.now(timezone.utc).isoformat()
    findings: list[Finding] = []

    if not settings.google_safe_browsing_api_key:
        return ProviderFinding(
            provider_name="Google Safe Browsing",
            status=ProviderStatus.UNAVAILABLE,
            is_malicious=None,
            threat_type=None,
            details={"note": "API key not configured in environment (GOOGLE_SAFE_BROWSING_API_KEY). Reported as unavailable, not safe."},
            cached=False,
            observation_time=now
        ), findings

    cache_key = f"gsb:{target_url}"
    if cache_key in INTEL_CACHE:
        cached_result = INTEL_CACHE[cache_key]
        cached_copy = cached_result.model_copy()
        cached_copy.cached = True
        return cached_copy, findings

    endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={settings.google_safe_browsing_api_key}"
    payload = {
        "client": {
            "clientId": "phantom-x-engine",
            "clientVersion": "1.0.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": target_url}]
        }
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(endpoint, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                matches = data.get("matches", [])
                if matches:
                    primary_threat = matches[0].get("threatType", "THREAT_MATCH")
                    finding_item = Finding(
                        detector_id="DET-INTEL-GSB-01",
                        name=f"Google Safe Browsing Confirmed Threat: {primary_threat}",
                        severity=SeverityLevel.CRITICAL,
                        evidence=f"Matched threat entry in Google Safe Browsing database for: {target_url}",
                        rationale="Google Safe Browsing lists this URL as an active source of malicious software or social engineering.",
                        recommended_action="Block access immediately across perimeter firewalls.",
                        source_type="PROVIDER_REPORT",
                        weight=6.0
                    )
                    findings.append(finding_item)
                    result = ProviderFinding(
                        provider_name="Google Safe Browsing",
                        status=ProviderStatus.AVAILABLE,
                        is_malicious=True,
                        threat_type=primary_threat,
                        details={"matches": matches},
                        cached=False,
                        observation_time=now
                    )
                else:
                    result = ProviderFinding(
                        provider_name="Google Safe Browsing",
                        status=ProviderStatus.NO_RECORD,
                        is_malicious=False,
                        threat_type=None,
                        details={"note": "No match found in database. Note: Clean rating does not guarantee innocence on zero-day targets."},
                        cached=False,
                        observation_time=now
                    )
                INTEL_CACHE[cache_key] = result
                return result, findings
            elif resp.status_code == 429:
                return ProviderFinding(
                    provider_name="Google Safe Browsing",
                    status=ProviderStatus.RATE_LIMITED,
                    is_malicious=None,
                    details={"error": "Rate limit exceeded on external API"},
                    observation_time=now
                ), findings
            else:
                return ProviderFinding(
                    provider_name="Google Safe Browsing",
                    status=ProviderStatus.ERROR,
                    is_malicious=None,
                    details={"http_status": resp.status_code, "body": resp.text[:200]},
                    observation_time=now
                ), findings
    except Exception as e:
        return ProviderFinding(
            provider_name="Google Safe Browsing",
            status=ProviderStatus.ERROR,
            is_malicious=None,
            details={"exception": str(e)},
            observation_time=now
        ), findings

async def query_virustotal(target_url: str) -> Tuple[ProviderFinding, list[Finding]]:
    """
    Query VirusTotal v3 URL intelligence.
    If API key is missing, report status as UNAVAILABLE.
    Uses SHA-256 URL identifier to avoid submitting raw URLs blindly.
    """
    now = datetime.now(timezone.utc).isoformat()
    findings: list[Finding] = []

    if not settings.virustotal_api_key:
        return ProviderFinding(
            provider_name="VirusTotal",
            status=ProviderStatus.UNAVAILABLE,
            is_malicious=None,
            threat_type=None,
            details={"note": "API key not configured in environment (VIRUSTOTAL_API_KEY). Reported as unavailable, not safe."},
            cached=False,
            observation_time=now
        ), findings

    url_id = hashlib.sha256(target_url.encode()).hexdigest()
    cache_key = f"vt:{url_id}"
    if cache_key in INTEL_CACHE:
        cached_copy = INTEL_CACHE[cache_key].model_copy()
        cached_copy.cached = True
        return cached_copy, findings

    endpoint = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    headers = {"x-apikey": settings.virustotal_api_key}

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(endpoint, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                attributes = data.get("data", {}).get("attributes", {})
                stats = attributes.get("last_analysis_stats", {})
                malicious_count = stats.get("malicious", 0)
                suspicious_count = stats.get("suspicious", 0)

                is_malicious = (malicious_count >= 2 or suspicious_count >= 3)
                if is_malicious:
                    findings.append(Finding(
                        detector_id="DET-INTEL-VT-01",
                        name=f"VirusTotal Multi-Engine Flag ({malicious_count} engines malicious)",
                        severity=SeverityLevel.CRITICAL if malicious_count >= 5 else SeverityLevel.HIGH,
                        evidence=f"VirusTotal analysis: {malicious_count} security vendors flagged URL as malicious, {suspicious_count} as suspicious.",
                        rationale="Consensus threat detection across multiple commercial antivirus and reputation engines.",
                        recommended_action="Block domain across enterprise endpoints and email gateways.",
                        source_type="PROVIDER_REPORT",
                        weight=6.0
                    ))

                result = ProviderFinding(
                    provider_name="VirusTotal",
                    status=ProviderStatus.AVAILABLE,
                    is_malicious=is_malicious,
                    threat_type=f"{malicious_count} detections" if is_malicious else None,
                    details={"stats": stats, "categories": attributes.get("categories", {})},
                    cached=False,
                    observation_time=now
                )
                INTEL_CACHE[cache_key] = result
                return result, findings
            elif resp.status_code == 404:
                result = ProviderFinding(
                    provider_name="VirusTotal",
                    status=ProviderStatus.NO_RECORD,
                    is_malicious=False,
                    threat_type=None,
                    details={"note": "URL has no recorded historical telemetry in VirusTotal corpus."},
                    cached=False,
                    observation_time=now
                )
                INTEL_CACHE[cache_key] = result
                return result, findings
            else:
                return ProviderFinding(
                    provider_name="VirusTotal",
                    status=ProviderStatus.ERROR,
                    is_malicious=None,
                    details={"http_status": resp.status_code},
                    observation_time=now
                ), findings
    except Exception as e:
        return ProviderFinding(
            provider_name="VirusTotal",
            status=ProviderStatus.ERROR,
            is_malicious=None,
            details={"exception": str(e)},
            observation_time=now
        ), findings

def check_local_threat_intelligence(hostname: str, domain: str) -> Tuple[Optional[ProviderFinding], list[Finding]]:
    """
    Check internal curated threat intelligence feed (works completely offline for hackathon/local demos).
    """
    findings: list[Finding] = []
    target = domain.lower()

    if target in KNOWN_LOCAL_MALICIOUS_DOMAINS:
        info = KNOWN_LOCAL_MALICIOUS_DOMAINS[target]
        finding_item = Finding(
            detector_id="DET-INTEL-LOCAL-01",
            name=f"Local Threat Intel Feed Match: {info['threat']}",
            severity=SeverityLevel.CRITICAL,
            evidence=f"Domain '{target}' matches curated IOC feed (Threat: {info['threat']}, Attribution: {info['actor']})",
            rationale="Domain is cataloged in the local verified threat intelligence repository as active malicious infrastructure.",
            recommended_action="Isolate affected endpoints and review network connection logs.",
            source_type="PROVIDER_REPORT",
            weight=6.0
        )
        findings.append(finding_item)
        return ProviderFinding(
            provider_name="PHANTOM Local Threat Feed",
            status=ProviderStatus.AVAILABLE,
            is_malicious=True,
            threat_type=info["threat"],
            details={"attribution": info["actor"], "database_version": "2026.04.1"},
            cached=False,
            observation_time=datetime.now(timezone.utc).isoformat()
        ), findings

    return ProviderFinding(
        provider_name="PHANTOM Local Threat Feed",
        status=ProviderStatus.AVAILABLE,
        is_malicious=False,
        threat_type=None,
        details={"note": "No match found in local IOC database."},
        cached=False,
        observation_time=datetime.now(timezone.utc).isoformat()
    ), findings

async def aggregate_threat_intelligence(target_url: str, hostname: str, registrable_domain: str) -> Tuple[list[ProviderFinding], list[Finding]]:
    """Aggregate all provider responses cleanly."""
    provider_results: list[ProviderFinding] = []
    all_findings: list[Finding] = []

    # 1. Local Threat Feed
    local_pf, local_findings = check_local_threat_intelligence(hostname, registrable_domain)
    if local_pf:
        provider_results.append(local_pf)
    all_findings.extend(local_findings)

    # 2. Google Safe Browsing
    gsb_pf, gsb_findings = await query_google_safe_browsing(target_url)
    provider_results.append(gsb_pf)
    all_findings.extend(gsb_findings)

    # 3. VirusTotal
    vt_pf, vt_findings = await query_virustotal(target_url)
    provider_results.append(vt_pf)
    all_findings.extend(vt_findings)

    return provider_results, all_findings
