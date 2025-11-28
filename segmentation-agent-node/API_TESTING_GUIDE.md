# 🚀 ChainReach Segmentation API - Testing Guide

## Prerequisites
1. Database initialized with 1000 customers ✅
2. Server running on port 8001

## Starting the Server

Open a PowerShell terminal and run:
```powershell
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation-agent-node"
npm run dev
```

Wait for these messages:
```
✅ Connected to PostgreSQL database
🚀 Server running on port 8001
```

---

## API Endpoints Testing

### 1. Health Check
**Endpoint:** `GET /health`

```powershell
Invoke-RestMethod -Uri http://localhost:8001/health | ConvertTo-Json
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "chainreach-segmentation-agent-node",
  "version": "1.0.0",
  "timestamp": "2025-11-27T...",
  "environment": "development"
}
```

---

### 2. List All Segments
**Endpoint:** `GET /api/segments`

```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segments | ConvertTo-Json -Depth 5
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "High Value Customers",
    "description": "Customers with high lifetime value and engagement",
    "customer_count": 150,
    "ai_generated": false,
    "created_at": "...",
    "updated_at": "..."
  },
  {
    "id": 2,
    "name": "At Risk",
    "description": "Previously active customers showing declining engagement",
    "customer_count": 80,
    "ai_generated": false
  }
  // ... more segments
]
```

---

### 3. Get Segment Details with Customers
**Endpoint:** `GET /api/segments/:id?limit=10`

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/segments/1?limit=10" | ConvertTo-Json -Depth 5
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "High Value Customers",
  "description": "Customers with high lifetime value and engagement",
  "criteria": {
    "min_total_purchases": 5000,
    "min_engagement_score": 70
  },
  "customer_count": 150,
  "customers": [
    {
      "customer_id": "CUST-0001",
      "name": "Ashley Jackson",
      "email": "ashley.jackson788@email.com",
      "total_purchases": 3461.38,
      "engagement_score": 83,
      "segment_name": "High Value Customers"
    }
    // ... up to 10 customers
  ]
}
```

---

### 4. List All Customers (Paginated)
**Endpoint:** `GET /api/customers?limit=20&offset=0`

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/customers?limit=20&offset=0" | ConvertTo-Json -Depth 3
```

**Expected Response:**
```json
{
  "customers": [
    {
      "customer_id": "CUST-0001",
      "name": "Ashley Jackson",
      "email": "ashley.jackson788@email.com",
      "location": "Fort Worth, TX",
      "country": "USA",
      "total_purchases": 3461.38,
      "purchase_count": 22,
      "avg_purchase_value": 157.34,
      "engagement_score": 83,
      "segment_id": 1,
      "segment_name": "High Value Customers"
    }
    // ... 19 more customers
  ],
  "total": 1000,
  "limit": 20,
  "offset": 0
}
```

---

### 5. Get Customer by ID
**Endpoint:** `GET /api/customers/:id`

```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/customers/CUST-0001 | ConvertTo-Json -Depth 3
```

**Expected Response:**
```json
{
  "customer_id": "CUST-0001",
  "name": "Ashley Jackson",
  "email": "ashley.jackson788@email.com",
  "phone": null,
  "company": null,
  "industry": null,
  "location": "Fort Worth, TX",
  "country": "USA",
  "total_purchases": 3461.38,
  "purchase_count": 22,
  "avg_purchase_value": 157.34,
  "last_purchase_date": "2025-11-03T...",
  "email_opens": 50,
  "email_clicks": 20,
  "website_visits": 41,
  "engagement_score": 83,
  "segment_id": 1,
  "segment_name": "High Value Customers",
  "created_at": "...",
  "updated_at": "..."
}
```

---

### 6. Filter Customers by Segment
**Endpoint:** `GET /api/customers?segment_id=1&limit=10`

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/customers?segment_id=1&limit=10" | ConvertTo-Json -Depth 3
```

---

### 7. Filter Customers by Industry
**Endpoint:** `GET /api/customers?industry=Technology&limit=10`

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/customers?industry=Technology&limit=10" | ConvertTo-Json -Depth 3
```

---

### 8. Create a New Customer
**Endpoint:** `POST /api/customers`

```powershell
$newCustomer = @{
    customer_id = "CUST-TEST-001"
    name = "Test Customer"
    email = "test@example.com"
    phone = "+1-555-0100"
    location = "New York, NY"
    country = "USA"
    total_purchases = 5000
    purchase_count = 25
    avg_purchase_value = 200
    engagement_score = 85
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8001/api/customers -Method Post -Body $newCustomer -ContentType "application/json" | ConvertTo-Json
```

---

### 9. Update Customer
**Endpoint:** `PUT /api/customers/:id`

```powershell
$updateData = @{
    engagement_score = 90
    total_purchases = 6000
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8001/api/customers/CUST-TEST-001 -Method Put -Body $updateData -ContentType "application/json" | ConvertTo-Json
```

---

### 10. Create a New Segment
**Endpoint:** `POST /api/segments`

```powershell
$newSegment = @{
    name = "VIP Customers"
    description = "Top tier customers with exceptional value"
    criteria = @{
        min_engagement_score = 80
        min_total_purchases = 10000
    }
    ai_generated = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8001/api/segments -Method Post -Body $newSegment -ContentType "application/json" | ConvertTo-Json
```

**Expected Response:**
```json
{
  "id": 6,
  "name": "VIP Customers",
  "description": "Top tier customers with exceptional value",
  "criteria": {
    "min_engagement_score": 80,
    "min_total_purchases": 10000
  },
  "customer_count": 0,
  "ai_generated": false
}
```

---

### 11. Calculate Engagement Scores
**Endpoint:** `POST /api/segment/calculate-engagement`

```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segment/calculate-engagement -Method Post | ConvertTo-Json
```

**Expected Response:**
```json
{
  "message": "Engagement scores updated successfully",
  "updated": 1000
}
```

---

### 12. Refresh All Segmentation
**Endpoint:** `POST /api/segment/refresh`

```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segment/refresh -Method Post | ConvertTo-Json -Depth 3
```

**Expected Response:**
```json
[
  {
    "segment_id": 1,
    "segment_name": "High Value Customers",
    "customers_assigned": 150
  },
  {
    "segment_id": 2,
    "segment_name": "At Risk",
    "customers_assigned": 80
  }
  // ... all segments
]
```

---

### 13. Generate Marketing Message (AI Feature)
**Endpoint:** `POST /api/segments/:id/generate-message`

**Note:** Requires Azure OpenAI configuration in .env

```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segments/1/generate-message -Method Post | ConvertTo-Json
```

**Expected Response:**
```json
{
  "segment_id": 1,
  "segment_name": "High Value Customers",
  "message": "Dear valued customer, as one of our most engaged users..."
}
```

---

### 14. AI-Powered Segment Analysis
**Endpoint:** `POST /api/segment/analyze`

**Note:** Requires Azure OpenAI configuration

```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segment/analyze -Method Post | ConvertTo-Json -Depth 5
```

---

## Quick Test Script

Run all tests automatically:

```powershell
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation-agent-node"
.\test-api.ps1
```

---

## Common Issues & Solutions

### Issue: "Unable to connect to remote server"
**Solution:** Make sure the server is running on port 8001

### Issue: "Database connection timeout"
**Solution:** Check Azure PostgreSQL firewall rules and .env credentials

### Issue: "No customers in segments"
**Solution:** Run the refresh segmentation endpoint:
```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segment/refresh -Method Post
```

---

## Next Steps: Dashboard Integration

Once API is tested, update the dashboard to call these endpoints:

1. **File:** `person5-orchestrator-dashboard/src/lib/api/segmentation.ts`

```typescript
const SEGMENTATION_API = process.env.NEXT_PUBLIC_SEGMENTATION_API || 'http://localhost:8001';

export async function getSegments() {
  const response = await fetch(`${SEGMENTATION_API}/api/segments`);
  return response.json();
}

export async function getSegmentCustomers(segmentId: number, limit = 10) {
  const response = await fetch(`${SEGMENTATION_API}/api/segments/${segmentId}?limit=${limit}`);
  return response.json();
}

export async function getCustomers(filters: any) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${SEGMENTATION_API}/api/customers?${params}`);
  return response.json();
}

export async function refreshSegmentation() {
  const response = await fetch(`${SEGMENTATION_API}/api/segment/refresh`, {
    method: 'POST'
  });
  return response.json();
}
```

2. **Environment Variable:** Add to dashboard `.env.local`:
```
NEXT_PUBLIC_SEGMENTATION_API=http://localhost:8001
```

---

## Deployment to Azure

After local testing, deploy to Azure:

```powershell
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation-agent-node"
.\deploy-azure.ps1
```

Then update dashboard to use production URL:
```
NEXT_PUBLIC_SEGMENTATION_API=https://chainreach-segmentation-node.azurewebsites.net
```
