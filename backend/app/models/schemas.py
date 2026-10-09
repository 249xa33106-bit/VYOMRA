from typing import Optional, Any
from enum import Enum
from pydantic import BaseModel, Field

class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class RiskCategory(str, Enum):
    MALICIOUS = "MALICIOUS"
    HIGH_RISK = "HIGH_RISK"
    SUSPICIOUS = "SUSPICIOUS"
    BENIGN = "BENIGN"

class EvidenceConfidence(str, Enum):
    CONFIRMED = "CONFIRMED"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    HEURISTIC = "HEURISTIC"

class ProviderStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    UNAVAILABLE = "UNAVAILABLE"
    RATE_LIMITED = "RATE_LIMITED"
    ERROR = "ERROR"
    NO_RECORD = "NO_RECORD"

class Finding(BaseModel):
    detector_id: str
    name: str
    severity: SeverityLevel
    evidence: str
    rationale: str
    recommended_action: str
    source_type: str = "DIRECT_OBSERVATION"  # DIRECT_OBSERVATION, HEURISTIC_RULE, PROVIDER_REPORT, SIMULATION
    weight: float = 1.0

class UrlComponents(BaseModel):
    submitted_url: str
    normalized_url: str
    scheme: str
    hostname: str
    unicode_hostname: str
    punycode_hostname: str
    port: Optional[int] = None
    path: str = "/"
    query_params: dict[str, str] = Field(default_factory=dict)
    fragment: str = ""
    user_info: Optional[str] = None
    registrable_domain: str = ""
    subdomain: str = ""
    suffix: str = ""
    is_ipv4: bool = False
    is_ipv6: bool = False

class RedirectHop(BaseModel):
    hop_number: int
    url: str
    hostname: str
    ip: Optional[str] = None
    status_code: Optional[int] = None
    timestamp: str
    is_cross_domain: bool = False
    blocked_reason: Optional[str] = None

class BrandMatch(BaseModel):
    brand_name: str
    claimed: bool
    actual_domain: str
    legitimate_domain: str
    similarity_score: float
    substitution_technique: Optional[str] = None
    confidence: str
    evidence: str
    limitations: str

class ProviderFinding(BaseModel):
    provider_name: str
    status: ProviderStatus
    is_malicious: Optional[bool] = None
    threat_type: Optional[str] = None
    details: dict[str, Any] = Field(default_factory=dict)
    cached: bool = False
    observation_time: str

class GraphNode(BaseModel):
    id: str
    type: str = "customNode"
    data: dict[str, Any]
    position: dict[str, float]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: bool = False
    data: dict[str, Any] = Field(default_factory=dict)

class AttackGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]

class RiskAssessment(BaseModel):
    score: int
    category: RiskCategory
    confidence: EvidenceConfidence
    positive_findings_count: int
    negative_findings_count: int
    coverage_status: str
    contributing_factors: list[dict[str, Any]]
    uncertainty_reasons: list[str]
    recommended_actions: list[str]
    methodology_summary: str

class AttackStory(BaseModel):
    executive_summary: str
    suspected_attack_category: str
    evidence_supporting: list[str]
    potential_impact: str
    recommended_defensive_actions: list[str]
    unknowns_and_limitations: list[str]
    generator_type: str

class ZeroHourSuspicion(BaseModel):
    is_unlisted_suspicious: bool
    suspicion_level: str
    structural_anomaly_score: float
    brand_risk_present: bool
    summary: str
    confidence: str

class ScanRequest(BaseModel):
    url: str
    enable_redirect_following: bool = True
    enable_threat_intel: bool = True
    enable_behavior_analysis: bool = True

class ScanResponse(BaseModel):
    scan_id: str
    timestamp: str
    rule_engine_version: str
    url_components: UrlComponents
    risk: RiskAssessment
    findings: list[Finding]
    brand_match: Optional[BrandMatch] = None
    redirect_chain: list[RedirectHop] = Field(default_factory=list)
    provider_findings: list[ProviderFinding] = Field(default_factory=list)
    zero_hour_suspicion: ZeroHourSuspicion
    attack_dna: AttackGraph
    attack_story: AttackStory
    report_hash: str
    is_simulation: bool = False

class ScanSummary(BaseModel):
    scan_id: str
    submitted_url: str
    normalized_url: str
    timestamp: str
    risk_score: int
    risk_category: str
    findings_count: int
    report_hash: str

class SimulationRequest(BaseModel):
    base_url: str = "http://secure-login.paypa1-security.com/verify-account"
    flag_threat_intel_match: bool = False
    flag_suspicious_credential_form: bool = True
    flag_brand_mismatch: bool = True
    flag_suspicious_redirect: bool = True
    flag_newly_registered_domain: bool = True
    flag_ip_address_host: bool = False
    flag_punycode_homoglyph: bool = False
    flag_intel_unavailable: bool = False

class SimulationResponse(BaseModel):
    is_simulation: bool = True
    simulated_score: int
    simulated_category: str
    simulated_confidence: str
    active_hypotheses: list[str]
    delta_explanation: str
    findings: list[Finding]
    attack_dna: AttackGraph
    attack_story: AttackStory
