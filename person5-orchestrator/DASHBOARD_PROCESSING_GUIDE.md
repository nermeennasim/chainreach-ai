# ChainReach AI Dashboard Processing Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Dashboard Components](#dashboard-components)
4. [Campaign Execution Flow](#campaign-execution-flow)
5. [API Endpoints](#api-endpoints)
6. [Real-Time Processing](#real-time-processing)
7. [Data Flow](#data-flow)
8. [Component Interactions](#component-interactions)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The ChainReach AI Dashboard is a Next.js 14-based real-time monitoring and orchestration platform that coordinates 5 specialized AI agents to execute personalized marketing campaigns. The dashboard provides live metrics, agent health monitoring, campaign execution, and performance analytics.

### Key Features
- **Real-time Campaign Execution**: Process 100 customers through 4-agent pipeline in ~50 seconds
- **Agent Health Monitoring**: Live status, uptime, and performance metrics for all 5 agents
- **Campaign Flow Visualization**: Interactive pipeline showing customer flow through agents
- **Performance Analytics**: Before/after comparison charts and real-time funnel metrics
- **Campaign Runner**: Custom customer ID input with live processing results

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                          │
│                         (Port 5005)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Landing    │  │  Dashboard   │  │   Campaign   │         │
│  │     Page     │→ │     Page     │← │    Runner    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                            ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Dashboard Components                        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  • AgentStatusGrid      • LiveMetricsCounter            │   │
│  │  • CampaignFlowVisualizer • PerformanceCharts           │   │
│  │  • RunCampaignButton                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  API Routes                              │   │
│  │  /api/agents/health    /api/campaign                    │   │
│  │  /api/metrics/live     /api/pipeline/status             │   │
│  │  /api/campaigns/execute-demo                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Orchestration Layer                         │   │
│  │         (src/lib/orchestrator.ts)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services (Agents)                     │
├─────────────────────────────────────────────────────────────────┤
│  Agent 1: Segmentation    → FastAPI (Port 8001)                 │
│  Agent 2: Content Strategy → FastAPI (Port 8002)                │
│  Agent 3: Message Gen     → .NET/Azure AI Foundry               │
│  Agent 4: Compliance      → Azure Functions                     │
│  Agent 5: Orchestrator    → Next.js API Routes                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dashboard Components

### 1. **AgentStatusGrid** (`src/components/Dashboard/AgentStatusGrid.tsx`)

**Purpose**: Displays real-time health status of all 5 agents

**Features**:
- Live agent status (Healthy/Degraded/Offline)
- Uptime tracking
- Active time monitoring
- Message count
- Average API call duration
- Visual health indicators (green/yellow/red)

**Data Source**: `/api/agents/health`

**Update Frequency**: Polls every 5 seconds

**Status Logic**:
```typescript
- Healthy: responseTime < 200ms, status === 'healthy'
- Degraded: 200ms ≤ responseTime < 500ms
- Offline: responseTime ≥ 500ms or status !== 'healthy'
```

### 2. **LiveMetricsCounter** (`src/components/Dashboard/LiveMetricsCounter.tsx`)

**Purpose**: Real-time animated counters for campaign metrics

**Metrics Displayed**:
- **Total Customers**: Total processed (target: 100)
- **Messages Generated**: AI-generated messages (target: 300)
- **Compliance Checks**: Safety validations (target: 300)
- **Approved Messages**: Compliant content (target: 285, 95% approval)

**Animation**: Smooth count-up animation using `setInterval`

**Data Source**: `/api/metrics/live`

**Update Frequency**: Polls every 2 seconds during active campaigns

### 3. **CampaignFlowVisualizer** (`src/components/Dashboard/CampaignFlowVisualizer.tsx`)

**Purpose**: Visual pipeline showing customer flow through agents

**Pipeline Stages**:
1. **Segmentation** → Customer categorization
2. **Strategy** → Content template retrieval
3. **Generation** → GPT-4 message creation (3 variants)
4. **Compliance** → Safety validation

**Visual Elements**:
- Animated progress bars per stage
- Real-time customer counts (e.g., "85/100")
- Stage-specific details:
  - Generation: "300 variants"
  - Compliance: "270 approved, 30 rejected"
- Color-coded status (blue → purple → pink → green)

**Data Source**: `/api/pipeline/status`

**Update Frequency**: Polls every 3 seconds during campaigns

### 4. **PerformanceCharts** (`src/components/Dashboard/PerformanceCharts.tsx`)

**Purpose**: Analytics comparing manual vs AI-orchestrated campaigns

**Chart 1: Before/After Comparison** (Bar Chart)
- Open Rate: 22% → 48%
- Click Rate: 3.2% → 12.5%
- Conversion: 1.8% → 8.3%
- ROI: 180% → 520%
- **Overall Improvement**: 184%

**Chart 2: Real-Time Funnel** (Line Chart)
- Messages Sent (blue line)
- Messages Opened (green line)
- Messages Clicked (purple line)
- Time series: 0s → 50s
- Final metrics: 100 sent, 48 opened (48%), 25 clicked (25%)

**Technology**: Recharts library for responsive charts

### 5. **RunCampaignButton** (`src/components/Dashboard/RunCampaignButton.tsx`)

**Purpose**: Execute demo campaign with 100 customers

**Workflow**:
1. User clicks "Run Demo Campaign"
2. Dialog opens with "Starting Campaign..." message
3. API call to `/api/campaigns/execute-demo`
4. Success confirmation with execution ID
5. Real-time updates visible in all dashboard components
6. Campaign completes in ~50 seconds

**Dialog States**:
- **Loading**: Spinner + "Starting Campaign..."
- **Success**: ✓ Campaign started + Execution ID + Instructions
- **Error**: Error message with retry option

---

## Campaign Execution Flow

### Step-by-Step Process

```
User Action: Click "Run Demo Campaign"
    ↓
1. Frontend: POST /api/campaigns/execute-demo
   {
     customerCount: 100,
     timestamp: ISO8601
   }
    ↓
2. Orchestrator: Generate execution ID
   executionId = `EXEC-${timestamp}-${random}`
    ↓
3. Process 100 customers through pipeline:
   
   For each customer:
   ┌─────────────────────────────────────────┐
   │ Agent 1: Segmentation (1-2s)            │
   │ - Analyze customer data                 │
   │ - Assign segment (High-Value/Engaged/etc)│
   └────────────┬────────────────────────────┘
                ↓
   ┌─────────────────────────────────────────┐
   │ Agent 2: Content Strategy (1-2s)        │
   │ - Retrieve template for segment         │
   │ - Fetch brand guidelines                │
   └────────────┬────────────────────────────┘
                ↓
   ┌─────────────────────────────────────────┐
   │ Agent 3: Message Generation (2-3s)      │
   │ - GPT-4 generates 3 variants            │
   │ - Personalize for customer              │
   │ - Apply tone/style                      │
   └────────────┬────────────────────────────┘
                ↓
   ┌─────────────────────────────────────────┐
   │ Agent 4: Compliance Check (1-2s)        │
   │ - Azure Content Safety validation       │
   │ - Check hate/violence/self-harm         │
   │ - Approve/Reject (95% approval rate)    │
   └────────────┬────────────────────────────┘
                ↓
   ┌─────────────────────────────────────────┐
   │ Agent 5: Orchestrator                   │
   │ - Coordinate all agents                 │
   │ - Store results                         │
   │ - Update live metrics                   │
   └─────────────────────────────────────────┘
    ↓
4. Campaign Complete (50 seconds total)
   - 100 customers processed
   - 300 messages generated (3 per customer)
   - 300 compliance checks
   - ~285 approved (95% rate)
    ↓
5. Dashboard Updates Complete
   - Final metrics displayed
   - All progress bars at 100%
   - Performance charts updated
```

### Timing Breakdown

| Stage | Processing Time | Total for 100 Customers |
|-------|----------------|------------------------|
| Segmentation | 1-2s per customer | 10-20s |
| Content Strategy | 1-2s per customer | 10-20s |
| Message Generation | 2-3s per customer | 20-30s |
| Compliance Check | 1-2s per customer | 10-20s |
| **Total Pipeline** | **5-9s per customer** | **~50s (parallel processing)** |

**Note**: Actual deployment uses parallel processing for faster execution

---

## API Endpoints

### 1. **GET /api/agents/health**

**Purpose**: Fetch health status of all agents

**Response**:
```json
{
  "timestamp": "2025-11-22T10:30:00Z",
  "agents": [
    {
      "id": "agent-1",
      "name": "Customer Segmentation",
      "status": "healthy",
      "responseTime": 145,
      "uptime": "99.9%",
      "activeTime": "47h 23m",
      "messageCount": 15420,
      "avgCallDuration": 1.2
    },
    // ... 4 more agents
  ]
}
```

**Status Codes**:
- 200: Success
- 500: Server error

### 2. **GET /api/metrics/live**

**Purpose**: Real-time campaign metrics

**Response**:
```json
{
  "totalCustomers": 85,
  "messagesGenerated": 255,
  "complianceChecks": 255,
  "approvedMessages": 242,
  "campaignActive": true,
  "lastUpdated": "2025-11-22T10:30:15Z"
}
```

### 3. **GET /api/pipeline/status**

**Purpose**: Campaign pipeline stage progress

**Response**:
```json
{
  "stats": {
    "totalCustomers": 100,
    "segmentation": {
      "processed": 100,
      "avgDuration": 1500
    },
    "contentStrategy": {
      "processed": 98,
      "avgDuration": 1200
    },
    "messageGeneration": {
      "processed": 95,
      "avgDuration": 2300,
      "variantsGenerated": 285
    },
    "compliance": {
      "processed": 90,
      "avgDuration": 1100,
      "approved": 85,
      "rejected": 5
    }
  }
}
```

### 4. **POST /api/campaigns/execute-demo**

**Purpose**: Start demo campaign execution

**Request Body**:
```json
{
  "customerCount": 100,
  "timestamp": "2025-11-22T10:30:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "executionId": "EXEC-20251122-103000-a1b2c3",
  "message": "Campaign execution started",
  "estimatedDuration": "50 seconds",
  "customersToProcess": 100
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Campaign already running",
  "currentExecutionId": "EXEC-20251122-102500-d4e5f6"
}
```

### 5. **POST /api/campaign** (Campaign Runner)

**Purpose**: Execute campaign with custom customer IDs

**Request Body**:
```json
{
  "customerIds": ["CUST001", "CUST002", "CUST003"]
}
```

**Response**:
```json
{
  "executionId": "EXEC-20251122-103000-xyz",
  "results": [
    {
      "customerId": "CUST001",
      "segment": "High-Value",
      "messagePreview": "Exclusive offer just for you!",
      "approved": true,
      "processingTime": 7500,
      "timestamp": "2025-11-22T10:30:07Z"
    }
    // ... more results
  ],
  "summary": {
    "totalCustomers": 3,
    "approvedCount": 3,
    "rejectedCount": 0,
    "successRate": 100,
    "averageProcessingTime": 7200
  }
}
```

---

## Real-Time Processing

### Polling Strategy

The dashboard uses aggressive polling during active campaigns for near real-time updates:

```typescript
// Component polling frequencies
AgentStatusGrid:         5 seconds (constant)
LiveMetricsCounter:      2 seconds (during campaign)
CampaignFlowVisualizer:  3 seconds (during campaign)
PerformanceCharts:       Static (no polling)
```

### State Management

**Campaign State Flow**:
```typescript
IDLE → STARTING → ACTIVE → COMPLETING → COMPLETED → IDLE
  ↑                                                    ↓
  └────────────────────────────────────────────────────┘
```

**State Indicators**:
- **IDLE**: No active campaign, metrics at 0
- **STARTING**: "Starting Campaign..." dialog visible
- **ACTIVE**: Metrics incrementing, progress bars animating
- **COMPLETING**: All stages at 100%, final calculations
- **COMPLETED**: Success message, final metrics displayed

### Data Refresh Logic

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/metrics/live');
      const data = await response.json();
      
      // Update state
      setMetrics(data);
      
      // Check if campaign is complete
      if (data.totalCustomers >= 100) {
        setCampaignState('COMPLETED');
        clearInterval(pollingInterval);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };
  
  // Poll every 2 seconds during active campaign
  const pollingInterval = setInterval(fetchData, 2000);
  
  return () => clearInterval(pollingInterval);
}, [campaignState]);
```

---

## Data Flow

### Complete Campaign Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    User Interaction                           │
│               (Click "Run Demo Campaign")                     │
└───────────────────────────┬──────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                  Frontend API Call                            │
│          POST /api/campaigns/execute-demo                     │
│          Body: { customerCount: 100 }                         │
└───────────────────────────┬──────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              Orchestrator Initialization                      │
│  1. Generate execution ID                                     │
│  2. Initialize campaign state                                 │
│  3. Create customer queue (100 customers)                     │
└───────────────────────────┬──────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                   Agent Processing                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Customer 1..100: Process through pipeline         │     │
│  │                                                      │     │
│  │  Segmentation → Strategy → Generation → Compliance  │     │
│  │       ↓             ↓           ↓            ↓      │     │
│  │    1-2s         1-2s        2-3s         1-2s       │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────────┬──────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              Results Aggregation                              │
│  1. Collect all agent responses                               │
│  2. Calculate statistics:                                     │
│     - Total processed: 100                                    │
│     - Messages generated: 300 (3 per customer)                │
│     - Compliance checks: 300                                  │
│     - Approved: ~285 (95% rate)                               │
│     - Success rate: 95%                                       │
│     - Avg processing time: ~7s                                │
└───────────────────────────┬──────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              Dashboard Updates (Real-Time Polling)            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Every 2s: GET /api/metrics/live                   │     │
│  │  - Update LiveMetricsCounter                        │     │
│  │                                                      │     │
│  │  Every 3s: GET /api/pipeline/status                 │     │
│  │  - Update CampaignFlowVisualizer                    │     │
│  │                                                      │     │
│  │  Every 5s: GET /api/agents/health                   │     │
│  │  - Update AgentStatusGrid                           │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────────┬──────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                  Campaign Completion                          │
│  1. All metrics reach target (100%)                           │
│  2. Stop polling                                              │
│  3. Display final results                                     │
│  4. Update PerformanceCharts                                  │
│  5. Show success notification                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Interactions

### Dashboard Page Component Tree

```
DashboardPage
│
├── Header
│   ├── Logo
│   ├── Title: "ChainReach AI Dashboard"
│   ├── Back to Home Button
│   └── Campaign Runner Button
│
├── Main Content
│   │
│   ├── RunCampaignButton
│   │   ├── Button: "Run Demo Campaign"
│   │   └── Dialog (when active)
│   │       ├── Loading State
│   │       ├── Success State
│   │       └── Error State
│   │
│   ├── LiveMetricsCounter
│   │   ├── Total Customers Counter
│   │   ├── Messages Generated Counter
│   │   ├── Compliance Checks Counter
│   │   └── Approved Messages Counter
│   │
│   ├── AgentStatusGrid
│   │   ├── Agent 1 Card (Segmentation)
│   │   ├── Agent 2 Card (Content Strategy)
│   │   ├── Agent 3 Card (Message Generation)
│   │   ├── Agent 4 Card (Compliance)
│   │   └── Agent 5 Card (Orchestrator)
│   │
│   ├── CampaignFlowVisualizer
│   │   ├── Segmentation Stage
│   │   ├── Strategy Stage
│   │   ├── Generation Stage
│   │   └── Compliance Stage
│   │
│   └── PerformanceCharts
│       ├── Before/After Bar Chart
│       └── Real-Time Funnel Line Chart
│
└── Footer
    ├── "ChainReach AI - Built for Hackathon 2025"
    └── "Multi-Agent Marketing Orchestration Platform"
```

### Inter-Component Communication

```typescript
// Shared state across components via API polling

// RunCampaignButton triggers campaign
const startCampaign = async () => {
  const response = await fetch('/api/campaigns/execute-demo', {
    method: 'POST'
  });
  // This initiates backend processing
};

// LiveMetricsCounter reads campaign progress
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetch('/api/metrics/live').then(r => r.json());
    setMetrics(data); // Updates counters
  }, 2000);
  return () => clearInterval(interval);
}, []);

// CampaignFlowVisualizer reads pipeline status
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetch('/api/pipeline/status').then(r => r.json());
    setPipelineStats(data); // Updates progress bars
  }, 3000);
  return () => clearInterval(interval);
}, []);

// AgentStatusGrid reads agent health
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetch('/api/agents/health').then(r => r.json());
    setAgentStats(data); // Updates health cards
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

---

## Troubleshooting

### Common Issues

#### 1. Dashboard Not Updating

**Symptoms**: Metrics stuck at 0, no campaign progress

**Causes**:
- Backend agents not running
- API endpoints returning errors
- Network connectivity issues

**Solutions**:
```bash
# Check if all agents are running
curl http://localhost:8001/health  # Agent 1
curl http://localhost:8002/health  # Agent 2
# Check Azure Functions status   # Agent 4

# Verify Next.js dev server
cd person5-orchestrator
npm run dev

# Check browser console for API errors
# Open DevTools → Console → Look for failed requests
```

#### 2. Campaign Execution Fails

**Symptoms**: "Campaign execution failed" error

**Causes**:
- One or more agents offline
- Timeout issues
- Invalid customer data

**Solutions**:
```typescript
// Check agent health before starting campaign
const healthCheck = await fetch('/api/agents/health');
const health = await healthCheck.json();

const allHealthy = health.agents.every(
  agent => agent.status === 'healthy'
);

if (!allHealthy) {
  alert('Some agents are offline. Please check agent status.');
  return;
}
```

#### 3. Real-Time Updates Lag

**Symptoms**: Dashboard updates slowly or skips metrics

**Causes**:
- Slow polling intervals
- Backend processing bottleneck
- Too many concurrent requests

**Solutions**:
```typescript
// Adjust polling frequency
const POLLING_INTERVALS = {
  metrics: 2000,      // Increase to 3000 if lagging
  pipeline: 3000,     // Increase to 5000 if lagging
  agentHealth: 5000   // Keep at 5000
};

// Implement debouncing for rapid updates
const debouncedUpdate = debounce(updateMetrics, 500);
```

#### 4. Memory Leaks from Polling

**Symptoms**: Browser slows down over time

**Causes**:
- Intervals not cleared on component unmount
- Too many listeners

**Solutions**:
```typescript
useEffect(() => {
  const interval = setInterval(fetchData, 2000);
  
  // CRITICAL: Always clean up intervals
  return () => {
    clearInterval(interval);
  };
}, [dependencies]);
```

#### 5. Charts Not Rendering

**Symptoms**: Empty chart containers

**Causes**:
- Recharts library issue
- Invalid data format
- CSS conflicts

**Solutions**:
```bash
# Reinstall recharts
npm uninstall recharts
npm install recharts

# Verify data format
console.log('Chart data:', performanceData);
// Should be: [{ metric, before, after, unit }, ...]
```

### Debug Mode

Enable verbose logging for troubleshooting:

```typescript
// Add to .env.local
NEXT_PUBLIC_DEBUG_MODE=true

// Use in components
if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
  console.log('[DEBUG] Campaign state:', campaignState);
  console.log('[DEBUG] Metrics:', metrics);
  console.log('[DEBUG] API response:', response);
}
```

### Performance Monitoring

```typescript
// Add performance tracking
const startTime = performance.now();

await executeCampaign();

const endTime = performance.now();
console.log(`Campaign completed in ${endTime - startTime}ms`);
```

---

## Performance Optimization

### Best Practices

1. **Polling Optimization**
   - Stop polling when campaign is idle
   - Use exponential backoff for errors
   - Implement request cancellation

2. **Data Caching**
   - Cache agent health for 5 seconds
   - Use SWR (stale-while-revalidate) pattern
   - Implement local state management

3. **Component Optimization**
   - Use `React.memo()` for expensive components
   - Implement `useMemo()` for calculated values
   - Debounce rapid state updates

4. **Bundle Size**
   - Code-split dashboard components
   - Lazy load charts
   - Tree-shake unused Recharts components

### Production Considerations

```typescript
// production.config.ts
export const PRODUCTION_CONFIG = {
  polling: {
    metrics: 5000,      // Slower in production
    pipeline: 5000,
    agentHealth: 10000
  },
  retry: {
    maxAttempts: 3,
    backoffMs: 1000
  },
  timeout: {
    apiCall: 10000,
    campaignExecution: 120000
  }
};
```

---

## Deployment Checklist

- [ ] All 5 agents deployed and healthy
- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] CORS configured correctly
- [ ] SSL/TLS certificates valid
- [ ] Monitoring and logging enabled
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] Mobile responsive design tested
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)
- [ ] Performance profiling completed
- [ ] Security audit passed

---

## Additional Resources

### Related Documentation
- [ORCHESTRATOR_README.md](./ORCHESTRATOR_README.md) - Main orchestrator setup
- [DASHBOARD_IMPLEMENTATION.md](./DASHBOARD_IMPLEMENTATION.md) - Technical implementation details
- [PROJECT_HANDOFF.md](./PROJECT_HANDOFF.md) - Project overview and handoff guide

### External Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Support

For questions or issues:
1. Check troubleshooting section above
2. Review browser console errors
3. Verify all agents are running
4. Check API endpoint responses
5. Contact team for assistance

---

**Last Updated**: November 22, 2025  
**Version**: 1.0  
**Authors**: ChainReach AI Team - Person 5 (Orchestration Lead)
