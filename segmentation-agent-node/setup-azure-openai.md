# 🚀 Azure OpenAI Setup (8 Minutes)

## Why Azure OpenAI for ChainReach?
- ✅ You already have Azure PostgreSQL (chainreach-db)
- ✅ Same subscription = easier billing
- ✅ Enterprise-grade security (GDPR, SOC 2)
- ✅ Better for production deployment
- ✅ Private network integration

## Step-by-Step Setup

### 1️⃣ Create Azure OpenAI Resource (3 minutes)

**Via Azure Portal**:
```
1. Go to portal.azure.com
2. Click "+ Create a resource"
3. Search "Azure OpenAI"
4. Click "Create"

Fill in:
- Subscription: (Same as your PostgreSQL)
- Resource Group: (Same as chainreach-db or create "chainreach-ai-rg")
- Region: East US (best GPT-4 availability)
- Name: chainreach-openai
- Pricing Tier: Standard S0

5. Click "Review + Create"
6. Wait ~2 minutes for deployment
```

**Via Azure CLI** (faster):
```bash
# Login
az login

# Create resource group (if needed)
az group create --name chainreach-ai-rg --location eastus

# Create Azure OpenAI
az cognitiveservices account create \
  --name chainreach-openai \
  --resource-group chainreach-ai-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus
```

### 2️⃣ Deploy GPT Model (2 minutes)

**Via Azure Portal**:
```
1. Open your "chainreach-openai" resource
2. Go to "Model deployments" → Click "Manage Deployments"
   (Opens Azure OpenAI Studio)
3. Click "+ Create new deployment"
4. Fill in:
   - Select model: gpt-35-turbo (recommended for cost)
     OR gpt-4 (smarter, 60x more expensive)
   - Deployment name: gpt-35-turbo-deployment
   - Model version: 0125 (latest)
   - Deployment type: Standard
   - Tokens per minute rate limit: 30K (enough for testing)
5. Click "Create"
```

**Via Azure CLI**:
```bash
# Deploy GPT-3.5-turbo (recommended)
az cognitiveservices account deployment create \
  --name chainreach-openai \
  --resource-group chainreach-ai-rg \
  --deployment-name gpt-35-turbo-deployment \
  --model-name gpt-35-turbo \
  --model-version "0125" \
  --model-format OpenAI \
  --sku-capacity 30 \
  --sku-name Standard
```

### 3️⃣ Get Credentials (1 minute)

**Via Azure Portal**:
```
1. In your "chainreach-openai" resource
2. Go to "Keys and Endpoint" (left sidebar)
3. Copy:
   - KEY 1: (like 1234567890abcdef...)
   - Endpoint: (like https://chainreach-openai.openai.azure.com/)
```

**Via Azure CLI**:
```bash
# Get endpoint
az cognitiveservices account show \
  --name chainreach-openai \
  --resource-group chainreach-ai-rg \
  --query properties.endpoint

# Get key
az cognitiveservices account keys list \
  --name chainreach-openai \
  --resource-group chainreach-ai-rg \
  --query key1
```

### 4️⃣ Update .env File (30 seconds)

Open `segmentation-agent-node/.env` and replace:

**BEFORE**:
```env
AZURE_OPENAI_ENDPOINT=https://your-openai.openai.azure.com/
AZURE_OPENAI_KEY=your-azure-openai-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

**AFTER**:
```env
AZURE_OPENAI_ENDPOINT=https://chainreach-openai.openai.azure.com/
AZURE_OPENAI_KEY=1234567890abcdef...  # Your KEY 1 from Azure
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo-deployment
```

### 5️⃣ Test AI (1 minute)

```powershell
cd segmentation-agent-node
node scripts/test-ai-small.js
```

**Expected Output**:
```
🧪 Testing AI Segmentation with 100 customers...
📊 Fetching 100 sample customers...
✅ Fetched 100 customers

🤖 Calling Azure OpenAI...

✅ AI Analysis Complete!

============================================================
AI-SUGGESTED SEGMENTS
============================================================

1. Premium Enterprise Accounts
   Description: Large companies with exceptional revenue
   Estimated Size: 12% (~12 of sampled customers)
   Marketing Strategy: VIP treatment with dedicated account managers
   Criteria: {
     "min_total_purchases": 15000,
     "min_engagement_score": 75,
     "min_employee_count": 200
   }

...
```

---

## 💰 Cost Estimate

### GPT-3.5-Turbo (Recommended)
- **Input**: $0.50 per 1M tokens
- **Output**: $1.50 per 1M tokens
- **100 customers test**: ~$0.05 (5 cents)
- **1000 customers**: ~$0.50 (50 cents)

### GPT-4 (If you need smarter analysis)
- **Input**: $30 per 1M tokens (60x more!)
- **Output**: $60 per 1M tokens
- **100 customers test**: ~$2.50
- **1000 customers**: ~$25

**Recommendation**: Start with GPT-3.5-Turbo. It's 98% as good for segmentation at 1.6% of the cost.

---

## 🎯 After Setup

Once Azure OpenAI is configured, you can:

### 1. Test on 100 customers (small chunk)
```powershell
node scripts/test-ai-small.js
```

### 2. Create segments from AI suggestions
```powershell
# Use the output from test-ai-small.js
# Copy the criteria and create via API
curl -X POST http://localhost:8001/api/segments -H "Content-Type: application/json" -d '{
  "name": "Premium Enterprise Accounts",
  "description": "Large companies with exceptional revenue",
  "criteria": {
    "min_total_purchases": 15000,
    "min_engagement_score": 75
  },
  "ai_generated": true
}'
```

### 3. Apply to all 1000 customers
```powershell
curl -X POST http://localhost:8001/api/segment/refresh
```

### 4. Check results
```powershell
curl http://localhost:8001/api/metrics
```

---

## 🔐 Security Best Practices

### For Development (.env file)
```env
AZURE_OPENAI_ENDPOINT=https://chainreach-openai.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
```

### For Production (Azure App Service)
```powershell
# Set as App Service environment variables
az webapp config appsettings set \
  --name chainreach-segmentation \
  --resource-group chainreach-ai-rg \
  --settings \
    AZURE_OPENAI_ENDPOINT="https://chainreach-openai.openai.azure.com/" \
    AZURE_OPENAI_KEY="your-key-here" \
    AZURE_OPENAI_DEPLOYMENT="gpt-35-turbo-deployment"
```

**NEVER** commit your `.env` file to git!

---

## ❓ Troubleshooting

### "Azure OpenAI resource not available in my region"
Try these regions in order:
1. East US (best availability)
2. West Europe
3. Sweden Central
4. Canada East

### "I don't have permission to create Azure OpenAI"
- Check with your Azure admin
- Some organizations require approval for AI services
- Alternative: Use regular OpenAI API temporarily

### "Deployment failed - quota exceeded"
- You might need to request quota increase
- Go to Azure OpenAI Studio → Quotas
- Or start with lower TPM (tokens per minute): 10K instead of 30K

### "401 Unauthorized" when testing
- Check your API key is copied exactly (no spaces)
- Verify endpoint ends with `/` 
- Make sure deployment name matches exactly

---

## 🚀 Quick Commands Reference

```powershell
# Create resource
az cognitiveservices account create --name chainreach-openai --resource-group chainreach-ai-rg --kind OpenAI --sku S0 --location eastus

# Deploy model
az cognitiveservices account deployment create --name chainreach-openai --resource-group chainreach-ai-rg --deployment-name gpt-35-turbo-deployment --model-name gpt-35-turbo --model-version "0125" --model-format OpenAI --sku-capacity 30 --sku-name Standard

# Get credentials
az cognitiveservices account show --name chainreach-openai --resource-group chainreach-ai-rg --query properties.endpoint
az cognitiveservices account keys list --name chainreach-openai --resource-group chainreach-ai-rg --query key1

# Test AI
node scripts/test-ai-small.js
```

---

## 📚 Next Steps

1. ✅ Setup Azure OpenAI (this guide)
2. ⏭️ Test AI on 100 customers
3. ⏭️ Review AI suggestions
4. ⏭️ Create chosen segments
5. ⏭️ Apply to all 1000 customers
6. ⏭️ Deploy to Azure App Service
7. ⏭️ Integrate with dashboard

See `AI_QUICKSTART.md` for the complete workflow after setup!
