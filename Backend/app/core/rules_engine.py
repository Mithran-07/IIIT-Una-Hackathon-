from typing import List
from datetime import datetime
from app.models.schemas import MetadataSummary, RuleResult

def evaluate_rules(metadata: MetadataSummary) -> List[RuleResult]:
    results = []
    
    # Rule 1: Benford's Law Anomaly
    # Prerequisite: run_benford_analysis must have been called
    benford_passed = True
    benford_details = {}
    if metadata.benford_analysis:
        if not metadata.benford_analysis.passed:
            benford_passed = False
            # Collect non-conforming columns
            for col, risk in metadata.benford_analysis.risk_labels.items():
                if risk == "Non-conforming":
                    benford_details[col] = risk

    results.append(RuleResult(
        rule_id="RULE_001",
        framework="AuditX_Core",
        severity="HIGH",
        description="Benford's Law Analysis",
        passed=benford_passed,
        details={"failed_columns": benford_details} if not benford_passed else None
    ))
    
    # Rule 2: Future Date Detection
    future_date_passed = True
    future_details = {}
    today = datetime.now().date().isoformat()
    
    for col, ranges in metadata.date_ranges.items():
        if ranges.get("max") and ranges.get("max") > today:
            future_date_passed = False
            future_details[col] = f"Date {ranges['max']} is in the future"

    results.append(RuleResult(
        rule_id="RULE_002",
        framework="AuditX_Core",
        severity="MEDIUM",
        description="Future Date Detection",
        passed=future_date_passed,
        details=future_details if not future_date_passed else None
    ))
    
    # Rule 3: Negative Amounts
    negative_passed = True
    negative_details = {}
    
    for col, stats in metadata.column_stats.items():
        if stats.get("type", "").startswith("int") or stats.get("type", "").startswith("float"):
            if stats.get("min") is not None and stats.get("min") < 0:
                # Basic heuristic: Usually only Amounts should be positive, but logic varies.
                # We flag and let auditor decide.
                negative_passed = False
                negative_details[col] = f"Found negative value: {stats['min']}"

    results.append(RuleResult(
        rule_id="RULE_003",
        framework="AuditX_Core",
        severity="MEDIUM",
        description="Negative Amount Detection",
        passed=negative_passed,
        details=negative_details if not negative_passed else None
    ))

    # Rule 4: Suspicious Entities (Placeholder Names)
    suspicious_passed = True
    suspicious_details = {}
    
    if metadata.suspicious_entities:
        suspicious_passed = False
        suspicious_details = metadata.suspicious_entities

    results.append(RuleResult(
        rule_id="RULE_004",
        framework="AuditX_Core",
        severity="HIGH",
        description="Suspicious Entity Detection",
        passed=suspicious_passed,
        details={"entities_found": suspicious_details} if not suspicious_passed else None
    ))

    # Rule 5: Completeness (Null Checks)
    # DQS Dimension: Completeness
    completeness_passed = True
    completeness_details = {}
    for col, stats in metadata.column_stats.items():
        if stats.get("null_percentage", 0) > 20.0: # Threshold: 20% nulls
            completeness_passed = False
            completeness_details[col] = f"{stats['null_percentage']}% Missing Data"

    results.append(RuleResult(
        rule_id="RULE_005",
        framework="DQS_Completeness",
        severity="MEDIUM",
        description="Data Completeness Check",
        passed=completeness_passed,
        details=completeness_details if not completeness_passed else None
    ))
    
    # Rule 6: Security (PII Guardrail)
    # DQS Dimension: Security
    security_passed = True
    security_details = {}
    
    if metadata.suspicious_entities and "pii_columns" in metadata.suspicious_entities:
        pii_cols = metadata.suspicious_entities["pii_columns"]
        if pii_cols:
            security_passed = False
            security_details["pii_columns_detected"] = pii_cols

    results.append(RuleResult(
        rule_id="RULE_006",
        framework="DQS_Security",
        severity="HIGH",
        description="PII Security Guardrail",
        passed=security_passed,
        details=security_details if not security_passed else None
    ))

    return results
