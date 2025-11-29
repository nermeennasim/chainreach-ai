# 🎯 Segmentation Agent API - Visual Workflow & Data Guide

## 📊 The Complete API Execution Workflow

```
╔════════════════════════════════════════════════════════════════════════════╗
║                   SEGMENTATION AGENT API WORKFLOW                         ║
║                       Swagger GUI API Explorer                            ║
╚════════════════════════════════════════════════════════════════════════════╝


PHASE 1: System Health & Readiness (1 minute)
═════════════════════════════════════════════════════════════════════════════

  GET /health
  │
  ├─ Returns:
  │  ✓ status: "healthy"
  │  ✓ service: "chainreach-segmentation-agent-node"
  │
  └─→ READY?


  GET /status
  │
  ├─ Returns:
  │  ✓ database.connected: true
  │  ✓ customers: 0 (will be 25 after load)
  │  ✓ segments: 5 (already created)
  │  ✓ ai_enabled: true/false
  │
  └─→ DATABASE READY?


  GET /metrics
  │
  ├─ Returns:
  │  ✓ total_customers: 0
  │  ✓ segments array with 5 items
  │  ✓ avg_engagement_score: null (will calculate)
  │
  └─→ SYSTEM INITIALIZED


PHASE 2: Load 25 Sample Customers (5-10 minutes)
═════════════════════════════════════════════════════════════════════════════

  FOR EACH OF 25 CUSTOMERS:

  POST /api/customers
  │
  ├─ Input: Customer JSON
  │  {
  │    "customer_id": "TECH_APPLE_001",
  │    "name": "Apple Inc",
  │    "email": "contact@apple.com",
  │    "company": "Apple",
  │    "industry": "Technology",
  │    "total_purchases": 250000,
  │    "engagement_score": 92.5,
  │    ...
  │  }
  │
  ├─ Output: 201 Created
  │  {
  │    "success": true,
  │    "data": {
  │      "id": 1,
  │      "customer_id": "TECH_APPLE_001",
  │      ...
  │    }
  │  }
  │
  └─→ CUSTOMER CREATED IN DATABASE


  Repeat for all 25:
  ✓ TECH_APPLE_001
  ✓ TECH_MICROSOFT_002
  ✓ FIN_JPM_003
  ✓ ... (22 more)
  ✓ NEW_VENTURES_025

  Result: 25 customers in database, segment_id = NULL for all


PHASE 3: Calculate Engagement Scores (1 minute)
═════════════════════════════════════════════════════════════════════════════

  POST /api/segment/calculate-engagement
  │
  ├─ What it does:
  │  ✓ Reads all 25 customers
  │  ✓ Calculates engagement score based on:
  │    - email_opens
  │    - email_clicks
  │    - website_visits
  │    - purchase history
  │  ✓ Updates engagement_score field
  │
  ├─ Output: 200 OK
  │  {
  │    "success": true,
  │    "data": {
  │      "customersUpdated": 25,
  │      "avgEngagementScore": 72.4,
  │      "message": "Engagement scores calculated"
  │    }
  │  }
  │
  └─→ SCORES CALCULATED FOR ALL 25 CUSTOMERS


PHASE 4: Apply Segmentation Rules (1 minute)
═════════════════════════════════════════════════════════════════════════════

  POST /api/segment/refresh
  │
  ├─ What it does:
  │  ✓ For each of 5 segments:
  │    - Read segment criteria
  │    - Match all 25 customers against criteria
  │    - Assign matching customers to segment
  │
  ├─ Segment Matching:
  │
  │  SEGMENT 1: "High Value Customers"
  │  Criteria: min_total_purchases=10000 AND min_engagement_score=75
  │  │
  │  ├─ ✓ TECH_APPLE_001        ($250K, 92.5%) MATCH
  │  ├─ ✓ TECH_MICROSOFT_002    ($280K, 95.0%) MATCH
  │  ├─ ✓ TECH_GOOGLE_006       ($215K, 91.0%) MATCH
  │  ├─ ✓ RETAIL_WALMART_004    ($450K, 88.5%) MATCH
  │  ├─ ✓ RETAIL_AMAZON_010     ($380K, 90.5%) MATCH
  │  ├─ ✓ FIN_JPM_003           ($320K, 85.0%) MATCH
  │  ├─ ✓ FIN_MORGAN_007        ($175K, 78.5%) MATCH
  │  └─ ✓ HEALTH_UNH_008        ($195K, 83.0%) MATCH
  │
  │  RESULT: 8 customers assigned to Segment 1
  │
  │
  │  SEGMENT 2: "At Risk"
  │  Criteria: days_since_last_purchase=90 AND max_engagement_score=30
  │  │
  │  ├─ ✓ INACTIVE_CORP_021     (Engagement: 15.2%) MATCH
  │  └─ ✓ OLD_CUSTOMER_022      (Engagement: 12.5%) MATCH
  │
  │  RESULT: 2 customers assigned to Segment 2
  │
  │
  │  SEGMENT 3: "New Customers"
  │  Criteria: days_since_created=30
  │  │
  │  ├─ ✓ NEW_TECH_STARTUP_023  (15 days) MATCH
  │  ├─ ✓ NEW_STARTUP_024       (22 days) MATCH
  │  └─ ✓ NEW_VENTURES_025      (28 days) MATCH
  │
  │  RESULT: 3 customers assigned to Segment 3
  │
  │
  │  SEGMENT 4: "VIP Enterprise"
  │  Criteria: min_employee_count=1000 OR min_revenue=50000
  │  │
  │  ├─ ✓ TECH_MICROSOFT_002    (221K employees) MATCH
  │  ├─ ✓ RETAIL_WALMART_004    (2.1M employees) MATCH
  │  ├─ ✓ RETAIL_AMAZON_010     (1.6M employees) MATCH
  │  ├─ ✓ PHARMA_PFIZER_005     ($68B revenue) MATCH
  │  └─ ✓ HEALTH_UNH_008        ($324B revenue) MATCH
  │
  │  RESULT: 5 customers assigned to Segment 4
  │
  │
  │  SEGMENT 5: "Engaged SMB"
  │  Criteria: max_employee_count=999 AND min_engagement_score=60
  │  │
  │  ├─ ✓ SMB_TECH_011          (125 emps, 68% eng) MATCH
  │  ├─ ✓ SMB_HEALTH_013        (95 emps, 71% eng) MATCH
  │  ├─ ✓ SMB_MFG_015           (180 emps, 75.5% eng) MATCH
  │  ├─ ✓ SMB_LOG_016           (140 emps, 73% eng) MATCH
  │  ├─ ✓ SMB_EDU_017           (450 emps, 76.5% eng) MATCH
  │  ├─ ✓ SMB_ENERGY_018        (280 emps, 74% eng) MATCH
  │  └─ ✓ SMB_TELECOM_019       (340 emps, 77.5% eng) MATCH
  │
  │  RESULT: 7 customers assigned to Segment 5
  │
  │
  ├─ Output: 200 OK
  │  {
  │    "success": true,
  │    "data": {
  │      "segmentsRefreshed": 5,
  │      "customersSegmented": 25,
  │      "segmentBreakdown": [
  │        {"segment_id": 1, "segment_name": "High Value", "customersAdded": 8},
  │        {"segment_id": 2, "segment_name": "At Risk", "customersAdded": 2},
  │        {"segment_id": 3, "segment_name": "New Customers", "customersAdded": 3},
  │        {"segment_id": 4, "segment_name": "VIP Enterprise", "customersAdded": 5},
  │        {"segment_id": 5, "segment_name": "Engaged SMB", "customersAdded": 7}
  │      ]
  │    }
  │  }
  │
  └─→ ALL 25 CUSTOMERS SEGMENTED


PHASE 5: Query Results & Analyze (2-3 minutes)
═════════════════════════════════════════════════════════════════════════════

  GET /api/segments
  │
  ├─ Returns: All 5 segments with updated customer counts
  │  {
  │    "success": true,
  │    "data": [
  │      {"id": 1, "name": "High Value Customers", "actual_customer_count": 8},
  │      {"id": 2, "name": "At Risk", "actual_customer_count": 2},
  │      {"id": 3, "name": "New Customers", "actual_customer_count": 3},
  │      {"id": 4, "name": "VIP Enterprise", "actual_customer_count": 5},
  │      {"id": 5, "name": "Engaged SMB", "actual_customer_count": 7}
  │    ]
  │  }
  │
  └─→ SEE SEGMENT BREAKDOWN


  GET /api/segments/1
  │
  ├─ Returns: High Value Segment + 8 Customers
  │  {
  │    "segment": {...},
  │    "customers": [
  │      {
  │        "customer_id": "TECH_APPLE_001",
  │        "name": "Apple Inc",
  │        "total_purchases": 250000,
  │        "engagement_score": 92.5,
  │        "segment_id": 1,
  │        "segment_name": "High Value Customers",
  │        "segment_confidence": 95.0
  │      },
  │      {...7 more customers}
  │    ],
  │    "pagination": {"limit": 50, "offset": 0, "total": 8}
  │  }
  │
  └─→ VIEW SEGMENT DETAILS


  GET /api/customers?segment_id=1
  │
  ├─ Returns: Filtered list of 8 high-value customers
  │  (Same 8 customers, different query method)
  │
  └─→ FILTER BY SEGMENT


  GET /api/customers/TECH_APPLE_001
  │
  ├─ Returns: Single customer with full details
  │  {
  │    "customer_id": "TECH_APPLE_001",
  │    "name": "Apple Inc",
  │    "email": "contact@apple.com",
  │    "total_purchases": 250000,
  │    "engagement_score": 92.5,
  │    "segment_id": 1,
  │    "segment_name": "High Value Customers",
  │    ...
  │  }
  │
  └─→ VIEW CUSTOMER DETAILS


PHASE 6: (OPTIONAL) AI-Powered Insights (1-2 minutes)
═════════════════════════════════════════════════════════════════════════════

  POST /api/segment/analyze
  │
  ├─ What it does (if Azure OpenAI configured):
  │  ✓ Reads all 25 customers
  │  ✓ Analyzes customer patterns
  │  ✓ Suggests new segment ideas
  │
  ├─ Output: AI-generated segment suggestions
  │  {
  │    "suggestedSegments": [
  │      {
  │        "name": "Enterprise Tech Leaders",
  │        "description": "Large tech companies...",
  │        "criteria": {...}
  │      },
  │      {...more suggestions}
  │    ]
  │  }
  │
  └─→ GET AI RECOMMENDATIONS


════════════════════════════════════════════════════════════════════════════════
                                    SUCCESS!
════════════════════════════════════════════════════════════════════════════════
```

---

## 📈 Customer Distribution Chart

```
AFTER SEGMENTATION: 25 Total Customers

High Value (8 customers)                   ████████████████░░░░░ 32%
├─ Enterprise focus
├─ Avg Spend: $250K+
└─ Avg Engagement: 89.4%

Engaged SMB (7 customers)                  ███████████░░░░░░░░░░░ 28%
├─ Mid-market focus
├─ Avg Spend: $38K
└─ Avg Engagement: 72.7%

VIP Enterprise (5 customers)               ████████░░░░░░░░░░░░░░ 20%
├─ Large corporations
├─ Avg Spend: $225K+
└─ Avg Engagement: 88%

New Customers (3 customers)                █████░░░░░░░░░░░░░░░░░ 12%
├─ Recently acquired
├─ Avg Spend: $8.3K
└─ Avg Engagement: 65.2%

At Risk (2 customers)                      ███░░░░░░░░░░░░░░░░░░░ 8%
├─ Churn risk
├─ Avg Spend: $17.5K
└─ Avg Engagement: 13.85%
```

---

## 🔄 Segment Criteria vs Matches

```
┌─────────────────────────────────────────────────────────────────┐
│ SEGMENT MATCHING LOGIC                                          │
└─────────────────────────────────────────────────────────────────┘

SEGMENT 1: High Value Customers
┌────────────────────────────────────────────────────────┐
│ Criteria:                                              │
│   • min_total_purchases: 10,000                        │
│   • min_engagement_score: 75                           │
│                                                        │
│ Matches (8):                                           │
│ ┌──────────────────────────────────┐                  │
│ │ Customer ID  │ Purchases │ Eng%  │                  │
│ ├──────────────────────────────────┤                  │
│ │ APPLE        │ $250K     │ 92.5% │ ✓                │
│ │ MICROSOFT    │ $280K     │ 95.0% │ ✓                │
│ │ GOOGLE       │ $215K     │ 91.0% │ ✓                │
│ │ WALMART      │ $450K     │ 88.5% │ ✓                │
│ │ AMAZON       │ $380K     │ 90.5% │ ✓                │
│ │ JPM          │ $320K     │ 85.0% │ ✓                │
│ │ MORGAN       │ $175K     │ 78.5% │ ✓                │
│ │ UNH          │ $195K     │ 83.0% │ ✓                │
│ └──────────────────────────────────┘                  │
└────────────────────────────────────────────────────────┘

SEGMENT 2: At Risk
┌────────────────────────────────────────────────────────┐
│ Criteria:                                              │
│   • days_since_last_purchase: 90                       │
│   • max_engagement_score: 30                           │
│                                                        │
│ Matches (2):                                           │
│ ┌──────────────────────────────────┐                  │
│ │ Customer ID  │ Days  │ Eng%      │                  │
│ ├──────────────────────────────────┤                  │
│ │ INACTIVE     │ 120   │ 15.2%     │ ✓                │
│ │ OLD          │ 135   │ 12.5%     │ ✓                │
│ └──────────────────────────────────┘                  │
└────────────────────────────────────────────────────────┘

SEGMENT 3: New Customers
┌────────────────────────────────────────────────────────┐
│ Criteria:                                              │
│   • days_since_created: 30                            │
│                                                        │
│ Matches (3):                                           │
│ ┌──────────────────────────────────┐                  │
│ │ Customer ID  │ Days   │ Status   │                  │
│ ├──────────────────────────────────┤                  │
│ │ NEW_TECH     │ 15     │ Very New │ ✓                │
│ │ NEW_STARTUP  │ 22     │ New      │ ✓                │
│ │ NEW_VENTURES │ 28     │ New      │ ✓                │
│ └──────────────────────────────────┘                  │
└────────────────────────────────────────────────────────┘

SEGMENT 4: VIP Enterprise
┌────────────────────────────────────────────────────────┐
│ Criteria:                                              │
│   • min_employee_count: 1,000 OR min_revenue: 50B     │
│                                                        │
│ Matches (5):                                           │
│ ┌──────────────────────────────────┐                  │
│ │ Customer   │ Size  │ Revenue    │                  │
│ ├──────────────────────────────────┤                  │
│ │ MICROSOFT  │ 221K  │ $212B      │ ✓                │
│ │ WALMART    │ 2.1M  │ $611B      │ ✓                │
│ │ AMAZON     │ 1.6M  │ $575B      │ ✓                │
│ │ PFIZER     │ 43K   │ $68B       │ ✓                │
│ │ UNH        │ 280K  │ $324B      │ ✓                │
│ └──────────────────────────────────┘                  │
└────────────────────────────────────────────────────────┘

SEGMENT 5: Engaged SMB
┌────────────────────────────────────────────────────────┐
│ Criteria:                                              │
│   • max_employee_count: 999                           │
│   • min_engagement_score: 60                          │
│   • min_purchase_count: 5                             │
│                                                        │
│ Matches (7):                                           │
│ ┌──────────────────────────────────┐                  │
│ │ Customer   │ Emps  │ Eng% │ Purch│                  │
│ ├──────────────────────────────────┤                  │
│ │ TECH_011   │ 125   │ 68%  │ 8    │ ✓                │
│ │ HEALTH_013 │ 95    │ 71%  │ 11   │ ✓                │
│ │ MFG_015    │ 180   │ 75%  │ 14   │ ✓                │
│ │ LOG_016    │ 140   │ 73%  │ 12   │ ✓                │
│ │ EDU_017    │ 450   │ 76%  │ 18   │ ✓                │
│ │ ENERGY_018 │ 280   │ 74%  │ 16   │ ✓                │
│ │ TELECOM_19 │ 340   │ 77%  │ 17   │ ✓                │
│ └──────────────────────────────────┘                  │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 What Each API Call Returns

```
╔════════════════════════════════════════════════════════════════╗
║                    API RESPONSE REFERENCE                      ║
╚════════════════════════════════════════════════════════════════╝

GET /health
├─ Purpose: Verify system is running
├─ Returns: { status: "healthy", service: "...", version: "1.0.0" }
├─ Response Time: <10ms
└─ Expected Status: 200 OK

GET /status
├─ Purpose: Check database connection and basic stats
├─ Returns: {
│   status: "healthy",
│   database: { connected: true, customers: 25, segments: 5 },
│   ai_enabled: true/false
│ }
├─ Response Time: 50-100ms
└─ Expected Status: 200 OK

GET /metrics
├─ Purpose: View system analytics
├─ Returns: {
│   summary: {
│     total_customers: 25,
│     active_segments: 5,
│     avg_engagement_score: 72.4,
│     total_revenue: 2400000000
│   },
│   segments: [
│     { segment_name: "High Value", customer_count: 8 },
│     ...
│   ]
│ }
├─ Response Time: 100-200ms
└─ Expected Status: 200 OK

POST /api/customers
├─ Purpose: Create a new customer
├─ Input: Full customer JSON
├─ Returns: {
│   success: true,
│   data: { id: 1, customer_id: "...", name: "...", ... }
│ }
├─ Response Time: 50-150ms
└─ Expected Status: 201 Created

POST /api/segment/calculate-engagement
├─ Purpose: Calculate engagement scores for all customers
├─ Input: None (POST, no body)
├─ Returns: {
│   success: true,
│   data: {
│     customersUpdated: 25,
│     avgEngagementScore: 72.4,
│     message: "Engagement scores calculated"
│   }
│ }
├─ Response Time: 200-500ms
└─ Expected Status: 200 OK

POST /api/segment/refresh
├─ Purpose: Apply segmentation rules to all customers
├─ Input: None (POST, no body)
├─ Returns: {
│   success: true,
│   data: {
│     segmentsRefreshed: 5,
│     customersSegmented: 25,
│     segmentBreakdown: [
│       { segment_id: 1, segment_name: "High Value", customersAdded: 8 },
│       ...
│     ]
│   }
│ }
├─ Response Time: 1-2 seconds
└─ Expected Status: 200 OK

GET /api/segments
├─ Purpose: List all segments with customer counts
├─ Returns: {
│   success: true,
│   data: [
│     { id: 1, name: "High Value", actual_customer_count: 8, ... },
│     ...
│   ]
│ }
├─ Response Time: 50-100ms
└─ Expected Status: 200 OK

GET /api/segments/1
├─ Purpose: Get segment details + list of customers in that segment
├─ Returns: {
│   success: true,
│   data: {
│     segment: { id: 1, name: "...", criteria: {...}, ... },
│     customers: [
│       { customer_id: "...", name: "...", total_purchases: 250000, ... },
│       ...
│     ],
│     pagination: { limit: 50, offset: 0, total: 8 }
│   }
│ }
├─ Response Time: 100-300ms
└─ Expected Status: 200 OK

GET /api/customers
├─ Purpose: List all customers (paginated, sorted by engagement)
├─ Returns: {
│   success: true,
│   data: [
│     { customer_id: "...", name: "...", engagement_score: 95.0, ... },
│     ...
│   ],
│   pagination: { limit: 100, offset: 0, total: 25 }
│ }
├─ Response Time: 100-200ms
└─ Expected Status: 200 OK

GET /api/customers?segment_id=1
├─ Purpose: Get customers filtered by segment
├─ Returns: Same format as above, but only 8 customers (high-value)
├─ Response Time: 50-100ms
└─ Expected Status: 200 OK

GET /api/customers/TECH_APPLE_001
├─ Purpose: Get single customer by customer_id
├─ Returns: {
│   success: true,
│   data: {
│     customer_id: "TECH_APPLE_001",
│     name: "Apple Inc",
│     total_purchases: 250000,
│     engagement_score: 92.5,
│     segment_id: 1,
│     segment_name: "High Value Customers",
│     ...
│   }
│ }
├─ Response Time: <50ms
└─ Expected Status: 200 OK

POST /api/segment/analyze
├─ Purpose: AI-powered segment analysis (requires Azure OpenAI)
├─ Returns: {
│   success: true,
│   data: {
│     customersAnalyzed: 25,
│     suggestedSegments: [
│       { name: "...", description: "...", criteria: {...} },
│       ...
│     ]
│   }
│ }
├─ Response Time: 2-5 seconds
└─ Expected Status: 200 OK (or 503 if AI not configured)
```

---

## ⏱️ Typical Response Times

```
Fast Operations (<100ms):
├─ GET /health                    ~10ms
├─ GET /api/customers/:id         ~30ms
├─ GET /api/segments              ~60ms
└─ GET /api/customers?filter      ~80ms

Medium Operations (100-500ms):
├─ POST /api/customers            ~100ms
├─ GET /api/segments/:id          ~200ms
├─ GET /metrics                   ~150ms
└─ POST /api/segment/analyze      ~5000ms (AI takes time)

Slow Operations (500ms+):
├─ POST /api/segment/calculate-engagement  ~500ms
├─ POST /api/segment/refresh              ~1500ms
└─ POST /api/segment/analyze (with AI)    ~5000ms
```

---

## 📝 Summary

**API Execution Order is Critical:**
```
1. Health checks (fast, verification only)
2. Create customers (data foundation)
3. Calculate engagement (score computation)
4. Refresh segments (rule application)
5. Query results (analysis & verification)
```

**Expected Results After Execution:**
- ✅ 25 customers in database
- ✅ All segmented into 5 groups
- ✅ Total breakdown: 8+2+3+5+7 = 25
- ✅ Average engagement: 72.4%
- ✅ Ready for campaign execution

**Next Steps:**
- Use segments with Message Generation (Agent 3)
- Target campaigns (Agent 5)
- Ensure compliance (Agent 4)
- Retrieve personalized content (Agent 2)

---

**Created:** November 28, 2025
**Version:** 1.0
**Status:** Ready to Use
