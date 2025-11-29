# How to Pass Segments to RAG API and Get Content

## Overview
This guide shows you the exact steps to:
1. Get segments from the **Segmentation Agent** (Port 8001)
2. Pass segment information to the **RAG API** (Port 8000)
3. Get relevant marketing content back

---

## Step-by-Step Walkthrough

### Step 1: Get Segments from Segmentation Agent

**Command:**
```powershell
$segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" -Method Get
```

**What you get:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "High Value Customers",
      "description": "Customers with high lifetime value and engagement",
      "customer_count": 150,
      "criteria": {
        "min_total_purchases": 5000,
        "min_engagement_score": 70
      },
      "created_at": "2025-11-28T..."
    },
    {
      "id": 2,
      "name": "At Risk",
      "description": "Previously active customers showing declining engagement",
      "customer_count": 80,
      "criteria": { ... }
    }
    // ... more segments
  ]
}
```

**Access the data:**
```powershell
# Get all segments
$segmentsList = $segments.data

# Get first segment
$firstSegment = $segments.data[0]
Write-Host "Segment: $($firstSegment.name)"
Write-Host "Description: $($firstSegment.description)"
Write-Host "Customers: $($firstSegment.customer_count)"
```

---

### Step 2: Create Search Query from Segment

The RAG API uses **semantic search**, so you need to create a meaningful query from the segment information.

**Option A: Use segment name + description**
```powershell
$segment = $segments.data[0]  # Get a segment

# Create a search query combining name and description
$searchQuery = "$($segment.name): $($segment.description)"
# Result: "High Value Customers: Customers with high lifetime value and engagement"
```

**Option B: Use segment criteria**
```powershell
$segment = $segments.data[0]

# Create query from criteria
$criteria = $segment.criteria | ConvertTo-Json -Compress
$searchQuery = "$($segment.name) - Criteria: $criteria"
# Result: "High Value Customers - Criteria: {min_total_purchases:5000,min_engagement_score:70}"
```

**Option C: Custom query based on business logic**
```powershell
$segment = $segments.data[0]

# Create contextual query
if ($segment.name -like "*High*") {
    $searchQuery = "premium benefits VIP exclusive loyalty rewards"
} elseif ($segment.name -like "*Risk*") {
    $searchQuery = "re-engagement win back comeback incentive offer"
} else {
    $searchQuery = $segment.name
}
```

---

### Step 3: Send Search Query to RAG API

**Basic Search:**
```powershell
$segment = $segments.data[0]
$searchQuery = "$($segment.name): $($segment.description)"

# Create request body
$searchBody = @{
    query = $searchQuery
    top_k = 3
} | ConvertTo-Json

# Send to RAG API
$content = Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post `
    -Body $searchBody `
    -ContentType "application/json" `
    -TimeoutSec 30

Write-Host "Found $($content.results_count) relevant content items"
```

**Search with Filters (More Specific):**
```powershell
$segment = $segments.data[0]

# Determine audience from segment name
$audience = if ($segment.name -like "*Enterprise*") { "Enterprise" } else { "SMB" }

# Create filtered search
$searchBody = @{
    query = "$($segment.name): $($segment.description)"
    audience = $audience
    top_k = 5
    content_type = "whitepaper"  # Optional: specific content type
} | ConvertTo-Json

$content = Invoke-RestMethod -Uri "http://localhost:8000/search" `
    -Method Post -Body $searchBody -ContentType "application/json" -TimeoutSec 30
```

---

### Step 4: Get the Content Results

**What you get:**
```json
{
  "query": "High Value Customers: Customers with high lifetime value and engagement",
  "results_count": 3,
  "results": [
    {
      "id": 4,
      "title": "Premium Member Benefits",
      "content": "Exclusive benefits and rewards for high-value customers",
      "content_type": "promotion",
      "audience": "Premium",
      "campaign_name": "VIP_Benefits",
      "tags": [],
      "created_at": "2025-11-28T..."
    },
    {
      "id": 1,
      "title": "Enterprise Security Solutions",
      "content": "Comprehensive security framework for large organizations",
      "content_type": "whitepaper",
      "audience": "Enterprise",
      "campaign_name": "Enterprise_2025",
      "tags": [],
      "created_at": "2025-11-28T..."
    },
    // ... more results
  ]
}
```

**Access the results:**
```powershell
# Loop through all results
$content.results | ForEach-Object {
    Write-Host "Title: $($_.title)"
    Write-Host "Type: $($_.content_type)"
    Write-Host "Audience: $($_.audience)"
    Write-Host "Content: $($_.content)"
    Write-Host ""
}

# Get just the titles
$content.results | ForEach-Object { Write-Host $_.title }

# Get first result
$firstContent = $content.results[0]
Write-Host "Best match: $($firstContent.title)"
```

---

## Complete Example: End-to-End Flow

```powershell
# ============================================
# COMPLETE SEGMENT TO CONTENT WORKFLOW
# ============================================

Write-Host "Step 1: Fetching segments..." -ForegroundColor Cyan

# Get all segments from Segmentation Agent
$segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" -Method Get
$segmentList = $segments.data

Write-Host "Found $($segmentList.Count) segments`n" -ForegroundColor Green

# ============================================
# Process each segment
# ============================================

foreach ($segment in $segmentList) {
    Write-Host "Processing: $($segment.name)" -ForegroundColor Yellow
    Write-Host "  Customers: $($segment.customer_count)" -ForegroundColor Gray
    Write-Host "  Description: $($segment.description)" -ForegroundColor Gray
    
    # Create search query from segment
    $searchQuery = "$($segment.name): $($segment.description)"
    
    # Build request
    $searchBody = @{
        query = $searchQuery
        top_k = 5
    } | ConvertTo-Json
    
    # Send to RAG API
    try {
        $content = Invoke-RestMethod -Uri "http://localhost:8000/search" `
            -Method Post `
            -Body $searchBody `
            -ContentType "application/json" `
            -TimeoutSec 30
        
        Write-Host "  Found $($content.results_count) relevant content items:" -ForegroundColor Green
        
        # Display results
        $content.results | ForEach-Object {
            Write-Host "    ✓ $($_.title)" -ForegroundColor Cyan
            Write-Host "      Type: $($_.content_type) | Audience: $($_.audience)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Done!" -ForegroundColor Green
```

---

## Data Flow Diagram

```
SEGMENTATION AGENT (Port 8001)
│
├─ Get /api/segments
│  │
│  ├─ Segment 1: "High Value Customers"
│  │   └─ Description: "Customers with high lifetime value..."
│  │   └─ Customer Count: 150
│  │
│  ├─ Segment 2: "At Risk"
│  │   └─ Description: "Previously active customers..."
│  │   └─ Customer Count: 80
│  │
│  └─ Segment 3: "New Customers"
│      └─ Description: "Recently onboarded..."
│      └─ Customer Count: 45
│
↓ (Use segment data to create search queries)
│
RAG API (Port 8000)
│
├─ POST /search with query: "High Value Customers: ..."
│  └─ Returns relevant content items
│
├─ POST /search with query: "At Risk: ..."
│  └─ Returns relevant content items
│
└─ POST /search with query: "New Customers: ..."
   └─ Returns relevant content items
```

---

## Example Queries by Segment

### For "High Value Customers"
```powershell
# Query 1: Simple
$query = "premium benefits VIP customers"

# Query 2: With description
$query = "High Value Customers: Customers with high lifetime value"

# Query 3: With specific needs
$query = "enterprise solutions premium support exclusive benefits"
```

### For "At Risk" Segment
```powershell
# Query 1: Simple
$query = "win back re-engagement comeback"

# Query 2: With description
$query = "At Risk: Previously active customers showing declining engagement"

# Query 3: With specific needs
$query = "special offer incentive discount to re-activate customers"
```

### For "New Customers"
```powershell
# Query 1: Simple
$query = "onboarding tutorial getting started guide"

# Query 2: With description
$query = "New Customers: Recently onboarded customers"

# Query 3: With specific needs
$query = "welcome introduction setup tutorial first steps"
```

---

## Advanced: Add Error Handling

```powershell
# Get segments with error handling
try {
    $segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" `
        -Method Get -TimeoutSec 10
} catch {
    Write-Host "Failed to fetch segments: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Search RAG with error handling and retry
foreach ($segment in $segments.data) {
    $searchBody = @{
        query = "$($segment.name): $($segment.description)"
        top_k = 5
    } | ConvertTo-Json
    
    $retryCount = 0
    $maxRetries = 3
    $success = $false
    
    while ($retryCount -lt $maxRetries -and -not $success) {
        try {
            $content = Invoke-RestMethod -Uri "http://localhost:8000/search" `
                -Method Post `
                -Body $searchBody `
                -ContentType "application/json" `
                -TimeoutSec 30
            
            $success = $true
            Write-Host "Segment: $($segment.name) - Found $($content.results_count) items" -ForegroundColor Green
            
        } catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host "Retry $retryCount/$maxRetries..." -ForegroundColor Yellow
                Start-Sleep -Seconds 2
            } else {
                Write-Host "Failed after $maxRetries attempts: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}
```

---

## Summary

**To pass segments to RAG and get content:**

1. **Get segments** from `http://localhost:8001/api/segments`
2. **Create query** from segment.name + segment.description
3. **POST to search** at `http://localhost:8000/search` with query
4. **Parse results** to get content items
5. **Use content** for your campaigns

That's it! 🎉

