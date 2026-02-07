import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.api.history import get_audit
from app.rag.query import query_regulations

# Try import Google Generative AI
try:
    import google.generativeai as genai
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_KEY:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')
    else:
        model = None
except Exception:
    model = None

router = APIRouter()

class ChatRequest(BaseModel):
    audit_id: Optional[str] = None
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: list

SYSTEM_PROMPT = """
You are AuditX, a helpful financial audit assistant.
You have access to the user's latest audit report and relevant banking regulations.
Answering the user's question clearly and concisely.
If the audit report shows specific failures, explain them.
"""

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    context = ""
    
    # 1. content from specific audit if provided
    if request.audit_id:
        audit = get_audit(request.audit_id)
        if audit:
            # summarize audit for context
            context += f"Audit Context (ID: {audit.audit_id}):\n"
            context += f"Score: {audit.compliance_score.final_score} ({audit.compliance_score.risk_band})\n"
            context += "Failed Rules:\n"
            for rule in audit.rule_results:
                if not rule.passed:
                    context += f"- {rule.description}: {rule.details}\n"
    
    # 2. RAG on regulations based on user query
    docs = query_regulations(request.message, top_k=3)
    rag_context = "\n".join([f"- {d['text']} (Source: {d['source']})" for d in docs])
    
    # 3. LLM Call
    full_prompt = f"""
    {SYSTEM_PROMPT}

    Context:
    {context}
    
    Relevant Regulations:
    {rag_context}
    
    User Question: {request.message}
    """
    
    response_text = "I cannot provide an answer at this moment."
    
    if model and os.getenv("GEMINI_API_KEY"):
        try:
            response = model.generate_content(full_prompt)
            response_text = response.text
        except Exception as e:
            response_text = f"AI Error: {str(e)}"
    else:
        response_text = f"[MOCK CHAT RESPONSE]\nYou asked: {request.message}\nFound {len(docs)} relevant regulation articles.\nAudit context: {'Present' if context else 'None'}.\n(Set GEMINI_API_KEY for live response)"

    return ChatResponse(
        response=response_text,
        sources=[d['source'] for d in docs]
    )
