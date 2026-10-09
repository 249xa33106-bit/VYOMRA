from app.models.schemas import SimulationRequest, SimulationResponse, Finding, SeverityLevel, RiskCategory, EvidenceConfidence
from app.services.forensics import normalize_and_parse_url
from app.services.attack_dna import build_attack_dna_graph
from app.services.brand_radar import BrandMatch

def run_what_if_simulation(req: SimulationRequest) -> SimulationResponse:
    """
    Run an interactive hypothesis simulation recalculating risk in real-time.
    Never persists to scan history database; strictly tagged as SIMULATION.
    """
    hypotheses: list[str] = []
    sim_findings: list[Finding] = []
    sim_score = 0  # baseline zero score when all conditions are off

    if req.flag_brand_mismatch:
        hypotheses.append("Hypothesis: Brand/Domain Impersonation Active")
        sim_score += 35
        sim_findings.append(Finding(
            detector_id="SIM-BRAND-MISMATCH-01",
            name="Simulated Brand Impersonation (e.g. PayPal)",
            severity=SeverityLevel.HIGH,
            evidence="Hypothetical signal: Target domain claims identity of tier-1 financial provider.",
            rationale="Illustrates risk jump when adversary mimics a protected consumer brand.",
            recommended_action="Validate brand domain ownership.",
            source_type="SIMULATED",
            weight=4.5
        ))

    if req.flag_suspicious_credential_form:
        hypotheses.append("Hypothesis: Password/Credential Input Fields Detected in DOM")
        sim_score += 25
        sim_findings.append(Finding(
            detector_id="SIM-FORM-PASS-01",
            name="Simulated Insecure Credential Form",
            severity=SeverityLevel.CRITICAL,
            evidence="Hypothetical signal: DOM contains <input type='password'> submitting cross-domain.",
            rationale="Direct visual credential collection on unverified domain.",
            recommended_action="Block page form submission.",
            source_type="SIMULATED",
            weight=5.0
        ))

    if req.flag_threat_intel_match:
        hypotheses.append("Hypothesis: Confirmed External Intelligence Blacklist Flag")
        sim_score = max(sim_score + 40, 92)
        sim_findings.append(Finding(
            detector_id="SIM-INTEL-FLAG-01",
            name="Simulated Threat Intel Blacklist Entry",
            severity=SeverityLevel.CRITICAL,
            evidence="Hypothetical signal: Global feed flagged domain as known active malware distributor.",
            rationale="Commercial consensus on malicious infrastructure.",
            recommended_action="Immediate firewall perimeter block.",
            source_type="SIMULATED",
            weight=6.0
        ))

    if req.flag_suspicious_redirect:
        hypotheses.append("Hypothesis: Cross-Domain Bouncing Redirect Observed")
        sim_score += 18
        sim_findings.append(Finding(
            detector_id="SIM-REDIR-CROSS-01",
            name="Simulated Evasive Redirect Chain",
            severity=SeverityLevel.MEDIUM,
            evidence="Hypothetical signal: HTTP 302 hop hops through intermediate URL shortener.",
            rationale="Obfuscation of final landing page destination.",
            recommended_action="Audit intermediate destination.",
            source_type="SIMULATED",
            weight=3.0
        ))

    if req.flag_newly_registered_domain:
        hypotheses.append("Hypothesis: Newly Registered Domain (< 7 days old)")
        sim_score += 20
        sim_findings.append(Finding(
            detector_id="SIM-DOMAIN-AGE-01",
            name="Simulated Newly Registered Domain",
            severity=SeverityLevel.HIGH,
            evidence="Hypothetical signal: Domain WHOIS indicates creation 48 hours ago.",
            rationale="Over 70% of spear-phishing sites operate on domains under 7 days old.",
            recommended_action="Hold outbound navigation until domain establishes reputation.",
            source_type="SIMULATED",
            weight=3.5
        ))

    if req.flag_ip_address_host:
        hypotheses.append("Hypothesis: Raw IP Address Host Destination")
        sim_score += 22
        sim_findings.append(Finding(
            detector_id="SIM-IP-HOST-01",
            name="Simulated Direct IP Host",
            severity=SeverityLevel.HIGH,
            evidence="Hypothetical signal: Destination URL uses IPv4 dotted quad directly.",
            rationale="Bypasses domain-level reputation blocklists.",
            recommended_action="Verify infrastructure ownership.",
            source_type="SIMULATED",
            weight=4.0
        ))

    if req.flag_punycode_homoglyph:
        hypotheses.append("Hypothesis: Punycode / Homoglyph Confusable Detected")
        sim_score += 28
        sim_findings.append(Finding(
            detector_id="SIM-PUNY-CONFUSE-01",
            name="Simulated Punycode Character Spoof",
            severity=SeverityLevel.CRITICAL,
            evidence="Hypothetical signal: Cyrillic 'а' substituted for Latin 'a' in root label.",
            rationale="Deceives visual inspection in modern browsers.",
            recommended_action="Inspect ASCII punycode representation.",
            source_type="SIMULATED",
            weight=5.0
        ))

    final_score = min(100, sim_score)
    if final_score >= 85:
        category = "MALICIOUS"
        confidence = "CONFIRMED" if req.flag_threat_intel_match else "HIGH"
    elif final_score >= 65:
        category = "HIGH_RISK"
        confidence = "HIGH"
    elif final_score >= 30:
        category = "SUSPICIOUS"
        confidence = "MEDIUM"
    else:
        category = "BENIGN"
        confidence = "CONFIRMED" if final_score == 0 else "HIGH"

    # Build simulated graph
    components, _ = normalize_and_parse_url(req.base_url)
    brand_dummy = BrandMatch(
        brand_name="PayPal",
        claimed=True,
        actual_domain=components.registrable_domain,
        legitimate_domain="paypal.com",
        similarity_score=0.95,
        confidence="SIMULATION",
        evidence="Simulated brand match",
        limitations="Generated in sandbox simulator"
    ) if req.flag_brand_mismatch else None

    sim_graph = build_attack_dna_graph(
        components=components,
        findings=sim_findings,
        redirect_chain=[],
        brand_match=brand_dummy,
        provider_findings=[],
        is_simulation=True
    )

    if len(hypotheses) == 0:
        delta_msg = "All threat conditions are turned OFF. Zero threat signals active (0/100 BENIGN - Clean Baseline)."
    else:
        delta_msg = (
            f"Simulated impact: Toggling {len(hypotheses)} signal hypotheses shifted the theoretical threat score "
            f"to {final_score}/100 ({category}). "
            f"Notice how combining brand impersonation with credential harvesting produces compound severity."
        )

    from app.services.story_generator import AttackStory
    story = AttackStory(
        executive_summary=f"WHAT-IF SIMULATION RESULT: Under the configured hypothetical conditions, this asset demonstrates traits characteristic of {category} infrastructure.",
        suspected_attack_category="Simulated Multi-Vector Threat Model",
        evidence_supporting=[f.name for f in sim_findings],
        potential_impact="Hypothetical simulation for training and defensive modeling purposes only.",
        recommended_defensive_actions=["Test firewall rule changes against this simulated threat profile."],
        unknowns_and_limitations=["This is a synthetic defense simulation. Not collected from live network traffic."],
        generator_type="SIMULATION_ENGINE"
    )

    return SimulationResponse(
        is_simulation=True,
        simulated_score=final_score,
        simulated_category=category,
        simulated_confidence=confidence,
        active_hypotheses=hypotheses,
        delta_explanation=delta_msg,
        findings=sim_findings,
        attack_dna=sim_graph,
        attack_story=story
    )
