from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from agla.routing import route_query, Route
from agla.retrieval import hybrid_search, graph_traversal
from agla.ingestion import process_document
from agla.personalization import PersonalizationEngine
from agla.db import init_db, get_db, DocumentMetadata
from sqlalchemy.orm import Session
from langchain_openai import ChatOpenAI
from qdrant_client import QdrantClient
import os
import logging
import glob

# Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
init_db()

qdrant_url = os.getenv("QDRANT_URL", "http://qdrant:6333")
qdrant = QdrantClient(url=qdrant_url)

app = FastAPI(title="AGLA Core API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

personalization = PersonalizationEngine()
llm = ChatOpenAI(model="gpt-4o-mini")

@app.get("/")
async def root():
    return {"message": "AGLA Online", "status": "operational"}

class ChatRequest(BaseModel):
    query: str
    user_id: Optional[str] = "anon_user"
    tenant_id: Optional[str] = "default_tenant"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        segment = personalization.get_user_segment(request.user_id)
        route = route_query(request.query)
        
        context = ""
        path_taken = ""
        results = []

        if route == Route.COMPLEX:
            path_taken = "Graph-Lite (Complex)"
            context = await graph_traversal(request.query, tenant_id=request.tenant_id)
            sources = ["Graph Index"]
        else:
            path_taken = "Vector Path (Fast)"
            results = await hybrid_search(request.query, tenant_id=request.tenant_id)
            context = "\n".join([r["text"] for r in results])
            # Return doc_ids if available, else filename
            sources = []
            seen_ids = set()
            for r in results:
                sid = r.get("doc_id") or r.get("source")
                if sid not in seen_ids:
                    sources.append(sid)
                    seen_ids.add(sid)
        
        personalized_context = personalization.apply_personalization_boost(context, segment)
        
        prompt = f"Context: {personalized_context}\n\nQuery: {request.query}\n\nAnswer concisely based on context."
        res = await llm.ainvoke(prompt)

        return {
            "answer": res.content,
            "path_taken": path_taken,
            "user_segment": segment,
            "sources": sources
        }
    except Exception as e:
        logger.error(f"Chat Error: {e}", exc_info=True)
        return {"answer": "System Error", "sources": []}

@app.post("/ingest")
async def ingest_endpoint(
    file: UploadFile = File(...), 
    tier: str = Form("essential"),
    tenant_id: str = Form("default_tenant"),
    file_path: Optional[str] = Form(None)
):
    try:
        content = await file.read()
        return await process_document(content, file.filename, tier, file_path, tenant_id)
    except Exception as e:
        logger.error(f"Ingest Error: {e}")
        # Do not expose internal error details to the client
        raise HTTPException(status_code=500, detail="Internal server error during ingestion")

@app.get("/documents/{doc_id}")
async def get_document(doc_id: str, tenant_id: str = "default_tenant", db: Session = Depends(get_db)):
    doc = db.query(DocumentMetadata).filter(
        DocumentMetadata.doc_id == doc_id,
        DocumentMetadata.tenant_id == tenant_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found for this tenant")
    
    if not os.path.exists(doc.path):
        raise HTTPException(status_code=404, detail=f"File missing at {doc.path}")
        
    return FileResponse(doc.path, filename=doc.filename)

@app.get("/status")
async def status_check():
    try:
        col = qdrant.get_collection("agla_chunks")
        return {"indexed": True, "doc_count": col.points_count}
    except:
        return {"indexed": False, "doc_count": 0}