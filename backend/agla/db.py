from sqlalchemy import create_engine, Column, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime
import hashlib

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://agla_admin:agla_password@postgres:5432/agla_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DocumentMetadata(Base):
    __tablename__ = "document_metadata"

    doc_id = Column(String, primary_key=True, index=True) # Content or Path Hash
    tenant_id = Column(String, index=True, default="default_tenant")
    filename = Column(String)
    path = Column(String)
    version = Column(String, default="1.0")
    last_indexed = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_doc_id(path: str) -> str:
    return hashlib.sha256(path.encode()).hexdigest()[:16]
