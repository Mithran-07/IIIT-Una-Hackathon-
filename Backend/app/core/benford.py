import math
from typing import Dict, Any 
from app.models.schemas import MetadataSummary, BenfordAnalysis

# Benford's Law Probabilities for digits 1-9
BENFORD_PROBS = {
    '1': 0.301, '2': 0.176, '3': 0.125, '4': 0.097, '5': 0.079,
    '6': 0.067, '7': 0.058, '8': 0.051, '9': 0.046
}

def calculate_mad(actual_counts: Dict[str, int], total_count: int) -> float:
    """Calculates Mean Absolute Deviation (MAD)."""
    if total_count == 0:
        return 0.0
    
    sum_abs_diff = 0.0
    for digit, prob in BENFORD_PROBS.items():
        actual_prob = actual_counts.get(digit, 0) / total_count
        sum_abs_diff += abs(actual_prob - prob)
    
    return sum_abs_diff / 9.0

def get_risk_label(mad: float) -> str:
    """Returns risk label based on MAD thresholds."""
    if mad < 0.004:
        return "Close Conformity"
    elif mad < 0.008:
        return "Acceptable"
    elif mad < 0.012:
        return "Marginal"
    else:
        return "Non-conforming"

def run_benford_analysis(metadata: MetadataSummary) -> MetadataSummary:
    """
    Runs Benford's analysis on the leading digit counts in metadata.
    Updates the benford_analysis field in metadata in-place (or returns updated object).
    """
    if not metadata.benford_analysis or not metadata.benford_analysis.leading_digits:
        return metadata

    analysis = metadata.benford_analysis
    overall_passed = True
    
    for col, counts in analysis.leading_digits.items():
        total_count = sum(counts.values())
        
        # Skip analysis if sample size is too small (e.g., < 50)
        # But we still calculate stats if possible.
        if total_count < 10: 
            analysis.mad_scores[col] = 0.0
            analysis.risk_labels[col] = "Insufficient Data"
            continue

        mad = calculate_mad(counts, total_count)
        risk = get_risk_label(mad)
        
        analysis.mad_scores[col] = round(mad, 5)
        analysis.risk_labels[col] = risk
        
        if risk == "Non-conforming":
            overall_passed = False
    
    analysis.passed = overall_passed
    return metadata
