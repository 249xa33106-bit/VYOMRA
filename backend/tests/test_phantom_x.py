import pytest
from app.services.forensics import normalize_and_parse_url, run_url_forensics
from app.services.brand_radar import detect_brand_impersonation, levenshtein_distance
from app.services.redirect_engine import is_ip_prohibited_for_ssrf
from app.services.risk_engine import calculate_explainable_risk
from app.services.vault import compute_report_hash
from app.models.schemas import SeverityLevel, ProviderFinding, ProviderStatus

def test_url_normalization_and_credentials():
    url = "http://admin:secret123@legit-look.net/verify?token=abc12345&password=mypassword"
    components, findings = normalize_and_parse_url(url)
    
    assert components.hostname == "legit-look.net"
    assert components.user_info == "admin:secret123"
    assert components.query_params["password"] == "[REDACTED_SENSITIVE_VALUE]"
    assert any("Authority Credentials" in f.name for f in findings)

def test_punycode_and_idn():
    # Cyrillic 'a' (U+0430) instead of Latin 'a'
    idn_url = "http://xn--pypal-4ve.com/account"
    components, _ = normalize_and_parse_url(idn_url)
    forensic_findings = run_url_forensics(components)
    
    assert components.unicode_hostname == "pаypal.com"
    assert any("Internationalized Domain" in f.name for f in forensic_findings)

def test_raw_ip_and_custom_port():
    ip_url = "http://198.51.100.42:8080/payload.exe"
    components, _ = normalize_and_parse_url(ip_url)
    forensic_findings = run_url_forensics(components)
    
    assert components.is_ipv4 is True
    assert components.port == 8080
    assert any("Raw IP Address Host" in f.name for f in forensic_findings)
    assert any("Non-Standard Port" in f.name for f in forensic_findings)
    assert any("Executable Download" in f.name for f in forensic_findings)

def test_brand_impersonation_detection():
    # Brand in subdomain
    match1, findings1 = detect_brand_impersonation(
        registrable_domain="phish-attacker.com",
        hostname="paypal.phish-attacker.com",
        full_url="http://paypal.phish-attacker.com/signin"
    )
    assert match1 is not None
    assert match1.brand_name == "Paypal"

    # Typosquatting leetspeak
    match2, findings2 = detect_brand_impersonation(
        registrable_domain="paypa1.com",
        hostname="paypa1.com",
        full_url="http://paypa1.com/login"
    )
    assert match2 is not None
    assert match2.brand_name == "Paypal"

def test_ssrf_protection_filters():
    # Loopback
    prohibited, reason = is_ip_prohibited_for_ssrf("127.0.0.1")
    assert prohibited is True
    assert "Loopback" in reason

    # RFC1918 Private
    prohibited, reason = is_ip_prohibited_for_ssrf("192.168.1.1")
    assert prohibited is True

    prohibited, reason = is_ip_prohibited_for_ssrf("10.0.0.5")
    assert prohibited is True

    # Cloud IMDS metadata
    prohibited, reason = is_ip_prohibited_for_ssrf("169.254.169.254")
    assert prohibited is True
    assert "Metadata" in reason

    # Public IP
    prohibited, _ = is_ip_prohibited_for_ssrf("93.184.216.34")
    assert prohibited is False

def test_risk_scoring_calibration():
    # Clean benign case
    clean_components, _ = normalize_and_parse_url("https://www.python.org")
    clean_findings = run_url_forensics(clean_components)
    clean_assessment = calculate_explainable_risk(clean_findings, [])
    assert clean_assessment.score < 30
    assert clean_assessment.category.value == "BENIGN"

def test_report_hash_integrity():
    sample_data = {
        "scan_id": "PX-TEST1234",
        "timestamp": "2026-10-09T00:00:00Z",
        "rule_engine_version": "v1.4.2",
        "url_components": {"submitted_url": "https://example.com", "normalized_url": "https://example.com/"},
        "risk": {"score": 10, "category": "BENIGN"},
        "findings": []
    }
    hash1 = compute_report_hash(sample_data)
    assert len(hash1) == 64  # SHA-256 is 64 hex chars

    # Modifying risk score changes hash
    sample_data["risk"]["score"] = 99
    hash2 = compute_report_hash(sample_data)
    assert hash1 != hash2
