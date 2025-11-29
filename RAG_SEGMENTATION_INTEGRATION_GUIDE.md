# RAG + Segmentation Integration Guide

## Overview

This integration connects the **RAG API** (Person 2) with the **Segmentation Agent** (Agent 1) through the **Orchestrator Dashboard** (Person 5).

### Workflow
```
Segmentation Agent (Port 3001)
           ↓
Gets customer segments
           ↓
Orchestrator Dashboard (Port 3000)
           ↓
Routes data to RAG API
           ↓
RAG API (Port 8000)
           ↓
Generates segment-specific content
           ↓
Returns integrated results
```

---

## Prerequisites

1. **Segmentation Agent** running on port 3001
2. **RAG API** running on port 8000
3. **Orchestrator Dashboard** running on port 3000

---

## Setup Instructions

### 1. Start Segmentation Agent

```bash
cd segmentation-agent-node
npm install
npm run dev
```

Expected output:
```
✓ Database connected
✓ Server listening on http://localhost:3001
✓ Segmentation Agent ready
```

### 2. Start RAG API

```bash
cd person2-rag-nodejs
npm install
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════╗
║  Person2 - Content Retrieval Agent (Node.js)           ║
║  Running on http://localhost:8000                      ║
║  Segmentation API: http://localhost:3001               ║
╚════════════════════════════════════════════════════════╝
```

### 3. Start Orchestrator Dashboard

```bash
cd person5-orchestrator-dashboard
npm install
npm run dev
```

Expected output:
```
- Ready in 2.5s
- http://localhost:3000
```

### 4. Navigate to Integration

Open your browser and go to:
```
http://localhost:3000/integration
```

---

## API Endpoints

### Execute Workflow

**Endpoint:** `POST /api/integration/rag-segmentation`

**Purpose:** Fetch segments from Segmentation Agent and generate content using RAG API

**Request Body:**
```json
{
  "segmentationApiUrl": "http://localhost:3001",
  "ragApiUrl": "http://localhost:8000",
  "generateContent": true
}
```

**Response:**
```json
{
  "success": true,
  "workflow": "rag-segmentation-integration",
  "timestamp": "2024-11-28T10:30:00Z",
  "segmentation": {
    "apiUrl": "http://localhost:3001",
    "segmentsCount": 4,
    "segments": [
      {
        "id": "seg-1",
        "name": "VIP Enterprise",
        "description": "High-value enterprise customers",
        "customerCount": 250,
        "criteria": {}
      }
    ]
  },
  "contentGeneration": {
    "apiUrl": "http://localhost:8000",
    "enabled": true,
    "generatedFor": 4,
    "content": [
      {
        "segment": "VIP Enterprise",
        "content": [
          {
            "title": "Enterprise Security Solutions",
            "content": "Comprehensive security framework for large organizations",
            "content_type": "whitepaper",
            "audience": "Enterprise",
            "campaign": "Enterprise_2025"
          }
        ],
        "generatedAt": "2024-11-28T10:30:00Z"
      }
    ]
  },
  "metrics": {
    "totalSegments": 4,
    "contentGenerationSuccessRate": 100,
    "totalContentItems": 8
  }
}
```

### Health Check

**Endpoint:** `GET /api/integration/rag-segmentation`

**Purpose:** Check health status of both services

**Query Parameters (optional):**
- `segmentationUrl`: Custom Segmentation Agent URL
- `ragUrl`: Custom RAG API URL

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-28T10:30:00Z",
  "services": {
    "segmentationAgent": {
      "url": "http://localhost:3001",
      "status": "online",
      "error": null
    },
    "ragApi": {
      "url": "http://localhost:8000",
      "status": "online",
      "error": null
    }
  }
}
```

---

## Service Layer (TypeScript)

### Import and Use

```typescript
import {
  executeRagSegmentationWorkflow,
  checkRagSegmentationHealth,
  getSegmentsOnly,
  getContentForSegment,
  searchSegmentContent,
  getRagSegmentationStats
} from '@/lib/api/rag-segmentation';

// Execute full workflow
const results = await executeRagSegmentationWorkflow();

// Check health
const health = await checkRagSegmentationHealth();

// Get only segments (faster)
const segments = await getSegmentsOnly();

// Get content for specific segment
const content = await getContentForSegment('VIP Enterprise');

// Search content across segments
const searchResults = await searchSegmentContent('enterprise');

// Get statistics
const stats = await getRagSegmentationStats();
```

---

## Environment Variables

### .env.local

```env
# Segmentation Agent
SEGMENTATION_API_URL=http://localhost:3001

# RAG API
RAG_API_URL=http://localhost:8000

# Optional: Custom API endpoints
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## Testing the Integration

### 1. Health Check

```bash
curl -X GET http://localhost:3000/api/integration/rag-segmentation
```

Expected: Both services should show "online"

### 2. Execute Workflow

```bash
curl -X POST http://localhost:3000/api/integration/rag-segmentation \
  -H "Content-Type: application/json" \
  -d '{
    "generateContent": true
  }'
```

Expected: Full workflow response with segments and generated content

### 3. Get Segments Only (Faster)

```bash
curl -X POST http://localhost:3000/api/integration/rag-segmentation \
  -H "Content-Type: application/json" \
  -d '{
    "generateContent": false
  }'
```

Expected: Only segments, no content generation

### 4. Search Content

Using the TypeScript service layer:

```typescript
const results = await searchSegmentContent('enterprise');
console.log(results);
```

---

## Troubleshooting

### Services Not Connecting

**Error:** "Could not connect to one or more services"

**Solution:**
1. Verify all services are running on correct ports
2. Check environment variables
3. Verify no firewall blocking connections
4. Check browser console for CORS issues

### Timeout Error

**Error:** "Integration workflow failed - timeout"

**Solution:**
1. Increase request timeout (RAG API may take longer for first request)
2. Verify services aren't overloaded
3. Check database connectivity for Segmentation Agent

### No Segments Found

**Error:** "No segments available from Segmentation API"

**Solution:**
1. Verify Segmentation Agent has data: `GET http://localhost:3001/api/segments`
2. Check database migration status
3. Verify Segmentation Agent is returning data

### Content Generation Failing

**Error:** "Failed to generate content for segment"

**Solution:**
1. Check RAG API logs: `GET http://localhost:8000/health`
2. Verify Azure OpenAI configuration in RAG API
3. Check request body format

---

## Performance Optimization

### 1. Cache Segments

```typescript
const cache = new Map();

async function getCachedSegments() {
  if (cache.has('segments')) {
    return cache.get('segments');
  }
  const segments = await getSegmentsOnly();
  cache.set('segments', segments);
  return segments;
}
```

### 2. Parallel Content Generation

```typescript
const contentPromises = segments.map(seg =>
  getContentForSegment(seg.name)
);
const allContent = await Promise.all(contentPromises);
```

### 3. Pagination

```typescript
// Get segments in batches
const batchSize = 10;
const batches = Array.from(
  { length: Math.ceil(segments.length / batchSize) },
  (_, i) => segments.slice(i * batchSize, (i + 1) * batchSize)
);
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              Orchestrator Dashboard (Port 3000)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/integration/rag-segmentation (Route Handler)   │  │
│  │  - Validates requests                               │  │
│  │  - Error handling & status codes                     │  │
│  │  - Response formatting                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /lib/api/rag-segmentation.ts (Service Layer)        │  │
│  │  - Wrapper functions for API calls                   │  │
│  │  - Search & filtering logic                          │  │
│  │  - Type definitions                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  RagSegmentationDashboard.tsx (UI Component)         │  │
│  │  - User interface                                    │  │
│  │  - Real-time workflow visualization                 │  │
│  │  - Content display                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           ↓                                    ↓
┌──────────────────────┐        ┌──────────────────────┐
│ Segmentation Agent   │        │  RAG API             │
│  (Port 3001)         │        │  (Port 8000)         │
│                      │        │                      │
│ - Get segments       │        │ - Search content     │
│ - Customer data      │        │ - Generate content   │
│ - Criteria           │        │ - Content library    │
└──────────────────────┘        └──────────────────────┘
```

---

## Next Steps

1. **Monitor Metrics:** Use the dashboard stats to track performance
2. **Extend Content:** Add more content types to RAG library
3. **Custom Segments:** Create campaign-specific segments
4. **Integrate with Campaign:** Use generated content in campaigns
5. **Add Caching:** Implement Redis for performance

---

## Support & Resources

- **Dashboard:** http://localhost:3000/integration
- **API Docs:** http://localhost:3000/api/integration/rag-segmentation
- **Segmentation Agent:** http://localhost:3001
- **RAG API:** http://localhost:8000
