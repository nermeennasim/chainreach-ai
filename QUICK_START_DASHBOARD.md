# Quick Start - Dashboard Integration 🚀

## Current Status: **Ready to Test** ✅

You have a fully functional dashboard with buttons for Agent 1 (Segmentation) and Agent 2 (RAG API).

---

## 5-Minute Setup

### 1. Start the Agents

**Terminal 1 - Segmentation Agent (Port 8001)**
```bash
cd segmentation-agent-node
npm start
# Should see: Server running on port 8001 ✅
```

**Terminal 2 - RAG API (Port 8000)**
```bash
cd person2-rag
python api.py
# Should see: Running on http://localhost:8000 ✅
```

**Terminal 3 - Dashboard (Port 3000)**
```bash
cd person5-orchestrator-dashboard
npm run dev
# Should see: ready - started server on 0.0.0.0:3000 ✅
```

### 2. Open Dashboard

```
http://localhost:3000/dashboard
```

---

## What You'll See

### Agent Selector (Top)
Two large buttons:
- 👥 **Agent 1: Customer Segmentation** (Blue theme)
- 📚 **Agent 2: Content Retrieval** (Green theme)

### Action Buttons (Middle)
Depends on which agent selected:

**Agent 1** (6 buttons):
- 🏥 Health Check
- 👥 Get All Segments
- 📋 Get All Customers
- ⚡ Calculate Engagement
- 🔄 Refresh Segmentation
- 🤖 Analyze Customers (AI)

**Agent 2** (3 buttons):
- 🏥 Health Check
- 📊 Get Statistics
- 🔍 Search Content

### Results Panel (Bottom)
Shows API responses as you click buttons:
- Endpoint name
- Status: SUCCESS ✅ or ERROR ❌
- Timestamp
- Response data (first 500 chars)
- Error message if it failed

---

## Test It

### Test Agent 1

1. Click "Agent 1" button
2. Make sure segmentation-agent-node running on port 8001
3. Click "🏥 Health Check" button
4. Should see green SUCCESS with response
5. Try other buttons!

### Test Agent 2

1. Click "Agent 2" button
2. Make sure RAG API running on port 8000
3. Click "📊 Get Statistics" button
4. Should see green SUCCESS with content library stats
5. Try "🔍 Search Content" button!

---

## Quick Endpoint Reference

### Agent 1 - What Each Button Does

| Button | Endpoint | Returns |
|--------|----------|---------|
| Health Check | GET /health | Service status |
| Get All Segments | GET /api/segments | List of all customer segments |
| Get All Customers | GET /api/customers | Paginated customer list (20) |
| Calculate Engagement | POST /api/segment/calculate-engagement | Engagement score updates |
| Refresh Segmentation | POST /api/segment/refresh | Re-runs segmentation algorithm |
| Analyze Customers | POST /api/segment/analyze | AI-powered segment suggestions |

### Agent 2 - What Each Button Does

| Button | Endpoint | Returns |
|--------|----------|---------|
| Health Check | GET /health | Service status |
| Get Statistics | GET /stats | Total content, grouped by type/audience |
| Search Content | POST /search | Top 5 matching content for "enterprise solutions" |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" on Agent 1 | Make sure segmentation-agent-node running on 8001 |
| "Connection refused" on Agent 2 | Make sure RAG API running on 8000 |
| Buttons not responding | Check browser console for errors |
| No segments showing | Agent 1 database might be empty - populate it first |
| Search returning empty | RAG API might be indexing - wait 5-10 seconds |
| Dashboard won't load | Check npm run dev output for errors |

---

## What's Ready to Use

✅ **AgentDashboard Component**
- Location: `components/dashboard/AgentDashboard.tsx`
- Status: Production ready
- Features: Agent selector, buttons, results history

✅ **Segmentation API Service**
- Location: `lib/api/segmentation.ts`
- Status: All 13 functions ready
- Functions: getSegments(), getCustomers(), calculateEngagementScores(), etc.

✅ **RAG API Service**
- Location: `lib/api/rag.ts`
- Status: All 5 functions ready
- Functions: searchContent(), getRAGStats(), getAllContent(), etc.

✅ **API Configuration**
- Location: `lib/api/config.ts`
- Status: All 5 agents configured (Agents 3, 4, 5 ready for service files)

---

## Custom Campaign (50% Ready)

**Go to**: `http://localhost:3000/campaign/custom`

**What works**:
- ✅ Upload CSV with customers
- ✅ Parse and display customer list
- ✅ Select customers

**In development**:
- ⚠️ Agent workflow mode (logic ready, UI needs completion)
- ❌ Step-by-step agent execution
- ❌ Results consolidation

---

## File Locations

```
Dashboard Component:  person5-orchestrator-dashboard/components/dashboard/AgentDashboard.tsx
Segmentation Service: person5-orchestrator-dashboard/lib/api/segmentation.ts
RAG Service:          person5-orchestrator-dashboard/lib/api/rag.ts
Configuration:        person5-orchestrator-dashboard/lib/api/config.ts
Custom Campaign:      person5-orchestrator-dashboard/app/campaign/custom/page.tsx
Main Dashboard:       person5-orchestrator-dashboard/app/dashboard/page.tsx
```

---

## Next Steps (When Ready)

1. ✅ Test dashboard buttons (you are here)
2. Complete custom campaign UI
3. Create Agent 3, 4, 5 service files
4. Add more agent buttons to dashboard
5. Build full 5-agent workflow
6. Add data visualization
7. Deploy to production

---

## Environment

All running locally:
- **Agent 1 (Segmentation)**: http://localhost:8001
- **Agent 2 (RAG API)**: http://localhost:8000
- **Dashboard**: http://localhost:3000
- **Agent 3 (Generation)**: http://localhost:5003 (not yet integrated)
- **Agent 4 (Compliance)**: https://chainreach-compliance-func.azurewebsites.net/api (configured, needs service file)
- **Agent 5 (Campaign)**: http://localhost:5005 (not yet integrated)

---

## Questions?

Everything is documented in:
- `DASHBOARD_INTEGRATION_COMPLETE.md` - Full integration guide
- `IMPLEMENTATION_STATUS.md` - Current status and checklist
- `RAG_API_COMPLETE_GUIDE.md` - RAG API specific
- `HOW_TO_PASS_SEGMENTS_TO_RAG.md` - Segments to RAG workflow

---

**You're ready! 🎉 Click those buttons and see your agents work! 🚀**

