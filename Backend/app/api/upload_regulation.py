from fastapi import APIRouter, UploadFile, File, HTTPException
from app.rag.ingest import rag_service

router = APIRouter()

@router.post("/upload-regulation")
async def upload_regulation(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    content = await file.read()
    num_chunks = rag_service.ingest_pdf(content, file.filename)
    
    return {"message": "Regulation uploaded and indexed successfully.", "chunks_added": num_chunks}
