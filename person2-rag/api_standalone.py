"""
Simplified Person2 RAG API - Works without heavy ML dependencies
Uses simple TF-IDF based similarity for testing
"""
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import os
from collections import Counter
import re

# Initialize FastAPI app
app = FastAPI(
    title="Content Retrieval Agent (Simplified)",
    version="1.0.0",
    description="RAG system for marketing content - simplified for testing"
)

# Load sample data
def load_sample_data():
    """Load sample marketing content from JSON"""
    data_path = os.path.join(os.path.dirname(__file__), 'sample_data.json')
    if os.path.exists(data_path):
        with open(data_path, 'r') as f:
            return json.load(f)
    # Fallback sample data if file doesn't exist
    return [
        {
            "id": 1,
            "title": "Summer Sale Email Campaign",
            "content": "Summer Savings Are Here! Get up to 50% off on all summer products. Limited time offer ends August 31st.",
            "content_type": "email",
            "audience": "B2C",
            "compliance_status": "approved",
            "tags": ["sale", "summer", "promotion"]
        },
        {
            "id": 2,
            "title": "Q4 Enterprise Solutions",
            "content": "Discover our latest enterprise solutions for Q4. Streamline operations and increase ROI with our comprehensive suite.",
            "content_type": "whitepaper",
            "audience": "B2B",
            "compliance_status": "approved",
            "tags": ["enterprise", "solutions", "B2B"]
        },
        {
            "id": 3,
            "title": "Monthly Newsletter - Product Updates",
            "content": "Learn about our latest product updates and new features. This month we're excited to announce three major improvements.",
            "content_type": "email",
            "audience": "B2C",
            "compliance_status": "approved",
            "tags": ["newsletter", "updates", "product"]
        }
    ]

SAMPLE_CONTENT = load_sample_data()

# Models
class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query", min_length=1)
    content_type: Optional[str] = Field(None, description="Filter by content type")
    audience: Optional[str] = Field(None, description="Filter by audience")
    top_k: Optional[int] = Field(3, description="Number of results", ge=1, le=10)

class ContentItem(BaseModel):
    id: int
    title: str
    content: str
    content_type: str
    audience: str
    compliance_status: str
    similarity_score: float

class SearchResponse(BaseModel):
    query: str
    results_count: int
    results: List[ContentItem]

class HealthResponse(BaseModel):
    status: str
    message: str
    content_count: int

# Utilities
def tokenize(text):
    """Simple tokenization"""
    text = text.lower()
    tokens = re.findall(r'\b\w+\b', text)
    return tokens

def calculate_tf_idf_similarity(query, document):
    """Calculate simple similarity based on word overlap"""
    query_tokens = set(tokenize(query))
    doc_tokens = set(tokenize(document))
    
    if not query_tokens or not doc_tokens:
        return 0.0
    
    intersection = query_tokens & doc_tokens
    union = query_tokens | doc_tokens
    
    # Jaccard similarity
    similarity = len(intersection) / len(union)
    return similarity

# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="RAG API is running",
        content_count=len(SAMPLE_CONTENT)
    )

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint"""
    return await health_check()

@app.post("/search", response_model=SearchResponse)
async def search_content(request: SearchRequest):
    """
    Search for relevant marketing content using similarity
    """
    if not SAMPLE_CONTENT:
        return SearchResponse(query=request.query, results_count=0, results=[])
    
    # Calculate similarities
    results_with_scores = []
    for item in SAMPLE_CONTENT:
        # Apply filters
        if request.content_type and item.get('content_type') != request.content_type:
            continue
        if request.audience and item.get('audience') != request.audience:
            continue
        
        # Calculate similarity
        doc_text = f"{item['title']} {item['content']}"
        similarity = calculate_tf_idf_similarity(request.query, doc_text)
        
        if similarity > 0:  # Only include if there's some match
            results_with_scores.append((item, similarity))
    
    # Sort by similarity and get top-k
    results_with_scores.sort(key=lambda x: x[1], reverse=True)
    top_results = results_with_scores[:request.top_k]
    
    # Format response
    formatted_results = [
        ContentItem(
            id=item['id'],
            title=item['title'],
            content=item['content'][:200] + "..." if len(item['content']) > 200 else item['content'],
            content_type=item.get('content_type', 'email'),
            audience=item.get('audience', 'B2C'),
            compliance_status=item.get('compliance_status', 'approved'),
            similarity_score=round(score, 4)
        )
        for item, score in top_results
    ]
    
    return SearchResponse(
        query=request.query,
        results_count=len(formatted_results),
        results=formatted_results
    )

@app.get("/content")
async def list_content(skip: int = 0, limit: int = 10):
    """List all content with pagination"""
    return {
        "total": len(SAMPLE_CONTENT),
        "skip": skip,
        "limit": limit,
        "items": SAMPLE_CONTENT[skip:skip+limit]
    }

@app.get("/content/{content_id}")
async def get_content(content_id: int):
    """Get specific content by ID"""
    for item in SAMPLE_CONTENT:
        if item['id'] == content_id:
            return item
    return {"error": "Content not found"}

@app.get("/stats")
async def get_stats():
    """Get statistics about content library"""
    by_type = {}
    by_audience = {}
    by_status = {}
    
    for item in SAMPLE_CONTENT:
        ct = item.get('content_type', 'unknown')
        by_type[ct] = by_type.get(ct, 0) + 1
        
        aud = item.get('audience', 'unknown')
        by_audience[aud] = by_audience.get(aud, 0) + 1
        
        status = item.get('compliance_status', 'unknown')
        by_status[status] = by_status.get(status, 0) + 1
    
    return {
        "total_content": len(SAMPLE_CONTENT),
        "by_content_type": by_type,
        "by_audience": by_audience,
        "by_compliance_status": by_status
    }

# Example usage
if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("Person2 RAG API (Simplified - No ML Dependencies)")
    print("="*60)
    print(f"✅ Loaded {len(SAMPLE_CONTENT)} content items")
    print("\n🚀 Starting API server...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🧪 Health Check: http://localhost:8000/health")
    print("🔍 Search Example: POST http://localhost:8000/search")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
