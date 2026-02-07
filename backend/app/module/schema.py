from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

class BenfordAnalysis(BaseModel):
    leading_digits: Dict[str, Dict[str, int]] # Column -> Digit -> Count
    mad_scores: Dict[str, float]
    risk_labels: Dict[str, str] # Close, Acceptable, Marginal, Non-conforming
    passed: bool

class RuleResult(BaseModel):
    rule_id: str
    framework: str # e.g., "Hackathon_Act_2026"
    severity: str # HIGH, MEDIUM, LOW
    description: str
    passed: bool
    details: Optional[Dict[str, Any]] = None

class MetadataSummary(BaseModel):
    columns: List[str]
    row_count: int
    column_stats: Dict[str, Dict[str, Any]] # min, max, mean, null_percentage, type
    date_ranges: Dict[str, Dict[str, Any]] # min, max
    benford_analysis: Optional[BenfordAnalysis] = None
    suspicious_entities: Dict[str, Any] = {} # Name of suspicious entity -> count OR pii_columns -> list

class ComplianceScore(BaseModel):
    final_score: int
    risk_band: str # GREEN, YELLOW, RED
    breakdown: List[str] # Explanation of deductions

class AuditResult(BaseModel):
    audit_id: str
    timestamp: datetime
    metadata_summary: MetadataSummary
    rule_results: List[RuleResult]
    compliance_score: ComplianceScore
    ai_explanation: Optional[str] = None
    provenance_hash: Optional[str] = None

