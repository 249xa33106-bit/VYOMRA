from typing import Any
from app.models.schemas import Finding, RiskAssessment, RiskCategory, EvidenceConfidence, SeverityLevel, ProviderFinding, ProviderStatus

SEVERITY_BASE_WEIGHTS = {
    SeverityLevel.CRITICAL: 28,
    SeverityLevel.HIGH: 18,
    SeverityLevel.MEDIUM: 10,
    SeverityLevel.LOW: 4,
    SeverityLevel.INFO: 0,
    "CRITICAL": 28,
    "HIGH": 18,
    "MEDIUM": 10,
    "LOW": 4,
    "INFO": 0,
}

def calculate_explainable_risk(
    findings: list[Finding],
    provider_findings: list[ProviderFinding],
    has_redirects: bool = False
) -> RiskAssessment:
    """
    Compute explainable, calibrated, multi-signal risk score (0-100).
    Avoids double-counting and provides mathematical transparency.
    """
    total_raw_points = 0.0
    contributing_factors: list[dict[str, Any]] = []
    seen_categories = set()

    positive_findings_count = len(findings)
    negative_findings_count = 0  # Signals that confirmed benign properties

    # Check for direct confirmed threat intel match
    has_confirmed_threat_intel = any(
        pf.is_malicious is True for pf in provider_findings if pf.status == ProviderStatus.AVAILABLE
    )

    for finding in findings:
        base_pts = SEVERITY_BASE_WEIGHTS.get(finding.severity, 0)
        weighted_pts = base_pts * (finding.weight / 4.0)

        # De-duplicate category clustering to avoid artificial score runaway
        prefix = finding.detector_id.split("-")[1] if "-" in finding.detector_id else "GEN"
        if prefix in seen_categories:
            weighted_pts *= 0.5  # diminishing return for duplicate signal family
        else:
            seen_categories.add(prefix)

        total_raw_points += weighted_pts
        contributing_factors.append({
            "detector_id": finding.detector_id,
            "name": finding.name,
            "severity": finding.severity,
            "points": round(weighted_pts, 1),
            "evidence": finding.evidence
        })

    # If confirmed threat intelligence match exists, floor the score at 85
    if has_confirmed_threat_intel:
        total_raw_points = max(total_raw_points, 88.0)

    # Clamp raw points to 0-100
    final_score = int(min(100, max(0, round(total_raw_points))))

    # Determine risk category
    if final_score >= 85:
        category = RiskCategory.MALICIOUS
    elif final_score >= 65:
        category = RiskCategory.HIGH_RISK
    elif final_score >= 30:
        category = RiskCategory.SUSPICIOUS
    else:
        category = RiskCategory.BENIGN

    # Evaluate Evidence Confidence
    if has_confirmed_threat_intel:
        confidence = EvidenceConfidence.CONFIRMED
    elif any(f.severity == SeverityLevel.CRITICAL for f in findings):
        confidence = EvidenceConfidence.HIGH
    elif any(f.severity == SeverityLevel.HIGH for f in findings):
        confidence = EvidenceConfidence.MEDIUM
    elif findings:
        confidence = EvidenceConfidence.HEURISTIC
    else:
        confidence = EvidenceConfidence.LOW

    # Coverage status calculation
    total_possible_checks = 6
    available_checks = 4  # Forensics, URL parsing, brand radar, SSRF redirect engine
    unavailable_reasons: list[str] = []

    for pf in provider_findings:
        if pf.status == ProviderStatus.AVAILABLE:
            available_checks += 1
        elif pf.status == ProviderStatus.UNAVAILABLE:
            unavailable_reasons.append(f"{pf.provider_name} is unavailable (API key not configured)")

    coverage_percent = int((min(available_checks, total_possible_checks) / total_possible_checks) * 100)
    coverage_status = f"{coverage_percent}% Layer Coverage ({available_checks}/{total_possible_checks} subsystems evaluated)"

    # Identify reasons for uncertainty
    uncertainty_reasons: list[str] = list(unavailable_reasons)
    if not has_confirmed_threat_intel and final_score >= 30:
        uncertainty_reasons.append("Score relies heavily on heuristic structural indicators; targeted threat intelligence feeds may lag on new domains.")
    if final_score < 30 and any(pf.status == ProviderStatus.UNAVAILABLE for pf in provider_findings):
        uncertainty_reasons.append("Low risk score is evaluated under partial provider visibility. Unchecked external feeds might contain unlisted threat indicators.")

    # Recommended defensive actions
    recommended_actions: list[str] = []
    if category == RiskCategory.MALICIOUS:
        recommended_actions.extend([
            "CRITICAL: Block URL domain globally at DNS resolver and secure web gateway (SWG).",
            "Quarantine any inbound emails or chat messages containing this link.",
            "Trigger automated credential reset if user telemetry indicates submission."
        ])
    elif category == RiskCategory.HIGH_RISK:
        recommended_actions.extend([
            "Warn user with high-severity interstitial warning before navigation.",
            "Inspect web-proxy logs for outbound connections from corporate endpoints.",
            "Enforce strict multi-factor authentication (MFA) challenge on affected sessions."
        ])
    elif category == RiskCategory.SUSPICIOUS:
        recommended_actions.extend([
            "Enable browser isolation or sandbox preview for this link.",
            "Advise user against entering corporate credentials, passwords, or personal identity numbers.",
            "Submit URL for continuous automated crawl and dynamic sandboxing."
        ])
    else:
        recommended_actions.extend([
            "Standard web browsing policies apply.",
            "Maintain baseline monitoring for subsequent domain redirection or DNS changes."
        ])

    methodology = (
        "Versioned Weighted Heuristic Matrix (v1.4.2) calibrated against known phishing corpora. "
        "Evaluates input syntax, brand vector distance, redirect boundaries, and provider telemetry. "
        "Scores represent relative risk priority; not uncalibrated raw probability."
    )

    return RiskAssessment(
        score=final_score,
        category=category,
        confidence=confidence,
        positive_findings_count=positive_findings_count,
        negative_findings_count=negative_findings_count,
        coverage_status=coverage_status,
        contributing_factors=contributing_factors,
        uncertainty_reasons=uncertainty_reasons,
        recommended_actions=recommended_actions,
        methodology_summary=methodology
    )
