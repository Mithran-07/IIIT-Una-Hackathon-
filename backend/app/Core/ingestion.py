import pandas as pd
import numpy as np
from io import BytesIO
from typing import Dict, Any, List
from app.models.schemas import MetadataSummary, BenfordAnalysis

def ingest_csv(file_content: bytes) -> MetadataSummary:
    """
    Ingests a CSV file bytes, extracts metadata, and DISCARDS raw data.
    """
    df = pd.read_csv(BytesIO(file_content))
    
    row_count = len(df)
    columns = df.columns.tolist()
    
    column_stats = {}
    date_ranges = {}
    lead_digit_counts = {}
    suspicious_entities = {}

    for col in columns:
        # Data Type
        dtype = str(df[col].dtype)
        null_count = df[col].isnull().sum()
        null_percentage = (null_count / row_count) * 100 if row_count > 0 else 0
        
        stats = {
            "type": dtype,
            "null_percentage": round(null_percentage, 2)
        }

        # Suspicious Name Check
        if pd.api.types.is_string_dtype(df[col]):
            # Check for generic placeholders
            placeholders = ["john doe", "jane doe", "test", "sample", "example"]
            try:
                lower_col = df[col].astype(str).str.lower()
                for p in placeholders:
                    count = lower_col.str.contains(p, regex=False).sum()
                    if count > 0:
                        if p in suspicious_entities:
                            suspicious_entities[p] += int(count)
                        else:
                            suspicious_entities[p] = int(count)
            except Exception:
                pass

        # PII Guardrail (Header Scan)
        pii_keywords = ["ssn", "social security", "cvv", "credit card", "password", "pwd", "secret", "card number"]
        if any(keyword in col.lower() for keyword in pii_keywords):
            # Mark this column as PII-risk
            if "pii_columns" not in suspicious_entities:
                 suspicious_entities["pii_columns"] = []
            suspicious_entities["pii_columns"].append(col)
        
        # Numeric Stats & Benford's Leading Digits
        if pd.api.types.is_numeric_dtype(df[col]):
            # Filter valid numbers for stats
            valid_nums = df[col].dropna()
            if not valid_nums.empty:
                stats["min"] = float(valid_nums.min())
                stats["max"] = float(valid_nums.max())
                stats["mean"] = float(valid_nums.mean())
                
                # Extract leading digits for Benford (1-9)
                # Convert absolute values to string, take first char, filter 1-9
                # We do this on the series to avoid keeping raw data in memory longer than needed
                # Ideally, we'd process chunk by chunk for huge files, but for hackathon, this is fine.
                
                # Vectorized approach to get leading digits
                # 1. abs() to handle negatives
                # 2. astype(str)
                # 3. str[0]
                
                digits = valid_nums.abs().astype(str).str[0]
                # Filter strictly 1-9
                digits = digits[digits.isin(['1','2','3','4','5','6','7','8','9'])]
                
                counts = digits.value_counts().to_dict() # {'1': 100, '2': 50...}
                # Convert keys to string just in case
                lead_digit_counts[col] = {str(k): int(v) for k, v in counts.items()}
            else:
                stats["min"] = None
                stats["max"] = None
                stats["mean"] = None
                lead_digit_counts[col] = {}

        # Date Stats
        # Try to convert to datetime to extract ranges if it looks like a date
        # This is a heuristic.
        elif 'date' in col.lower() or 'time' in col.lower():
             try:
                # Force coercion to catch mixed formats/errors as NaT
                dt_series = pd.to_datetime(df[col], errors='coerce').dropna()
                if not dt_series.empty:
                     date_ranges[col] = {
                         "min": dt_series.min().isoformat(),
                         "max": dt_series.max().isoformat()
                     }
             except Exception:
                 pass # Not a date column or parse failed

        column_stats[col] = stats
    
    # Construct partial BenfordAnalysis (just counts for now)
    # The actual MAD calculation happens in the Benford Engine
    benford_data = BenfordAnalysis(
        leading_digits=lead_digit_counts,
        mad_scores={}, # To be filled by Benford Engine
        risk_labels={}, # To be filled by Benford Engine
        passed=False # Default
    )

    summary = MetadataSummary(
        columns=columns,
        row_count=row_count,
        column_stats=column_stats,
        date_ranges=date_ranges,
        benford_analysis=benford_data,
        suspicious_entities=suspicious_entities
    )
    
    # Explicitly discard raw dataframe to enforce privacy boundary
    del df
    import gc
    gc.collect()
    
    return summary
