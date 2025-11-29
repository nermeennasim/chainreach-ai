# 🎯 Segmentation API Testing Workflow & Checklist

## 📊 API Execution Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SEGMENTATION AGENT API WORKFLOW                          │
│                     (Correct Order to Get Results)                          │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: INITIALIZATION (1 minute)
═════════════════════════════════════════════════════════════════════════════

    GET /health              ✓ System running
         ↓
    GET /status              ✓ Database connected, 5 segments created
         ↓
    GET /metrics             ✓ Summary of current state
         ↓
    ✅ READY FOR DATA


PHASE 2: DATA INGESTION (5-10 minutes)
═════════════════════════════════════════════════════════════════════════════

    FOR EACH CUSTOMER (25 total):
    
    POST /api/customers ───┐
    [Customer 1 JSON]      │
         ↓                 │
    POST /api/customers ───┤
    [Customer 2 JSON]      │  ← Repeat for all 25
         ↓                 │
    POST /api/customers ───┤
    [Customer 3 JSON]      │
         ↓                 │
    ...                    │
         ↓                 │
    POST /api/customers ───┘
    [Customer 25 JSON]
         ↓
    ✅ DATABASE POPULATED WITH 25 CUSTOMERS


PHASE 3: SEGMENTATION (2 minutes)
═════════════════════════════════════════════════════════════════════════════

    POST /api/segment/calculate-engagement
    │
    └─→ Calculate engagement_score for each customer
         ↓
    POST /api/segment/refresh
    │
    └─→ Apply segmentation rules to each customer
    │   (Each customer matched against 5 segment criteria)
         ↓
    ✅ CUSTOMERS SEGMENTED INTO 5 GROUPS


PHASE 4: ANALYSIS & RESULTS (2-3 minutes)
═════════════════════════════════════════════════════════════════════════════

    GET /api/segments
    ↓
    [See 5 segments with customer counts]
    ├─ Segment 1: High Value (8)
    ├─ Segment 2: At Risk (2)
    ├─ Segment 3: New Customers (3)
    ├─ Segment 4: VIP Enterprise (5)
    └─ Segment 5: Engaged SMB (7)
    
         ↓
    
    FOR EACH SEGMENT:
    
    GET /api/segments/1 (High Value)
    ├─ See: segment details + customer list
    ├─ Response: 8 customers with all details
    
    GET /api/segments/2 (At Risk)
    ├─ See: segment details + customer list
    ├─ Response: 2 customers (recent inactivity)
    
    GET /api/segments/:id (repeat for 3-5)
    
         ↓
    
    GET /api/customers?segment_id=1
    ├─ Filter by segment, see all high-value customers
    
    GET /api/customers/:id
    ├─ Get detailed view of single customer
    
         ↓
    
    ✅ FULL SEGMENTATION ANALYSIS COMPLETE


PHASE 5 (OPTIONAL): AI INSIGHTS
═════════════════════════════════════════════════════════════════════════════

    POST /api/segment/analyze
    │
    └─→ Use AI to suggest new segments
         (requires Azure OpenAI configured)
         ↓
    ✅ AI SUGGESTIONS RECEIVED (if configured)
```

---

## 🔄 Correct Order Summary

| Step | Endpoint | Method | Purpose | Response |
|------|----------|--------|---------|----------|
| 1 | `/health` | GET | Verify system running | ✅ Status |
| 2 | `/status` | GET | Check database connection | ✅ Connected |
| 3 | `/metrics` | GET | View system metrics | ✅ Summary |
| 4 | `/api/customers` | POST | Create Customer 1 | ✅ Created |
| 5 | `/api/customers` | POST | Create Customer 2 | ✅ Created |
| ... | ... | ... | Create Customers 3-25 | ... |
| 29 | `/api/segment/calculate-engagement` | POST | Calculate scores | ✅ Scores updated |
| 30 | `/api/segment/refresh` | POST | Apply segmentation | ✅ Segmented |
| 31 | `/api/segments` | GET | View segment counts | ✅ See totals |
| 32 | `/api/segments/1` | GET | View segment 1 details | ✅ See customers |
| 33 | `/api/segments/2` | GET | View segment 2 details | ✅ See customers |
| 34 | `/api/segments/3-5` | GET | View other segments | ✅ See customers |
| 35 | `/api/customers?segment_id=1` | GET | Filter by segment | ✅ Filtered list |
| 36 | `/api/customers/:id` | GET | View single customer | ✅ Details |
| 37 | `/api/segment/analyze` | POST | AI analysis (optional) | ✅ Suggestions |

---

## ✅ Complete Testing Checklist

### PHASE 1: Health Checks ✓

```
□ GET /health
  ✓ Response Code: 200
  ✓ status = "healthy"
  ✓ service = "chainreach-segmentation-agent-node"
  
□ GET /status
  ✓ Response Code: 200
  ✓ database.connected = true
  ✓ customers = 0 (before loading data)
  ✓ segments = 5 (pre-created)
  ✓ ai_enabled = true or false (depends on config)
  
□ GET /metrics
  ✓ Response Code: 200
  ✓ total_customers = 0
  ✓ segments array with 5 items
```

### PHASE 2: Customer Creation ✓

```
□ Customer 1-5 (Enterprise - High Value)
  ✓ TECH_APPLE_001 - Created (200/201)
  ✓ TECH_MICROSOFT_002 - Created
  ✓ FIN_JPM_003 - Created
  ✓ RETAIL_WALMART_004 - Created
  ✓ PHARMA_PFIZER_005 - Created

□ Customer 6-10 (More Enterprise/Emerging)
  ✓ TECH_GOOGLE_006 - Created
  ✓ FIN_MORGAN_007 - Created
  ✓ HEALTH_UNH_008 - Created
  ✓ TECH_COINBASE_009 - Created
  ✓ RETAIL_AMAZON_010 - Created

□ Customer 11-20 (SMB/Mid-Market)
  ✓ SMB_TECH_011 through SMB_MEDIA_020 - All Created

□ Customer 21-25 (Special Cases)
  ✓ INACTIVE_CORP_021 (At Risk) - Created
  ✓ OLD_CUSTOMER_022 (At Risk) - Created
  ✓ NEW_TECH_STARTUP_023 (New) - Created
  ✓ NEW_STARTUP_024 (New) - Created
  ✓ NEW_VENTURES_025 (New) - Created

□ Verify POST Responses
  ✓ All 25 POST requests return 201 Created
  ✓ Each response contains customer ID
  ✓ No duplicate customer_id errors
```

### PHASE 3: Segmentation Setup ✓

```
□ GET /api/segments (Before segmentation)
  ✓ Response Code: 200
  ✓ 5 segments visible
  ✓ actual_customer_count = 0 for all
  ✓ Segments: High Value, At Risk, New Customers, VIP Enterprise, Engaged SMB

□ Verify Segment Details
  ✓ Segment 1: High Value (criteria: min_total_purchases: 10000, min_engagement_score: 75)
  ✓ Segment 2: At Risk (criteria: days_since_last_purchase: 90, max_engagement_score: 30)
  ✓ Segment 3: New Customers (criteria: days_since_created: 30)
  ✓ Segment 4: VIP Enterprise (criteria: min_employee_count: 1000, min_revenue: 50000)
  ✓ Segment 5: Engaged SMB (criteria: max_employee_count: 999, min_engagement_score: 60)
```

### PHASE 4: Apply Segmentation ✓

```
□ POST /api/segment/calculate-engagement
  ✓ Response Code: 200
  ✓ customersUpdated = 25
  ✓ avgEngagementScore calculated
  ✓ All customers now have engagement_score > 0

□ POST /api/segment/refresh
  ✓ Response Code: 200
  ✓ segmentsRefreshed = 5
  ✓ customersSegmented = 25
  ✓ segmentBreakdown shows distribution
  
Expected Breakdown After Refresh:
  ✓ Segment 1 (High Value): ~8 customers
  ✓ Segment 2 (At Risk): ~2 customers
  ✓ Segment 3 (New Customers): ~3 customers
  ✓ Segment 4 (VIP Enterprise): ~5 customers
  ✓ Segment 5 (Engaged SMB): ~7 customers
  ✓ Total: ~25 customers assigned
```

### PHASE 5: Verify Segmentation Results ✓

```
□ GET /api/segments (After segmentation)
  ✓ Response Code: 200
  ✓ actual_customer_count > 0 for all segments
  ✓ All 25 customers have been segmented
  
  Expected:
  ✓ Segment 1: actual_customer_count = 8
  ✓ Segment 2: actual_customer_count = 2
  ✓ Segment 3: actual_customer_count = 3
  ✓ Segment 4: actual_customer_count = 5
  ✓ Segment 5: actual_customer_count = 7

□ GET /api/segments/1 (High Value Customers)
  ✓ Response Code: 200
  ✓ segment.name = "High Value Customers"
  ✓ customers array has 8 items
  ✓ Each customer has:
    - customer_id
    - name
    - total_purchases > 10000
    - engagement_score >= 75
    - segment_id = 1
    - segment_confidence = 95.0

□ GET /api/segments/2 (At Risk)
  ✓ Response Code: 200
  ✓ customers array has 2 items
  ✓ Customers: INACTIVE_CORP_021, OLD_CUSTOMER_022
  ✓ engagement_score < 30 for each
  ✓ segment_id = 2

□ GET /api/segments/3 (New Customers)
  ✓ Response Code: 200
  ✓ customers array has 3 items
  ✓ Customers: NEW_TECH_STARTUP_023, NEW_STARTUP_024, NEW_VENTURES_025
  ✓ segment_id = 3

□ GET /api/segments/4 (VIP Enterprise)
  ✓ Response Code: 200
  ✓ customers array has 5 items
  ✓ employee_count >= 1000 or revenue >= 50000
  ✓ segment_id = 4

□ GET /api/segments/5 (Engaged SMB)
  ✓ Response Code: 200
  ✓ customers array has 7 items
  ✓ engagement_score >= 60
  ✓ segment_id = 5
```

### PHASE 6: Query & Filter ✓

```
□ GET /api/customers
  ✓ Response Code: 200
  ✓ Returns all 25 customers
  ✓ Sorted by engagement_score DESC, total_purchases DESC
  ✓ Top customer: engagement_score = 95.0 (Microsoft)
  ✓ pagination: limit=100, offset=0, total=25

□ GET /api/customers?segment_id=1
  ✓ Response Code: 200
  ✓ Returns only 8 high-value customers
  ✓ All have segment_id = 1
  ✓ All have engagement_score >= 75
  ✓ All have total_purchases >= 10000

□ GET /api/customers?segment_id=2
  ✓ Response Code: 200
  ✓ Returns only 2 at-risk customers
  ✓ Verified: INACTIVE_CORP_021, OLD_CUSTOMER_022

□ GET /api/customers/:id (by customer_id)
  ✓ GET /api/customers/TECH_APPLE_001
    ✓ Response Code: 200
    ✓ Returns single customer object
    ✓ customer_id = "TECH_APPLE_001"
    ✓ segment_id = 1
    ✓ segment_name = "High Value Customers"

□ GET /api/customers/:id (by numeric ID)
  ✓ GET /api/customers/1
    ✓ Response Code: 200
    ✓ Returns customer with id=1
    ✓ Works with both numeric and string IDs

□ GET /api/customers?limit=10&offset=0
  ✓ Response Code: 200
  ✓ Returns only 10 customers
  ✓ pagination.limit = 10

□ GET /api/customers?industry=Technology
  ✓ Response Code: 200
  ✓ Returns only Technology industry customers
  ✓ All have industry = "Technology"
```

### PHASE 7: Metrics & Monitoring ✓

```
□ GET /metrics (After data load)
  ✓ Response Code: 200
  ✓ total_customers = 25
  ✓ active_segments = 5
  ✓ avg_engagement_score > 0 (should be ~72)
  ✓ total_revenue > 0 (from sample data)
  ✓ unassigned_customers = 0 (all 25 segmented)
  ✓ segments array shows each segment with customer_count
```

### PHASE 8: Optional - AI Analysis ✓

```
□ POST /api/segment/analyze (if Azure OpenAI configured)
  ✓ Response Code: 200
  ✓ customersAnalyzed = 25
  ✓ suggestedSegments array returned
  ✓ Each suggested segment has:
    - name
    - description
    - criteria (JSONB object)
  ✓ Message explains next steps
```

---

## 🎯 Expected Customer Distribution

After completing segmentation with provided sample data:

```
SEGMENT 1: High Value Customers (8)
├─ TECH_APPLE_001        | Total: $250K | Engagement: 92.5%
├─ TECH_MICROSOFT_002    | Total: $280K | Engagement: 95.0%
├─ FIN_JPM_003           | Total: $320K | Engagement: 85.0%
├─ RETAIL_WALMART_004    | Total: $450K | Engagement: 88.5%
├─ TECH_GOOGLE_006       | Total: $215K | Engagement: 91.0%
├─ FIN_MORGAN_007        | Total: $175K | Engagement: 78.5%
├─ HEALTH_UNH_008        | Total: $195K | Engagement: 83.0%
└─ RETAIL_AMAZON_010     | Total: $380K | Engagement: 90.5%

SEGMENT 2: At Risk (2)
├─ INACTIVE_CORP_021     | Total: $15K  | Engagement: 15.2% ⚠️
└─ OLD_CUSTOMER_022      | Total: $20K  | Engagement: 12.5% ⚠️

SEGMENT 3: New Customers (3)
├─ NEW_TECH_STARTUP_023  | Total: $5K   | Engagement: 58.0% 🆕
├─ NEW_STARTUP_024       | Total: $8K   | Engagement: 65.5% 🆕
└─ NEW_VENTURES_025      | Total: $12K  | Engagement: 72.0% 🆕

SEGMENT 4: VIP Enterprise (5)
├─ PHARMA_PFIZER_005     | Employees: 43K | Revenue: $68B
├─ TECH_COINBASE_009     | Employees: 4K  | Revenue: $28B
└─ (3 more from high-value set)

SEGMENT 5: Engaged SMB (7)
├─ SMB_TECH_011          | Total: $28K  | Engagement: 68.0%
├─ SMB_FIN_012           | Total: $22K  | Engagement: 64.5%
├─ SMB_HEALTH_013        | Total: $35K  | Engagement: 71.0%
├─ SMB_RETAIL_014        | Total: $18K  | Engagement: 62.0%
├─ SMB_MFG_015           | Total: $42K  | Engagement: 75.5%
├─ SMB_LOG_016           | Total: $38K  | Engagement: 73.0%
└─ (1 more SMB company)

TOTALS:
✓ Total Customers: 25
✓ Total Purchases: $2.4M+
✓ Average Engagement: 72.4%
✓ Total Revenue (companies): $2.4B+
```

---

## 🔴 Common Issues & Solutions

### Issue 1: POST /api/customers returns 400 error
```
Problem: "Name and criteria are required" or "Missing field"
Solution:
  • Verify ALL required fields in JSON (customer_id, name, email, company, industry, total_purchases)
  • Check JSON syntax (no trailing commas, quotes properly matched)
  • Copy JSON exactly as provided
  • Paste entire JSON between curly braces { }
```

### Issue 2: Customers not appearing in segments after refresh
```
Problem: actual_customer_count still 0 after refresh
Solution:
  1. Verify customers were created: GET /api/customers (should show 25)
  2. Run: POST /api/segment/calculate-engagement first
  3. Wait for response, then run: POST /api/segment/refresh
  4. Check segment criteria matches customer data
  5. Try refreshing in browser
```

### Issue 3: Engagement scores all 0 or 0.00
```
Problem: Engagement scores not calculated
Solution:
  • Run: POST /api/segment/calculate-engagement
  • Wait for success response
  • Then run: POST /api/segment/refresh
  • Order matters!
```

### Issue 4: GET /api/segments returns empty array
```
Problem: No segments visible
Solution:
  • Verify database initialized with: npm run setup
  • Check init-db.sql was run (should create default 5 segments)
  • If lost, run: psql -U postgres -d chainreach_db -f scripts/init-db.sql
```

### Issue 5: 503 Service Unavailable
```
Problem: Database connection failed
Solution:
  1. Verify PostgreSQL is running
  2. Check DATABASE_URL in .env file
  3. Verify credentials match your PostgreSQL setup
  4. Test connection: psql -U postgres -d chainreach_db
  5. If fails, reinitialize database
```

### Issue 6: CORS error in browser console
```
Problem: "Cross-Origin Request Blocked"
Solution:
  • Verify ALLOWED_ORIGINS in .env includes http://localhost:3000
  • Restart segmentation agent after .env changes
  • Check that agent is running on port 8001
```

---

## ⏱️ Timeline & Performance

```
Expected Execution Times:

Phase 1 (Health checks):           1-2 minutes
Phase 2 (Create 25 customers):     5-10 minutes (if copy-pasting)
Phase 3 (Setup verification):      1 minute
Phase 4 (Segmentation):            2 minutes
Phase 5 (Results verification):    2-3 minutes
Phase 6 (Additional queries):      1-2 minutes
Phase 7 (Metrics check):           1 minute
Phase 8 (AI analysis - optional):  1-2 minutes

TOTAL: 14-22 minutes to complete entire workflow
```

---

## 📱 API Response Format Reference

### Success Response Format
```json
{
  "success": true,
  "data": {
    // endpoint-specific data
  },
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 25
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed explanation"
}
```

---

## ✅ Final Success Criteria

You've successfully executed the Segmentation Agent API when:

- ✅ All 3 health checks pass
- ✅ Created 25 customers (all POST endpoints return 201)
- ✅ Verified 5 pre-existing segments
- ✅ Engagement scores calculated for all 25
- ✅ All segments refreshed with customers
- ✅ GET /api/segments shows all 5 with customer_count > 0
- ✅ Can view each segment's customers (GET /api/segments/:id)
- ✅ High Value segment shows exactly 8 customers
- ✅ At Risk segment shows exactly 2 customers
- ✅ Can filter customers by segment
- ✅ Can get individual customer details
- ✅ Total of 25 customers visible
- ✅ Metrics show correct totals

**When all criteria met = ✅ SUCCESS!**

---

**Created:** November 28, 2025
**Version:** 1.0
**Status:** Ready for Testing
