# 🚀 ChainReach Segmentation API - Complete Deployment & Integration Guide

**For Agent 2, Dashboard Teams, and Other Integration Partners**

Last Updated: November 27, 2025  
Version: 1.0  
Status: ✅ Production Ready

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [System Architecture](#system-architecture)
3. [API Endpoints](#api-endpoints)
4. [Complete Workflows](#complete-workflows)
5. [Deployment Guide](#deployment-guide)
6. [Dashboard Integration](#dashboard-integration)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Reference

### **Production API**
```
Base URL: http://localhost:8001
Status: ✅ Ready for Azure deployment
Database: PostgreSQL (Azure Database for PostgreSQL)
AI: Azure OpenAI GPT-4o (eastus2)
```

### **Key Statistics**
- **Total Customers**: 1,010
- **Active Segments**: 16 (11 rule-based + 5 AI-generated)
- **Assigned Customers**: 206 high-value customers
- **Unassigned**: 804 (available for additional segmentation)

### **Current AI Segments**
1. Elite High Spenders (5 customers) - $54K avg purchases
2. Consistent Volume Buyers (62 customers) - $40K avg
3. Emerging Growth Customers (65 customers) - $24K avg
4. High Engagement Aspirants (70 customers) - $16K avg
5. Low Engagement Value Buyers (4 customers) - $2.4K avg

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  DASHBOARD                          │
│              (Next.js/React)                        │
│         person5-orchestrator-dashboard              │
└───────────────┬─────────────────────────────────────┘
                │ HTTP REST API Calls
                │
┌───────────────▼─────────────────────────────────────┐
│         SEGMENTATION API (Node.js)                  │
│      segmentation-agent-node (Port 8001)            │
│                                                     │
│  ┌─────────────────────────────────────────┐      │
│  │  Express.js REST API                    │      │
│  │  - Customer Management                  │      │
│  │  - Segment CRUD                         │      │
│  │  - AI Integration                       │      │
│  │  - Analytics & Metrics                  │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
│  ┌─────────────────────────────────────────┐      │
│  │  Azure OpenAI Integration               │      │
│  │  - GPT-4o (eastus2)                     │      │
│  │  - Intelligent Segmentation             │      │
│  │  - Marketing Message Generation         │      │
│  └─────────────────────────────────────────┘      │
└───────────────┬─────────────────────────────────────┘
                │
                │ PostgreSQL Connection
                │
┌───────────────▼─────────────────────────────────────┐
│    POSTGRESQL DATABASE (Azure)                      │
│    chainreach-db.postgres.database.azure.com        │
│                                                     │
│    Tables:                                          │
│    - customers (1,010 rows)                         │
│    - segments (16 segments)                         │
│    - campaign_templates                             │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### **Health & Status**

#### GET `/health`
Check API health status
```bash
curl http://localhost:8001/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T10:30:00.000Z",
  "database": "connected",
  "uptime": 3600
}
```

#### GET `/status`
Detailed system status
```bash
curl http://localhost:8001/status
```

#### GET `/metrics`
System-wide metrics
```bash
curl http://localhost:8001/api/metrics
```
**Response:**
```json
{
  "total_customers": 1010,
  "total_segments": 16,
  "customers_segmented": 206,
  "customers_unsegmented": 804,
  "average_engagement_score": 93.5,
  "segment_distribution": {
    "Elite High Spenders": 5,
    "Consistent Volume Buyers": 62,
    "Emerging Growth Customers": 65,
    "High Engagement Aspirants": 70,
    "Low Engagement Value Buyers": 4
  }
}
```

---

### **Customer Management**

#### GET `/api/customers`
Get all customers with pagination
```bash
curl "http://localhost:8001/api/customers?page=1&limit=50"
```

#### GET `/api/customers/:id`
Get single customer details
```bash
curl http://localhost:8001/api/customers/123
```

#### GET `/api/customers/segment/:segmentId`
Get all customers in a specific segment
```bash
curl http://localhost:8001/api/customers/segment/12
```

---

### **Segment Management**

#### GET `/api/segments`
List all segments
```bash
curl http://localhost:8001/api/segments
```
**Response:**
```json
[
  {
    "id": 12,
    "name": "Elite High Spenders",
    "description": "Top-tier customers with purchases nearing the upper range",
    "criteria": {
      "min_total_purchases": 50000,
      "min_engagement_score": 100
    },
    "ai_generated": true,
    "customer_count": 5,
    "created_at": "2025-11-27T10:00:00.000Z"
  }
]
```

#### GET `/api/segments/:id`
Get segment with all customers
```bash
curl http://localhost:8001/api/segments/12
```

#### POST `/api/segments`
Create new segment
```bash
curl -X POST http://localhost:8001/api/segments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Segment",
    "description": "Description here",
    "criteria": {
      "min_total_purchases": 10000,
      "min_engagement_score": 80
    },
    "ai_generated": false
  }'
```

#### PUT `/api/segments/:id`
Update existing segment
```bash
curl -X PUT http://localhost:8001/api/segments/12 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'
```

#### DELETE `/api/segments/:id`
Delete segment
```bash
curl -X DELETE http://localhost:8001/api/segments/12
```

---

### **🤖 AI-Powered Operations**

#### POST `/api/segment/refresh`
**CRITICAL ENDPOINT** - Apply all segment criteria to customers
```bash
curl -X POST http://localhost:8001/api/segment/refresh
```
**What it does:**
1. Evaluates all 1,010 customers against all 16 segment criteria
2. Assigns customers to matching segments
3. Updates segment_id and segment_name in customers table
4. Calculates engagement scores

**Response:**
```json
{
  "success": true,
  "message": "Segmentation refreshed successfully",
  "customers_updated": 206,
  "segments_applied": 5,
  "execution_time_ms": 1234
}
```

#### POST `/api/segments/ai/analyze`
**AI SEGMENTATION** - Create new segments from raw customer data
```bash
curl -X POST http://localhost:8001/api/segments/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "sample_size": 500,
    "num_segments": 5,
    "focus": "high-value customers"
  }'
```
**What it does:**
1. Samples N customers from database
2. Analyzes with Azure OpenAI GPT-4o
3. Returns AI-suggested segments with criteria
4. Provides marketing strategies

**Response:**
```json
{
  "suggestions": [
    {
      "name": "Elite High Spenders",
      "description": "Top-tier customers...",
      "criteria": {
        "min_total_purchases": 50000,
        "min_engagement_score": 100
      },
      "marketing_strategy": "VIP experiences, exclusive loyalty programs",
      "estimated_size_percentage": 5
    }
  ],
  "analyzed_customers": 500,
  "model": "gpt-4o"
}
```

#### POST `/api/segments/:id/generate-message`
Generate AI marketing message for segment
```bash
curl -X POST http://localhost:8001/api/segments/12/generate-message \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_type": "email",
    "tone": "professional",
    "goal": "retention"
  }'
```

#### POST `/api/engagement/calculate`
Recalculate engagement scores for all customers
```bash
curl -X POST http://localhost:8001/api/engagement/calculate
```

---

## 🔄 Complete Workflows

### **Workflow 1: Initial Setup (One-Time)**

```powershell
# 1. Clone repository
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation-agent-node"

# 2. Install dependencies
npm install

# 3. Configure environment
# Edit .env with database and Azure OpenAI credentials

# 4. Build TypeScript
npm run build

# 5. Start server
npm start
# Server runs at http://localhost:8001
```

### **Workflow 2: AI-Powered Segmentation (Complete Process)**

```powershell
# Step 1: Analyze customer data with AI (500 sample)
node scripts/ai-segment-500.mjs

# What happens:
# - Fetches 500 customers from database
# - Sends to Azure OpenAI GPT-4o
# - AI creates 5 intelligent segments
# - Automatically inserts into database
# Output: 5 new segments created with IDs 12-16

# Step 2: Apply segments to all customers
node scripts/apply-segments.mjs

# What happens:
# - Resets all segment assignments
# - Evaluates each customer against segment criteria
# - Assigns matching customers
# Output: 206 customers assigned to AI segments

# Step 3: Verify results
curl http://localhost:8001/api/metrics

# Step 4: View segment details
curl http://localhost:8001/api/segments
```

### **Workflow 3: Dashboard Integration**

**From Dashboard (TypeScript/React):**

```typescript
// File: src/lib/segmentation.ts

const SEGMENTATION_API = process.env.NEXT_PUBLIC_SEGMENTATION_API || 'http://localhost:8001';

// 1. Get all segments
async function getSegments() {
  const response = await fetch(`${SEGMENTATION_API}/api/segments`);
  return response.json();
}

// 2. Get segment with customers
async function getSegmentDetails(segmentId: number) {
  const response = await fetch(`${SEGMENTATION_API}/api/segments/${segmentId}`);
  return response.json();
}

// 3. Get system metrics
async function getMetrics() {
  const response = await fetch(`${SEGMENTATION_API}/api/metrics`);
  return response.json();
}

// 4. Refresh segmentation
async function refreshSegments() {
  const response = await fetch(`${SEGMENTATION_API}/api/segment/refresh`, {
    method: 'POST'
  });
  return response.json();
}

// 5. Request AI analysis
async function analyzeWithAI(sampleSize = 500) {
  const response = await fetch(`${SEGMENTATION_API}/api/segments/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sample_size: sampleSize, num_segments: 5 })
  });
  return response.json();
}

// 6. Get customers by segment
async function getCustomersBySegment(segmentId: number) {
  const response = await fetch(`${SEGMENTATION_API}/api/customers/segment/${segmentId}`);
  return response.json();
}
```

**Dashboard .env.local:**
```env
NEXT_PUBLIC_SEGMENTATION_API=http://localhost:8001
# After Azure deployment:
# NEXT_PUBLIC_SEGMENTATION_API=https://chainreach-segmentation-node.azurewebsites.net
```

### **Workflow 4: Ongoing Operations**

```bash
# Daily/Weekly: Refresh segments as customer data changes
curl -X POST http://localhost:8001/api/segment/refresh

# Monthly: Recalculate engagement scores
curl -X POST http://localhost:8001/api/engagement/calculate

# On-Demand: Generate new AI segments
node scripts/ai-segment-500.mjs

# Monitor health
curl http://localhost:8001/health
```

---

## ☁️ Deployment Guide

### **Prerequisites**
```powershell
# 1. Azure CLI installed
az --version

# 2. Logged in to Azure
az login

# 3. Confirm resource group exists
az group show --name chainreach-ai
```

### **Automated Deployment**

```powershell
cd segmentation-agent-node

# Option 1: Use automated script
.\deploy-azure.ps1 `
  -ResourceGroup "chainreach-ai" `
  -Location "centralus" `
  -AppName "chainreach-segmentation-node" `
  -AzureOpenAIEndpoint "YOUR_AZURE_OPENAI_ENDPOINT" `
  -AzureOpenAIKey "YOUR_AZURE_OPENAI_KEY"

# What the script does:
# 1. Builds TypeScript (npm run build)
# 2. Creates deployment package (dist/ + package.json)
# 3. Creates App Service Plan (B1 tier)
# 4. Creates Web App (Node.js 18)
# 5. Configures environment variables
# 6. Deploys code
# 7. Tests endpoints
```

### **Manual Deployment Steps**

```powershell
# 1. Build application
npm run build

# 2. Create deployment package
Compress-Archive -Path dist,package.json,package-lock.json -DestinationPath deploy.zip -Force

# 3. Create App Service Plan
az appservice plan create `
  --name chainreach-node-plan `
  --resource-group chainreach-ai `
  --sku B1 `
  --is-linux

# 4. Create Web App
az webapp create `
  --resource-group chainreach-ai `
  --plan chainreach-node-plan `
  --name chainreach-segmentation-node `
  --runtime "NODE:18-lts"

# 5. Configure environment variables
az webapp config appsettings set `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --settings `
    NODE_ENV=production `
    PORT=8080 `
    DB_HOST=chainreach-db.postgres.database.azure.com `
    DB_DATABASE=chainreach_prod `
    DB_USER=chainreach_admin `
    DB_PASSWORD=<YOUR_DB_PASSWORD> `
    DB_PORT=5432 `
    DB_SSL=true `
    AZURE_OPENAI_ENDPOINT=YOUR_AZURE_OPENAI_ENDPOINT `
    AZURE_OPENAI_KEY=YOUR_AZURE_OPENAI_KEY `
    AZURE_OPENAI_DEPLOYMENT=gpt-4o `
    AZURE_OPENAI_API_VERSION=2024-04-01-preview

# 6. Deploy code
az webapp deployment source config-zip `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --src deploy.zip

# 7. Test deployment
curl https://chainreach-segmentation-node.azurewebsites.net/health
```

### **Post-Deployment Configuration**

```powershell
# Enable logging
az webapp log config `
  --name chainreach-segmentation-node `
  --resource-group chainreach-ai `
  --application-logging filesystem `
  --level information

# View logs
az webapp log tail `
  --name chainreach-segmentation-node `
  --resource-group chainreach-ai

# Restart app
az webapp restart `
  --name chainreach-segmentation-node `
  --resource-group chainreach-ai
```

---

## 🎨 Dashboard Integration Examples

### **React Component: Segment List**

```typescript
// components/SegmentList.tsx
import { useEffect, useState } from 'react';

interface Segment {
  id: number;
  name: string;
  description: string;
  customer_count: number;
  ai_generated: boolean;
}

export function SegmentList() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8001/api/segments')
      .then(res => res.json())
      .then(data => {
        setSegments(data);
        setLoading(false);
      });
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetch('http://localhost:8001/api/segment/refresh', { method: 'POST' });
    // Reload segments
    const res = await fetch('http://localhost:8001/api/segments');
    setSegments(await res.json());
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleRefresh}>Refresh Segments</button>
      {loading ? 'Loading...' : (
        <ul>
          {segments.map(seg => (
            <li key={seg.id}>
              {seg.name} {seg.ai_generated && '🤖'}
              <span>({seg.customer_count} customers)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### **React Component: AI Segmentation Button**

```typescript
// components/AISegmentation.tsx
export function AISegmentationButton() {
  const [analyzing, setAnalyzing] = useState(false);

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8001/api/segments/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample_size: 500, num_segments: 5 })
      });
      const data = await response.json();
      alert(`AI created ${data.suggestions.length} new segments!`);
    } catch (error) {
      alert('AI analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <button onClick={runAIAnalysis} disabled={analyzing}>
      {analyzing ? 'Analyzing with AI...' : '🤖 Create AI Segments'}
    </button>
  );
}
```

---

## 🔧 Troubleshooting

### **Issue: Cannot connect to database**
```powershell
# Test connection
psql -h chainreach-db.postgres.database.azure.com -U chainreach_admin -d chainreach_prod

# Check .env file
cat .env | Select-String "DB_"

# Verify database exists
SELECT COUNT(*) FROM customers;
```

### **Issue: Azure OpenAI not working**
```powershell
# Test endpoint
curl -X POST "<YOUR_AZURE_OPENAI_ENDPOINT>/openai/deployments/gpt-4o/chat/completions?api-version=2024-04-01-preview" `
  -H "api-key: YOUR_KEY" `
  -H "Content-Type: application/json" `
  -d '{"messages":[{"role":"user","content":"test"}]}'

# Check .env
cat .env | Select-String "AZURE_OPENAI"
```

### **Issue: Server not starting**
```powershell
# Check TypeScript compilation
npm run build

# Check for errors
node dist/app.js

# View logs
tail -f logs/app.log
```

### **Issue: Segments not applying**
```bash
# Check segment criteria
curl http://localhost:8001/api/segments

# Manually run refresh
curl -X POST http://localhost:8001/api/segment/refresh

# Check customers
curl http://localhost:8001/api/customers?limit=10
```

---

## 📊 Data Schema Reference

### **customers table**
```sql
- id: SERIAL PRIMARY KEY
- customer_id: VARCHAR(255)
- name: VARCHAR(255)
- email: VARCHAR(255)
- company: VARCHAR(255)
- total_purchases: DECIMAL(15,2)
- purchase_count: INTEGER
- revenue: DECIMAL(15,2)
- engagement_score: DECIMAL(5,2)
- segment_id: INTEGER (FK to segments)
- segment_name: VARCHAR(255)
- industry: VARCHAR(255)
- country: VARCHAR(100)
- employee_count: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **segments table**
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(255) UNIQUE
- description: TEXT
- criteria: JSONB (e.g., {"min_total_purchases": 50000})
- ai_generated: BOOLEAN DEFAULT false
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## 🚦 Status Indicators

| Status | Meaning |
|--------|---------|
| ✅ | Completed and working |
| 🚀 | Ready for deployment |
| 🔄 | In progress |
| ⚠️ | Needs attention |
| ❌ | Not implemented |

**Current System Status:**
- ✅ Database: Connected (1,010 customers)
- ✅ API Server: Running (Port 8001)
- ✅ Azure OpenAI: Configured (GPT-4o, eastus2)
- ✅ AI Segmentation: Working (5 segments created)
- ✅ Customer Assignment: Complete (206 assigned)
- 🚀 Azure Deployment: Ready (script prepared)
- 🚀 Dashboard Integration: Ready (API client provided)

---

## 📞 Support & Next Steps

### **For Dashboard Team:**
1. Use the TypeScript API client examples above
2. Set `NEXT_PUBLIC_SEGMENTATION_API` in your `.env.local`
3. Test endpoints with `curl` commands first
4. Check `/health` endpoint regularly

### **For Agent 2 / RAG Team:**
- Your API follows similar patterns
- See **person2-rag** project for implementation
- Use same Azure OpenAI credentials
- Database connection pattern is identical

### **Quick Command Reference Card:**
```bash
# Health check
curl http://localhost:8001/health

# Get all segments
curl http://localhost:8001/api/segments

# Get metrics
curl http://localhost:8001/api/metrics

# Refresh segments
curl -X POST http://localhost:8001/api/segment/refresh

# Run AI analysis
node scripts/ai-segment-500.mjs

# Deploy to Azure
.\deploy-azure.ps1
```

---

**Last Updated:** November 27, 2025  
**Maintained By:** ChainReach AI Team  
**Questions?** Check logs: `az webapp log tail --name chainreach-segmentation-node --resource-group chainreach-ai`
