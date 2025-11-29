"""
Person2 RAG - Simplified Standalone API
Uses keyword-based retrieval instead of embeddings for testing
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

app = FastAPI(
    title="ChainReach Person2 RAG Agent",
    version="1.0.0",
    description="Retrieval-Augmented Generation for marketing content"
)

# Sample marketing content database
SAMPLE_CONTENT = [
    {
        "id": 1,
        "content": "High-value customers show strong engagement and consistent purchase behavior",
        "content_type": "email",
        "campaign": "Enterprise Engagement",
        "audience": "Enterprise",
        "tags": ["high-value", "engagement", "enterprise"]
    },
    {
        "id": 2,
        "content": "At-risk customers benefit from personalized win-back campaigns",
        "content_type": "email",
        "campaign": "Win-Back",
        "audience": "Enterprise",
        "tags": ["at-risk", "retention", "personalized"]
    },
    {
        "id": 3,
        "content": "New customers appreciate educational content and onboarding guidance",
        "content_type": "blog",
        "campaign": "New Customer Onboarding",
        "audience": "B2B",
        "tags": ["new-customers", "education", "onboarding"]
    },
    {
        "id": 4,
        "content": "SMB customers respond well to ROI-focused messaging and case studies",
        "content_type": "social",
        "campaign": "SMB Growth",
        "audience": "SMB",
        "tags": ["smb", "roi", "case-study"]
    },
    {
        "id": 5,
        "content": "Engaged customers are ideal for upsell and cross-sell opportunities",
        "content_type": "ad",
        "campaign": "Upsell Campaign",
        "audience": "B2B",
        "tags": ["engagement", "upsell", "high-engagement"]
    },
    {
        "id": 6,
        "content": "B2C audiences prefer emotional storytelling and social proof",
        "content_type": "social",
        "campaign": "B2C Trust",
        "audience": "B2C",
        "tags": ["b2c", "storytelling", "social-proof"]
    },
    {
        "id": 7,
        "content": "Enterprise customers value compliance, security, and dedicated support",
        "content_type": "email",
        "campaign": "Enterprise Support",
        "audience": "Enterprise",
        "tags": ["enterprise", "compliance", "security"]
    }
]

class SearchRequest(BaseModel):
    query: str
    segment_name: Optional[str] = None
    top_k: int = 3

class ContentResult(BaseModel):
    id: int
    content: str
    content_type: str
    campaign: str
    audience: str
    tags: List[str]
    relevance_score: float

class SearchResponse(BaseModel):
    query: str
    segment: Optional[str]
    results: List[ContentResult]
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

def keyword_search(query: str, segment: Optional[str] = None, top_k: int = 3) -> List[ContentResult]:
    """Simple keyword-based search"""
    query_lower = query.lower()
    query_words = set(query_lower.split())
    
    # Score content based on keyword matches
    scored_results = []
    for item in SAMPLE_CONTENT:
        score = 0.0
        content_lower = item["content"].lower()
        
        # Check query words in content
        for word in query_words:
            if len(word) > 2:  # Skip short words
                if word in content_lower:
                    score += 2.0
        
        # Check tags match
        for tag in item["tags"]:
            if any(word in tag.lower() for word in query_words):
                score += 3.0
        
        # Boost score if segment matches audience
        if segment and segment.lower() in item["audience"].lower():
            score += 2.0
        
        if score > 0:
            scored_results.append((score, item))
    
    # Sort by score and return top_k
    scored_results.sort(key=lambda x: x[0], reverse=True)
    
    results = []
    for score, item in scored_results[:top_k]:
        results.append(ContentResult(
            id=item["id"],
            content=item["content"],
            content_type=item["content_type"],
            campaign=item["campaign"],
            audience=item["audience"],
            tags=item["tags"],
            relevance_score=min(score / 10.0, 1.0)  # Normalize to 0-1
        ))
    
    return results

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="Person2 RAG Agent",
        version="1.0.0"
    )

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint"""
    return HealthResponse(
        status="healthy",
        service="Person2 RAG Agent",
        version="1.0.0"
    )

@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """
    Search for relevant marketing content based on segment or query
    
    Args:
        query: Search query or segment description
        segment_name: Optional segment name to filter results
        top_k: Number of results to return
    """
    if not request.query or len(request.query) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
    
    # Map segment names to keywords
    segment_keywords = {
        "High Value Customers": "high-value engagement purchase",
        "At Risk": "at-risk retention win-back",
        "New Customers": "new customers onboarding education",
        "VIP Enterprise": "enterprise compliance security support",
        "Engaged SMB": "smb roi engaged business"
    }
    
    # Enhance query with segment keywords if provided
    search_query = request.query
    if request.segment_name and request.segment_name in segment_keywords:
        search_query = f"{request.query} {segment_keywords[request.segment_name]}"
    
    results = keyword_search(search_query, request.segment_name, request.top_k)
    
    return SearchResponse(
        query=request.query,
        segment=request.segment_name,
        results=results,
        timestamp=datetime.utcnow().isoformat()
    )

@app.get("/content")
async def list_content():
    """List all available content"""
    return {
        "total": len(SAMPLE_CONTENT),
        "content": SAMPLE_CONTENT
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Person2 RAG API on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
