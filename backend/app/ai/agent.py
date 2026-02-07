import os
import json
from typing import List, Any, Optional, Tuple
from app.models.schemas import MetadataSummary, RuleResult, ComplianceScore
from app.ai.prompts import AUDITOR_SYSTEM_PROMPT, USER_PROMPT_TEMPLATE, FEW_SHOT_EXAMPLES
from app.rag.query import query_regulations

# AI Provider Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "grok").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROK_API_KEY = os.getenv("GROK_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_llm_client(provider: str = None) -> Tuple[Any, str]:
    """
    Get LLM client with fallback support.
    Returns: (client, provider_name)
    """
    provider = provider or LLM_PROVIDER
    
    # Try primary provider
    if provider == "openai" and OPENAI_API_KEY:
        try:
            from openai import OpenAI
            return OpenAI(api_key=OPENAI_API_KEY), "openai"
        except Exception as e:
            print(f"⚠️  OpenAI failed: {e}")
            
    elif provider == "grok" and GROK_API_KEY:
        try:
            from openai import OpenAI
            return OpenAI(
                api_key=GROK_API_KEY,
                base_url="https://api.groq.com/openai/v1"
            ), "grok"
        except Exception as e:
            print(f"⚠️  Grok failed: {e}")
    
    # Fallback to Gemini if primary fails
    if GEMINI_API_KEY and provider != "gemini":
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            print(f"✅ Falling back to Gemini (primary provider '{provider}' unavailable)")
            return genai, "gemini"
        except Exception as e:
            print(f"⚠️  Gemini fallback failed: {e}")
            
    return None, None

client, active_provider = get_llm_client()

def generate_audit_explanation(
    metadata: MetadataSummary, 
    rule_results: List[RuleResult], 
    score: ComplianceScore
) -> str:
    """
    Generates an AI explanation for the audit results.
    
    SAFETY NOTICE:
    LLMs never receive raw data, PII, or row-level values. 
    Only statistical summaries and rule outcomes are processed here.
    """
    # 1. Gather failed rules
    failed_rules_text = ""
    query_context = ""
    for rule in rule_results:
        if not rule.passed:
            failed_rules_text += f"- {rule.rule_id} ({rule.severity}): {rule.description}. Details: {rule.details}\n"
            query_context += f"{rule.description} "

    # 2. Retrieve Regulations if there are failures
    regulations_text = "No specific regulations cited."
    if query_context and query_context.strip():
        # Query RAG with the description of failures
        docs = query_regulations(query_context, top_k=3)
        if docs:
            regulations_text = "\n".join([f"- {d['text'][:200]}... (Source: {d['source']})" for d in docs])

    # 3. Construct Prompt
    metadata_json = metadata.model_dump_json(exclude={'benford_analysis': {'leading_digits'}}) 
    # Exclude raw counts to save token space if needed, or keep them. keeping stats.
    
    prompt = USER_PROMPT_TEMPLATE.format(
        metadata_summary=metadata_json,
        score=score.final_score,
        risk_band=score.risk_band,
        failed_rules=failed_rules_text if failed_rules_text else "None. All rules passed.",
        regulations=regulations_text
    )

    # 4. Call LLM with fallback support
    if client:
        try:
            # Determine model based on provider
            if active_provider == "openai":
                model_name = "gpt-4o"
            elif active_provider == "grok":
                model_name = "llama-3.3-70b-versatile"
            elif active_provider == "gemini":
                model_name = "gemini-2.0-flash-exp"  # Fast and capable
            else:
                model_name = "gpt-4o"
            
            # Build messages with optional few-shot examples
            messages = [
                {"role": "system", "content": AUDITOR_SYSTEM_PROMPT}
            ]
            
            # Add few-shot examples for complex audits (when there are failures)
            if failed_rules_text and os.getenv("USE_FEW_SHOT", "true").lower() == "true":
                messages.append({"role": "system", "content": f"Here are examples of high-quality audit analyses:\n\n{FEW_SHOT_EXAMPLES}"})
            
            messages.append({"role": "user", "content": prompt})
            
            # Call appropriate API
            if active_provider == "gemini":
                # Gemini uses different API
                model = client.GenerativeModel(model_name)
                # Combine system and user messages for Gemini
                full_prompt = f"{AUDITOR_SYSTEM_PROMPT}\n\n{prompt}"
                response = model.generate_content(full_prompt)
                return response.text
            else:
                # OpenAI-compatible API (OpenAI, Grok)
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.3  # Slightly higher for chain-of-thought reasoning
                )
                return response.choices[0].message.content
                
        except Exception as e:
            error_msg = str(e)
            print(f"❌ {active_provider} failed: {error_msg}")
            
            # Try fallback to Gemini if not already using it
            if active_provider != "gemini" and GEMINI_API_KEY:
                try:
                    print("🔄 Attempting Gemini fallback...")
                    import google.generativeai as genai
                    genai.configure(api_key=GEMINI_API_KEY)
                    model = genai.GenerativeModel("gemini-2.0-flash-exp")
                    full_prompt = f"{AUDITOR_SYSTEM_PROMPT}\n\n{prompt}"
                    response = model.generate_content(full_prompt)
                    print("✅ Gemini fallback successful!")
                    return response.text
                except Exception as fallback_error:
                    print(f"❌ Gemini fallback also failed: {fallback_error}")
                    return f"AI Analysis failed: Primary ({active_provider}): {error_msg}, Fallback (Gemini): {str(fallback_error)}"
            
            return f"AI Analysis failed ({active_provider}): {error_msg}"
    else:
        return f"[MOCK AI RESPONSE]\n\nBased on the score of {score.final_score} ({score.risk_band}), the audit indicates {'significant' if score.risk_band == 'RED' else 'minor'} risks.\n\nFailed Rules:\n{failed_rules_text}\n\nRegulations:\n{regulations_text}\n\n(Configure API keys: GROK_API_KEY or GEMINI_API_KEY for live AI analysis)"

