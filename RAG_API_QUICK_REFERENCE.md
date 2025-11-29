# RAG API - Quick Reference Summary

## 🚀 What is the RAG API?

The RAG API (Retrieval-Augmented Generation API) running on **port 8000** is your **marketing content retrieval engine**. It uses semantic search with embeddings to find relevant content for customer segments.

---

## 📍 API Location
- **URL**: `http://localhost:8000`
- **Status**: Currently running ✓
- **Health Check**: `GET /health` ✓ Works

---

## 🔌 All Available Endpoints

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | GET | `/health` | Check API status |
| 2 | GET | `/content?skip=0&limit=10` | List all content (paginated) |
| 3 | GET | `/content/{id}` | Get specific content by ID |
| 4 | POST | `/search` | Search content semantically |
| 5 | GET | `/stats` | Get library statistics |

---

## 📊 How to Use Each Endpoint

### Endpoint 1: Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
```
**Response**: `{ "status": "healthy", "version": "1.0.0" }`

---

### Endpoint 2: List All Content
```powershell
# Get first 10 items
Invoke-RestMethod -Uri "http://localhost:8000/content?skip=0&limit=10" -Method Get

# Get items 11-20
Invoke-RestMethod -Uri "http://localhost:8000/content?skip=10&limit=10" -Method Get
```
**Parameters**: `skip` (default 0), `limit` (default 10, max 100)

---

### Endpoint 3: Get Content by ID
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/content/1" -Method Get
```
**Response**: Single content item with title, type, audience, etc.

---

### Endpoint 4: Search Content ⭐ MAIN ONE
This is the **most important endpoint** for your workflow.

**How it works**:
1. You send a query (based on segment name/description)
2. API uses embeddings to find semantically similar content
3. Returns top N most relevant items

```powershell
# Create search request
$searchBody = @{
    query = "your search text"
    top_k = 3
} | ConvertTo-Json

# Send request
Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post `
    -Body $searchBody `
    -ContentType "application/json"
```

**Optional Filters**:
```powershell
$searchBody = @{
    query = "enterprise solutions"
    top_k = 5
    audience = "Enterprise"
    content_type = "whitepaper"
    campaign_name = "Enterprise_2025"
} | ConvertTo-Json
```

---

### Endpoint 5: Get Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/stats" -Method Get
```
**Returns**: Total content, breakdown by type/audience, embedding model info

---

## 🔗 Integration with Segmentation Agent

**Workflow**:

```
1. Get segments from Segmentation Agent (Port 8001)
   → GET http://localhost:8001/api/segments
   
2. For each segment:
   → Create query from segment.name + segment.description
   → Send to RAG API search endpoint
   → Get relevant content back
   
3. Use content for your campaigns
```

**Example**:
```powershell
# Get segments
$segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" -Method Get

# Process each segment
foreach ($segment in $segments.data) {
    $searchBody = @{
        query = "$($segment.name): $($segment.description)"
        top_k = 5
    } | ConvertTo-Json
    
    $content = Invoke-RestMethod -Uri "http://localhost:8000/search" `
        -Method Post -Body $searchBody -ContentType "application/json"
    
    Write-Host "Segment: $($segment.name)"
    $content.results | ForEach-Object { Write-Host "  - $($_.title)" }
}
```

---

## 📝 Example: Complete Workflow

See the included script: **`ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1`**

Run it with:
```powershell
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai"
.\ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1
```

This script:
1. ✓ Fetches all segments from Segmentation Agent
2. ✓ Checks RAG API health
3. ✓ Gets RAG statistics
4. ✓ Searches for content for each segment
5. ✓ Shows summary results

---

## 🎯 Common Use Cases

### Use Case 1: Find All Enterprise Content
```powershell
$body = @{
    query = "enterprise"
    audience = "Enterprise"
    top_k = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post -Body $body -ContentType "application/json"
```

### Use Case 2: Find Promotional Content
```powershell
$body = @{
    query = "promotion discount offer"
    content_type = "promotion"
    top_k = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post -Body $body -ContentType "application/json"
```

### Use Case 3: Get All Content for Pagination
```powershell
# Page 1
Invoke-RestMethod -Uri "http://localhost:8000/content?skip=0&limit=20" -Method Get

# Page 2
Invoke-RestMethod -Uri "http://localhost:8000/content?skip=20&limit=20" -Method Get
```

---

## ⚡ Key Things to Know

1. **Search is semantic**: Uses embeddings, not keyword matching
2. **top_k**: Number of results (1-10, default 3)
3. **Filters are optional**: But they help narrow down results
4. **Timeout**: Use `-TimeoutSec 30` for POST requests (embeddings take time)
5. **Content types**: email, social, ad, blog, whitepaper, toolkit, guide, promotion
6. **Audiences**: B2B, B2C, Enterprise, SMB

---

## 📂 Content Structure

Each content item has:
- `id`: Unique identifier
- `title`: Content title
- `content`: Content body text
- `content_type`: Type (email, blog, etc.)
- `audience`: Target audience
- `campaign_name`: Associated campaign
- `tags`: Array of tags
- `created_at`: Creation timestamp

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Start API: `python api.py` in person2-rag folder |
| "Operation timed out" | Use longer timeout: `-TimeoutSec 30` |
| "No results" | Check your search query or try different keywords |
| "Database error" | Ensure PostgreSQL is running |

---

## 📋 Files Reference

- **Main API**: `person2-rag/api.py`
- **Config**: `person2-rag/config.py`
- **Complete Guide**: `RAG_API_COMPLETE_GUIDE.md`
- **Orchestration Script**: `ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1`

---

## ✅ Quick Test

```powershell
# 1. Test health
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get

# 2. Test search
$body = @{ query = "security"; top_k = 3 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/search" -Method Post -Body $body -ContentType "application/json"

# 3. Get stats
Invoke-RestMethod -Uri "http://localhost:8000/stats" -Method Get
```

All working? You're good to go! 🎉

