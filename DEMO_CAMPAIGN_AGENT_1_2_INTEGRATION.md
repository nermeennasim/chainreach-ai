# Demo Campaign Integration - Agent 1 & Agent 2 Ready! 🚀

## What Was Updated

The demo campaign at `http://localhost:3000/campaign/demo` now integrates **Agent 1 (Segmentation)** and **Agent 2 (RAG/Content)** with real API calls!

### Changes Made

**File**: `person5-orchestrator-dashboard/hooks/useOrchestrator.ts`

#### Before (Simulated)
```typescript
// Agent 1: Simulated for 2 seconds
await new Promise(resolve => setTimeout(resolve, 2000));
const segments = [{...}]; // Hardcoded demo data

// Agent 2: Simulated for 1.5 seconds  
await new Promise(resolve => setTimeout(resolve, 1500));
const templates = [{...}]; // Hardcoded demo data
```

#### After (Real API Calls)
```typescript
// Agent 1: Real API call
const realSegments = await getSegments();          // GET http://localhost:8001/api/segments
const customersData = await getCustomers(100, 0); // GET http://localhost:8001/api/customers

// Agent 2: Real API call
const contentResults = await searchContent('enterprise solutions', 5); // POST http://localhost:8000/search
```

---

## How It Works Now

### Step 1: Start All Services

```bash
# Terminal 1: Segmentation Agent (port 8001)
cd segmentation-agent-node
npm start

# Terminal 2: RAG API (port 8000)
cd person2-rag
python api.py

# Terminal 3: Dashboard (port 3000)
cd person5-orchestrator-dashboard
npm run dev
```

### Step 2: Open Demo Campaign

```
http://localhost:3000/campaign/demo
```

### Step 3: Click "Start Campaign"

The orchestration will now:

1. **Agent 1 - Segmentation** 🎯
   - ✅ Calls `GET http://localhost:8001/api/segments` 
   - ✅ Calls `GET http://localhost:8001/api/customers?limit=100&offset=0`
   - Shows progress: "Loading segments and customers..."
   - Falls back to sample data if API unavailable

2. **Agent 2 - Content Retrieval** 📚
   - ✅ Calls `POST http://localhost:8000/search`
   - Searches for "enterprise solutions" (top 5 results)
   - Shows progress: "Retrieving templates from RAG..."
   - Falls back to default templates if API unavailable

3. **Agent 3 - Message Generation** ✍️
   - Generates 3 variants per customer
   - Uses first 10 customers from Agent 1 data

4. **Agent 4 - Compliance Check** 🛡️
   - Validates all messages via Azure Content Safety API
   - Shows approval/rejection status
   - Displays safety scores

5. **Agent 5 - Campaign Execution** 📤
   - Would send approved messages
   - (Simulated in demo mode)

---

## Real Data Integration

### What Gets Loaded

**From Agent 1 (Segmentation)**:
- All segments with names and descriptions
- First 100 customers with all details:
  - customer_id, name, email
  - recency, frequency, monetary scores
  - engagement_score, segment_name
  - purchase history

**From Agent 2 (RAG)**:
- Top 5 matching content items for "enterprise solutions"
- Content includes: title, type, audience, relevance score
- Used to generate personalized message templates

**Result**: Real customer segments + Real content = Real personalized campaigns

---

## Error Handling

If either API is unavailable:

```typescript
try {
  // Call real Agent 1 API
  const realSegments = await getSegments();
  // ... success handling
} catch (error) {
  // Falls back to sample data
  updateAgentStatus(1, { status: 'done', progress: 100 });
  toast.success('Agent 1: Using sample data (API unavailable)');
}
```

This ensures the demo still works even if agents aren't running!

---

## Testing Checklist

- [ ] Start Segmentation Agent on port 8001
- [ ] Start RAG API on port 8000
- [ ] Start Dashboard on port 3000
- [ ] Open `http://localhost:3000/campaign/demo`
- [ ] Click "Start Campaign" button
- [ ] Watch Agent 1 load segments and customers
- [ ] Watch Agent 2 search for content
- [ ] Watch Agent 3 generate variants
- [ ] Watch Agent 4 run compliance checks
- [ ] See final results with approval rates

---

## Expected Output

When you click "Start Campaign", you should see:

```
[10:30:15] [System] 🚀 Starting 5-Agent Campaign Orchestration
[10:30:16] [Agent 1] Loading segments and customers... ← REAL API CALL
[10:30:17] [System] Agent 1: Loaded 3 segments with 100 customers!
[10:30:18] [Agent 2] Retrieving templates from RAG... ← REAL API CALL
[10:30:19] [System] Agent 2: Retrieved 5 templates from RAG!
[10:30:20] [Agent 3] Generating 30 variants (10 customers × 3 variants)...
[10:30:23] [System] Agent 3: Generated 30 variants!
[10:30:24] [Agent 4] Running compliance checks...
[10:30:26] [System] Agent 4: 28 approved, 2 rejected
[10:30:27] [System] ✅ Campaign execution complete!
```

---

## Data Flow Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                   DEMO CAMPAIGN PAGE                        │
│            http://localhost:3000/campaign/demo              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                  ┌────────┴────────┐
                  │ START CAMPAIGN  │
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌────────────┐   ┌─────────────┐   ┌──────────────┐
   │  Agent 1   │   │  Agent 2    │   │  Agent 3/4   │
   │  Segment   │   │  RAG Search │   │  Generation  │
   │            │   │             │   │  Compliance  │
   │ Real API   │   │  Real API   │   │  (As before) │
   │ CALL       │   │  CALL       │   │              │
   └────────────┘   └─────────────┘   └──────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
   Segments +        5 Content        30 Variants
   100 Customers     Templates        + Results
```

---

## File Changes Summary

**Modified**: `person5-orchestrator-dashboard/hooks/useOrchestrator.ts`

**Added Imports**:
```typescript
import { getCustomers, getSegments, type Segment } from '@/lib/api/segmentation';
import { searchContent, type SearchResponse } from '@/lib/api/rag';
```

**Agent 1 Changes**:
- ✅ Now calls `getSegments()` to load real segments
- ✅ Now calls `getCustomers(100, 0)` to load real customers
- ✅ Gracefully falls back to sample data if API unavailable
- ✅ Shows actual segment and customer counts

**Agent 2 Changes**:
- ✅ Now calls `searchContent('enterprise solutions', 5)` to get real content
- ✅ Maps RAG results to message templates
- ✅ Gracefully falls back to default templates if API unavailable
- ✅ Shows actual retrieved template count

---

## Next Steps

1. ✅ **Test the demo campaign** with real data
2. ⏭️ **Integrate Agent 3** (Message Generation) with real API
3. ⏭️ **Integrate Agent 4** (Compliance) - Already connected to Azure
4. ⏭️ **Integrate Agent 5** (Campaign Execution) with real send API
5. ⏭️ **Add results dashboard** showing all agent outputs
6. ⏭️ **Add compliance breakdown** showing approved/rejected stats

---

## API Endpoints Being Called

### Agent 1 (Segmentation) - Port 8001
```
GET http://localhost:8001/api/segments
GET http://localhost:8001/api/customers?limit=100&offset=0
```

### Agent 2 (RAG) - Port 8000
```
POST http://localhost:8000/search
Body: { query: "enterprise solutions", top_k: 5 }
```

### Agent 4 (Compliance) - Azure
```
POST https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze
Body: { messages: [...all generated messages...] }
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Agent 1 fails | Make sure segmentation-agent-node running on port 8001 |
| Agent 2 fails | Make sure RAG API running on port 8000 |
| Campaign hangs | Check browser console for errors (F12) |
| Falls back to sample data | APIs not responding - check ports and services |
| Compliance shows all rejected | Azure endpoint might be down - check connection |

---

## Success Indicators ✅

You'll know it's working when:

- ✅ Agent 1 shows "Loaded X segments with Y customers!"
- ✅ Agent 2 shows "Retrieved X templates from RAG!"
- ✅ Both show real numbers (not just "1 segment")
- ✅ Execution logs show actual processing times
- ✅ Final stats show real customer and approval counts
- ✅ No "API unavailable" fallback messages

---

**Ready to run the demo with real Agent 1 & 2 data! 🚀**

Navigate to: `http://localhost:3000/campaign/demo`

Click "Start Campaign" and watch the 5-agent orchestration with real API calls! 🎉

