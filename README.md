# AuditX: Privacy-First AI Financial Audit System

AuditX is a metadata-only financial audit system designed to solve the Privacy–Utility Paradox. It uses deterministic rules, Benford's Law, and RAG-based AI to assist auditors without ever exposing raw financial data to LLMs.

## 🛡️ AI Safety & Privacy Guarantee
> **"LLMs never receive raw data, PII, or row-level values."**

AuditX operates strictly on statistical metadata (counts, distributions, rules). Raw CSV rows are discarded immediately after ingestion and never leave the secure environment.

## Features
- **Metadata-Only Ingestion**: Zero PII retention.
- **Deterministic Rules Engine**: Flags anomalies like future dates and negative amounts.
- **Benford's Law Analysis**: Detects unnatural digit distributions.
- **RAG-Powered AI Agent**: Explains risks by citing specific regulations.
- **Cryptographic Provenance**: Tamper-evident audit trails.

## Quick Start
1. Install dependencies: `pip install -r auditx-backend/requirements.txt`
2. Run server: `./run.sh`
3. Access API docs at `http://localhost:8000/docs`
