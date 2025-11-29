# Pipeline Orchestration Backend - Implementation Complete

## 🎉 What Has Been Built

You now have a complete **Event-Driven Pipeline Orchestration System** that:

1. ✅ **Sequentially executes 4 agents** (Python → Python → C# → Python)
2. ✅ **Manages state** for each pipeline execution
3. ✅ **Handles retries** automatically on failures
4. ✅ **Tracks real-time status** of each step
5. ✅ **Provides REST APIs** for frontend integration

---

## 📁 Architecture Overview

```
Next.js Orchestrator (Person 5)
│
├── Frontend (Already Exists)
│   ├── Dashboard → "Start Campaign" button
│   └── Campaign Builder → View approved/rejected messages
│
├── Backend (Just Implemented)
│   ├── API Routes
│   │   ├── POST /api/pipeline/start
│   │   ├── GET /api/pipeline/status/:id
│   │   ├── POST /api/pipeline/stop/:id
│   │   └── GET /api/campaign/:id
│   │
│   ├── Orchestration Engine
│   │   ├── PipelineExecutor → Sequential execution
│   │   ├── StateManager → Tracks progress
│   │   └── RetryHandler → Handles failures
│   │
│   └── Agent Clients
│       ├── Agent 1: Segmentation (Python)
│       ├── Agent 2: Content (Python)
│       ├── Agent 3: Generation (C#)
│       └── Agent 4: Compliance (Python)
```

---

## 🔌 API Endpoints

### 1. **Start Pipeline**
```http
POST /api/pipeline/start
Content-Type: application/json

{
  "campaign_name": "Summer Sale 2025",
  "customer_id": "CUST123",
  "trigger_data": {
    "source": "dashboard"
  }
}
```

**Response:**
```json
{
  "success": true,
  "pipeline_id": "abc-123-def-456",
  "message": "Pipeline started successfully",
  "status_url": "/api/pipeline/status/abc-123-def-456"
}
```

---

### 2. **Get Pipeline Status (Real-time)**
```http
GET /api/pipeline/status/:id
```

**Response:**
```json
{
  "success": true,
  "pipeline": {
    "pipeline_id": "abc-123-def-456",
    "campaign_name": "Summer Sale 2025",
    "status": "running",
    "current_step": 2,
    "total_steps": 4,
    "started_at": "2025-11-24T10:00:00Z",
    "steps": [
      {
        "step_number": 1,
        "agent_name": "Segmentation",
        "status": "success",
        "duration_ms": 1234
      },
      {
        "step_number": 2,
        "agent_name": "Content",
        "status": "running",
        "duration_ms": null
      },
      {
        "step_number": 3,
        "agent_name": "Generation",
        "status": "pending"
      },
      {
        "step_number": 4,
        "agent_name": "Compliance",
        "status": "pending"
      }
    ]
  }
}
```

---

### 3. **Stop Pipeline**
```http
POST /api/pipeline/stop/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Pipeline stopped successfully"
}
```

---

### 4. **Get Campaign Results**
```http
GET /api/campaign/:id
```

**Response:**
```json
{
  "success": true,
  "campaign_id": "CUST123",
  "results": {
    "approved_messages": [
      {
        "message_id": "msg-1",
        "content": "Hello John! Check out our summer sale...",
        "compliance_score": 0.95
      }
    ],
    "rejected_messages": [
      {
        "message_id": "msg-2",
        "content": "...",
        "rejection_reason": "Contains prohibited words",
        "compliance_issues": ["word: discount"]
      }
    ],
    "total_approved": 5,
    "total_rejected": 2,
    "message": "approved"
  }
}
```

---

## 🔧 Configuration

### 1. Update `.env.local` (copy from `.env.example`)

```bash
# Agent URLs (Replace with your Azure Function URLs)
AGENT_1_URL=https://your-agent1.azurewebsites.net/api
AGENT_2_URL=https://your-agent2.azurewebsites.net/api
AGENT_3_URL=https://your-agent3.azurewebsites.net/api
AGENT_4_URL=https://your-agent4.azurewebsites.net/api

# Agent API Keys (if required)
AGENT_1_API_KEY=your-key-1
AGENT_2_API_KEY=your-key-2
AGENT_3_API_KEY=your-key-3
AGENT_4_API_KEY=your-key-4

# Pipeline Configuration
PIPELINE_TIMEOUT_MS=60000
PIPELINE_RETRY_ATTEMPTS=3
PIPELINE_RETRY_DELAY_MS=2000
PIPELINE_DEBUG=true
```

---

## 🚀 How to Use

### From Dashboard (Start Campaign Button)

```typescript
// src/components/Dashboard.tsx or similar

const handleStartCampaign = async () => {
  try {
    const response = await fetch('/api/pipeline/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_name: 'My Campaign',
        customer_id: 'CUST123',
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      const pipelineId = data.pipeline_id;
      
      // Poll for status updates
      pollPipelineStatus(pipelineId);
    }
  } catch (error) {
    console.error('Failed to start pipeline:', error);
  }
};

const pollPipelineStatus = async (pipelineId: string) => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/pipeline/status/${pipelineId}`);
    const data = await response.json();
    
    if (data.pipeline.status === 'completed') {
      clearInterval(interval);
      console.log('Pipeline completed!', data.pipeline);
    } else if (data.pipeline.status === 'failed') {
      clearInterval(interval);
      console.error('Pipeline failed:', data.pipeline.error);
    } else {
      // Update UI with current status
      console.log(`Step ${data.pipeline.current_step}/4 - ${data.pipeline.steps[data.pipeline.current_step - 1]?.agent_name}`);
    }
  }, 2000); // Poll every 2 seconds
};
```

---

### From Campaign Builder (View Results)

```typescript
// src/components/CampaignBuilder.tsx or similar

const fetchCampaignResults = async (campaignId: string) => {
  try {
    const response = await fetch(`/api/campaign/${campaignId}`);
    const data = await response.json();
    
    if (data.success) {
      const { approved_messages, rejected_messages } = data.results;
      
      // Display approved messages
      console.log('Approved:', approved_messages);
      
      // Display rejected messages with reasons
      console.log('Rejected:', rejected_messages);
    }
  } catch (error) {
    console.error('Failed to fetch campaign results:', error);
  }
};
```

---

## 📊 Pipeline Execution Flow

```
1. Frontend clicks "Start Campaign"
   ↓
2. POST /api/pipeline/start
   ↓
3. PipelineExecutor.executePipeline()
   ↓
4. Step 1: Agent 1 (Segmentation)
   - Input: customer_id
   - Output: { customer_id, segments, profile }
   ↓
5. Step 2: Agent 2 (Content)
   - Input: Agent 1 output
   - Output: { customer_id, content_templates }
   ↓
6. Step 3: Agent 3 (Generation)
   - Input: Agent 2 output
   - Output: { customer_id, message_variants[] }
   ↓
7. Step 4: Agent 4 (Compliance)
   - Input: Agent 3 output
   - Output: { approved_messages[], rejected_messages[] }
   ↓
8. Pipeline Completed
   - State saved with final results
   - Frontend can fetch results
```

---

## 🧪 Testing

### Test Pipeline Locally

1. **Start Dev Server:**
```bash
npm run dev
```

2. **Test with curl:**
```bash
# Start pipeline
curl -X POST http://localhost:5005/api/pipeline/start \
  -H "Content-Type: application/json" \
  -d '{"campaign_name": "Test", "customer_id": "CUST123"}'

# Get status
curl http://localhost:5005/api/pipeline/status/abc-123-def-456

# Get campaign results (from Agent 4)
curl http://localhost:5005/api/campaign/CUST123
```

---

## 🎯 Next Steps

1. **Update Agent URLs** in `.env.local` with your Azure Function URLs
2. **Connect Dashboard Button** to `/api/pipeline/start`
3. **Add Real-time Status Display** using polling or WebSockets
4. **Integrate Campaign Builder** with `/api/campaign/:id`
5. **Test End-to-End** with real agents

---

## 📦 File Structure Created

```
person5-orchestrator/
├── src/
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── base-agent-client.ts
│   │   │   ├── agent-1-segmentation.ts
│   │   │   ├── agent-2-content.ts
│   │   │   ├── agent-3-generation.ts
│   │   │   ├── agent-4-compliance.ts
│   │   │   └── index.ts
│   │   ├── orchestration/
│   │   │   ├── pipeline-executor.ts
│   │   │   ├── state-manager.ts
│   │   │   └── retry-handler.ts
│   │   └── utils/
│   │       └── uuid.ts
│   ├── app/
│   │   └── api/
│   │       ├── pipeline/
│   │       │   ├── start/route.ts
│   │       │   ├── status/[id]/route.ts
│   │       │   └── stop/[id]/route.ts
│   │       └── campaign/
│   │           └── [id]/route.ts
│   └── types/
│       └── index.ts (updated with pipeline types)
└── .env.example (updated with agent configuration)
```

---

## 🎓 Key Concepts

### 1. **Sequential Pipeline Pattern**
Each agent's output becomes the next agent's input.

### 2. **State Management**
Track progress in-memory (can upgrade to Redis for production).

### 3. **Retry Logic**
Automatically retry failed agent calls up to 3 times.

### 4. **Non-blocking Execution**
API returns immediately, pipeline runs asynchronously.

### 5. **Real-time Status**
Frontend polls `/api/pipeline/status/:id` for updates.

---

You're all set! 🚀 The backend orchestration is complete and ready to integrate with your frontend.
