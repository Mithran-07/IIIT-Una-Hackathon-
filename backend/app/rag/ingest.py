import os
import faiss
import pickle
import numpy as np
from io import BytesIO
from typing import List, Dict
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

# Constants
INDEX_PATH = "auditx_faiss.index"
METADATA_PATH = "auditx_metadata.pkl"
MODEL_NAME = 'all-MiniLM-L6-v2'

class RAGService:
    def __init__(self):
        self.model = SentenceTransformer(MODEL_NAME)
        self.index = None
        self.metadata = [] # List of dicts: {"text": "...", "source": "..."}
        self.load_index()

    def load_index(self):
        if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):
            self.index = faiss.read_index(INDEX_PATH)
            with open(METADATA_PATH, "rb") as f:
                self.metadata = pickle.load(f)
        else:
            # Initialize new index
            # Dimension for all-MiniLM-L6-v2 is 384
            self.index = faiss.IndexFlatL2(384)
            self.metadata = []

    def save_index(self):
        faiss.write_index(self.index, INDEX_PATH)
        with open(METADATA_PATH, "wb") as f:
            pickle.dump(self.metadata, f)

    def ingest_pdf(self, file_content: bytes, filename: str):
        reader = PdfReader(BytesIO(file_content))
        text_chunks = []
        
        # simple chunking by page for hackathon
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                # Further split by "Article" keyword if possible, 
                # but for robustness we'll just chunk by paragraphs or size overlaps
                # Here: Simple overlap
                chunk_size = 500
                overlap = 50
                
                # Naive chunking
                words = text.split()
                for j in range(0, len(words), chunk_size - overlap):
                    chunk = " ".join(words[j:j + chunk_size])
                    text_chunks.append({
                        "text": chunk,
                        "source": f"{filename} - Page {i+1}",
                        "article_id": f"Pg{i+1}_k{j}" # Dummy ID
                    })
        
        if not text_chunks:
            return 0

        # Embed
        texts = [c["text"] for c in text_chunks]
        embeddings = self.model.encode(texts)
        
        # Add to index
        self.index.add(np.array(embeddings).astype('float32'))
        self.metadata.extend(text_chunks)
        
        self.save_index()
        return len(text_chunks)

# Singleton instance to be used by API
rag_service = RAGService()
