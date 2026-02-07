import sqlite3
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.schemas import AuditResult

DB_PATH = "auditx.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS audits (
            audit_id TEXT PRIMARY KEY,
            timestamp TEXT,
            final_score INTEGER,
            risk_band TEXT,
            audit_data JSON,
            provenance_hash TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_audit(audit: AuditResult):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    audit_json = audit.model_dump_json()
    
    c.execute('''
        INSERT INTO audits (audit_id, timestamp, final_score, risk_band, audit_data, provenance_hash)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        audit.audit_id,
        audit.timestamp.isoformat(),
        audit.compliance_score.final_score,
        audit.compliance_score.risk_band,
        audit_json,
        audit.provenance_hash
    ))
    conn.commit()
    conn.close()

def get_all_audits() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT audit_id, timestamp, final_score, risk_band, audit_data, provenance_hash FROM audits ORDER BY timestamp DESC')
    rows = c.fetchall()
    conn.close()
    
    audits = []
    for row in rows:
        audit_dict = dict(row)
        # Extract fileName from audit_data JSON
        if audit_dict.get('audit_data'):
            try:
                audit_data = json.loads(audit_dict['audit_data'])
                audit_dict['fileName'] = audit_data.get('fileName', 'unknown.csv')
            except:
                audit_dict['fileName'] = 'unknown.csv'
        else:
            audit_dict['fileName'] = 'unknown.csv'
        # Remove audit_data from response (too large)
        audit_dict.pop('audit_data', None)
        audits.append(audit_dict)
    
    return audits

def get_audit(audit_id: str) -> Optional[AuditResult]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT audit_data FROM audits WHERE audit_id = ?', (audit_id,))
    row = c.fetchone()
    conn.close()
    
    if row:
        return AuditResult.model_validate_json(row['audit_data'])
    return None

# Initialize DB on module load (safe for hackathon)
init_db()
