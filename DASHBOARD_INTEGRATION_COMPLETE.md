# Dashboard Integration Plan - All 4 Agents + Compliance

## YES! This is 100% Possible! ✅

Based on your current dashboard architecture and APIs, you can build a comprehensive system showing:
- **Agent 1**: Segmentation (Port 8001)
- **Agent 2**: Content Retrieval (Port 8000 - RAG API)
- **Agent 3**: Message Generation (Future)
- **Agent 4**: Compliance & Safety (Azure API)
- **All transparency**: Approved/Rejected messages, safety scores, customer mapping

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD INTERFACE                           │
│                  (person5-orchestrator-dashboard)                │
└──────────────────────────────────────────────────────────────────┘
           │              │              │              │
    (Port 8001)    (Port 8000)    (Port 5003)    (Azure API)
           │              │              │              │
           ▼              ▼              ▼              ▼
    ┌──────────────┬──────────────┬──────────────┬──────────────┐
    │   Agent 1    │   Agent 2    │   Agent 3    │   Agent 4    │
    │Segmentation  │ Content RAG  │ Generation   │ Compliance   │
    │              │              │              │              │
    │ Segments     │ Templates    │ 3 Variants   │ Safety       │
    │ Customers    │ Approved     │ per Customer │ Scores       │
    │              │ Content      │              │ (Approved/   │
    │              │              │              │  Rejected)   │
    └──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## What Your Dashboard Will Show

### 1. **Main Dashboard** (Already Exists)
- System health for all 4 agents ✅
- Quick action buttons ✅
- Recent campaigns ✅

### 2. **New Sections to Add**

#### A. **Individual Agent Runners**
Each agent gets its own dedicated interface:

**Agent 1: Segmentation Runner**
- Button: "Load Segments"
- Display: Segment list with customer counts
- Action: Select segment and proceed

**Agent 2: Content Retrieval Runner**
- Button: "Search Content" 
- Display: Content library filtered by segment
- Action: Pick content for segment

**Agent 3: Message Generation Runner**
- Button: "Generate Variants"
- Display: 3 message variants per customer
- Action: Review and approve

**Agent 4: Compliance Check**
- Button: "Validate Messages"
- Display: Safety scores + status (APPROVED/REJECTED)
- Action: View detailed breakdown

#### B. **Campaign Runners**

1. **Demo Campaign** (Already exists)
   - Full 5-agent orchestration
   - Sample customers

2. **Custom Campaign**
   - Upload customer CSV
   - Select segment
   - Choose content
   - Run through all agents

3. **Dataset Campaign**
   - Target specific segment
   - Generate all content for that segment
   - Validate all messages

4. **Compliance Runner**
   - Test individual messages
   - Batch validation
   - See safety scores

---

## How to Set It Up - Step by Step

### Step 1: Update API Config (Already Has Correct Ports!)

```typescript
// lib/api/config.ts - ALREADY CORRECT!
export const API_CONFIG = {
  agent1: {
    url: 'http://localhost:8001',  // Segmentation ✅
    name: 'Customer Segmentation Agent',
  },
  agent2: {
    url: 'http://localhost:8000',  // RAG API ✅
    name: 'Content Retrieval Agent',
  },
  agent3: {
    url: 'http://localhost:5003',  // Message Generation (TODO)
    name: 'Content Generation Agent',
  },
  agent4: {
    url: 'https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze',
    name: 'Compliance & Safety Agent',
  },
};
```

### Step 2: Create Agent Runner Components (New Files)

**Component Structure:**
```
components/
├── Navbar.tsx (✓ exists)
├── campaign/
│   ├── AgentCard.tsx (✓ exists)
│   ├── ComplianceResults.tsx (✓ exists)
│   ├── SegmentationRunner.tsx (NEW)
│   ├── ContentRetrieverRunner.tsx (NEW)
│   ├── MessageGeneratorRunner.tsx (NEW)
│   └── ComplianceRunner.tsx (NEW)
└── ui/
    ├── card.tsx (✓ exists)
    ├── button.tsx (✓ exists)
    └── LoadingSpinner.tsx (✓ exists)
```

### Step 3: Create Campaign Pages (New Files)

```
app/
├── dashboard/
│   └── page.tsx (✓ exists - enhance it)
├── campaign/
│   ├── page.tsx (Campaign Hub)
│   ├── demo/
│   │   └── page.tsx (✓ exists)
│   ├── custom/
│   │   └── page.tsx (NEW)
│   ├── dataset/
│   │   └── page.tsx (NEW)
│   └── compliance/
│       └── page.tsx (NEW)
```

---

## Detailed Component Breakdown

### Component 1: Segmentation Runner
**File**: `components/campaign/SegmentationRunner.tsx`

```typescript
export function SegmentationRunner() {
  // 1. Button: "Load Segments"
  // 2. Display segments from http://localhost:8001/api/segments
  // 3. Show: ID, Name, Description, Customer Count
  // 4. Select action: View customers or proceed to content
}
```

### Component 2: Content Retriever Runner
**File**: `components/campaign/ContentRetrieverRunner.tsx`

```typescript
export function ContentRetrieverRunner() {
  // 1. Button: "Search Content"
  // 2. Get segment from previous step
  // 3. POST to http://localhost:8000/search with segment query
  // 4. Display: Content items with title, type, audience
  // 5. Action: Select content for message generation
}
```

### Component 3: Message Generator Runner
**File**: `components/campaign/MessageGeneratorRunner.tsx`

```typescript
export function MessageGeneratorRunner() {
  // 1. Get selected customers + content
  // 2. Call Agent 3 (or mock for now)
  // 3. Generate 3 variants per customer
  // 4. Display all variants in editable form
  // 5. Action: Pass to compliance check
}
```

### Component 4: Compliance Runner
**File**: `components/campaign/ComplianceRunner.tsx`

```typescript
export function ComplianceRunner() {
  // 1. Get messages from message generator
  // 2. POST to Azure API: /api/content-safety/analyze
  // 3. Display results:
  //    - Status: APPROVED ✅ or REJECTED ❌
  //    - Safety Scores: hate, violence, sexual, self_harm (0-1)
  //    - Reason: Why rejected
  //    - Customer: Which customer this is for
  // 4. Show summary: X Approved, Y Rejected, Z% Rate
}
```

---

## Campaign Pages Structure

### Campaign Hub (Main Page)
**File**: `app/campaign/page.tsx`

Shows 4 campaign options:
1. **Demo Campaign** (Full 5-agent on sample data)
2. **Custom Campaign** (Select segment → content → customers → validate)
3. **Dataset Campaign** (Target all customers in a segment)
4. **Compliance Only** (Test individual messages)

### Custom Campaign Page
**File**: `app/campaign/custom/page.tsx`

4-step wizard:
- Step 1: Select Segment (Agent 1 data)
- Step 2: Choose Content (Agent 2 search)
- Step 3: Generate Messages (Agent 3)
- Step 4: Validate Compliance (Agent 4)

### Dataset Campaign Page
**File**: `app/campaign/dataset/page.tsx`

- Select entire segment
- Generate content for all customers
- Batch compliance check
- Show approval rate

### Compliance Page
**File**: `app/campaign/compliance/page.tsx`

- Paste/Upload individual messages
- Run through compliance API
- Show detailed safety scores
- Explain why each was approved/rejected

---

## Data Flow Diagrams

### Flow 1: Custom Campaign
```
User Selects Segment (Agent 1)
           │
           ▼
API Call: GET http://localhost:8001/api/segments
           │
           ▼
Display Segment Details
           │
User Picks Segment
           │
           ▼
User Searches Content (Agent 2)
           │
           ▼
API Call: POST http://localhost:8000/search
           │
           ▼
Display Content Items
           │
User Picks Content
           │
           ▼
Generate Message Variants (Agent 3)
           │
           ▼
Validate with Compliance (Agent 4)
           │
           ▼
API Call: POST Azure /api/content-safety/analyze
           │
           ▼
Display Results with Safety Scores
           │
User Sees: APPROVED ✅ / REJECTED ❌
```

### Flow 2: Compliance Check Only
```
User Pastes Messages
           │
           ▼
Submit for Validation
           │
           ▼
API Call: POST Azure /api/content-safety/analyze
           │
           ▼
Display for Each Message:
- Status (APPROVED/REJECTED)
- Safety Scores (hate, violence, sexual, self_harm)
- Reason (if rejected)
```

---

## API Endpoints You'll Use

### Agent 1 (Segmentation)
```
GET http://localhost:8001/api/segments
→ Returns: [{id, name, description, customer_count, criteria}, ...]

GET http://localhost:8001/api/customers?segment_id=1&limit=10
→ Returns: [{customer_id, name, email, ...}, ...]
```

### Agent 2 (Content/RAG)
```
POST http://localhost:8000/search
Body: {query: string, top_k: number, audience?: string}
→ Returns: {query, results_count, results: [{id, title, content, type, ...}]}

GET http://localhost:8000/stats
→ Returns: {total_content, by_content_type, by_audience, ...}
```

### Agent 4 (Compliance)
```
POST https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze
Body: {messages: string[]}
→ Returns: {
    results: [{
      status: "APPROVED|REJECTED",
      safety_scores: {hate, violence, sexual, self_harm},
      reason: string
    }, ...]
  }
```

---

## Dashboard Enhancements

### Enhanced Main Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│  Campaign Dashboard                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  QUICK ACTIONS (NEW)                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ 👥 Segmentation      │  │ 📚 Content Retrieval │            │
│  │ Load Segments        │  │ Search Content       │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ ✍️ Message Generation │  │ 🛡️ Compliance Check  │            │
│  │ Generate Variants    │  │ Validate Messages    │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                 │
│  CAMPAIGN RUNNERS (NEW)                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ 🚀 Demo Campaign     │  │ 🎯 Custom Campaign   │            │
│  │ Full 5-Agent Flow    │  │ Step-by-Step Wizard  │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ 📊 Dataset Campaign  │  │ 🔍 Compliance Test   │            │
│  │ Batch Processing     │  │ Individual Messages  │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1 (Week 1) - Core Agent Runners
1. ✅ Segmentation Runner (read from Agent 1)
2. ✅ Content Retriever Runner (search Agent 2)
3. ✅ Compliance Runner (validate with Agent 4)

### Phase 2 (Week 2) - Campaign Pages
1. ✅ Custom Campaign (wizard-based)
2. ✅ Dataset Campaign (batch mode)
3. ✅ Compliance Page (individual message testing)

### Phase 3 (Week 3) - Integration
1. ✅ Message Generation integration (when Agent 3 ready)
2. ✅ Dashboard enhancements
3. ✅ Result visualization

### Phase 4 (Week 4) - Polish
1. ✅ Error handling
2. ✅ Loading states
3. ✅ Data export
4. ✅ Performance optimization

---

## Technology Stack (Already In Place!)

✅ **Framework**: Next.js 15 (App Router)
✅ **UI**: Tailwind CSS + shadcn/ui components
✅ **State Management**: React hooks
✅ **HTTP Client**: Axios
✅ **Toasts**: React Hot Toast
✅ **Icons**: Lucide React

---

## Quick Summary

**YES, you can build:**
- ✅ Individual buttons for each agent
- ✅ Step-by-step workflow
- ✅ Show all 4 agent data side-by-side
- ✅ Compliance transparency (approved/rejected)
- ✅ Safety scores visualization
- ✅ Campaign runners
- ✅ Dataset batch processing
- ✅ Custom campaign wizard
- ✅ Compliance-only tester

**All using:**
- Your existing Agent APIs
- Your current dashboard infrastructure
- New components you'll add

---

## Next Steps

1. **Create Segmentation Runner Component**
   - Button to load segments
   - Display segments list
   - Select action

2. **Create Content Retriever Component**
   - Search bar with segment query
   - Display search results
   - Filter options

3. **Create Compliance Runner Component**
   - Input messages
   - Show safety scores
   - Display approved/rejected status

4. **Create Campaign Pages**
   - Custom campaign (4-step wizard)
   - Dataset campaign (batch mode)
   - Compliance test page

5. **Integrate Everything**
   - Connect all components
   - Add data flow between components
   - Show results beautifully

Ready to start building? 🚀

