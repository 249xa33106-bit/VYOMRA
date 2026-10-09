SAMPLE_TEST_URLS = [
    {
        "category": "BENIGN",
        "label": "Legitimate Open Source Project",
        "url": "https://www.python.org/downloads",
        "expected_score_range": (0, 25),
        "description": "Standard benign documentation page with clean domain reputation."
    },
    {
        "category": "BENIGN",
        "label": "Wikipedia Knowledge Base",
        "url": "https://en.wikipedia.org/wiki/Phishing",
        "expected_score_range": (0, 25),
        "description": "High-reputation encyclopedia domain with standard HTTPS."
    },
    {
        "category": "TYPOSQUATTING",
        "label": "PayPal Leetspeak Typosquatting",
        "url": "http://paypa1-security-verification.com/login",
        "expected_score_range": (65, 95),
        "description": "Character substitution '1' for 'l' impersonating PayPal."
    },
    {
        "category": "PUNYCODE_HOMOGLYPH",
        "label": "Cyrillic Homoglyph Attack",
        "url": "http://xn--pypal-4ve.com/account-recovery",  # pаypal with Cyrillic а
        "expected_score_range": (70, 95),
        "description": "Internationalized punycode domain spoofing paypal using Cyrillic lookalikes."
    },
    {
        "category": "EMBEDDED_CREDENTIALS",
        "label": "Embedded Authority Credentials",
        "url": "http://admin:supersecret@suspicious-bank-auth.com/portal",
        "expected_score_range": (50, 85),
        "description": "Authority credentials in URL used to disguise phishing target."
    },
    {
        "category": "RAW_IP_HOST",
        "label": "Direct IP Host on Custom Port",
        "url": "http://198.51.100.42:8080/download/update.exe",
        "expected_score_range": (75, 100),
        "description": "Direct IP address on non-standard port 8080 targeting an executable binary."
    },
    {
        "category": "OPEN_REDIRECT",
        "label": "Nested Redirect Parameter Phishing",
        "url": "https://trusted-portal.org/login?redirect=http://external-credential-trap.com/submit",
        "expected_score_range": (35, 75),
        "description": "Open redirect parameter embedding an untrusted second-stage URL."
    },
    {
        "category": "LOCAL_IOC_MATCH",
        "label": "Curated Malicious Threat Feed Match",
        "url": "http://malicious-test-phishing.org/urgent-verify",
        "expected_score_range": (85, 100),
        "description": "Known malware and phishing IOC recorded in local threat intelligence repository."
    }
]
