# 🚀 AI Segmentation - Quick Start (5 Minutes)

**Goal**: Enable AI to analyze your 1000 customers and suggest smart segments

## ⚡ Fast Track: OpenAI (Easiest)

### Step 1: Get OpenAI API Key (2 minutes)
1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. **IMPORTANT**: Save it now - you can't see it again!

### Step 2: Configure (30 seconds)
Open `segmentation-agent-node/.env` and add:
```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

### Step 3: Install OpenAI Package
```powershell
cd segmentation-agent-node
npm install openai
```

### Step 4: Test AI on 100 Customers (2 minutes)
```powershell
node scripts/test-ai-small.js
```

**Expected Output**:
```
🧪 Testing AI Segmentation with 100 customers...

📊 Fetching 100 sample customers...
✅ Fetched 100 customers

📈 Customer Summary:
Total Customers Analyzed: 100
Average Total Purchases: $5,432.50
Average Engagement Score: 67.3/100

🤖 Calling OpenAI...

✅ AI Analysis Complete!

============================================================
AI-SUGGESTED SEGMENTS
============================================================

1. High-Value Enterprise Clients
   Description: Large companies with exceptional purchase history
   Estimated Size: 15% (~15 of sampled customers)
   Marketing Strategy: Premium product bundles with dedicated support
   Criteria: {
     "min_total_purchases": 10000,
     "min_engagement_score": 70,
     "min_employee_count": 100
   }

2. Growing SMBs
   Description: Small-medium businesses showing strong engagement
   Estimated Size: 25% (~25 customers)
   Marketing Strategy: Growth-focused packages with scalability
   Criteria: {
     "min_engagement_score": 60,
     "max_employee_count": 100,
     "min_purchase_count": 5
   }

... (3-5 total segments suggested)
```

---

## 🏢 Enterprise Track: Azure OpenAI (Production-Ready)

**Why Azure OpenAI?**
- ✅ Enterprise security & compliance (GDPR, SOC 2)
- ✅ Private network deployment
- ✅ Better SLA and support
- ✅ Integrates with your Azure database

### Step 1: Create Azure OpenAI Resource (5 minutes)
```powershell
# Via Azure Portal (easier):
1. Go to portal.azure.com
2. Search "Azure OpenAI"
3. Click "+ Create"
4. Fill in:
   - Resource name: chainreach-openai
   - Region: East US (best for GPT-4)
   - Pricing: Standard S0
5. Click "Review + Create"
```

### Step 2: Deploy Model (2 minutes)
```powershell
1. Open your Azure OpenAI resource
2. Go to "Model deployments" → "Manage Deployments"
3. Click "+ Create new deployment"
4. Select:
   - Model: gpt-35-turbo (faster) OR gpt-4 (smarter)
   - Deployment name: gpt-35-turbo-deployment
   - Version: Latest
5. Click "Create"
```

### Step 3: Get Credentials (1 minute)
```powershell
1. In Azure OpenAI resource → "Keys and Endpoint"
2. Copy:
   - KEY 1
   - Endpoint (like https://chainreach-openai.openai.azure.com/)
```

### Step 4: Configure
Add to `segmentation-agent-node/.env`:
```env
AZURE_OPENAI_ENDPOINT=https://chainreach-openai.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo-deployment
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Step 5: Install Package
```powershell
cd segmentation-agent-node
npm install openai
```

### Step 6: Test
```powershell
node scripts/test-ai-small.js
```

---

## 📊 What Happens Next?

### 1. AI Analyzes Your Customers
The AI looks at:
- Purchase history ($5k avg, range $0-$50k)
- Engagement scores (0-100)
- Industries (Tech, Retail, Manufacturing...)
- Company sizes (employee count)
- Geographic distribution

### 2. AI Suggests 3-5 Segments
Example segments:
- **"High-Value Tech Buyers"** - Top 15% revenue generators
- **"At-Risk Previous Champions"** - High past engagement, recent drop
- **"Growth-Stage SMBs"** - 50-200 employees, increasing purchases
- **"International Enterprise"** - Large global companies
- **"Loyal Local Partners"** - Consistent small-medium businesses

### 3. Each Segment Includes:
```json
{
  "name": "High-Value Tech Buyers",
  "description": "Technology companies with exceptional revenue contribution",
  "criteria": {
    "min_total_purchases": 15000,
    "min_engagement_score": 75,
    "industries": ["Technology", "Software", "IT Services"],
    "min_purchase_count": 10
  },
  "marketing_strategy": "Offer premium product bundles, early access to new features, and dedicated account management",
  "estimated_size_percentage": 12
}
```

### 4. You Decide What to Do
After seeing AI suggestions:

**Option A - Create AI Segments** (Recommended)
```powershell
# Use the API to create each segment AI suggested
.\test-api.ps1  # Use the "Create Segment" section with AI data
```

**Option B - Manually Create Selected Segments**
Pick your favorite 2-3 AI suggestions and create them via dashboard

**Option C - Hybrid Approach**
Keep your 5 existing rule-based segments + add 2-3 AI segments

---

## 🎯 Full Workflow

### Phase 1: Test AI (5 minutes)
```powershell
# 1. Configure credentials (.env file)
# 2. Install package
npm install openai

# 3. Test on 100 customers
node scripts/test-ai-small.js
```

### Phase 2: Review & Create (10 minutes)
```powershell
# 4. Review AI suggestions (printed on screen)
# 5. Create segments you like via API
curl -X POST http://localhost:8001/api/segments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High-Value Tech Buyers",
    "description": "...",
    "criteria": {...},
    "ai_generated": true
  }'
```

### Phase 3: Apply to All Customers (2 minutes)
```powershell
# 6. Apply segmentation to all 1000 customers
curl -X POST http://localhost:8001/api/segment/refresh

# 7. Check results
curl http://localhost:8001/api/metrics
```

### Phase 4: Generate Marketing Messages (Optional)
```powershell
# AI writes personalized marketing copy for each segment
curl -X POST http://localhost:8001/api/segments/1/generate-message \
  -H "Content-Type: application/json" \
  -d '{"campaignType": "email"}'
```

---

## 🔥 Cost Estimates

### OpenAI (Pay-as-you-go)
- **100 customers test**: ~$0.05 (5 cents)
- **1000 customers full**: ~$0.50 (50 cents)
- **GPT-3.5-turbo**: $0.50 per 1M input tokens
- **GPT-4**: $30 per 1M input tokens (60x more expensive)

**Recommendation**: Start with GPT-3.5-turbo, upgrade to GPT-4 if you need smarter analysis

### Azure OpenAI
- **Standard S0**: $1.00 per 1,000 tokens
- **Same costs as OpenAI** + enterprise features
- **Plus**: Azure gives you $200 free credit if new account

---

## ❓ Troubleshooting

### "Cannot find module 'openai'"
```powershell
npm install openai
```

### "AI NOT CONFIGURED"
Check your `.env` file has:
- **For OpenAI**: `OPENAI_API_KEY=sk-...`
- **For Azure**: All 3 variables (ENDPOINT, KEY, DEPLOYMENT)

### "Invalid API key"
- OpenAI: Check key starts with `sk-` and is copied correctly
- Azure: Check you copied KEY 1, not KEY 2

### "Model not found" (Azure)
- Check `AZURE_OPENAI_DEPLOYMENT` matches your deployment name exactly
- Go to Azure Portal → Model deployments to verify

### AI Returns Bad JSON
- Try GPT-4 instead of GPT-3.5-turbo (more reliable JSON)
- Script has markdown cleanup code, but sometimes AI adds extra text

---

## 🎬 Next Steps

1. **Run the test**: `node scripts/test-ai-small.js`
2. **Review suggestions**: Look at the 3-5 segments AI created
3. **Pick winners**: Choose which segments make sense for your business
4. **Create segments**: Use the API to create them
5. **Apply to all**: Run refresh endpoint to assign all 1000 customers
6. **Check metrics**: See segment distribution at `/api/metrics`
7. **Deploy**: Push to Azure and update dashboard

---

## 📚 Related Docs
- `API_TESTING_GUIDE.md` - All API endpoints
- `SEGMENTATION_METHOD_EXPLAINED.md` - How segmentation works
- `DEPLOYMENT_GUIDE_COMPLETE.md` - Deploy to Azure

---

**Questions?** Check the output of `test-ai-small.js` - it tells you exactly what's missing!
