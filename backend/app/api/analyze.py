import uuid
import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Request
from typing import Optional
from app.core.ingestion import ingest_csv
from app.core.benford import run_benford_analysis
from app.core.rules_engine import evaluate_rules
from app.core.scoring import calculate_score
from app.core.provenance import generate_audit_hash
from app.ai.agent import generate_audit_explanation
from app.api.history import save_audit
from app.models.schemas import AuditResult
from app.api.rate_limit import limiter

router = APIRouter()

@router.post("/analyze", response_model=AuditResult)
@limiter.limit("10/minute")  # Rate limit: 10 audits per minute
async def analyze_csv(
    request: Request,
    file: UploadFile = File(...), 
    background_tasks: BackgroundTasks = None
):
    # 1. Ingest (Metadata Extraction)
    content = await file.read()
    metadata = ingest_csv(content)
    
    # 2. Benford Analysis
    metadata = run_benford_analysis(metadata)
    
    # 3. Rules Engine
    rule_results = evaluate_rules(metadata)
    
    # 4. Scoring
    score = calculate_score(rule_results)
    
    # 5. AI Reasoning (Synchronous or Background? Demo needs sync usually for immediate result)
    # We'll do it synchronously for the hackathon demo flow.
    explanation = generate_audit_explanation(metadata, rule_results, score)
    
    # 6. Construct Result
    audit_id = str(uuid.uuid4())
    audit_result = AuditResult(
        audit_id=audit_id,
        timestamp=datetime.now(),
        fileName=file.filename,
        metadata_summary=metadata,
        rule_results=rule_results,
        compliance_score=score,
        ai_explanation=explanation,
        provenance_hash=None # Placeholder
    )
    
    # 7. Provenance & Blockchain
    # Dump model to dict (excluding hash field)
    audit_dict_for_hash = audit_result.model_dump(exclude={'provenance_hash', 'blockchain_metadata'})
    
    # Add to Local Ledger (returns hash)
    # Note: ingest_csv in analysis flow does NOT give us 'audit_dict_for_hash' structure directly
    # So we must use the result object.
    
    from app.core.provenance import ledger
    audit_hash = ledger.add_block(audit_id, audit_dict_for_hash)
    audit_result.provenance_hash = audit_hash

    # Anchor to Ethereum (Fail-safe)
    tx_info = ledger.store_on_chain(audit_hash, score.risk_band)
    audit_result.blockchain_metadata = tx_info
    
    # 8. Save
    save_audit(audit_result)
    
    return audit_result
