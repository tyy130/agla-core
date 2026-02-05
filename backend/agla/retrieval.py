import os
from qdrant_client import QdrantClient, models
from langchain_openai import OpenAIEmbeddings
from falkordb import FalkorDB
import re

# Initialize clients
qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
qdrant = QdrantClient(url=qdrant_url)

falkor_url = os.getenv("FALKORDB_URL", "redis://localhost:6379")
match = re.match(r"redis://(.*?):(\d+)", falkor_url)
f_host = match.group(1) if match else "localhost"
f_port = int(match.group(2)) if match else 6379
falkor = FalkorDB(host=f_host, port=f_port)
graph = falkor.select_graph("agla_graph")

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

async def hybrid_search(query: str, tenant_id: str = "default_tenant", limit: int = 5):
    query_vector = embeddings.embed_query(query)
    
    # 1. Vector Search
    search_result = qdrant.search(
        collection_name="agla_chunks",
        query_vector=query_vector,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="tenant_id",
                    match=models.MatchValue(value=tenant_id),
                )
            ]
        ),
        limit=limit
    )
    
    # Return both text and source for better attribution
    return [{"text": res.payload["text"], "source": res.payload.get("source", "Unknown")} for res in search_result]

async def graph_traversal(query: str, tenant_id: str = "default_tenant"):
    # Simplified LightRAG: Find nodes mentioned in query and get their 1-hop neighborhood
    # In a real system, we'd use an LLM to extract search entities from the query first.
    words = query.split()
    entities_found = []
    
    # Naive entity detection for demo
    for word in words:
        if len(word) > 4 and word[0].isupper():
            entities_found.append(word.strip("?,.!:"))

    if not entities_found:
        return "No specific graph entities identified for traversal."

    context_parts = []
    for ent in entities_found[:2]:
        cypher = f"MATCH (e:Entity {{name: '{ent}', tenant_id: '{tenant_id}'}})-[r]->(neighbor) RETURN e.name, type(r), neighbor.name LIMIT 5"
        result = graph.query(cypher)
        for row in result.result_set:
            context_parts.append(f"{row[0]} is {row[1]} to {row[2]}")

    return "Graph Context: " + "; ".join(context_parts) if context_parts else "Graph search returned no results."