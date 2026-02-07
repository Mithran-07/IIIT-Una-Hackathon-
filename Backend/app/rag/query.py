from typing import List, Dict, Any
from app.rag.ingest import rag_service
import numpy as np

def query_regulations(query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Queries the RAG index for relevant regulation articles.
    """
    if not rag_service.index or rag_service.index.ntotal == 0:
        return []

    # Embed query
    query_vector = rag_service.model.encode([query_text])
    
    # Search
    distances, indices = rag_service.index.search(np.array(query_vector).astype('float32'), top_k)
    
    results = []
    for idx in indices[0]:
        if idx < len(rag_service.metadata) and idx != -1:
            results.append(rag_service.metadata[idx])
            
    return results
