export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type RiskCategory = "MALICIOUS" | "HIGH_RISK" | "SUSPICIOUS" | "BENIGN";
export type EvidenceConfidence = "CONFIRMED" | "HIGH" | "MEDIUM" | "LOW" | "HEURISTIC";
export type ProviderStatus = "AVAILABLE" | "UNAVAILABLE" | "RATE_LIMITED" | "ERROR" | "NO_RECORD";

export interface Finding {
  detector_id: string;
  name: string;
  severity: SeverityLevel;
  evidence: string;
  rationale: string;
  recommended_action: string;
  source_type: string;
  weight: number;
}

export interface UrlComponents {
  submitted_url: string;
  normalized_url: string;
  scheme: string;
  hostname: string;
  unicode_hostname: string;
  punycode_hostname: string;
  port?: number | null;
  path: string;
  query_params: Record<string, string>;
  fragment: string;
  user_info?: string | null;
  registrable_domain: string;
  subdomain: string;
  suffix: string;
  is_ipv4: boolean;
  is_ipv6: boolean;
}

export interface RedirectHop {
  hop_number: number;
  url: string;
  hostname: string;
  ip?: string | null;
  status_code?: number | null;
  timestamp: string;
  is_cross_domain: boolean;
  blocked_reason?: string | null;
}

export interface BrandMatch {
  brand_name: string;
  claimed: boolean;
  actual_domain: string;
  legitimate_domain: string;
  similarity_score: number;
  substitution_technique?: string | null;
  confidence: string;
  evidence: string;
  limitations: string;
}

export interface ProviderFinding {
  provider_name: string;
  status: ProviderStatus;
  is_malicious?: boolean | null;
  threat_type?: string | null;
  details: Record<string, any>;
  cached: boolean;
  observation_time: string;
}

export interface GraphNode {
  id: string;
  type: string;
  data: {
    label: string;
    full_value?: string;
    entity_type: string;
    source_type: string;
    severity: string;
    evidence: string;
    icon?: string;
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string | null;
  animated?: boolean;
  data?: Record<string, any>;
}

export interface AttackGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RiskAssessment {
  score: number;
  category: RiskCategory;
  confidence: EvidenceConfidence;
  positive_findings_count: number;
  negative_findings_count: number;
  coverage_status: string;
  contributing_factors: Array<{
    detector_id: string;
    name: string;
    severity: SeverityLevel;
    points: number;
    evidence: string;
  }>;
  uncertainty_reasons: string[];
  recommended_actions: string[];
  methodology_summary: string;
}

export interface AttackStory {
  executive_summary: string;
  suspected_attack_category: string;
  evidence_supporting: string[];
  potential_impact: string;
  recommended_defensive_actions: string[];
  unknowns_and_limitations: string[];
  generator_type: string;
}

export interface ZeroHourSuspicion {
  is_unlisted_suspicious: boolean;
  suspicion_level: string;
  structural_anomaly_score: number;
  brand_risk_present: boolean;
  summary: string;
  confidence: string;
}

export interface ScanResponse {
  scan_id: string;
  timestamp: string;
  rule_engine_version: string;
  url_components: UrlComponents;
  risk: RiskAssessment;
  findings: Finding[];
  brand_match?: BrandMatch | null;
  redirect_chain: RedirectHop[];
  provider_findings: ProviderFinding[];
  zero_hour_suspicion: ZeroHourSuspicion;
  attack_dna: AttackGraph;
  attack_story: AttackStory;
  report_hash: string;
  is_simulation: boolean;
}

export interface ScanSummary {
  scan_id: string;
  submitted_url: string;
  normalized_url: string;
  timestamp: string;
  risk_score: number;
  risk_category: string;
  findings_count: number;
  report_hash: string;
}

export interface SimulationRequest {
  base_url: string;
  flag_threat_intel_match: boolean;
  flag_suspicious_credential_form: boolean;
  flag_brand_mismatch: boolean;
  flag_suspicious_redirect: boolean;
  flag_newly_registered_domain: boolean;
  flag_ip_address_host: boolean;
  flag_punycode_homoglyph: boolean;
  flag_intel_unavailable: boolean;
}

export interface SimulationResponse {
  is_simulation: boolean;
  simulated_score: number;
  simulated_category: string;
  simulated_confidence: string;
  active_hypotheses: string[];
  delta_explanation: string;
  findings: Finding[];
  attack_dna: AttackGraph;
  attack_story: AttackStory;
}

export interface DashboardStats {
  total_scans: number;
  high_risk_scans: number;
  benign_scans: number;
  suspicious_scans: number;
  malicious_scans: number;
  categories: Record<string, number>;
  trends: Array<{ date: string; scans: number }>;
}

export interface SampleUrl {
  category: string;
  label: string;
  url: string;
  expected_score_range: [number, number];
  description: string;
}

export type UserRole = "AUTHORITY" | "ANALYST" | "GUEST";

export interface UserSession {
  email: string;
  displayName: string;
  role: UserRole;
  clearanceLevel: string;
  badgeId: string;
  authenticatedAt: string;
}
