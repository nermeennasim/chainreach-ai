# RAG API - Complete Documentation Index

## 📚 Documentation Files Created

### 1. **RAG_API_README.md** ⭐ START HERE
   - **Best for**: First-time users, overview
   - **Size**: 10.4 KB
   - **Contains**:
     - Quick start (TL;DR)
     - All 5 endpoints explained
     - Integration with Segmentation Agent
     - Real examples
     - FAQ section
     - Quick test commands

### 2. **RAG_API_QUICK_REFERENCE.md**
   - **Best for**: Quick lookup, quick tests
   - **Size**: 6.6 KB
   - **Contains**:
     - What is RAG API?
     - 5 endpoints in table format
     - How to use each endpoint
     - Integration workflow
     - Common use cases
     - Troubleshooting

### 3. **RAG_API_COMPLETE_GUIDE.md**
   - **Best for**: Detailed reference, complete API documentation
   - **Size**: 9.4 KB
   - **Contains**:
     - Every endpoint with full details
     - PowerShell examples for each
     - Optional parameters explained
     - Response format examples
     - Data flow diagrams
     - Database configuration
     - Troubleshooting table

### 4. **HOW_TO_PASS_SEGMENTS_TO_RAG.md**
   - **Best for**: Integration implementation
   - **Size**: 10.6 KB
   - **Contains**:
     - Step-by-step segment to content flow
     - How to create search queries from segments
     - Complete end-to-end example
     - Data flow diagram
     - Example queries by segment type
     - Advanced error handling
     - Multiple query strategies

## 🚀 Ready-to-Run Scripts

### 1. **ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1** ⭐ RUN THIS FIRST
   - **What it does**: 
     - Fetches all segments from Segmentation Agent
     - Finds relevant content for each segment
     - Shows summary with results
   
   - **How to run**:
     ```powershell
     .\ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1
     ```
   
   - **Output**: Beautiful formatted report showing:
     - All segments from Agent 1
     - Content items found for each
     - Summary statistics

### 2. **RAG_API_GUIDE.ps1**
   - **What it does**: Tests all 5 endpoints
   - **How to run**:
     ```powershell
     powershell -NoProfile -Command "& .\RAG_API_GUIDE.ps1"
     ```
   - **Output**: Health check, content listing, stats, search results

---

## 🎯 Quick Start Guide (5 Minutes)

### Step 1: Make sure services are running
```powershell
# Terminal 1 - Segmentation Agent
cd segmentation-agent-node
npm start

# Terminal 2 - RAG API
cd person2-rag
python api.py
```

### Step 2: Run the orchestration script
```powershell
cd c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai
.\ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1
```

### Step 3: Check the output
The script will show you:
- ✓ All segments from your database
- ✓ Relevant content for each segment
- ✓ Summary report

---

## 📖 What Each Document Is For

### "I just want a quick overview"
→ Read: **RAG_API_README.md** (10 min read)

### "I need to know how to call the endpoints"
→ Read: **RAG_API_QUICK_REFERENCE.md** (5 min)

### "I need all the technical details"
→ Read: **RAG_API_COMPLETE_GUIDE.md** (20 min)

### "I want to integrate segments with content"
→ Read: **HOW_TO_PASS_SEGMENTS_TO_RAG.md** (15 min)

### "I want to see it working right now"
→ Run: **ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1** (2 min)

---

## 🔧 The 5 API Endpoints (Summary)

| Endpoint | Method | Purpose | When to Use |
|----------|--------|---------|------------|
| `/health` | GET | Check if running | Verify API is up |
| `/content` | GET | List all content | See everything |
| `/content/{id}` | GET | Get one item | Display specific content |
| `/search` | POST | Find relevant content | **Main endpoint** - find content for segments |
| `/stats` | GET | Get statistics | See library overview |

---

## 🔗 The Integration Pattern (Copy-Paste Ready)

```powershell
# 1. Get segments
$segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" -Method Get

# 2. Process each segment
foreach ($segment in $segments.data) {
    
    # 3. Create search query
    $searchBody = @{
        query = "$($segment.name): $($segment.description)"
        top_k = 5
    } | ConvertTo-Json
    
    # 4. Find content
    $content = Invoke-RestMethod -Uri "http://localhost:8000/search" `
        -Method Post `
        -Body $searchBody `
        -ContentType "application/json" `
        -TimeoutSec 30
    
    # 5. Use results
    Write-Host "Segment: $($segment.name)"
    $content.results | ForEach-Object { Write-Host "  - $($_.title)" }
}
```

---

## 📋 Checklist: Setting Up RAG Integration

- [ ] Segmentation Agent running on port 8001
- [ ] RAG API running on port 8000
- [ ] Read RAG_API_README.md
- [ ] Run ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1
- [ ] Test search endpoint manually with a query
- [ ] Understand the data flow (segment → query → content)
- [ ] Add error handling to your integration
- [ ] Ready to build!

---

## 🎯 Common Tasks & Solutions

### Task: Get segments and their content
**File**: HOW_TO_PASS_SEGMENTS_TO_RAG.md  
**Section**: "Complete Example: End-to-End Flow"

### Task: See all endpoints working
**File**: RAG_API_COMPLETE_GUIDE.md  
**Section**: Every endpoint has PowerShell examples

### Task: Understand the architecture
**File**: RAG_API_COMPLETE_GUIDE.md  
**Section**: "Data Flow Diagram"

### Task: Run a quick test
**File**: RAG_API_QUICK_REFERENCE.md  
**Section**: "Quick Test"

### Task: Troubleshoot issues
**File**: RAG_API_QUICK_REFERENCE.md  
**Section**: "Troubleshooting"

---

## 🚨 Important Notes

1. **Search is semantic, not keyword-based**
   - It uses embeddings (vector similarity)
   - More intelligent than substring matching
   - May take 2-5 seconds

2. **Always use timeouts for search**
   ```powershell
   -TimeoutSec 30
   ```

3. **Query creation is important**
   - Combine segment name + description for best results
   - Example: "High Value Customers: high lifetime value and engagement"

4. **Results are ranked by relevance**
   - First result is most relevant
   - Use `top_k` to get more options

5. **Optional filters improve results**
   - audience, content_type, campaign_name, tags
   - But not required

---

## 📞 Quick Reference: Port Numbers

| Service | Port | Command | Status |
|---------|------|---------|--------|
| Segmentation Agent | 8001 | `npm start` in segmentation-agent-node | ✓ Running |
| RAG API | 8000 | `python api.py` in person2-rag | ✓ Running |
| Message Generation | 8080 | TBD | - |

---

## 🎉 You're Ready!

The RAG API is fully documented and tested. You have:

✅ 4 comprehensive guides  
✅ 2 ready-to-run scripts  
✅ All endpoints explained  
✅ Integration examples  
✅ Troubleshooting help  

### Next: Start building! 🚀

Choose a file above and dive in. Most people start with:
1. RAG_API_README.md for overview
2. ORCHESTRATE_SEGMENTATION_AND_CONTENT.ps1 to see it work
3. HOW_TO_PASS_SEGMENTS_TO_RAG.md to build their own

Good luck! 🎯

