import uuid
from datetime import datetime, timezone
from app.config import settings
from app.models.schemas import ScanRequest, ScanResponse
from app.services.forensics import normalize_and_parse_url, run_url_forensics
from app.services.brand_radar import detect_brand_impersonation
from app.services.redirect_engine import follow_redirect_chain_safely
from app.services.reputation import aggregate_threat_intelligence
from app.services.risk_engine import calculate_explainable_risk
from app.services.zero_hour import evaluate_zero_hour_suspicion
from app.services.attack_dna import build_attack_dna_graph
from app.services.story_generator import generate_attack_story
from app.services.vault import compute_report_hash
from app.database import ScanRepository

async def analyze_url_pipeline(req: ScanRequest) -> ScanResponse:
    """
    Execute the multi-layered threat investigation pipeline.
    """
    scan_id = f"PX-{uuid.uuid4().hex[:12].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()

    # 1. Safe Input Processing and Normalization
    components, input_findings = normalize_and_parse_url(req.url)

    # 2. Deterministic URL Forensics
    forensic_findings = run_url_forensics(components)
    all_findings = input_findings + forensic_findings

    # 3. Brand Impersonation Radar
    brand_match, brand_findings = detect_brand_impersonation(
        registrable_domain=components.registrable_domain,
        hostname=components.hostname,
        full_url=components.normalized_url
    )
    all_findings.extend(brand_findings)

    # 4. Safe Redirect Analysis
    redirect_chain = []
    if req.enable_redirect_following:
        redirect_chain, redirect_findings = await follow_redirect_chain_safely(components.normalized_url)
        all_findings.extend(redirect_findings)

    # 5. Threat Intelligence Lookups
    provider_findings = []
    if req.enable_threat_intel:
        provider_findings, intel_findings = await aggregate_threat_intelligence(
            target_url=components.normalized_url,
            hostname=components.hostname,
            registrable_domain=components.registrable_domain
        )
        all_findings.extend(intel_findings)

    # 6. Explainable Risk Engine
    risk_assessment = calculate_explainable_risk(
        findings=all_findings,
        provider_findings=provider_findings,
        has_redirects=bool(redirect_chain)
    )

    # 7. Zero-Hour Suspicion Engine
    zero_hour = evaluate_zero_hour_suspicion(
        findings=all_findings,
        provider_findings=provider_findings,
        brand_match=brand_match,
        risk_score=risk_assessment.score
    )

    # 8. Interactive Attack DNA Graph Generation
    attack_dna = build_attack_dna_graph(
        components=components,
        findings=all_findings,
        redirect_chain=redirect_chain,
        brand_match=brand_match,
        provider_findings=provider_findings,
        is_simulation=False
    )

    # 9. AI Attack Story Narrative
    attack_story = await generate_attack_story(
        components=components,
        risk=risk_assessment,
        findings=all_findings,
        brand_match=brand_match,
        provider_findings=provider_findings
    )

    # 10. Generate Partial Dict to Compute SHA-256 Report Hash
    interim_data = {
        "scan_id": scan_id,
        "timestamp": timestamp,
        "rule_engine_version": settings.rule_engine_version,
        "url_components": components.model_dump(),
        "risk": risk_assessment.model_dump(),
        "findings": [f.model_dump() for f in all_findings],
    }
    report_hash = compute_report_hash(interim_data)

    # Build ScanResponse
    response = ScanResponse(
        scan_id=scan_id,
        timestamp=timestamp,
        rule_engine_version=settings.rule_engine_version,
        url_components=components,
        risk=risk_assessment,
        findings=all_findings,
        brand_match=brand_match,
        redirect_chain=redirect_chain,
        provider_findings=provider_findings,
        zero_hour_suspicion=zero_hour,
        attack_dna=attack_dna,
        attack_story=attack_story,
        report_hash=report_hash,
        is_simulation=False
    )

    # 11. Persist to Digital Evidence Vault
    ScanRepository.save_scan(response.model_dump())

    return response
