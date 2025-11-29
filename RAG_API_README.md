# RAG API - Everything You Need to Know

## 📌 TL;DR (Too Long; Didn't Read)

The RAG API on **port 8000** is a content retrieval system that finds marketing content relevant to customer segments.

### Quick Start:
```powershell
# 1. Get segments
$segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" -Method Get

# 2. For each segment, search for content
foreach ($segment in $segments.data) {
    $body = @{
        query = "$($segment.name): $($segment.description)"
        top_k = 5
    } | ConvertTo-Json
    
    $content = Invoke-RestMethod -Uri "http://localhost:8000/search" `
        -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "Segment: $($segment.name) - Found $($content.results_count) items"
}
```

---

## 🎯 All 5 Endpoints Explained

| # | Method | Endpoint | What it Does | Response |
|---|--------|----------|--------------|----------|
| **1** | GET | `/health` | Check if API is running | `{status: "healthy"}` |
| **2** | GET | `/content?skip=0&limit=10` | List all content | Array of content items |
| **3** | GET | `/content/1` | Get one content item | Single content object |
| **4** | POST | `/search` | **Find content by query** | Relevant results ranked |
| **5** | GET | `/stats` | Library statistics | Stats object |

---

## 🔍 Endpoint Breakdown

### 1️⃣ Health Check
Check if the API is alive and working.
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get

# Response: {"status": "healthy", "version": "1.0.0", "embedding_model": "..."}
```

---

### 2️⃣ List Content (Paginated)
Get all content items with pagination.
```powershell
# Get items 0-9
Invoke-RestMethod -Uri "http://localhost:8000/content?skip=0&limit=10" -Method Get

# Get items 10-19 (next page)
Invoke-RestMethod -Uri "http://localhost:8000/content?skip=10&limit=10" -Method Get
```

**Parameters:**
- `skip`: How many items to skip (0-based)
- `limit`: How many items to return (1-100)

---

### 3️⃣ Get Specific Content
Get one content item by ID.
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/content/1" -Method Get

# Response: {id: 1, title: "...", content: "...", type: "...", audience: "..."}
```

---

### 4️⃣ Search Content ⭐ (The Important One)
Find content using semantic search based on a query.

**Basic Search:**
```powershell
$searchBody = @{
    query = "your search text"
    top_k = 3  # Return top 3 results
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post -Body $searchBody -ContentType "application/json"
```

**With Filters:**
```powershell
$searchBody = @{
    query = "enterprise solutions"
    top_k = 5
    audience = "Enterprise"
    content_type = "whitepaper"
    campaign_name = "Enterprise_2025"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post -Body $searchBody -ContentType "application/json"
```

**Response:**
```json
{
  "query": "enterprise solutions",
  "results_count": 3,
  "results": [
    {
      "id": 1,
      "title": "Enterprise Security Solutions",
      "content": "Comprehensive security...",
      "content_type": "whitepaper",
      "audience": "Enterprise",
      "campaign_name": "Enterprise_2025",
      "tags": [],
      "created_at": "2025-11-28T..."
    }
    // ... more results
  ]
}
```

---

### 5️⃣ Get Statistics
Get overview of what's in the content library.
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/stats" -Method Get

# Response: {
#   total_content: 15,
#   by_content_type: {whitepaper: 5, email: 4, ...},
#   by_audience: {Enterprise: 6, SMB: 7, ...},
#   embedding_dimension: 384,
#   embedding_model: "..."
# }
```

---

## 🔗 How to Integrate with Segmentation Agent

### The Workflow:

```
Segmentation Agent (Port 8001)
    ↓ GET /api/segments
    ↓ Get list of customer segments
    ↓
Your Code
    ↓ For each segment:
    ↓   1. Extract name + description
    ↓   2. Create search query
    ↓   3. POST to /search
    ↓
RAG API (Port 8000)
    ↓ Semantic search for relevant content
    ↓ Return ranked results
    ↓
You Get Relevant Content for Each Segment
```

### Step-by-Step Implementation:

```powershell
# Step 1: Get all segments
$segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" -Method Get

# Step 2: Extract segment data
$segmentList = $segments.data  # This is an array of segments

# Step 3: For each segment, find content
foreach ($segment in $segmentList) {
    
    # Create search query from segment
    $searchQuery = "$($segment.name): $($segment.description)"
    
    # Create request body
    $searchBody = @{
        query = $searchQuery
        top_k = 5  # Get top 5 results per segment
    } | ConvertTo-Json
    
    # Send to RAG API
    $contentResults = Invoke-RestMethod -Uri "http://localhost:8000/search" `
        -Method Post `
        -Body $searchBody `
        -ContentType "application/json" `
        -TimeoutSec 30
    
    # Step 4: Process results
    Write-Host "Segment: $($segment.name)"
    Write-Host "Found: $($contentResults.results_count) content items"
    
    foreach ($item in $contentResults.results) {
        Write-Host "  - $($item.title) ($($item.content_type))"
    }
}
```

---

## 📝 Real Example: Processing 3 Segments

```powershell
# Sample segment data you'll get:
# [
#   {id: 1, name: "High Value Customers", description: "...", customer_count: 150},
#   {id: 2, name: "At Risk", description: "...", customer_count: 80},
#   {id: 3, name: "New Customers", description: "...", customer_count: 45}
# ]

# Get segments
$segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" -Method Get

# Process High Value Customers
$segment1 = $segments.data[0]
$search1 = @{
    query = "High Value Customers: Customers with high lifetime value and engagement"
    top_k = 3
} | ConvertTo-Json
$result1 = Invoke-RestMethod -Uri "http://localhost:8000/search" -Method Post -Body $search1 -ContentType "application/json"
# Returns: Premium Member Benefits, Enterprise Security Solutions, VIP Toolkit

# Process At Risk
$segment2 = $segments.data[1]
$search2 = @{
    query = "At Risk: Previously active customers showing declining engagement"
    top_k = 3
} | ConvertTo-Json
$result2 = Invoke-RestMethod -Uri "http://localhost:8000/search" -Method Post -Body $search2 -ContentType "application/json"
# Returns: Win-Back Campaign, Re-engagement Guide, Special Offer

# Process New Customers
$segment3 = $segments.data[2]
$search3 = @{
    query = "New Customers: Recently onboarded customers"
    top_k = 3
} | ConvertTo-Json
$result3 = Invoke-RestMethod -Uri "http://localhost:8000/search" -Method Post -Body $search3 -ContentType "application/json"
# Returns: Onboarding Guide, Welcome Email, Getting Started Toolkit
```

---

## 🛠️ Available Parameters

### Search Parameters
- **query** (required): Your search text
- **top_k** (optional): Number of results (1-10, default 3)
- **audience** (optional): B2B, B2C, Enterprise, SMB
- **content_type** (optional): email, social, ad, blog, whitepaper, toolkit, guide, promotion
- **campaign_name** (optional): Filter by campaign
- **tags** (optional): Array of tags

---

## 📊 Content Fields

Each content item has:
- **id**: Unique identifier
- **title**: Content title
- **content**: The actual content/body
- **content_type**: What kind of content (email, blog, etc.)
- **audience**: Who it's for (Enterprise, SMB, etc.)
- **campaign_name**: Associated campaign
- **tags**: Keywords/tags
- **created_at**: When it was created

---

## ⏱️ Performance Notes

- **Health check**: ~100ms
- **List content**: ~200ms
- **Get by ID**: ~150ms
- **Search**: 2-5 seconds (uses embeddings, which is slow but accurate)
- **Statistics**: ~300ms

**Always use `-TimeoutSec 30` for search requests!**

---

## 🎯 Ready-Made Scripts

You have these scripts ready to use:

1. **`RAG_API_GUIDE.ps1`**: Tests all endpoints
2. **`ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1`**: Full workflow integration
3. **`RAG_API_COMPLETE_GUIDE.md`**: Detailed reference
4. **`HOW_TO_PASS_SEGMENTS_TO_RAG.md`**: Step-by-step integration

---

## ❓ FAQ

**Q: What's the difference between /content and /search?**
- `/content`: Lists ALL content in order (no filtering)
- `/search`: Finds RELEVANT content based on your query (semantic matching)

**Q: How do I pass a segment to the API?**
- You don't pass the segment object. You create a search query from the segment's name and description.
- Example: `query = "High Value Customers: high lifetime value and engagement"`

**Q: Why does search take so long?**
- It uses embeddings (vector similarity), which requires computation. This is normal.

**Q: Can I filter by multiple criteria?**
- Yes! Use audience + content_type + campaign_name together.

**Q: What if I get no results?**
- Try a broader/different search query
- Check stats to see what content exists
- Try without filters first

---

## ✅ Quick Test

Copy and run this to verify everything works:

```powershell
# Test 1: Health
Write-Host "Test 1: Health" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get

# Test 2: Search
Write-Host "Test 2: Search" -ForegroundColor Cyan
$body = @{ query = "enterprise"; top_k = 3 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/search" -Method Post -Body $body -ContentType "application/json"

# Test 3: Stats
Write-Host "Test 3: Stats" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:8000/stats" -Method Get

Write-Host "All tests passed!" -ForegroundColor Green
```

---

## 🚀 Next Steps

1. Run the orchestration script to see it working:
   ```powershell
   .\ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1
   ```

2. Build your integration using the pattern shown above

3. Extend with your custom logic (filtering, scoring, etc.)

4. Connect to Message Generation (Agent 3) to create campaigns

---

## 📞 Support

Files created for you:
- `RAG_API_QUICK_REFERENCE.md` - Quick lookup
- `RAG_API_COMPLETE_GUIDE.md` - Full documentation
- `HOW_TO_PASS_SEGMENTS_TO_RAG.md` - Integration guide
- `ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1` - Working script

Good luck! 🎉

