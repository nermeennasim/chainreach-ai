# RAG API (Person2-RAG) - Complete Usage Guide

## Overview
The RAG API runs on **port 8000** and provides content retrieval with semantic search capabilities using embeddings.

---

## Quick Start

### Start the API
```powershell
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\person2-rag"
python api.py
```

The API will be available at: `http://localhost:8000`

---

## API Endpoints

### 1. **Health Check**
Check API status

**Endpoint:** `GET /health`

**PowerShell Example:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

---

### 2. **List All Content (Paginated)**
Retrieve all marketing content with pagination

**Endpoint:** `GET /content?skip=0&limit=10`

**Parameters:**
- `skip` (optional): Number of items to skip (default: 0)
- `limit` (optional): Max items to return, 1-100 (default: 10)

**PowerShell Example:**
```powershell
# Get first 10 items
$content = Invoke-RestMethod -Uri "http://localhost:8000/content?skip=0&limit=10" -Method Get

# Get next 10 items (pagination)
$content = Invoke-RestMethod -Uri "http://localhost:8000/content?skip=10&limit=10" -Method Get

# Display results
$content | ConvertTo-Json -Depth 5
```

---

### 3. **Get Specific Content by ID**
Retrieve a single content item with all metadata

**Endpoint:** `GET /content/{content_id}`

**PowerShell Example:**
```powershell
$item = Invoke-RestMethod -Uri "http://localhost:8000/content/1" -Method Get
$item | ConvertTo-Json -Depth 5
```

**Response:**
```json
{
  "id": 1,
  "title": "Enterprise Security Solutions",
  "content": "Comprehensive security framework for large organizations",
  "content_type": "whitepaper",
  "audience": "Enterprise",
  "campaign_name": "Enterprise_2025",
  "tags": [],
  "created_at": "2025-11-28T..."
}
```

---

### 4. **Search Content (Semantic Search)**
Search for relevant content using semantic similarity

**Endpoint:** `POST /search`

**Required Body:**
```json
{
  "query": "your search query",
  "top_k": 3
}
```

**Optional Filters:**
- `content_type`: Filter by type (email, social, ad, blog)
- `campaign_name`: Filter by campaign name
- `audience`: Filter by audience (B2B, B2C, Enterprise, SMB)
- `tags`: Array of tags to filter

**PowerShell Examples:**

**Basic search:**
```powershell
$searchBody = @{
    query = "enterprise security"
    top_k = 3
} | ConvertTo-Json

$results = Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post `
    -Body $searchBody `
    -ContentType "application/json"

$results | ConvertTo-Json -Depth 5
```

**Search with filters:**
```powershell
$searchBody = @{
    query = "SMB growth"
    audience = "SMB"
    content_type = "toolkit"
    top_k = 5
} | ConvertTo-Json

$results = Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post `
    -Body $searchBody `
    -ContentType "application/json"
```

**Response:**
```json
{
  "query": "enterprise security",
  "results_count": 3,
  "results": [
    {
      "id": 1,
      "title": "Enterprise Security Solutions",
      "content": "...",
      "similarity_score": 0.85
    }
  ]
}
```

---

### 5. **Get Statistics**
Get overview statistics about the content library

**Endpoint:** `GET /stats`

**PowerShell Example:**
```powershell
$stats = Invoke-RestMethod -Uri "http://localhost:8000/stats" -Method Get
$stats | ConvertTo-Json -Depth 5
```

**Response:**
```json
{
  "total_content": 5,
  "by_content_type": {
    "whitepaper": 2,
    "toolkit": 1,
    "guide": 1,
    "promotion": 1
  },
  "by_audience": {
    "Enterprise": 2,
    "SMB": 1,
    "New": 1,
    "Premium": 1
  },
  "embedding_dimension": 384,
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

---

## How to Pass Segments to RAG API

### Integration with Segmentation Agent

The RAG API can receive segments from the Segmentation Agent (Port 8001) and generate content for them.

### Example Workflow:

**Step 1: Get segments from Segmentation Agent**
```powershell
# Fetch all segments from Agent 1 (Port 8001)
$segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" -Method Get
$segments | ConvertTo-Json -Depth 5
```

**Step 2: For each segment, generate relevant content using search**
```powershell
# Get a segment
$segment = $segments.data[0]  # e.g., "High Value Customers"

# Search RAG content relevant to this segment
$searchBody = @{
    query = "$($segment.name): $($segment.description)"
    top_k = 5
} | ConvertTo-Json

$segmentContent = Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post `
    -Body $searchBody `
    -ContentType "application/json"

Write-Host "Segment: $($segment.name)"
Write-Host "Found $($segmentContent.results_count) relevant content items"
$segmentContent.results | ForEach-Object {
    Write-Host "  - $($_.title)"
}
```

---

## Complete Example Script

```powershell
# FILE: Orchestrate-Segmentation-and-Content.ps1

$SEGMENTATION_API = "http://localhost:8001"
$RAG_API = "http://localhost:8000"

# Step 1: Get all segments
Write-Host "Fetching segments from Segmentation Agent..." -ForegroundColor Cyan
$segments = Invoke-RestMethod -Uri "$SEGMENTATION_API/api/segments" -Method Get

if ($segments.data) {
    foreach ($segment in $segments.data) {
        Write-Host "`nSegment: $($segment.name)" -ForegroundColor Yellow
        Write-Host "Description: $($segment.description)" -ForegroundColor Gray
        Write-Host "Customers: $($segment.customer_count)" -ForegroundColor Gray
        
        # Step 2: Search RAG for content relevant to this segment
        $query = "$($segment.name): $($segment.description)"
        $searchBody = @{
            query = $query
            top_k = 3
        } | ConvertTo-Json
        
        try {
            $content = Invoke-RestMethod -Uri "$RAG_API/search" `
                -Method Post `
                -Body $searchBody `
                -ContentType "application/json" `
                -TimeoutSec 30
            
            Write-Host "  Relevant Content Items:" -ForegroundColor Cyan
            $content.results | ForEach-Object {
                Write-Host "    - $($_.title) (Type: $($_.content_type))"
            }
        }
        catch {
            Write-Host "  Error fetching content: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
```

---

## Data Flow Diagram

```
┌─────────────────────────┐
│   Segmentation Agent    │  Port 8001
│   (Agent 1)             │
├─────────────────────────┤
│  - Customer Segments    │
│  - Segment Criteria     │
│  - Customer Counts      │
└────────────┬────────────┘
             │
             │ GET /api/segments
             │
             ▼
┌─────────────────────────┐
│   Your Script/App       │
│   (Orchestration)       │
└────────────┬────────────┘
             │
             │ Send query based on segment
             │
             ▼
┌─────────────────────────┐
│    RAG API              │  Port 8000
│    (Agent 2)            │
├─────────────────────────┤
│  POST /search           │  Search for content
│  GET /content           │  List all content
│  GET /stats             │  Get statistics
└─────────────────────────┘
             │
             │ Return relevant content
             │
             ▼
┌─────────────────────────┐
│   Marketing Campaigns   │
│   (Message Generation)  │
└─────────────────────────┘
```

---

## Important Notes

1. **Semantic Search**: The search endpoint uses embedding-based semantic similarity, not just keyword matching
2. **Timeout**: Embedding operations can take a few seconds, so use longer timeouts (30+ seconds)
3. **Content Caching**: The API may cache embeddings for performance
4. **Audience Filters**: Use specific audiences: B2B, B2C, Enterprise, SMB
5. **Content Types**: Valid types are: email, social, ad, blog, whitepaper, toolkit, guide, promotion

---

## Environment Setup

The RAG API uses a PostgreSQL database for storing content. Configuration:

```
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/marketing_content
EMBEDDING_MODEL: sentence-transformers/all-MiniLM-L6-v2
API_HOST: 0.0.0.0
API_PORT: 8000
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Make sure RAG API is running: `python api.py` |
| "Operation timed out" | Increase timeout in PowerShell: `-TimeoutSec 30` |
| "No results found" | Check if content exists in database or try different search query |
| "Database connection error" | Verify PostgreSQL is running and DATABASE_URL is correct |

