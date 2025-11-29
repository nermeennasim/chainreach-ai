# 🚀 API Explorer - Swagger-Like Dashboard

## Overview

The **API Explorer** is an interactive, Swagger-like interface that lets you test all 5 agents directly from the browser without needing external tools like Postman or curl.

**Access it at:** `http://localhost:3000/dashboard` → Click "🚀 API Explorer (Swagger)" tab

---

## Features

### ✨ What You Can Do

- **🎯 Select Any Agent** - Choose from 5 agents with instant agent switching
- **📝 Input Parameters** - Fill in request parameters with type hints
- **▶️ Execute API Calls** - Click one button to execute any endpoint
- **📊 View Results** - See JSON responses in a formatted, collapsible view
- **📱 Color-Coded Methods** - GET (blue), POST (green), PUT (yellow), DELETE (red)
- **⏱️ Response History** - Keep track of all requests and responses
- **🔄 Expandable Results** - Click to expand/collapse any result for detailed view

---

## Agent Documentation

### 👥 Agent 1: Customer Segmentation (Port 8001)

**Purpose:** Analyzes customers and creates targeted segments

#### Endpoints Available:

1. **🏥 Health Check**
   - Method: `GET /health`
   - Description: Verify agent is running
   - Parameters: None
   - Example Response: `{status: "healthy", uptime: 12345}`

2. **👥 Get All Segments**
   - Method: `GET /api/segments`
   - Description: Retrieve all customer segments
   - Parameters: None
   - Example Response:
     ```json
     [
       {
         "id": "seg_001",
         "name": "Enterprise Customers",
         "customer_count": 250,
         "avg_lifetime_value": 45000
       }
     ]
     ```

3. **🔍 Get Segment by ID**
   - Method: `GET /api/segments/:id`
   - Description: Get detailed segment info
   - Parameters:
     - `id` (string, required) - Segment ID, e.g., "seg_001"
   - Example Response: Detailed segment data with customers

4. **📋 Get All Customers**
   - Method: `GET /api/customers`
   - Description: Get paginated customer list
   - Parameters:
     - `limit` (number, optional) - Default: 20, Max: 100
     - `offset` (number, optional) - Default: 0
   - Example Response:
     ```json
     {
       "customers": [...],
       "total": 5000,
       "limit": 20,
       "offset": 0
     }
     ```

5. **👤 Get Customer by ID**
   - Method: `GET /api/customers/:id`
   - Description: Get specific customer details
   - Parameters:
     - `id` (string, required) - Customer ID, e.g., "cust_001"

6. **⚡ Calculate Engagement Scores**
   - Method: `POST /api/segment/calculate-engagement`
   - Description: Calculate engagement metrics for all segments
   - Parameters: None

7. **🔄 Refresh Segmentation**
   - Method: `POST /api/segment/refresh`
   - Description: Recalculate all segments based on latest data
   - Parameters: None

8. **🤖 Analyze Customers (AI)**
   - Method: `POST /api/segment/analyze`
   - Description: AI-powered customer behavior analysis
   - Parameters: None

---

### 📚 Agent 2: Content Retrieval (RAG) (Port 8000)

**Purpose:** Searches and retrieves relevant marketing content

#### Endpoints Available:

1. **🏥 Health Check**
   - Method: `GET /health`
   - Description: Verify RAG API is running
   - Parameters: None

2. **🔍 Search Content**
   - Method: `POST /search`
   - Description: Search marketing content by query
   - Parameters:
     - `query` (string, required) - Search term, e.g., "enterprise solutions"
     - `top_k` (number, optional) - Number of results, Default: 5
   - Example Response:
     ```json
     {
       "results": [
         {
           "id": "content_001",
           "title": "Enterprise Solutions Overview",
           "content": "...",
           "type": "guide",
           "relevance_score": 0.95
         }
       ]
     }
     ```

3. **📚 Get All Content**
   - Method: `GET /content`
   - Description: Retrieve all indexed content items
   - Parameters: None

4. **📊 Get Statistics**
   - Method: `GET /stats`
   - Description: RAG system statistics
   - Parameters: None
   - Example Response: `{total_documents: 150, avg_chunk_size: 512, last_update: "2025-11-28"}`

---

### ✍️ Agent 3: Message Generation (Port 5003)

**Purpose:** Generates 3 personalized message variants per customer

#### Endpoints Available:

1. **🏥 Health Check**
   - Method: `GET /health`
   - Description: Verify agent is running
   - Parameters: None

2. **✍️ Generate Message Variants**
   - Method: `POST /api/generate-variants`
   - Description: Create 3 personalized variants per customer
   - Parameters:
     - `segment_id` (string, required) - Which segment, e.g., "seg_001"
     - `content_id` (string, required) - Which content, e.g., "content_001"
   - Example Response:
     ```json
     {
       "success": true,
       "variants": [
         {
           "variant_id": "var_001",
           "customer_id": "cust_001",
           "content": "Personalized variant 1...",
           "tone": "professional"
         }
       ],
       "generated_count": 250
     }
     ```

---

### 🛡️ Agent 4: Compliance & Safety (Azure Content Safety API)

**Purpose:** Validates content compliance and safety

#### Endpoints Available:

1. **🛡️ Analyze Content Safety**
   - Method: `POST /analyze`
   - Description: Check content for harmful material
   - Parameters:
     - `text` (string, required) - Content to check
   - Example Response:
     ```json
     {
       "text": "Your message here",
       "has_harmful_content": false,
       "severity": "safe",
       "categories": {
         "hate_speech": 0,
         "sexual_content": 0,
         "violence": 0,
         "self_harm": 0
       },
       "confidence": 0.95,
       "recommendations": []
     }
     ```

---

### 🎯 Agent 5: Campaign Executor (Port 5005)

**Purpose:** Sends approved messages to customers

#### Endpoints Available:

1. **🏥 Health Check**
   - Method: `GET /health`
   - Description: Verify agent is running
   - Parameters: None

2. **📧 Send Campaign Messages**
   - Method: `POST /api/send`
   - Description: Execute campaign message sends
   - Parameters:
     - `campaign_id` (string, required) - Campaign to send, e.g., "camp_001"
     - `batch_size` (number, optional) - Messages per batch, Default: 100
   - Example Response:
     ```json
     {
       "success": true,
       "campaign_id": "camp_001",
       "messages_sent": 5000,
       "messages_failed": 12,
       "duration_seconds": 45.3
     }
     ```

3. **📊 Get Campaign Status**
   - Method: `GET /api/campaign-status`
   - Description: Check campaign progress
   - Parameters:
     - `campaign_id` (string, required) - Campaign ID, e.g., "camp_001"
   - Example Response:
     ```json
     {
       "campaign_id": "camp_001",
       "status": "running",
       "progress": {
         "total": 5000,
         "sent": 3500,
         "failed": 12,
         "pending": 1488
       }
     }
     ```

---

## How to Use

### Quick Start (2 Minutes)

1. **Navigate to Dashboard**
   ```
   http://localhost:3000/dashboard
   ```

2. **Click "API Explorer" Tab**
   - See all 5 agents displayed horizontally

3. **Select an Agent**
   - Click on any agent card (blue, green, purple, red, orange)

4. **Choose an Endpoint**
   - Scroll through available endpoints
   - Each shows: method (color), endpoint path, description

5. **Fill in Parameters** (if needed)
   - Some endpoints need input parameters
   - Fill in the form fields
   - Default values are pre-filled

6. **Click Execute**
   - Watch the request execute
   - See response in real-time below

7. **View Results**
   - Click to expand any result
   - See full JSON response with formatting
   - Results show method, status code, timestamp

---

### Step-by-Step Example: Search Content

1. Select **Agent 2** (📚 green card)
2. Find **"Search Content"** endpoint
3. In Parameters section:
   - `query` field shows "enterprise solutions" (default)
   - `top_k` field shows "5" (default)
4. You can change these or use defaults
5. Click **"▶️ Execute"** button
6. Watch for green SUCCESS badge
7. Click result to see 5 content items returned
8. Each item shows title, content, relevance score

---

### Step-by-Step Example: Check Compliance

1. Select **Agent 4** (🛡️ red card)
2. Find **"Analyze Content Safety"** endpoint
3. In Parameters section:
   - `text` field has default message
   - Edit to your own message to test
4. Click **"▶️ Execute"** button
5. See response showing:
   - `has_harmful_content`: true/false
   - `severity`: safe, low, medium, high
   - Safety scores for each category
   - Recommendations if issues found

---

## Color Reference

| Color | Method | Meaning |
|-------|--------|---------|
| 🔵 Blue | GET | Retrieve data |
| 🟢 Green | POST | Send/Create data |
| 🟡 Yellow | PUT | Update data |
| 🔴 Red | DELETE | Remove data |

---

## Response Status Reference

| Badge | Meaning |
|-------|---------|
| ✓ SUCCESS | Request succeeded (green) |
| ✗ ERROR | Request failed (red) |
| ⏳ Loading | Request in progress |

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success ✅ |
| 400 | Bad Request ❌ |
| 404 | Not Found ❌ |
| 500 | Server Error ❌ |

---

## Tips & Tricks

### 💡 Pro Tips

1. **Test Order**: Start with Health Check first, then other endpoints
2. **Default Values**: Always has sensible defaults, can execute without changes
3. **Response History**: Scroll down to see all previous requests
4. **Copy JSON**: Click response to select and copy JSON to clipboard
5. **Tab Switching**: Switch between Overview and API Explorer without losing history

### ⚠️ Common Issues

**"Connection Refused" Error?**
- Make sure all 3 services are running (Agent 1, 2, and Dashboard)
- Check ports: 8001, 8000, 3000

**"404 Not Found"?**
- Check parameter values are correct
- Make sure segment/customer IDs exist

**"500 Server Error"?**
- Check agent logs in terminal
- Try health check first
- Restart agent if needed

---

## Advanced Usage

### Testing Workflow

```
1. Start Agents 1 & 2 services
2. Start Dashboard on port 3000
3. Open API Explorer
4. Agent 1: Click "Health Check" ✅
5. Agent 1: Click "Get All Segments" → See segments ✅
6. Agent 1: Click "Get All Customers" → See customers ✅
7. Agent 2: Click "Health Check" ✅
8. Agent 2: Fill search query, click "Search Content" ✅
9. All green SUCCESS? Your APIs are working! 🎉
```

### Full Campaign Workflow

```
1. Agent 1: Get segments
2. Agent 2: Search content for the segment
3. Agent 3: Generate variants using segment + content
4. Agent 4: Check compliance of generated messages
5. Agent 5: Send campaign to customers
6. Agent 5: Check campaign status
```

---

## API Response Examples

### Successful Request
```json
{
  "endpoint": "GET /api/segments",
  "method": "GET",
  "status": "success",
  "statusCode": 200,
  "timestamp": 1701187200000,
  "data": [
    {
      "id": "seg_001",
      "name": "Enterprise",
      "customer_count": 250
    }
  ]
}
```

### Failed Request
```json
{
  "endpoint": "GET /api/segments/:id",
  "method": "GET",
  "status": "error",
  "statusCode": 404,
  "timestamp": 1701187200000,
  "error": "Segment not found"
}
```

---

## Video Demo Walkthrough

**Want to see it in action?** [See the 5-minute API Explorer demo](./DEMO_VIDEO_HERE.md)

---

## Next Steps

After testing APIs:

1. ✅ Review response data formats
2. ✅ Understand endpoint parameters
3. ✅ Test error scenarios
4. ✅ Build custom workflows
5. ✅ Integrate into applications

---

## Support & Troubleshooting

**Question?** Check:
- [START_HERE.md](START_HERE.md) - Quick setup
- [COMPLETE_INTEGRATION_SUMMARY.md](COMPLETE_INTEGRATION_SUMMARY.md) - Full guide
- [COMMAND_REFERENCE.md](COMMAND_REFERENCE.md) - Quick commands

**Still stuck?**
- Check agent logs in terminals
- Run health checks for each agent
- Verify all 3 services are running
- Restart services if needed

---

## Architecture

```
Dashboard (Port 3000)
    ↓
API Explorer Component
    ├─→ Agent 1 (Port 8001) → Segmentation
    ├─→ Agent 2 (Port 8000) → Content Retrieval (RAG)
    ├─→ Agent 3 (Port 5003) → Message Generation
    ├─→ Agent 4 (Azure) → Compliance Check
    └─→ Agent 5 (Port 5005) → Campaign Executor
```

---

**Ready to explore?** Open your browser to `http://localhost:3000/dashboard` and click the API Explorer tab! 🚀
