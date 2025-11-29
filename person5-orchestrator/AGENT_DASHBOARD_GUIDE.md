# Error Analysis & Multi-Agent Dashboard Implementation

## 🔴 Errors Encountered

### 1. CORS Error (Access-Control-Allow-Origin)
**Error Message:**
```
'Access-Control-Allow-Origin' header is present on the requested resource.
POST https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze net::ERR_FAILED
```

**Root Cause:**
- Azure Function (Agent 4 - Compliance) is missing CORS configuration
- Browser blocks requests from `localhost:5005` to `azurewebsites.net`

**Solution:**
Add CORS configuration to your Azure Function:
```json
// In Azure Portal or local.settings.json
{
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

Or via Azure Portal:
1. Navigate to your Function App
2. Go to "CORS" settings
3. Add `http://localhost:5005` to allowed origins
4. Add `*` for development (restrict in production)

---

### 2. Pipeline Status 404 Error
**Error Message:**
```
GET http://localhost:5005/api/pipeline/status/af65597e-c590-4f8a-9f3b-9554a2579900 404 (Not Found)
```

**Root Cause:**
- Backend API endpoint `/api/pipeline/status/{id}` doesn't exist
- Frontend is polling for status, but route is missing

**Current Workaround:**
- Using mock mode in custom campaign (no API calls)
- Full pipeline orchestration not yet connected to real backend

**Future Solution:**
Create the backend API route at `src/app/api/pipeline/status/[id]/route.ts`:
```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Implement status checking logic
  return Response.json({ success: true, pipeline: { status: 'completed' } });
}
```

---

## ✅ Solution: Multi-Agent Dashboard

### New Architecture

Created a **tabbed dashboard** for better UX with individual agent control:

#### Pages Created:
1. **`/agents`** - New Multi-Agent Dashboard (RECOMMENDED)
   - Tab-based navigation (Overview + 4 Agent tabs)
   - Individual agent control
   - Sequential execution flow
   - Real-time status tracking
   - Detailed input/output display

2. **`/dashboard`** - Original Dashboard (Legacy)
   - Full pipeline view
   - Compliance results display
   - Analytics and metrics

3. **`/custom-campaign`** - Direct Agent 4 Testing
   - Mock mode enabled (no CORS issues)
   - JSON message input
   - Campaign info tracking
   - Responsible AI transparency

---

## 🎯 Multi-Agent Dashboard Features

### Tab Navigation
- **Overview Tab**: Pipeline summary, quick actions, overall metrics
- **Agent 1 Tab**: Customer Segmentation (RFM analysis)
- **Agent 2 Tab**: Content Strategy (template generation)
- **Agent 3 Tab**: Message Generation (personalization)
- **Agent 4 Tab**: Compliance Check (Azure Content Safety)

### Agent Panel Components
Each agent panel displays:
- ✅ **Status Badge**: Idle / Processing / Completed / Failed
- 📊 **Metrics Grid**: Key performance indicators
- 📥 **Inputs Section**: Collapsible input data display
- 📤 **Outputs Section**: Results and generated data
- 📜 **Activity Logs**: Real-time processing logs
- ⏱️ **Progress Bar**: Visual progress indicator (during processing)
- 🎮 **Control Buttons**: Start/Stop individual agents

### Pipeline Control
- **Run Full Pipeline**: Execute all 4 agents sequentially
- **Reset All**: Clear all agent states
- **Individual Agent Start**: Control each agent independently
- **Sequential Dependency**: Agent 2 requires Agent 1 completion, etc.

---

## 🔧 Integration Guide

### Agent 1: Segmentation (Port 5001)
**Existing API:** `segmentation_agent/app.py`
```python
# Endpoints:
GET  /health                    # Status check
POST /segment/manual            # RFM input → segment
POST /segment/customer          # Customer ID → segment
```

**Dashboard Integration:**
```typescript
// In startAgent1() function
const response = await fetch('http://localhost:5001/health');
const segmentData = await fetch('http://localhost:5001/segment/manual', {
  method: 'POST',
  body: JSON.stringify({ recency: 10, frequency: 50, monetary: 1000 })
});
```

**Current Status:**
- ✅ API working (Flask app)
- ✅ Mock data implemented
- ⚠️ Need to connect real segmentation calls
- ⚠️ CSV/Database integration pending

---

### Agent 2: Content Strategy
**Planned API:** Not yet implemented
```
POST /content/strategy
Input: { segments: [...] }
Output: { templates: {...}, variants: [...] }
```

**Dashboard Integration:**
```typescript
// Currently using mock templates
const mockTemplates = {
  'Champions': 'Exclusive VIP offer...',
  'Loyal': 'Special rewards...',
  // ...
};
```

**Next Steps:**
1. Create Agent 2 API (Flask/FastAPI)
2. Implement OpenAI/GPT integration for content generation
3. Connect to dashboard via `startAgent2()` function

---

### Agent 3: Message Generation
**Planned API:** Not yet implemented
```
POST /messages/generate
Input: { templates: {...}, customers: [...] }
Output: { messages: [...], personalized: true }
```

**Dashboard Integration:**
```typescript
// Currently using mock message count
const totalMessages = agent1State.outputs?.total_customers || 1250;
```

**Next Steps:**
1. Create Agent 3 API
2. Implement personalization engine
3. Database integration for customer data

---

### Agent 4: Compliance Check (Azure Function)
**Existing API:** `person4-compliance-azfn`
```
POST /api/content-safety/analyze
Input: { messages: ["text1", "text2"] }
Output: { 
  success: true,
  total: 2,
  results: [{id, text, approved, reason, confidence, categories}]
}
```

**CORS Fix Required:**
```json
// In Azure Function host.json or CORS settings
{
  "Host": {
    "CORS": "http://localhost:5005,https://your-production-domain.com"
  }
}
```

**Dashboard Integration:**
- ✅ Custom Campaign uses mock mode
- ⚠️ Main dashboard needs CORS fix to call real API
- ✅ Response format matches Python API

---

## 🚀 Quick Start

### 1. Start Segmentation Agent
```powershell
cd segmentation_agent
python app.py
# Runs on http://localhost:5001
```

### 2. Start Next.js Dashboard
```powershell
cd person5-orchestrator
npm run dev
# Runs on http://localhost:5005
```

### 3. Access Multi-Agent Dashboard
Navigate to: **http://localhost:5005/agents**

### 4. Test Sequential Execution
1. Click "Run Full Pipeline" button
2. Watch agents execute in sequence:
   - Agent 1 → Segmentation (connects to port 5001)
   - Agent 2 → Content Strategy (mock)
   - Agent 3 → Message Generation (mock)
   - Agent 4 → Compliance (mock, CORS pending)

---

## 🎨 UX Design Decisions

### Why Tabs Over Side Panel?
- ✅ **More Screen Space**: Full width for detailed agent info
- ✅ **Better Mobile**: Tabs stack vertically on mobile
- ✅ **Clearer Focus**: One agent at a time, less overwhelming
- ✅ **Standard Pattern**: Users familiar with tab navigation

### Why Not Accordion/Side Panel?
- ❌ Limited vertical space for all 4 agents
- ❌ Harder to see full logs and metrics
- ❌ Less intuitive for sequential flow

### Visual Flow Indicators
- **Color-coded Agents**: Blue → Green → Orange → Purple
- **Status-based Borders**: Gray (idle) → Blue (processing) → Green (completed)
- **Icons**: Users, FileText, Send, Shield
- **Progress Bars**: Only shown during processing

---

## 📊 Mock Data vs Real API

### Current State (Mock Mode)
```typescript
// Agent 1 Mock
const mockCustomers = 1250;
const mockSegments = { Champions: 320, Loyal: 405, ... };

// Agent 2 Mock
const mockTemplates = { Champions: "Exclusive VIP offer...", ... };

// Agent 3 Mock
const totalMessages = 1250;

// Agent 4 Mock (Custom Campaign)
const hasViolence = /kill|murder|destroy/.test(text);
const mockApproval = !hasViolence && !hasHate && !hasSexual;
```

### Real API Integration
Replace mock data with actual fetch calls:
```typescript
// Agent 1 Real
const response = await fetch('http://localhost:5001/segment/manual', {...});
const { segment_id, segment_name, stats } = await response.json();

// Agent 4 Real (after CORS fix)
const response = await fetch(`${AGENT_4_URL}/analyze`, {
  method: 'POST',
  body: JSON.stringify({ messages: [...] })
});
```

---

## 🔐 Security & Compliance

### Agent 4 Responsible AI Features
- ✅ Transparency: Confidence scores displayed
- ✅ Explainability: Rejection reasons with categories
- ✅ Category Scores: Violence, Hate, Sexual, Self-Harm (0-6 scale)
- ✅ Campaign Context: Customer IDs tracked
- ✅ Audit Trail: Activity logs for each agent

### CORS Best Practices
**Development:**
```json
{ "CORS": "*" }  // Allow all origins
```

**Production:**
```json
{ 
  "CORS": "https://your-domain.com,https://admin.your-domain.com"
}  // Specific domains only
```

---

## 🐛 Troubleshooting

### Agent 1 Not Starting
- Check if Flask app is running: `curl http://localhost:5001/health`
- Verify models exist: `ls segmentation_agent/models/`
- Check Python environment: `python --version` (3.8+)

### CORS Error Persists
- Clear browser cache
- Check Azure Function CORS settings in Portal
- Verify `NEXT_PUBLIC_AGENT_4_URL` in `.env.local`
- Use Custom Campaign mock mode as fallback

### Progress Bar Stuck
- Check browser console for errors
- Verify `progress` state updates in code
- Ensure async/await properly used

### Tabs Not Switching
- Check Radix UI Tabs installed: `npm list @radix-ui/react-tabs`
- Verify `activeTab` state management
- Check browser console for React errors

---

## 📝 Next Steps

### Phase 1: Backend Integration (Priority)
1. ✅ Agent 1 API working (Flask)
2. ⚠️ Fix CORS for Agent 4 (Azure Function)
3. 🔲 Create Agent 2 API (Content Strategy)
4. 🔲 Create Agent 3 API (Message Generation)

### Phase 2: Real Data Flow
1. 🔲 Connect Agent 1 to real database/CSV
2. 🔲 Pass segmentation results to Agent 2
3. 🔲 Generate actual personalized messages
4. 🔲 Send messages to real Agent 4 API

### Phase 3: Polish & Demo
1. ✅ Multi-Agent Dashboard UI complete
2. ✅ Custom Campaign mock mode working
3. 🔲 Add error handling and retry logic
4. 🔲 Implement campaign history/results viewer
5. 🔲 Add export functionality (CSV/JSON)

---

## 🎯 Demo Script

### For Hackathon Presentation:

**1. Show Custom Campaign (No CORS Issues)**
- Navigate to `/custom-campaign`
- Show mock compliance checking
- Highlight Responsible AI features

**2. Show Multi-Agent Dashboard**
- Navigate to `/agents`
- Click "Run Full Pipeline"
- Watch sequential execution
- Show detailed logs and metrics

**3. Explain Architecture**
- 4 independent agents
- Sequential data flow
- Real APIs ready (CORS pending)
- Mock mode for demo stability

**4. Highlight Innovation**
- RFM ML model (K-Means clustering)
- Azure Content Safety integration
- Responsible AI transparency
- Multi-agent orchestration

---

## 📚 Files Modified/Created

### New Files
- ✅ `src/app/agents/page.tsx` - Multi-Agent Dashboard
- ✅ `src/components/Dashboard/AgentPanel.tsx` - Reusable agent component
- ✅ `src/components/ui/tabs.tsx` - Tab navigation component

### Modified Files
- ✅ `src/app/dashboard/page.tsx` - Added "Multi-Agent View" button
- ✅ `src/app/custom-campaign/page.tsx` - Mock mode with campaign info

### Documentation
- ✅ `AGENT_DASHBOARD_GUIDE.md` - This file

---

## 🌟 Key Features Summary

1. **Tab-Based Navigation**: Overview + 4 agent tabs
2. **Individual Agent Control**: Start/stop each agent independently
3. **Sequential Orchestration**: Run full pipeline with dependency checks
4. **Real-Time Logs**: Activity logs for each processing step
5. **Visual Progress**: Progress bars and status badges
6. **Input/Output Display**: Collapsible sections for data inspection
7. **Metrics Dashboard**: Key performance indicators per agent
8. **Mock Mode Support**: Demo without API dependencies
9. **Responsive Design**: Works on desktop and mobile
10. **Responsible AI**: Transparency, explainability, audit trails

---

## 💡 Pro Tips

- **Use Mock Mode for Demo**: Avoids CORS and API availability issues
- **Run Agent 1 Separately**: Test segmentation API independently
- **Clear Browser Cache**: If styles or updates don't appear
- **Check Browser Console**: Detailed error messages in DevTools
- **Sequential Testing**: Test Agent 1, then 2, then 3, then 4
- **Use Custom Campaign**: Direct Agent 4 testing without full pipeline

---

**Built for Hackathon AI 2025 🚀**
