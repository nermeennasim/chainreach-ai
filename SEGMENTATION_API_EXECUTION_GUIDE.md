# 🎯 Segmentation Agent API Execution Guide

## 📋 API Execution Order (Correct Sequence)

Your Swagger-like GUI lets you test any endpoint, but here's the **correct order** to get meaningful results:

### **Phase 1: Setup & Health Checks**
```
1. GET /health
2. GET /status
3. GET /metrics
```

### **Phase 2: Load Sample Customers**
```
4. POST /api/customers (create 100-500 customers)
```

### **Phase 3: Create Segments**
```
5. POST /api/segments (define your customer groups)
```

### **Phase 4: Apply Segmentation**
```
6. POST /api/segment/calculate-engagement (calculate scores)
7. POST /api/segment/refresh (apply all segments)
```

### **Phase 5: View & Analyze Results**
```
8. GET /api/segments (list all segments)
9. GET /api/segments/:id (view segment details + customers)
10. GET /api/customers (view all customers)
11. GET /api/customers?segment_id=1 (filter by segment)
12. POST /api/segment/analyze (AI analysis - optional)
```

---

## 🚀 Phase 1: Health Checks (30 seconds)

### Step 1: Health Check
```
Endpoint: GET /health
Expected Response: ✅ 200 OK
```

**Sample Response:**
```json
{
  "status": "healthy",
  "service": "chainreach-segmentation-agent-node",
  "version": "1.0.0",
  "timestamp": "2025-11-28T10:30:00.000Z",
  "environment": "development"
}
```

### Step 2: Status Check
```
Endpoint: GET /status
Expected Response: ✅ 200 OK
```

**Sample Response:**
```json
{
  "status": "healthy",
  "service": "chainreach-segmentation-agent-node",
  "version": "1.0.0",
  "timestamp": "2025-11-28T10:30:00.000Z",
  "database": {
    "connected": true,
    "timestamp": "2025-11-28T10:30:00.000Z",
    "customers": 0,
    "segments": 5
  },
  "ai_enabled": true
}
```

### Step 3: View Metrics
```
Endpoint: GET /metrics
Expected Response: ✅ 200 OK
```

**Sample Response:**
```json
{
  "timestamp": "2025-11-28T10:30:00.000Z",
  "summary": {
    "total_customers": 0,
    "active_segments": 0,
    "avg_engagement_score": 0,
    "total_revenue": 0,
    "unassigned_customers": 0
  },
  "segments": [
    {
      "segment_id": 1,
      "segment_name": "High Value Customers",
      "customer_count": 0
    },
    {
      "segment_id": 2,
      "segment_name": "At Risk",
      "customer_count": 0
    },
    {
      "segment_id": 3,
      "segment_name": "New Customers",
      "customer_count": 0
    },
    {
      "segment_id": 4,
      "segment_name": "VIP Enterprise",
      "customer_count": 0
    },
    {
      "segment_id": 5,
      "segment_name": "Engaged SMB",
      "customer_count": 0
    }
  ]
}
```

✅ **Result:** System healthy, 5 default segments created, ready for customers

---

## 👥 Phase 2: Create Sample Customers (2-5 minutes)

### Sample Customer IDs to Use

**Option A: Simple Numbered IDs**
```
CUST_001, CUST_002, CUST_003, ..., CUST_100
```

**Option B: Industry-Based IDs**
```
TECH_APPLE_001, TECH_MICROSOFT_002, FINANCE_JPM_001, RETAIL_WALMART_001, etc.
```

**Option C: Realistic Mix (Recommended)**
```
Use the 25 sample customers below
```

### Step 4: Create 25 Sample Customers (Copy-Paste Each)

**Use GUI:** Fill in the parameter fields with this data and click Execute for each:

#### Customer 1: High-Value Tech Company
```
POST /api/customers

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

#### Customer 2: High-Value Tech Company
```
POST /api/customers

{
  "customer_id": "TECH_MICROSOFT_002",
  "name": "Microsoft Corporation",
  "email": "sales@microsoft.com",
  "phone": "+1-425-882-8080",
  "company": "Microsoft",
  "industry": "Technology",
  "revenue": 211915000000,
  "employee_count": 221000,
  "location": "Redmond, WA",
  "country": "USA",
  "total_purchases": 280000,
  "purchase_count": 52,
  "avg_purchase_value": 5384.62,
  "email_opens": 920,
  "email_clicks": 480,
  "website_visits": 2800,
  "engagement_score": 95.0,
  "custom_attributes": {
    "company_size": "enterprise",
    "annual_spend": "$280K+",
    "account_type": "premium"
  }
}
```

#### Customer 3: Finance VIP
```
POST /api/customers

{
  "customer_id": "FIN_JPM_003",
  "name": "JP Morgan Chase",
  "email": "procurement@jpmorganchase.com",
  "phone": "+1-212-270-6000",
  "company": "JPMorgan Chase",
  "industry": "Finance",
  "revenue": 127237000000,
  "employee_count": 309394,
  "location": "New York, NY",
  "country": "USA",
  "total_purchases": 320000,
  "purchase_count": 68,
  "avg_purchase_value": 4705.88,
  "email_opens": 650,
  "email_clicks": 380,
  "website_visits": 1900,
  "engagement_score": 85.0,
  "custom_attributes": {
    "company_size": "enterprise",
    "annual_spend": "$320K+",
    "account_type": "premium"
  }
}
```

#### Customer 4: Retail Leader
```
POST /api/customers

{
  "customer_id": "RETAIL_WALMART_004",
  "name": "Walmart Inc",
  "email": "orders@walmart.com",
  "phone": "+1-479-273-4000",
  "company": "Walmart",
  "industry": "Retail",
  "revenue": 611289000000,
  "employee_count": 2100000,
  "location": "Bentonville, AR",
  "country": "USA",
  "total_purchases": 450000,
  "purchase_count": 95,
  "avg_purchase_value": 4736.84,
  "email_opens": 1200,
  "email_clicks": 620,
  "website_visits": 3200,
  "engagement_score": 88.5,
  "custom_attributes": {
    "company_size": "enterprise",
    "annual_spend": "$450K+",
    "account_type": "premium"
  }
}
```

#### Customer 5: Pharmaceutical Corp
```
POST /api/customers

{
  "customer_id": "PHARMA_PFIZER_005",
  "name": "Pfizer Inc",
  "email": "business@pfizer.com",
  "phone": "+1-212-733-2323",
  "company": "Pfizer",
  "industry": "Pharmaceutical",
  "revenue": 68215000000,
  "employee_count": 43000,
  "location": "New York, NY",
  "country": "USA",
  "total_purchases": 185000,
  "purchase_count": 38,
  "avg_purchase_value": 4868.42,
  "email_opens": 580,
  "email_clicks": 310,
  "website_visits": 1400,
  "engagement_score": 82.0,
  "custom_attributes": {
    "company_size": "enterprise",
    "annual_spend": "$185K+",
    "account_type": "premium"
  }
}
```

---

### 🎯 Quick: Create 20 More SMB Customers (Small-Medium Business)

#### Customer 6-25: SMB Tech Companies (High Engagement, Medium Spend)

**Template (Modify the ID and details for each):**
```
POST /api/customers

{
  "customer_id": "TECH_STARTUP_006",
  "name": "TechStartup Co",
  "email": "sales@techstartup.com",
  "phone": "+1-415-555-0101",
  "company": "TechStartup",
  "industry": "Technology",
  "revenue": 45000000,
  "employee_count": 250,
  "location": "San Francisco, CA",
  "country": "USA",
  "total_purchases": 35000,
  "purchase_count": 12,
  "avg_purchase_value": 2916.67,
  "email_opens": 280,
  "email_clicks": 145,
  "website_visits": 850,
  "engagement_score": 75.5,
  "custom_attributes": {
    "company_size": "mid-market",
    "annual_spend": "$35K+",
    "account_type": "standard"
  }
}
```

**Create 20 variations with these IDs:**
- TECH_STARTUP_006 to TECH_STARTUP_009
- FINANCE_STARTUP_010 to FINANCE_STARTUP_013
- RETAIL_SHOP_014 to RETAIL_SHOP_017
- HEALTHCARE_CLINIC_018 to HEALTHCARE_CLINIC_021
- MANUFACTURING_PLANT_022 to MANUFACTURING_PLANT_025

*(Adjust values: engagement_score 60-80, total_purchases $20K-50K, purchase_count 8-20)*

---

### ⚠️ Low Engagement Customers (For "At Risk" Segment)

#### Customer 26-30: Inactive Customers (Last purchase 120+ days ago)

```
POST /api/customers

{
  "customer_id": "OLD_CUSTOMER_026",
  "name": "Inactive Corp",
  "email": "support@inactivecorp.com",
  "phone": "+1-555-0102",
  "company": "Inactive Corp",
  "industry": "Technology",
  "revenue": 5000000,
  "employee_count": 50,
  "location": "Boston, MA",
  "country": "USA",
  "total_purchases": 15000,
  "purchase_count": 3,
  "avg_purchase_value": 5000,
  "email_opens": 12,
  "email_clicks": 2,
  "website_visits": 15,
  "engagement_score": 15.2,
  "custom_attributes": {
    "company_size": "small",
    "annual_spend": "$15K",
    "account_type": "starter",
    "churn_risk": "high"
  }
}
```

---

## 🎯 Phase 3: View Pre-Created Segments

### Step 8: Get All Segments
```
Endpoint: GET /api/segments
Expected Response: ✅ 200 OK
Parameters: None
```

**Sample Response:**
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
      "customer_count": 0,
      "ai_generated": false,
      "created_at": "2025-11-28T10:30:00.000Z",
      "updated_at": "2025-11-28T10:30:00.000Z",
      "actual_customer_count": 0
    },
    {
      "id": 2,
      "name": "At Risk",
      "description": "Previously active customers who haven't engaged recently",
      "criteria": {
        "days_since_last_purchase": 90,
        "max_engagement_score": 30
      },
      "customer_count": 0,
      "ai_generated": false,
      "created_at": "2025-11-28T10:30:00.000Z",
      "updated_at": "2025-11-28T10:30:00.000Z",
      "actual_customer_count": 0
    }
  ]
}
```

---

## 🔄 Phase 4: Apply Segmentation

### Step 9: Calculate Engagement Scores
```
Endpoint: POST /api/segment/calculate-engagement
Expected Response: ✅ 200 OK
Parameters: None (POST, no body required)
```

**Sample Response:**
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

### Step 10: Refresh All Segments
```
Endpoint: POST /api/segment/refresh
Expected Response: ✅ 200 OK
Parameters: None (POST, no body required)
```

**Sample Response:**
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
        "customersAdded": 5,
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
        "customersAdded": 5,
        "customersRemoved": 0
      }
    ]
  }
}
```

✅ **Success:** Your 25 customers are now segmented!

---

## 📊 Phase 5: View Results

### Step 11: Get All Segments with Counts
```
Endpoint: GET /api/segments
Expected Response: ✅ 200 OK
Parameters: None
```

Now should show actual_customer_count values > 0

### Step 12: View Segment Details & Customers
```
Endpoint: GET /api/segments/:id
Expected Response: ✅ 200 OK
Parameters:
  - id: 1 (segment ID)
  - limit: 50 (optional, default 50)
  - offset: 0 (optional, for pagination)
```

**Example: Get "High Value Customers" segment:**
```
GET /api/segments/1?limit=50&offset=0
```

**Sample Response:**
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
      },
      {
        "id": 2,
        "customer_id": "TECH_MICROSOFT_002",
        "name": "Microsoft Corporation",
        "email": "sales@microsoft.com",
        "company": "Microsoft",
        "industry": "Technology",
        "total_purchases": 280000,
        "purchase_count": 52,
        "engagement_score": 95.0,
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

✅ **Result:** See all customers in "High Value Customers" segment!

### Step 13: View Specific Customer
```
Endpoint: GET /api/customers/:id
Expected Response: ✅ 200 OK
Parameters:
  - id: TECH_APPLE_001 (customer_id)
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": "TECH_APPLE_001",
    "name": "Apple Inc",
    "email": "contact@apple.com",
    "company": "Apple",
    "industry": "Technology",
    "revenue": 394328000000,
    "employee_count": 161000,
    "total_purchases": 250000,
    "purchase_count": 45,
    "avg_purchase_value": 5555.56,
    "engagement_score": 92.5,
    "segment_id": 1,
    "segment_name": "High Value Customers",
    "segment_confidence": 95.0,
    "created_at": "2025-11-28T10:30:00.000Z"
  }
}
```

### Step 14: Filter Customers by Segment
```
Endpoint: GET /api/customers?segment_id=1
Expected Response: ✅ 200 OK
Parameters:
  - segment_id: 1
  - limit: 100 (optional)
  - offset: 0 (optional)
```

**Sample Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "customer_id": "TECH_APPLE_001", ... },
    { "id": 2, "customer_id": "TECH_MICROSOFT_002", ... },
    ...
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 8
  }
}
```

---

## 🤖 Phase 6 (Optional): AI Analysis

### Step 15: Get AI-Powered Segment Suggestions
```
Endpoint: POST /api/segment/analyze
Expected Response: ✅ 200 OK (if Azure OpenAI configured)
Parameters: None (POST, no body)
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "customersAnalyzed": 25,
    "suggestedSegments": [
      {
        "name": "Enterprise Tech Leaders",
        "description": "Large tech companies with consistent high engagement",
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

---

## 📈 Complete Execution Summary

### Recommended Timeline:
```
⏱️ Total Time to Complete: ~15-20 minutes

Timeline:
├─ Phase 1 (Health checks): 1 minute
├─ Phase 2 (Create 25 customers): 5-8 minutes (if copy-pasting)
├─ Phase 3 (View segments): 1 minute
├─ Phase 4 (Apply segmentation): 2 minutes
├─ Phase 5 (View results): 2-3 minutes
└─ Phase 6 (AI analysis): 1 minute (optional)
```

### Data Summary After Execution:
```
✅ Customers Created: 25-30
✅ Segments: 5 (all pre-created)
✅ High Value Segment: 8 customers
✅ At Risk Segment: 2 customers
✅ New Customers: 5 customers
✅ VIP Enterprise: 5 customers
✅ Engaged SMB: 5 customers
✅ Average Engagement: 72.4/100
✅ Total Revenue: $2.4B+ (from sample data)
✅ Total Purchases: $2.4M+
```

---

## 🔍 Troubleshooting

### Issue: POST /api/customers returns 400 error
**Solution:** Check that all required fields are included (customer_id, name, email, company, industry, total_purchases, etc.)

### Issue: Segments show 0 customers after refresh
**Solution:** 
1. Verify customers were created (GET /api/customers)
2. Check segment criteria match customer data
3. Run POST /api/segment/calculate-engagement first

### Issue: Engagement scores all 0
**Solution:** Run POST /api/segment/calculate-engagement endpoint

### Issue: AI Analysis returns error
**Solution:** Azure OpenAI may not be configured. Check .env file and environment variables.

---

## ✅ Success Checklist

- [ ] Phase 1: Health checks pass
- [ ] Phase 2: Created 25+ customers
- [ ] Phase 3: View all 5 default segments
- [ ] Phase 4: Engagement scores calculated
- [ ] Phase 4: Segments refreshed with customers
- [ ] Phase 5: View segment details (>0 customers)
- [ ] Phase 5: Filter customers by segment
- [ ] Phase 6: AI analysis suggestions (optional)

**All checkmarks = ✅ Success! Your segmentation agent is working!**

---

## 🎓 Next Steps

After completing the execution:

1. **Explore the Data:**
   - Look at different segments
   - Compare customer characteristics
   - Identify patterns

2. **Create Custom Segments:**
   - Use POST /api/segments to create your own
   - Define custom criteria
   - Apply to your actual customer data

3. **Integrate with Dashboard:**
   - Use this same data flow in your Message Generation agent
   - Pass segment IDs to create targeted campaigns
   - Use engagement scores for personalization

4. **Production Data:**
   - Replace sample data with your real customer data
   - Use import scripts: `scripts/import-csv.js` or `scripts/import-excel.js`
   - Scale to thousands of customers

---

**Created:** November 28, 2025
**Version:** 1.0
**Status:** ✅ Ready to Execute
