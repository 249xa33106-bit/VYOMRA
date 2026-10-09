from typing import Any
from app.models.schemas import AttackGraph, GraphNode, GraphEdge, UrlComponents, Finding, RedirectHop, BrandMatch, ProviderFinding

def build_attack_dna_graph(
    components: UrlComponents,
    findings: list[Finding],
    redirect_chain: list[RedirectHop],
    brand_match: BrandMatch | None,
    provider_findings: list[ProviderFinding],
    is_simulation: bool = False
) -> AttackGraph:
    """
    Construct typed ReactFlow-compatible nodes and edges derived strictly from observed scan findings.
    """
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
    source_tag = "SIMULATED" if is_simulation else "DIRECT_OBSERVATION"

    # Node 1: Submitted URL (Root Node)
    url_node_id = "node-url-root"
    nodes.append(GraphNode(
        id=url_node_id,
        type="customNode",
        position={"x": 50, "y": 200},
        data={
            "label": components.submitted_url[:35] + ("..." if len(components.submitted_url) > 35 else ""),
            "full_value": components.submitted_url,
            "entity_type": "SUBMITTED_URL",
            "source_type": source_tag,
            "severity": "CRITICAL" if any(f.severity.value == "CRITICAL" for f in findings) else "INFO",
            "evidence": f"Input submission: Scheme '{components.scheme}', Host '{components.hostname}'",
            "icon": "Link"
        }
    ))

    # Node 2: Registrable Domain
    domain_node_id = "node-domain"
    nodes.append(GraphNode(
        id=domain_node_id,
        type="customNode",
        position={"x": 300, "y": 100},
        data={
            "label": components.registrable_domain,
            "full_value": components.registrable_domain,
            "entity_type": "REGISTRABLE_DOMAIN",
            "source_type": source_tag,
            "severity": "HIGH" if any("BRAND" in f.detector_id or "PUNY" in f.detector_id for f in findings) else "MEDIUM",
            "evidence": f"Public Suffix List extraction: Domain '{components.registrable_domain}' (Suffix: '{components.suffix}')",
            "icon": "Globe"
        }
    ))
    edges.append(GraphEdge(
        id="edge-url-domain",
        source=url_node_id,
        target=domain_node_id,
        label="belongs_to_domain",
        animated=False,
        data={"relationship_type": "BELONGS_TO", "evidence_ref": "PSL extraction", "source_type": source_tag}
    ))

    # Node 3: Infrastructure / IP Node
    ip_node_id = "node-infra-ip"
    primary_ip = None
    if components.is_ipv4 or components.is_ipv6:
        primary_ip = components.hostname
    elif redirect_chain and redirect_chain[0].ip:
        primary_ip = redirect_chain[0].ip

    if primary_ip:
        nodes.append(GraphNode(
            id=ip_node_id,
            type="customNode",
            position={"x": 300, "y": 320},
            data={
                "label": f"IP: {primary_ip}",
                "full_value": primary_ip,
                "entity_type": "INFRASTRUCTURE_IP",
                "source_type": source_tag,
                "severity": "HIGH" if (components.is_ipv4 or components.is_ipv6) else "INFO",
                "evidence": f"Resolved infrastructure endpoint: {primary_ip}",
                "icon": "Server"
            }
        ))
        edges.append(GraphEdge(
            id="edge-domain-ip",
            source=domain_node_id,
            target=ip_node_id,
            label="resolves_to_ip",
            animated=True,
            data={"relationship_type": "RESOLVES_TO", "evidence_ref": f"IP {primary_ip}", "source_type": source_tag}
        ))

    # Node 4: Brand Impersonation Node (if detected)
    if brand_match:
        brand_node_id = "node-brand-victim"
        nodes.append(GraphNode(
            id=brand_node_id,
            type="customNode",
            position={"x": 580, "y": 50},
            data={
                "label": f"Spoofed Brand: {brand_match.brand_name}",
                "full_value": brand_match.legitimate_domain,
                "entity_type": "BRAND_IDENTITY",
                "source_type": "RULE_INFERRED",
                "severity": "CRITICAL" if brand_match.similarity_score > 0.9 else "HIGH",
                "evidence": brand_match.evidence,
                "icon": "ShieldAlert"
            }
        ))
        edges.append(GraphEdge(
            id="edge-domain-brand",
            source=domain_node_id,
            target=brand_node_id,
            label="impersonates_brand",
            animated=True,
            data={"relationship_type": "IMPERSONATES", "evidence_ref": brand_match.evidence, "source_type": "RULE_INFERRED"}
        ))

    # Node 5: Redirect Hops (if chain observed)
    prev_hop_id = url_node_id
    for idx, hop in enumerate(redirect_chain[:4]):
        hop_node_id = f"node-hop-{hop.hop_number}"
        x_pos = 550 + (idx * 160)
        y_pos = 220 + (idx * 50)
        nodes.append(GraphNode(
            id=hop_node_id,
            type="customNode",
            position={"x": x_pos, "y": y_pos},
            data={
                "label": f"Hop #{hop.hop_number}: {hop.hostname[:20]}",
                "full_value": hop.url,
                "entity_type": "REDIRECT_HOP",
                "source_type": "DIRECT_OBSERVATION",
                "severity": "CRITICAL" if hop.blocked_reason else ("HIGH" if hop.is_cross_domain else "INFO"),
                "evidence": f"Status: {hop.status_code or 'Blocked'}, Blocked: {hop.blocked_reason or 'None'}",
                "icon": "CornerDownRight"
            }
        ))
        edges.append(GraphEdge(
            id=f"edge-hop-{idx}",
            source=prev_hop_id,
            target=hop_node_id,
            label="redirects_to",
            animated=True,
            data={"relationship_type": "REDIRECTS_TO", "evidence_ref": f"HTTP {hop.status_code}", "source_type": "DIRECT_OBSERVATION"}
        ))
        prev_hop_id = hop_node_id

    # Node 6: Threat Intelligence Matches (if any)
    for pf_idx, pf in enumerate(provider_findings):
        if pf.is_malicious:
            intel_node_id = f"node-intel-{pf_idx}"
            nodes.append(GraphNode(
                id=intel_node_id,
                type="customNode",
                position={"x": 580, "y": 380 + (pf_idx * 70)},
                data={
                    "label": f"{pf.provider_name} Flag",
                    "full_value": pf.threat_type or "Confirmed Malicious",
                    "entity_type": "THREAT_INTEL_INDICATOR",
                    "source_type": "PROVIDER_REPORT",
                    "severity": "CRITICAL",
                    "evidence": f"{pf.provider_name} confirmed threat classification: {pf.threat_type}",
                    "icon": "AlertTriangle"
                }
            ))
            edges.append(GraphEdge(
                id=f"edge-intel-{pf_idx}",
                source=domain_node_id,
                target=intel_node_id,
                label="flagged_by",
                animated=False,
                data={"relationship_type": "FLAGGED_BY", "evidence_ref": pf.provider_name, "source_type": "PROVIDER_REPORT"}
            ))

    return AttackGraph(nodes=nodes, edges=edges)
