# 🎯 Segmentation Method Explained

## Current Segmentation: **HYBRID APPROACH** (Excel Data + Rule-Based Logic)

---

## 📊 How It Works Currently:

### 1️⃣ **Excel Data Import (Pre-Segmented)**
The Excel file (`ChainReach_AI_Customers_1000.xlsx`) contains:
- ✅ Customer data with **pre-calculated** segments
- ✅ Engagement scores **already computed**
- ✅ Segment names like: `REGULAR_SATISFIED`, `DORMANT_HIGH_VALUE`, `VIP_LOYALIST`

**From Excel:**
```javascript
// Import script reads:
row['Segment']            // Pre-assigned segment name
row['Engagement Score']   // Pre-calculated score (0-100)
row['Churn Risk']         // Pre-calculated risk level
```

**This is imported BUT NOT USED for segmentation!** 
The Excel segments are **ignored** during import. Only customer data is imported.

---

### 2️⃣ **Rule-Based Segmentation (Active Method)**
The system uses **5 hardcoded segments** with JSON criteria:

**Segments in Database:**
```javascript
// From setup-db.js
[
  {
    name: 'High Value Customers',
    description: 'Customers with high lifetime value and engagement',
    criteria: {
      min_total_purchases: 5000,
      min_engagement_score: 70
    }
  },
  {
    name: 'At Risk',
    description: 'Previously active customers showing declining engagement',
    criteria: {
      max_engagement_score: 40,
      days_since_last_purchase: 90
    }
  },
  {
    name: 'New Customers',
    description: 'Recently acquired customers',
    criteria: {
      days_since_created: 30,
      max_purchase_count: 3
    }
  },
  {
    name: 'VIP Enterprise',
    description: 'Large enterprise accounts',
    criteria: {
      min_employee_count: 1000,
      min_revenue: 100000
    }
  },
  {
    name: 'Engaged SMB',
    description: 'Small/medium businesses with high engagement',
    criteria: {
      max_employee_count: 999,
      min_engagement_score: 60,
      min_purchase_count: 5
    }
  }
]
```

**How It Assigns Customers:**
```typescript
// segmentService.ts - applySegmentation()

// 1. Get segment criteria
const criteria = { min_total_purchases: 5000, min_engagement_score: 70 };

// 2. Build SQL query dynamically
WHERE total_purchases >= 5000 
  AND engagement_score >= 70

// 3. Update matching customers
UPDATE customers 
SET segment_id = 1, segment_name = 'High Value Customers'
WHERE total_purchases >= 5000 AND engagement_score >= 70
```

---

### 3️⃣ **AI-Powered Segmentation (Optional Feature - NOT ACTIVE)**
The system **CAN** use Azure OpenAI to suggest segments, but:
- ❌ **NOT configured** (requires Azure OpenAI credentials)
- ❌ **NOT running** by default
- ✅ **Available** if you want to enable it

**How AI Segmentation Would Work:**
```typescript
// aiService.ts - analyzeCustomersForSegmentation()

// 1. Send customer data to Azure OpenAI
const prompt = `Analyze these customers and suggest optimal segments:
- 1000 customers
- Avg engagement: 65
- Industries: Technology, Healthcare, Retail
`;

// 2. AI returns suggested segments
[
  {
    name: "High-Value Tech Buyers",
    criteria: { min_total_purchases: 5000, industries: ["Technology"] },
    marketing_strategy: "Premium offerings",
    estimated_size: 15%
  }
]

// 3. You can then create these segments via API
POST /api/segments
```

---

## 🔄 Complete Flow:

### **Current Active Flow:**

```
1. Excel File (1000 customers)
   ↓
2. Import Script
   - Reads customer data
   - Ignores Excel segments ❌
   - Imports to PostgreSQL
   ↓
3. Database (1000 customers, no segments assigned)
   ↓
4. Manual/API Trigger: POST /api/segment/refresh
   ↓
5. Rule-Based Engine
   - Applies 5 hardcoded segment rules
   - Assigns customers based on criteria
   ↓
6. Database (1000 customers WITH segments assigned)
```

### **If You Enable AI:**

```
1. Call POST /api/segment/analyze (AI endpoint)
   ↓
2. Azure OpenAI analyzes customer patterns
   ↓
3. Returns AI-suggested segments
   ↓
4. You review and create segments manually
   ↓
5. Rule-Based Engine applies new segments
```

---

## 📈 What's Actually Happening Now:

### Import Process:
```javascript
// Customer imported with NO segment
{
  customer_id: "CUST-0001",
  name: "Ashley Jackson",
  total_purchases: 3461.38,
  engagement_score: 83,
  segment_id: NULL,          // ← No segment yet!
  segment_name: NULL         // ← No segment yet!
}
```

### After Refresh Segmentation:
```javascript
// Customer assigned to segment
{
  customer_id: "CUST-0001",
  name: "Ashley Jackson",
  total_purchases: 3461.38,
  engagement_score: 83,
  segment_id: 1,             // ← Assigned!
  segment_name: "High Value Customers"  // ← Assigned!
}
```

---

## 🎮 How to Use Each Method:

### **Method 1: Rule-Based (Active Now)**

**Use built-in segments:**
```powershell
# Apply default 5 segments
Invoke-RestMethod -Uri http://localhost:8001/api/segment/refresh -Method Post
```

**Create custom segment:**
```powershell
$segment = @{
    name = "Tech Enthusiasts"
    description = "Technology customers with high engagement"
    criteria = @{
        min_engagement_score = 80
        industries = @("Technology", "Software")
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8001/api/segments -Method Post -Body $segment -ContentType "application/json"

# Then apply it
Invoke-RestMethod -Uri http://localhost:8001/api/segment/refresh -Method Post
```

---

### **Method 2: AI-Powered (Optional)**

**1. Configure Azure OpenAI in .env:**
```env
AZURE_OPENAI_ENDPOINT=https://your-openai.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

**2. Get AI suggestions:**
```powershell
# AI analyzes customers and suggests segments
Invoke-RestMethod -Uri http://localhost:8001/api/segment/analyze -Method Post | ConvertTo-Json -Depth 5
```

**3. Review AI suggestions:**
```json
[
  {
    "name": "High-Value Tech Buyers",
    "description": "Technology companies with high engagement",
    "criteria": {
      "min_total_purchases": 5000,
      "min_engagement_score": 60,
      "industries": ["Technology"]
    },
    "marketing_strategy": "Premium offerings",
    "estimated_size_percentage": 15
  }
]
```

**4. Create AI-suggested segment:**
```powershell
$aiSegment = @{
    name = "High-Value Tech Buyers"
    description = "Technology companies with high engagement"
    criteria = @{
        min_total_purchases = 5000
        min_engagement_score = 60
        industries = @("Technology")
    }
    ai_generated = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8001/api/segments -Method Post -Body $aiSegment -ContentType "application/json"
```

---

## 📋 Summary:

| Method | Status | How It Works |
|--------|--------|--------------|
| **Excel Pre-Segmentation** | ❌ Ignored | Excel has segments but they're not imported |
| **Rule-Based Segmentation** | ✅ Active | 5 hardcoded segments with JSON criteria |
| **AI-Powered Segmentation** | ⚪ Optional | Azure OpenAI suggests segments (not configured) |

---

## 🔧 Current Segment Rules:

```javascript
Segment 1: High Value Customers
→ total_purchases >= 5000 AND engagement_score >= 70
→ Result: Customers who spend a lot and are engaged

Segment 2: At Risk
→ engagement_score <= 40 AND last_purchase > 90 days ago
→ Result: Inactive customers likely to churn

Segment 3: New Customers
→ created within last 30 days AND purchase_count <= 3
→ Result: Recently onboarded customers

Segment 4: VIP Enterprise
→ employee_count >= 1000 AND revenue >= 100000
→ Result: Large corporate accounts

Segment 5: Engaged SMB
→ employee_count <= 999 AND engagement_score >= 60 AND purchase_count >= 5
→ Result: Active small/medium businesses
```

---

## 💡 Recommendations:

### **For Your Demo:**
1. **Keep Rule-Based** - It's working, reliable, and fast
2. **Add Custom Segments** - Create segments specific to your use case
3. **Show AI as "Future Feature"** - Mention AI capability but not required

### **To Enable AI:**
1. Get Azure OpenAI access
2. Add credentials to `.env`
3. Call `/api/segment/analyze` to get AI suggestions
4. Use AI-generated criteria to create new segments

### **To Use Excel Segments:**
Would need to modify import script to:
```javascript
// Read segment from Excel
const excelSegment = row['Segment']; // e.g., "VIP_LOYALIST"

// Map to database segment
const segmentMapping = {
  'VIP_LOYALIST': 1,
  'DORMANT_HIGH_VALUE': 2,
  // etc...
};

// Import with segment already assigned
INSERT INTO customers (..., segment_id) 
VALUES (..., segmentMapping[excelSegment])
```

---

## ✅ What You Have:
- ✅ 1000 customers in database
- ✅ 5 rule-based segments defined
- ✅ Segmentation engine working
- ✅ API to apply/refresh segments
- ✅ AI capability (optional, not configured)

The segmentation is **NOT AI-based by default** - it's **rule-based with optional AI enhancement**.
