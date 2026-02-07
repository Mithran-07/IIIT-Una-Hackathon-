from typing import List
from app.models.schemas import RuleResult, ComplianceScore

SEVERITY_DEDUCTIONS = {
    "HIGH": 30,
    "MEDIUM": 15,
    "LOW": 5
}

def calculate_score(rule_results: List[RuleResult]) -> ComplianceScore:
    current_score = 100
    breakdown = []
    
    for rule in rule_results:
        if not rule.passed:
            deduction = SEVERITY_DEDUCTIONS.get(rule.severity, 0)
            current_score -= deduction
            breakdown.append(f"Rule {rule.rule_id} ({rule.severity}) failed: -{deduction} points. {rule.description}")
            
    # Ensure score doesn't go below 0
    final_score = max(0, current_score)
    
    # Determine Risk Band
    if final_score >= 85:
        risk_band = "GREEN"
    elif final_score >= 50:
        risk_band = "YELLOW"
    else:
        risk_band = "RED"
        
    return ComplianceScore(
        final_score=final_score,
        risk_band=risk_band,
        breakdown=breakdown
    )
