from app.models.schemas import ZeroHourSuspicion, Finding, ProviderFinding, BrandMatch, ProviderStatus

def evaluate_zero_hour_suspicion(
    findings: list[Finding],
    provider_findings: list[ProviderFinding],
    brand_match: BrandMatch | None,
    risk_score: int
) -> ZeroHourSuspicion:
    """
    Evaluate whether a URL exhibits dangerous zero-hour patterns while being unlisted in traditional threat databases.
    """
    # Check if traditional feeds reported a known match
    any_provider_listed = any(
        pf.is_malicious is True for pf in provider_findings if pf.status == ProviderStatus.AVAILABLE
    )

    structural_findings = [f for f in findings if f.detector_id.startswith(("DET-URL", "DET-BRAND", "DET-REDIR"))]
    structural_weight_sum = sum(f.weight for f in structural_findings)
    brand_present = brand_match is not None and brand_match.similarity_score >= 0.70

    # If unlisted by providers BUT exhibits high structural anomalies and brand impersonation:
    is_unlisted_suspicious = (not any_provider_listed) and (risk_score >= 45 or brand_present or structural_weight_sum >= 8.0)

    if is_unlisted_suspicious:
        if risk_score >= 70:
            level = "CRITICAL_UNLISTED_THREAT"
            summary = (
                "Unlisted suspicious URL: High structural anomalies and brand spoofing signals detected, "
                "despite no active blocklist matches in public reputation databases. This strongly indicates "
                "a potentially previously unreported threat or freshly provisioned phishing campaign."
            )
            confidence = "HIGH"
        else:
            level = "MODERATE_UNLISTED_SUSPICION"
            summary = (
                "Potentially previously unreported threat: URL structure and redirect characteristics deviate "
                "from legitimate web patterns, but external reputation feeds show no prior historical flags."
            )
            confidence = "MEDIUM"
    else:
        level = "STANDARD_BASELINE"
        summary = "No anomalous unlisted structural signature detected outside known parameters."
        confidence = "LOW"

    return ZeroHourSuspicion(
        is_unlisted_suspicious=is_unlisted_suspicious,
        suspicion_level=level,
        structural_anomaly_score=round(min(10.0, structural_weight_sum), 2),
        brand_risk_present=brand_present,
        summary=summary,
        confidence=confidence
    )
