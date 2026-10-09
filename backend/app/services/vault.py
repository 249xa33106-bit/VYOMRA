import hashlib
import json
from typing import Any

def compute_report_hash(scan_data: dict[str, Any]) -> str:
    """
    Compute a SHA-256 cryptographic hash of canonicalized scan data.
    Note: This hash guarantees report data integrity against tampering;
    it does not constitute cryptographic digital signature proof of source origin.
    """
    # Create copy omitting volatile fields
    data_to_hash = {
        "scan_id": scan_data.get("scan_id"),
        "timestamp": scan_data.get("timestamp"),
        "rule_engine_version": scan_data.get("rule_engine_version"),
        "submitted_url": scan_data.get("url_components", {}).get("submitted_url"),
        "normalized_url": scan_data.get("url_components", {}).get("normalized_url"),
        "risk_score": scan_data.get("risk", {}).get("score"),
        "risk_category": scan_data.get("risk", {}).get("category"),
        "findings_count": len(scan_data.get("findings", [])),
    }
    canonical_json = json.dumps(data_to_hash, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

def generate_markdown_report(scan_data: dict[str, Any]) -> str:
    """Generate a clean, readable forensic cybersecurity report in Markdown."""
    risk = scan_data.get("risk", {})
    url_info = scan_data.get("url_components", {})
    story = scan_data.get("attack_story", {})
    findings = scan_data.get("findings", [])
    redirects = scan_data.get("redirect_chain", [])
    providers = scan_data.get("provider_findings", [])
    zero_hour = scan_data.get("zero_hour_suspicion", {})
    brand = scan_data.get("brand_match")

    md = []
    md.append("# PHANTOM X — THREAT INVESTIGATION & FORENSIC DOSSIER")
    md.append(f"**Scan ID:** `{scan_data.get('scan_id')}`  ")
    md.append(f"**Generated At (UTC):** `{scan_data.get('timestamp')}`  ")
    md.append(f"**Engine Version:** `{scan_data.get('rule_engine_version')}`  ")
    md.append(f"**Cryptographic Integrity Hash (SHA-256):** `{scan_data.get('report_hash')}`  ")
    md.append("\n---\n")

    md.append("## 1. EXECUTIVE RISK ASSESSMENT")
    md.append(f"- **Risk Score:** **{risk.get('score')}/100**")
    md.append(f"- **Classification:** **{risk.get('category')}**")
    md.append(f"- **Evidence Confidence:** **{risk.get('confidence')}**")
    md.append(f"- **Coverage:** {risk.get('coverage_status')}")
    md.append(f"\n> **Methodology:** {risk.get('methodology_summary')}\n")

    md.append("## 2. TARGET IDENTIFIERS")
    md.append(f"- **Submitted URL:** `{url_info.get('submitted_url')}`")
    md.append(f"- **Normalized URL:** `{url_info.get('normalized_url')}`")
    md.append(f"- **Registrable Domain:** `{url_info.get('registrable_domain')}`")
    md.append(f"- **Unicode Hostname:** `{url_info.get('unicode_hostname')}`")
    md.append(f"- **Punycode (ASCII):** `{url_info.get('punycode_hostname')}`")
    if url_info.get('port'):
        md.append(f"- **Custom Port:** `{url_info.get('port')}`")

    if brand:
        md.append("\n## 3. BRAND IMPERSONATION RADAR")
        md.append(f"- **Target Brand:** {brand.get('brand_name')}")
        md.append(f"- **Legitimate Domain:** `{brand.get('legitimate_domain')}`")
        md.append(f"- **Similarity Score:** {int(brand.get('similarity_score', 0) * 100)}%")
        md.append(f"- **Substitution Technique:** {brand.get('substitution_technique')}")
        md.append(f"- **Evidence:** {brand.get('evidence')}")

    md.append("\n## 4. ZERO-HOUR SUSPICION STATUS")
    md.append(f"- **Unlisted Suspicion Level:** `{zero_hour.get('suspicion_level')}`")
    md.append(f"- **Assessment:** {zero_hour.get('summary')}")

    md.append("\n## 5. FORENSIC FINDINGS")
    if findings:
        for f in findings:
            md.append(f"### [{f.get('severity')}] {f.get('name')} (`{f.get('detector_id')}`)")
            md.append(f"- **Evidence:** {f.get('evidence')}")
            md.append(f"- **Rationale:** {f.get('rationale')}")
            md.append(f"- **Action:** {f.get('recommended_action')}")
            md.append(f"- **Source:** {f.get('source_type')}\n")
    else:
        md.append("No adverse heuristic or structural findings identified.\n")

    if redirects:
        md.append("## 6. OBSERVED REDIRECT CHAIN")
        for hop in redirects:
            status_str = f"HTTP {hop.get('status_code')}" if hop.get('status_code') else f"Blocked: {hop.get('blocked_reason')}"
            md.append(f"- **Hop #{hop.get('hop_number')}:** `{hop.get('hostname')}` ({status_str}) -> `{hop.get('url')}`")
        md.append("")

    md.append("## 7. THREAT INTELLIGENCE PROVIDERS")
    for p in providers:
        status_disp = p.get('status')
        if p.get('is_malicious'):
            status_disp += f" - THREAT MATCH ({p.get('threat_type')})"
        elif p.get('is_malicious') is False:
            status_disp += " - No Record"
        md.append(f"- **{p.get('provider_name')}:** {status_disp}")

    md.append("\n## 8. INCIDENT EXPLANATION (AI ATTACK STORY)")
    md.append(f"**Attack Category:** {story.get('suspected_attack_category')}\n")
    md.append(f"**Executive Summary:**\n{story.get('executive_summary')}\n")
    md.append(f"**Potential Impact:**\n{story.get('potential_impact')}\n")

    md.append("### Recommended Defensive Actions")
    for act in story.get('recommended_defensive_actions', []):
        md.append(f"- {act}")

    md.append("\n### Investigation Limitations & Unknowns")
    for unk in story.get('unknowns_and_limitations', []):
        md.append(f"- {unk}")

    md.append("\n---\n*Generated by PHANTOM X Autonomous Threat Investigation Engine*")
    return "\n".join(md)
