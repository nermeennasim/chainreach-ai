# Button-to-API Mapping Reference

This guide shows exactly what happens when you click each button on the AgentDashboard.

---

## Agent 1: Customer Segmentation (Port 8001)

### Button 1: 🏥 Health Check

**What it does**: Checks if Agent 1 is running and healthy

**Code**:
```typescript
const data = await checkSegmentationHealth();
addResult('GET /health', 'success', data);
```

**API Call**:
```
GET http://localhost:8001/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "segmentation-agent",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Shows in Results**:
- ✅ SUCCESS (green)
- Status: healthy
- Service: segmentation-agent
- Timestamp: 10:30:00

---

### Button 2: 👥 Get All Segments

**What it does**: Loads all customer segments from the database

**Code**:
```typescript
const data = await getSegments();
addResult('GET /api/segments', 'success', data);
```

**API Call**:
```
GET http://localhost:8001/api/segments
```

**Expected Response**:
```json
[
  {
    "id": 1,
    "name": "Enterprise Customers",
    "description": "High-value B2B customers with 6+ figure annual spend",
    "customer_count": 245,
    "criteria": {
      "min_annual_spend": 100000,
      "industry": ["Technology", "Finance"],
      "employee_count": ">1000"
    },
    "ai_generated": false,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-15T08:00:00Z"
  },
  {
    "id": 2,
    "name": "Mid-Market Growth",
    "description": "Growing companies with 20-500 employees",
    "customer_count": 678,
    ...
  },
  {
    "id": 3,
    "name": "SMB Segment",
    "description": "Small business customers under 20 employees",
    "customer_count": 1203,
    ...
  }
]
```

**Shows in Results**:
- ✅ SUCCESS (green)
- Array of segments
- Each segment shows: ID, name, description, customer_count
- First 500 characters of JSON displayed

---

### Button 3: 📋 Get All Customers

**What it does**: Lists all customers in the system (paginated - shows 20 per page)

**Code**:
```typescript
const data = await getCustomers(20, 0);
addResult('GET /api/customers', 'success', data);
```

**API Call**:
```
GET http://localhost:8001/api/customers?limit=20&offset=0
```

**Expected Response**:
```json
{
  "customers": [
    {
      "customer_id": "CUST-001",
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "company": "Acme Inc",
      "industry": "Technology",
      "location": "San Francisco",
      "country": "USA",
      "total_purchases": 250000.00,
      "purchase_count": 42,
      "avg_purchase_value": 5952.38,
      "engagement_score": 0.92,
      "segment_id": 1,
      "segment_name": "Enterprise Customers",
      "last_purchase_date": "2025-01-10T14:30:00Z",
      "email_opens": 156,
      "email_clicks": 28,
      "website_visits": 342,
      "created_at": "2024-01-15T00:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z"
    },
    ...19 more customers...
  ],
  "total": 2126,
  "limit": 20,
  "offset": 0
}
```

**Shows in Results**:
- ✅ SUCCESS (green)
- Shows 20 customers
- Each customer shows: ID, name, email, purchases, engagement score
- Total count: 2,126 customers in system

---

### Button 4: ⚡ Calculate Engagement

**What it does**: Runs the AI engagement calculation algorithm to update scores for all customers

**Code**:
```typescript
const data = await calculateEngagementScores();
addResult('POST /api/segment/calculate-engagement', 'success', data);
```

**API Call**:
```
POST http://localhost:8001/api/segment/calculate-engagement
Content-Type: application/json

(no body required)
```

**Expected Response**:
```json
{
  "message": "Engagement scores calculated successfully",
  "updated": 2126,
  "timestamp": "2025-01-15T10:35:00Z",
  "average_engagement": 0.72,
  "highest_engagement_segment": "Enterprise Customers",
  "lowest_engagement_segment": "SMB Segment"
}
```

**Shows in Results**:
- ✅ SUCCESS (green)
- Updated: 2,126 customers
- Average engagement: 0.72 (out of 1.0)
- Segment with highest engagement: Enterprise Customers

---

### Button 5: 🔄 Refresh Segmentation

**What it does**: Re-runs the entire segmentation algorithm using RFM (Recency, Frequency, Monetary) analysis

**Code**:
```typescript
const data = await refreshSegmentation();
addResult('POST /api/segment/refresh', 'success', data);
```

**API Call**:
```
POST http://localhost:8001/api/segment/refresh
Content-Type: application/json

(no body required)
```

**Expected Response**:
```json
{
  "message": "Segmentation refreshed successfully",
  "timestamp": "2025-01-15T10:40:00Z",
  "total_customers_processed": 2126,
  "segments_updated": [
    {
      "id": 1,
      "name": "Enterprise Customers",
      "previous_count": 245,
      "new_count": 258,
      "change": "+13"
    },
    {
      "id": 2,
      "name": "Mid-Market Growth",
      "previous_count": 678,
      "new_count": 665,
      "change": "-13"
    },
    {
      "id": 3,
      "name": "SMB Segment",
      "previous_count": 1203,
      "new_count": 1203,
      "change": "0"
    }
  ],
  "processing_time_ms": 3245
}
```

**Shows in Results**:
- ✅ SUCCESS (green)
- Total customers processed: 2,126
- How segment sizes changed
- Processing time: 3.2 seconds

---

### Button 6: 🤖 Analyze Customers (AI)

**What it does**: Uses AI to analyze customer behavior and suggest new segments

**Code**:
```typescript
const data = await analyzeCustomers();
addResult('POST /api/segment/analyze', 'success', data);
```

**API Call**:
```
POST http://localhost:8001/api/segment/analyze
Content-Type: application/json

(no body required)
```

**Expected Response**:
```json
{
  "analysis": "AI analysis complete",
  "timestamp": "2025-01-15T10:45:00Z",
  "suggested_segments": [
    {
      "name": "High-Value Churned Customers",
      "description": "Customers with high historical value who haven't purchased in 90+ days",
      "potential_customers": 156,
      "risk_level": "high",
      "recommended_action": "Reactivation campaign",
      "confidence": 0.94
    },
    {
      "name": "Growth Trajectory Leaders",
      "description": "Mid-market customers with 30%+ YoY growth in purchase frequency",
      "potential_customers": 287,
      "growth_potential": "high",
      "recommended_action": "Upsell premium features",
      "confidence": 0.91
    },
    {
      "name": "Seasonal Buyers",
      "description": "Customers with concentrated purchases during Q4",
      "potential_customers": 423,
      "seasonality": "Q4 focused",
      "recommended_action": "Year-round engagement program",
      "confidence": 0.88
    }
  ],
  "analysis_model": "AI Segment Generator v2.1",
  "processing_time_ms": 5234
}
```

**Shows in Results**:
- ✅ SUCCESS (green)
- 3 AI-suggested new segments
- Each shows: name, description, customer count, confidence level (94%, 91%, 88%)

---

## Agent 2: RAG/Content Retrieval API (Port 8000)

### Button 1: 🏥 Health Check

**What it does**: Checks if the RAG API is running and ready

**Code**:
```typescript
const data = await checkRAGHealth();
addResult('GET /health', 'success', data);
```

**API Call**:
```
GET http://localhost:8000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "rag-api",
  "version": "1.0.0",
  "embeddings_available": true,
  "documents_indexed": 1234,
  "timestamp": "2025-01-15T10:50:00Z"
}
```

**Shows in Results**:
- ✅ SUCCESS (green)
- Status: healthy
- Documents indexed: 1,234
- Embeddings available: true

---

### Button 2: 📊 Get Statistics

**What it does**: Shows statistics about the content library

**Code**:
```typescript
const data = await getRAGStats();
addResult('GET /stats', 'success', data);
```

**API Call**:
```
GET http://localhost:8000/stats
```

**Expected Response**:
```json
{
  "total_content": 1234,
  "by_content_type": {
    "whitepaper": 456,
    "case_study": 234,
    "datasheet": 321,
    "blog": 223
  },
  "by_audience": {
    "Enterprise": 600,
    "Mid-Market": 400,
    "SMB": 234
  },
  "storage_size_mb": 250.5,
  "last_updated": "2025-01-14T18:00:00Z",
  "timestamp": "2025-01-15T10:55:00Z"
}
```

**Shows in Results**:
- ✅ SUCCESS (green)
- Total content: 1,234 items
- Breakdown by type: Whitepapers (456), Case Studies (234), Datasheets (321), Blogs (223)
- Breakdown by audience: Enterprise (600), Mid-Market (400), SMB (234)

---

### Button 3: 🔍 Search Content

**What it does**: Searches the content library for "enterprise solutions" and returns top 5 matching results

**Code**:
```typescript
const data = await searchContent('enterprise solutions', 5);
addResult('POST /search', 'success', data);
```

**API Call**:
```
POST http://localhost:8000/search
Content-Type: application/json

{
  "query": "enterprise solutions",
  "top_k": 5
}
```

**Expected Response**:
```json
{
  "query": "enterprise solutions",
  "results_count": 5,
  "search_time_ms": 342,
  "results": [
    {
      "id": "doc-001",
      "title": "Enterprise Solutions Overview",
      "content": "Comprehensive guide to our enterprise platform...",
      "type": "whitepaper",
      "audience": "Enterprise",
      "relevance_score": 0.98,
      "created_date": "2024-06-15",
      "updated_date": "2025-01-10"
    },
    {
      "id": "doc-234",
      "title": "Case Study: Fortune 500 Implementation",
      "content": "How a leading enterprise customer...",
      "type": "case_study",
      "audience": "Enterprise",
      "relevance_score": 0.96,
      "created_date": "2024-09-20",
      "updated_date": "2025-01-05"
    },
    {
      "id": "doc-567",
      "title": "Enterprise Datasheet",
      "content": "Technical specifications and features...",
      "type": "datasheet",
      "audience": "Enterprise",
      "relevance_score": 0.94,
      "created_date": "2024-08-01",
      "updated_date": "2025-01-12"
    },
    {
      "id": "doc-890",
      "title": "Blog: Future of Enterprise",
      "content": "Industry insights and trends...",
      "type": "blog",
      "audience": "Enterprise",
      "relevance_score": 0.89,
      "created_date": "2025-01-14",
      "updated_date": "2025-01-14"
    },
    {
      "id": "doc-123",
      "title": "ROI Calculator for Enterprise",
      "content": "Calculate your return on investment...",
      "type": "datasheet",
      "audience": "Enterprise",
      "relevance_score": 0.87,
      "created_date": "2024-12-01",
      "updated_date": "2025-01-10"
    }
  ],
  "timestamp": "2025-01-15T11:00:00Z"
}
```

**Shows in Results**:
- ✅ SUCCESS (green)
- Query: "enterprise solutions"
- Search time: 342ms (fast!)
- 5 matching results showing:
  - Title, type (whitepaper, case study, etc.)
  - Audience (Enterprise)
  - Relevance score (0.98 = perfect match)
  - Last updated date

---

## What You'll See

### When Everything Works ✅

1. Dashboard loads
2. Two agent buttons appear
3. Click Agent 1 → 6 buttons appear
4. Click "Get All Segments" → Green SUCCESS
5. Results show segment data
6. Click Agent 2 → 3 buttons appear
7. Click "Search Content" → Green SUCCESS
8. Results show 5 content items

### If There's an Error ❌

1. Click button
2. Button shows "loading..."
3. Results appear but RED ERROR
4. Error message shows what went wrong:
   - "Connection refused" = Agent not running
   - "Invalid JSON" = Agent sent bad data
   - "Timeout" = Agent not responding fast enough
   - etc.

---

## Testing Order (Recommended)

1. **Start Agent 1** on port 8001
2. **Open Dashboard**
3. **Click Agent 1 → Health Check** → Should see green SUCCESS
4. **Try other Agent 1 buttons** → All should work
5. **Start Agent 2** on port 8000
6. **Click Agent 2 → Health Check** → Should see green SUCCESS
7. **Try other Agent 2 buttons** → All should work
8. **You're done!** Both agents integrated and working

---

## Data Types

All responses are **JSON** with consistent structure:

**Success Response**:
```json
{
  "data": "...",
  "timestamp": "2025-01-15T11:00:00Z",
  "status": "success"
}
```

**Error Response**:
```json
{
  "error": "Connection refused",
  "timestamp": "2025-01-15T11:01:00Z",
  "status": "error"
}
```

---

## What Each Response Component Means

| Component | Example | Meaning |
|-----------|---------|---------|
| `id` | `"CUST-001"` | Unique identifier for customer/segment |
| `name` | `"Enterprise Customers"` | Human-readable name |
| `customer_count` | `245` | How many customers in this group |
| `relevance_score` | `0.98` | How well it matches search (0-1, higher=better) |
| `engagement_score` | `0.92` | How active this customer is (0-1) |
| `confidence` | `0.94` | How sure AI is about suggestion (0-1) |
| `timestamp` | `"2025-01-15T11:00:00Z"` | When response was generated |

---

## Real-World Scenarios

### Scenario 1: Marketing Team Uses Dashboard
```
1. Open dashboard
2. Click Agent 1 to see segments
3. "Enterprise Customers" has 245 people
4. Click Agent 2 to search content
5. Find "Enterprise Solutions Overview" (whitepaper)
6. Use in new campaign email
```

### Scenario 2: Data Team Monitors Health
```
1. Open dashboard each morning
2. Click both Health Checks
3. Verify both show green SUCCESS
4. If red ERROR: investigate why agents are down
5. Take corrective action
```

### Scenario 3: AI Suggests New Segment
```
1. Open dashboard
2. Click "Analyze Customers (AI)"
3. AI suggests "High-Value Churned Customers"
4. Data shows 156 customers need reactivation
5. Create reactivation campaign targeting them
```

---

## Troubleshooting by Response

| Response | Meaning | Fix |
|----------|---------|-----|
| 🟢 Success in <1s | Everything working | Keep going! |
| 🔴 "Connection refused" | Agent not running | Start agent on correct port |
| 🔴 "Timeout" | Agent too slow | Check agent logs for errors |
| 🔴 "Invalid JSON" | Agent sent bad data | Restart agent |
| 🟢 Success but empty data | Agent working, data is empty | Populate database |

---

## Next Steps After Testing

Once all buttons work (all green ✅):

1. **Test Custom Campaign** with real CSV
2. **Integrate Agent 3** (Message Generation)
3. **Integrate Agent 4** (Compliance)
4. **Build full 5-agent workflow**

You're now ready to move to Phase 2! 🚀

