from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.api.analyze import router as analyze_router
from app.api.upload_regulation import router as upload_router
from app.api.chat import router as chat_router
from app.api.history_endpoint import router as history_router

app = FastAPI(
    title="AuditX Backend",
    description="Privacy-First Metadata-Only AI Financial Audit System",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api", tags=["Analysis"])
app.include_router(upload_router, prefix="/api", tags=["Regulations"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(history_router, prefix="/api", tags=["History"])

@app.get("/")
async def root():
    return {"message": "AuditX Backend is running. Privacy compliance: ACTIVE."}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
