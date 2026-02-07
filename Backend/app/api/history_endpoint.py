from fastapi import APIRouter
from typing import List, Dict, Any
from app.api.history import get_all_audits

router = APIRouter()

@router.get("/history", response_model=List[Dict[str, Any]])
async def history():
    return get_all_audits()
