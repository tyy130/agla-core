import os
import logging
import asyncio
import io
from qdrant_client import QdrantClient
from qdrant_client.http import models
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from falkordb import FalkorDB
import uuid
import re
import openai
from agla.db import SessionLocal, DocumentMetadata, generate_doc_id
from datetime import datetime

# Document Parsers
from pypdf import PdfReader
import docx
import pandas as pd

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize clients
qdrant_url = os.getenv("QDRANT_URL", "http://qdrant:6333")
qdrant = QdrantClient(url=qdrant_url)

falkor_url = os.getenv("FALKORDB_URL", "redis://falkordb:6379")
match = re.match(r"redis://(.*?):(\d+)", falkor_url)
f_host = match.group(1) if match else "falkordb"
f_port = int(match.group(2)) if match else 6379
falkor = FalkorDB(host=f_host, port=f_port)
graph = falkor.select_graph("agla_graph")

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
llm = ChatOpenAI(model="gpt-4o-mini")

def extract_text(content: bytes, filename: str) -> str:
    ext = filename.split(".")[-1].lower()
    try:
        if ext == "pdf":
            reader = PdfReader(io.BytesIO(content))
            return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        elif ext == "docx":
            doc = docx.Document(io.BytesIO(content))
            return "\n".join([para.text for para in doc.paragraphs])
        elif ext in ["csv", "xls", "xlsx"]:
            if ext == "csv":
                df = pd.read_csv(io.BytesIO(content))
            else:
                df = pd.read_excel(io.BytesIO(content))
            return df.to_string()
        else: 
            return content.decode("utf-8", errors="ignore")
    except Exception as e:
        logger.error(f"Parser error for {filename}: {e}")
        return ""

async def extract_graph(target_chunks, doc_id, tenant_id: str = "default_tenant"):
    for chunk in target_chunks:
        try:
            prompt = f"Extract entities (Org, Person, Tech) and relationships: Entity1 | Relationship | Entity2. One per line.\n\n{chunk}"
            res = await llm.ainvoke(prompt)
            lines = res.content.split("\n")
            for line in lines:
                if "|" in line:
                    parts = [p.strip() for p in line.split("|")]
                    if len(parts) == 3:
                        e1, rel, e2 = parts
                        e1, rel, e2 = [p.replace("'", "\'\'") for p in [e1, rel, e2]]
                        query = f"MERGE (a:Entity {{name: '{e1}', tenant_id: '{tenant_id}'}}) MERGE (b:Entity {{name: '{e2}', tenant_id: '{tenant_id}'}}) MERGE (a)-[r:RELATED {{type: '{rel}', doc_id: '{doc_id}', tenant_id: '{tenant_id}'}}]->(b)"
                        graph.query(query)
        except Exception as e:
            logger.warning(f"Graph extraction failed: {e}")
            continue

async def process_document(file_content: bytes, filename: str, tier: str = "essential", file_path: str = None, tenant_id: str = "default_tenant"):
    db = SessionLocal()
    try:
        logger.info(f"Parsing {filename} for tenant {tenant_id}...")
        text = extract_text(file_content, filename)
        
        if not text.strip():
            return {"status": "skipped", "message": "Empty content"}
        
        # Stable Identifier (Unique per tenant)
        effective_path = file_path or filename
        doc_id = generate_doc_id(f"{tenant_id}:{effective_path}")

        # Update SQL Metadata
        doc_meta = db.query(DocumentMetadata).filter(DocumentMetadata.doc_id == doc_id).first()
        if not doc_meta:
            doc_meta = DocumentMetadata(doc_id=doc_id, tenant_id=tenant_id, filename=filename, path=effective_path)
            db.add(doc_meta)
        else:
            doc_meta.last_indexed = datetime.utcnow()
        db.commit()

        # 1. Chunking
        chunk_size = 1500 if tier == "comprehensive" else 1000
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=100)
        chunks = text_splitter.split_text(text)
        
        # 2. Vector Indexing
        collection_name = "agla_chunks"
        collections = qdrant.get_collections().collections
        if not any(c.name == collection_name for c in collections):
            qdrant.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(size=3072, distance=models.Distance.COSINE)
            )

        points = []
        for chunk in chunks:
            vector = embeddings.embed_query(chunk)
            points.append(models.PointStruct(
                id=str(uuid.uuid4()), 
                vector=vector, 
                payload={"text": chunk, "source": filename, "doc_id": doc_id, "tenant_id": tenant_id}
            ))
        
        qdrant.upsert(collection_name=collection_name, points=points)

        # 3. Graph Path
        if tier != "lite":
            await extract_graph(chunks[:5], doc_id, tenant_id)

        return {"status": "success", "doc_id": doc_id, "chunks": len(chunks)}

    except Exception as e:
        logger.error(f"Processing Error {filename}: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
