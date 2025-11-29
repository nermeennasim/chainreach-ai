"""
FastAPI application for Content Retrieval Agent - Simplified Test Version
"""
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from pydantic import BaseModel, Field
import json
import os

# Initialize FastAPI app
app = FastAPI(
    title="ChainReach RAG API",
    version="1.0.0",
    description="Retrieve relevant marketing content using semantic search and RAG"
)

# Load sample marketing content
SAMPLE_CONTENT = [
    {"id": 1, "title": "Bundle & Save: 35% Off When You Buy More", "content": "Get 35% off when you purchase multiple items", "content_type": "ad", "campaign_name": "Entertainment Launch Q4 2025", "audience": "B2C", "compliance_status": "approved"},
    {"id": 2, "title": "New Travel Arrivals - Just for You", "content": "Explore our latest travel destination packages", "content_type": "infographic", "campaign_name": "Growth Potential Engagement Series", "audience": "B2B", "compliance_status": "approved"},
    {"id": 3, "title": "Customer Onboarding Guide", "content": "Welcome to our platform! Here's how to get started", "content_type": "email", "campaign_name": "New Customer Welcome", "audience": "B2C", "compliance_status": "approved"},
]

# Request/Response Models
class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query", min_length=1)
    top_k: Optional[int] = Field(3, description="Number of results to return", ge=1, le=10)


class ContentItem(BaseModel):
    id: int
    title: str
    content: str
    content_type: str
    campaign_name: Optional[str]
    audience: Optional[str]
    compliance_status: str


class SearchResponse(BaseModel):
    query: str
    results_count: int
    results: List[ContentItem]


class HealthResponse(BaseModel):
    status: str
    message: str
    content_count: int


# API Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="RAG API is running",
        content_count=len(SAMPLE_CONTENT)
    )


@app.post("/search", response_model=SearchResponse)
async def search_content(request: SearchRequest):
    """
    Search for relevant marketing content
    """
    try:
        # Simple keyword matching
        query_lower = request.query.lower()
        results = []
        
        for content in SAMPLE_CONTENT:
            score = 0
            if query_lower in content["title"].lower():
                score += 2
            if query_lower in content["content"].lower():
                score += 1
            if query_lower in content["campaign_name"].lower():
                score += 0.5
                
            if score > 0:
                results.append((content, score))
        
        # Sort by score and limit results
        results.sort(key=lambda x: x[1], reverse=True)
        top_results = [ContentItem(**r[0]) for r in results[:request.top_k]]
        
        return SearchResponse(
            query=request.query,
            results_count=len(top_results),
            results=top_results
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/content", response_model=List[ContentItem])
async def list_content(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """List all content with pagination"""
    return [ContentItem(**c) for c in SAMPLE_CONTENT[skip:skip+limit]]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
