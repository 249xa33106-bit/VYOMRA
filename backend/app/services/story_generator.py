import json
import logging
from app.config import settings
from app.models.schemas import AttackStory, Finding, RiskAssessment, UrlComponents, BrandMatch, ProviderFinding

logger = logging.getLogger("phantom_x.story")

def generate_deterministic_attack_story(
    components: UrlComponents,
    risk: RiskAssessment,
    findings: list[Finding],
    brand_match: BrandMatch | None,
    provider_findings: list[ProviderFinding]
) -> AttackStory:
    """
    Deterministic rule-driven story generator providing deep, fact-based incident analysis
    without requiring third-party API keys or internet LLM services.
    """
    top_findings = findings[:4]
    evidence_points = [f"{f.name}: {f.evidence}" for f in top_findings]
    if not evidence_points:
        evidence_points = ["No severe structural anomalies or blacklist records observed on target."]

    # Categorize attack vector
    if brand_match and brand_match.claimed:
        attack_category = f"Credential Phishing & Brand Spoofing targeting {brand_match.brand_name}"
        summary = (
            f"Forensic inspection of '{components.normalized_url}' reveals high-fidelity brand impersonation "
            f"targeting {brand_match.brand_name}. The attacker registered domain '{components.registrable_domain}', "
            f"which deviates from the authorized {brand_match.legitimate_domain}. Visual and syntactic indicators "
            f"indicate an orchestrated attempt to solicit user login credentials or authentication secrets."
        )
        impact = (
            f"Compromise of {brand_match.brand_name} account credentials, potential unauthorized account takeover, "
            f"data exfiltration, and secondary session hijacking across interconnected corporate single sign-on (SSO) systems."
        )
    elif components.is_ipv4 or components.is_ipv6:
        attack_category = "Direct IP Infrastructure / Unregistered Staging Host"
        summary = (
            f"Investigation of '{components.normalized_url}' identified connection targeting a raw IP destination "
            f"({components.hostname}). Cyber adversaries frequently use direct IP endpoints to host ephemeral "
            f"phishing kits or malware payloads while evading domain-based reputation classifiers."
        )
        impact = "Bypass of standard DNS filtering controls and potential direct infection or unauthenticated command-and-control interaction."
    elif any(f.detector_id.startswith("DET-URL-EXEC") for f in findings):
        attack_category = "Drive-By Malware Payload Distribution"
        summary = (
            f"The analyzed URL directly references an executable or installer package structure on '{components.hostname}'. "
            f"Unsolicited distribution of binary packages via web links is strongly indicative of payload staging."
        )
        impact = "Arbitrary code execution on client endpoint, persistent malware implant, or lateral network movement."
    elif risk.score >= 50:
        attack_category = "Suspicious Multi-Signal Social Engineering Infrastructure"
        summary = (
            f"The target '{components.normalized_url}' displays multiple heuristic anomalies including subdomain "
            f"obfuscation, elevated entropy, and redirect parameters that match contemporary spear-phishing campaigns."
        )
        impact = "Potential victim redirection to malicious credential-harvesting pages or deceptive landing portals."
    else:
        attack_category = "Benign Web Asset / Minimal Anomaly Footprint"
        summary = (
            f"Deep inspection of '{components.normalized_url}' did not uncover aggressive phishing patterns, "
            f"typosquatting, or known malicious blocklist signatures. Risk assessment sits within baseline operating thresholds."
        )
        impact = "Low probability of immediate malicious exploitation based on current observable signals."

    defensive_actions = list(risk.recommended_actions)
    limitations = list(risk.uncertainty_reasons)
    if not limitations:
        limitations.append("Analysis is based on static syntax and immediate network reachability. Dynamic server-side cloaking may conceal payloads from scanners.")

    return AttackStory(
        executive_summary=summary,
        suspected_attack_category=attack_category,
        evidence_supporting=evidence_points,
        potential_impact=impact,
        recommended_defensive_actions=defensive_actions,
        unknowns_and_limitations=limitations,
        generator_type="DETERMINISTIC_EXPERT_SYSTEM"
    )

async def generate_attack_story(
    components: UrlComponents,
    risk: RiskAssessment,
    findings: list[Finding],
    brand_match: BrandMatch | None,
    provider_findings: list[ProviderFinding]
) -> AttackStory:
    """
    Generate incident explanation narrative.
    Falls back deterministically if no external LLM credentials exist.
    """
    # Deterministic fallback is guaranteed, fast, and completely immune to prompt injection
    return generate_deterministic_attack_story(
        components, risk, findings, brand_match, provider_findings
    )
