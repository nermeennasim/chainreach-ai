# 🎯 Segmentation Agent API - Complete Endpoint Reference

## 📋 Quick API Overview

**Base URL:** `http://localhost:8001`

**Total Endpoints:** 14
- Health/Status: 3
- Customers: 5
- Segments: 6

---

## 🏥 Health & Status Endpoints

### 1. GET /health
**Purpose:** Verify system is running

```
Endpoint: GET /health
Parameters: None
Response: 200 OK
```

**Response:**
```json
{
  "status": "healthy",
  "service": "chainreach-segmentation-agent-node",
  "version": "1.0.0",
  "timestamp": "2025-11-28T10:30:00.000Z",
  "environment": "development"
}
```

---

### 2. GET /status
**Purpose:** Check database connection and counts

```
Endpoint: GET /status
Parameters: None
Response: 200 OK
```

**Response:**
```json
{
  "status": "healthy",
  "service": "chainreach-segmentation-agent-node",
  "version": "1.0.0",
  "timestamp": "2025-11-28T10:30:00.000Z",
  "environment": "development",
  "database": {
    "connected": true,
    "timestamp": "2025-11-28T10:30:00.000Z",
    "customers": 25,
    "segments": 5
  },
  "ai_enabled": true
}
```

---

### 3. GET /metrics
**Purpose:** View system analytics and segment breakdown

```
Endpoint: GET /metrics
Parameters: None
Response: 200 OK
```

**Response:**
```json
{
  "timestamp": "2025-11-28T10:30:00.000Z",
  "summary": {
    "total_customers": 25,
    "active_segments": 5,
    "avg_engagement_score": 72.4,
    "total_revenue": 2400000000,
    "unassigned_customers": 0
  },
  "segments": [
    {
      "segment_id": 1,
      "segment_name": "High Value Customers",
      "customer_count": 8
    },
    {
      "segment_id": 2,
      "segment_name": "At Risk",
      "customer_count": 2
    },
    {
      "segment_id": 3,
      "segment_name": "New Customers",
      "customer_count": 3
    },
    {
      "segment_id": 4,
      "segment_name": "VIP Enterprise",
      "customer_count": 5
    },
    {
      "segment_id": 5,
      "segment_name": "Engaged SMB",
      "customer_count": 7
    }
  ]
}
```

---

## 👥 Customer Endpoints

### 4. GET /api/customers
**Purpose:** List all customers (paginated, filtered)

```
Endpoint: GET /api/customers
Parameters:
  - limit: number (default: 100)
  - offset: number (default: 0)
  - industry: string (optional, filter by industry)
  - segment_id: number (optional, filter by segment)
Response: 200 OK
```

**Example:**
```
GET /api/customers?limit=50&offset=0&segment_id=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_id": "TECH_APPLE_001",
      "name": "Apple Inc",
      "email": "contact@apple.com",
      "phone": "+1-408-996-1010",
      "company": "Apple",
      "industry": "Technology",
      "revenue": 394328000000,
      "employee_count": 161000,
      "location": "Cupertino, CA",
      "country": "USA",
      "total_purchases": 250000,
      "purchase_count": 45,
      "avg_purchase_value": 5555.56,
      "email_opens": 850,
      "email_clicks": 420,
      "website_visits": 2300,
      "engagement_score": 92.5,
      "segment_id": 1,
      "segment_name": "High Value Customers",
      "segment_confidence": 95.0,
      "created_at": "2025-11-28T10:30:00.000Z",
      "updated_at": "2025-11-28T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 25
  }
}
```

---

### 5. GET /api/customers/:id
**Purpose:** Get single customer by ID or customer_id

```
Endpoint: GET /api/customers/:id
Parameters:
  - id: string (can be numeric ID or customer_id like "TECH_APPLE_001")
Response: 200 OK or 404 Not Found
```

**Examples:**
```
GET /api/customers/1              (by numeric ID)
GET /api/customers/TECH_APPLE_001 (by customer_id)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": "TECH_APPLE_001",
    "name": "Apple Inc",
    "email": "contact@apple.com",
    "phone": "+1-408-996-1010",
    "company": "Apple",
    "industry": "Technology",
    "revenue": 394328000000,
    "employee_count": 161000,
    "location": "Cupertino, CA",
    "country": "USA",
    "total_purchases": 250000,
    "purchase_count": 45,
    "avg_purchase_value": 5555.56,
    "email_opens": 850,
    "email_clicks": 420,
    "website_visits": 2300,
    "engagement_score": 92.5,
    "segment_id": 1,
    "segment_name": "High Value Customers",
    "segment_confidence": 95.0,
    "created_at": "2025-11-28T10:30:00.000Z",
    "updated_at": "2025-11-28T10:30:00.000Z"
  }
}
```

---

### 6. POST /api/customers
**Purpose:** Create new customer

```
Endpoint: POST /api/customers
Parameters: JSON body
Response: 201 Created or 400/409 Error
```

**Request Body:**
```json
{
  "customer_id": "TECH_APPLE_001",
  "name": "Apple Inc",
  "email": "contact@apple.com",
  "phone": "+1-408-996-1010",
  "company": "Apple",
  "industry": "Technology",
  "revenue": 394328000000,
  "employee_count": 161000,
  "location": "Cupertino, CA",
  "country": "USA",
  "total_purchases": 250000,
  "purchase_count": 45,
  "avg_purchase_value": 5555.56,
  "email_opens": 850,
  "email_clicks": 420,
  "website_visits": 2300,
  "engagement_score": 92.5,
  "custom_attributes": {
    "company_size": "enterprise",
    "annual_spend": "$250K+",
    "account_type": "premium"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": "TECH_APPLE_001",
    "name": "Apple Inc",
    "email": "contact@apple.com",
    "engagement_score": 92.5,
    ...
  }
}
```

**Response (Error - Duplicate Email):**
```json
{
  "success": false,
  "error": "Customer with this email already exists"
}
```

---

### 7. PUT /api/customers/:id
**Purpose:** Update customer

```
Endpoint: PUT /api/customers/:id
Parameters:
  - id: string (numeric ID or customer_id)
  - JSON body with fields to update
Response: 200 OK or 404 Not Found
```

**Example:**
```
PUT /api/customers/TECH_APPLE_001
```

**Request Body (partial update):**
```json
{
  "engagement_score": 95.0,
  "total_purchases": 300000,
  "purchase_count": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": "TECH_APPLE_001",
    "engagement_score": 95.0,
    "total_purchases": 300000,
    "purchase_count": 50,
    ...
  }
}
```

---

### 8. DELETE /api/customers/:id
**Purpose:** Delete customer

```
Endpoint: DELETE /api/customers/:id
Parameters:
  - id: string (numeric ID or customer_id)
Response: 200 OK or 404 Not Found
```

**Example:**
```
DELETE /api/customers/TECH_APPLE_001
```

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## 🎯 Segment Endpoints

### 9. GET /api/segments
**Purpose:** List all segments with customer counts

```
Endpoint: GET /api/segments
Parameters: None
Response: 200 OK
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "High Value Customers",
      "description": "Customers with high purchase value and strong engagement",
      "criteria": {
        "min_total_purchases": 10000,
        "min_engagement_score": 75
      },
      "customer_count": 8,
      "ai_generated": false,
      "created_at": "2025-11-28T10:30:00.000Z",
      "updated_at": "2025-11-28T10:30:00.000Z",
      "actual_customer_count": 8
    },
    {
      "id": 2,
      "name": "At Risk",
      "description": "Previously active customers who haven't engaged recently",
      "criteria": {
        "days_since_last_purchase": 90,
        "max_engagement_score": 30
      },
      "customer_count": 2,
      "ai_generated": false,
      "created_at": "2025-11-28T10:30:00.000Z",
      "updated_at": "2025-11-28T10:30:00.000Z",
      "actual_customer_count": 2
    }
  ]
}
```

---

### 10. GET /api/segments/:id
**Purpose:** Get segment details with paginated customer list

```
Endpoint: GET /api/segments/:id
Parameters:
  - id: number (segment ID)
  - limit: number (default: 50)
  - offset: number (default: 0)
Response: 200 OK or 404 Not Found
```

**Example:**
```
GET /api/segments/1?limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "segment": {
      "id": 1,
      "name": "High Value Customers",
      "description": "Customers with high purchase value and strong engagement",
      "criteria": {
        "min_total_purchases": 10000,
        "min_engagement_score": 75
      },
      "customer_count": 8,
      "ai_generated": false,
      "created_at": "2025-11-28T10:30:00.000Z",
      "updated_at": "2025-11-28T10:30:00.000Z"
    },
    "customers": [
      {
        "id": 1,
        "customer_id": "TECH_APPLE_001",
        "name": "Apple Inc",
        "email": "contact@apple.com",
        "company": "Apple",
        "industry": "Technology",
        "total_purchases": 250000,
        "purchase_count": 45,
        "engagement_score": 92.5,
        "segment_id": 1,
        "segment_name": "High Value Customers",
        "segment_confidence": 95.0,
        "created_at": "2025-11-28T10:30:00.000Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 8
    }
  }
}
```

---

### 11. POST /api/segments
**Purpose:** Create new custom segment

```
Endpoint: POST /api/segments
Parameters: JSON body
Response: 201 Created or 400 Bad Request
```

**Request Body:**
```json
{
  "name": "My Custom Segment",
  "description": "Customers matching my criteria",
  "criteria": {
    "min_total_purchases": 5000,
    "min_engagement_score": 60,
    "industry": "Technology"
  },
  "ai_generated": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "My Custom Segment",
    "description": "Customers matching my criteria",
    "criteria": {
      "min_total_purchases": 5000,
      "min_engagement_score": 60,
      "industry": "Technology"
    },
    "customer_count": 0,
    "ai_generated": false,
    "created_at": "2025-11-28T10:30:00.000Z",
    "updated_at": "2025-11-28T10:30:00.000Z"
  }
}
```

---

### 12. POST /api/segment/refresh
**Purpose:** Apply all segment rules to customers (segmentation)

```
Endpoint: POST /api/segment/refresh
Parameters: None (POST, no body required)
Response: 200 OK
```

**Response:**
```json
{
  "success": true,
  "data": {
    "segmentsRefreshed": 5,
    "customersSegmented": 25,
    "segmentBreakdown": [
      {
        "segment_id": 1,
        "segment_name": "High Value Customers",
        "customersAdded": 8,
        "customersRemoved": 0
      },
      {
        "segment_id": 2,
        "segment_name": "At Risk",
        "customersAdded": 2,
        "customersRemoved": 0
      },
      {
        "segment_id": 3,
        "segment_name": "New Customers",
        "customersAdded": 3,
        "customersRemoved": 0
      },
      {
        "segment_id": 4,
        "segment_name": "VIP Enterprise",
        "customersAdded": 5,
        "customersRemoved": 0
      },
      {
        "segment_id": 5,
        "segment_name": "Engaged SMB",
        "customersAdded": 7,
        "customersRemoved": 0
      }
    ]
  }
}
```

---

### 13. POST /api/segment/calculate-engagement
**Purpose:** Calculate engagement scores for all customers

```
Endpoint: POST /api/segment/calculate-engagement
Parameters: None (POST, no body required)
Response: 200 OK
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customersUpdated": 25,
    "avgEngagementScore": 72.4,
    "message": "Engagement scores calculated for 25 customers"
  }
}
```

---

### 14. POST /api/segment/analyze
**Purpose:** AI-powered segment analysis and suggestions (requires Azure OpenAI)

```
Endpoint: POST /api/segment/analyze
Parameters: None (POST, no body required)
Response: 200 OK or 503 Service Unavailable
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "customersAnalyzed": 25,
    "suggestedSegments": [
      {
        "name": "Enterprise Tech Leaders",
        "description": "Large tech companies with consistent high engagement and significant spending",
        "criteria": {
          "industry": "Technology",
          "min_employee_count": 100000,
          "min_engagement_score": 85,
          "min_total_purchases": 200000
        }
      },
      {
        "name": "Growing Tech SMBs",
        "description": "Medium-sized tech companies with growth trajectory",
        "criteria": {
          "industry": "Technology",
          "employee_count_range": [100, 5000],
          "min_engagement_score": 70,
          "min_total_purchases": 30000
        }
      }
    ],
    "message": "AI analysis complete. Use POST /api/segments to create these segments."
  }
}
```

**Response (Error - AI not configured):**
```json
{
  "success": false,
  "error": "AI features are not available. Please configure Azure OpenAI credentials."
}
```

---

## 📊 API Usage by Segment

### For Testing Purposes:

**Segment 1: High Value Customers**
```
GET /api/segments/1?limit=50&offset=0
```
Returns: 8 customers with high purchases and engagement

**Segment 2: At Risk**
```
GET /api/segments/2?limit=50&offset=0
```
Returns: 2 low-engagement customers

**Segment 3: New Customers**
```
GET /api/segments/3?limit=50&offset=0
```
Returns: 3 recently created customers

**Segment 4: VIP Enterprise**
```
GET /api/segments/4?limit=50&offset=0
```
Returns: 5 large enterprises

**Segment 5: Engaged SMB**
```
GET /api/segments/5?limit=50&offset=0
```
Returns: 7 engaged small/medium businesses

---

## 🧪 Complete Test Flow

```
1. GET /health                              ✓ Verify running
2. GET /status                              ✓ Check database
3. GET /metrics                             ✓ View current state
4. POST /api/customers x25                  ✓ Load sample data
5. POST /api/segment/calculate-engagement   ✓ Calculate scores
6. POST /api/segment/refresh                ✓ Apply segmentation
7. GET /api/segments                        ✓ View all segments
8. GET /api/segments/1                      ✓ View segment 1 details
9. GET /api/customers?segment_id=1          ✓ Filter by segment
10. GET /api/customers/TECH_APPLE_001       ✓ View single customer
11. GET /metrics                            ✓ Verify results
```

---

## ⚡ Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Verify system |
| `/status` | GET | Check database |
| `/metrics` | GET | View analytics |
| `/api/customers` | GET | List all customers |
| `/api/customers/:id` | GET | Get single customer |
| `/api/customers` | POST | Create customer |
| `/api/customers/:id` | PUT | Update customer |
| `/api/customers/:id` | DELETE | Delete customer |
| `/api/segments` | GET | List all segments |
| `/api/segments/:id` | GET | Get segment details |
| `/api/segments` | POST | Create segment |
| `/api/segment/refresh` | POST | Apply segmentation |
| `/api/segment/calculate-engagement` | POST | Calculate scores |
| `/api/segment/analyze` | POST | AI analysis |

---

**Port:** 8001
**Database:** PostgreSQL (Azure)
**Status:** ✅ Ready to Use
**Created:** November 28, 2025
