# 🚀 Complete Deployment Guide: Segmentation Agent + PostgreSQL

## 📋 What You'll Deploy
- ✅ Azure PostgreSQL Flexible Server ($7/month)
- ✅ Azure Container Registry ($5/month)
- ✅ Azure Container Apps (Segmentation API, ~$5/month)
- 💰 **Total: ~$17/month**

---

## 🎯 STEP-BY-STEP DEPLOYMENT

### **STEP 1: Create .env file locally**

```powershell
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation_agent"

# Copy example to actual .env
Copy-Item .env.example .env
```

Edit `.env` and update `DATABASE_URL` (you'll get this in Step 3):
```env
DATABASE_URL=postgresql://dbadmin:YourPassword123!@chainreach-db.postgres.database.azure.com:5432/chainreach_prod?sslmode=require
```

---

### **STEP 2: Login to Azure**

```powershell
az login

# Verify your resource group
az group show --name chainreach-ai
```

---

### **STEP 3: Create PostgreSQL Database**

```powershell
# Create PostgreSQL Flexible Server
az postgres flexible-server create `
  --resource-group chainreach-ai `
  --name chainreach-db `
  --location eastus `
  --admin-user dbadmin `
  --admin-password "<YOUR_DB_ADMIN_PASSWORD>" `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 14 `
  --public-access 0.0.0.0-255.255.255.255 `
  --yes

# Create database
az postgres flexible-server db create `
  --resource-group chainreach-ai `
  --server-name chainreach-db `
  --database-name chainreach_prod

# Get connection details
az postgres flexible-server show `
  --resource-group chainreach-ai `
  --name chainreach-db `
  --query "fullyQualifiedDomainName" -o tsv
```

**📝 Connection String:**
```
postgresql://dbadmin:<YOUR_DB_PASSWORD>@chainreach-db.postgres.database.azure.com:5432/chainreach_prod?sslmode=require
```

⏱️ **Time:** 5-10 minutes | **Cost:** ~$7/month

---

### **STEP 4: Migrate CSV Data to PostgreSQL**

Update your `.env` file with the connection string from Step 3, then:

```powershell
# Install dependencies
pip install -r requirements.txt

# Run migration script
python migrate_csv_to_db.py
```

**Expected Output:**
```
✅ MIGRATION COMPLETE
📊 Total records in CSV: 4339
✅ Successfully inserted: 4339
⏭️ Skipped (duplicates): 0
❌ Errors: 0
✅ Database now contains 4339 customer records
```

⏱️ **Time:** 2-3 minutes

---

### **STEP 5: Test Locally with Database**

```powershell
# Run Flask app locally
python app.py
```

**Test in another terminal:**
```powershell
# Test health
curl http://localhost:5001/health

# Test with database lookup
curl -X POST http://localhost:5001/segment/customer `
  -H "Content-Type: application/json" `
  -d '{"customer_id": 12347}'

# Should return: "data_source": "database"
```

Press `Ctrl+C` to stop the local server.

⏱️ **Time:** 2 minutes

---

### **STEP 6: Create Azure Container Registry**

```powershell
az acr create `
  --resource-group chainreach-ai `
  --name chainreachacr `
  --sku Basic `
  --admin-enabled true

# Login to ACR
az acr login --name chainreachacr
```

⏱️ **Time:** 3 minutes | **Cost:** ~$5/month

---

### **STEP 7: Build and Push Docker Image**

```powershell
# Make sure you're in segmentation_agent folder
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation_agent"

# Build and push to ACR
az acr build `
  --registry chainreachacr `
  --image segmentation-agent:v1 `
  --file Dockerfile .
```

⏱️ **Time:** 5-7 minutes (first build is slower)

---

### **STEP 8: Create Container Apps Environment**

```powershell
az containerapp env create `
  --name chainreach-env `
  --resource-group chainreach-ai `
  --location eastus
```

⏱️ **Time:** 3-5 minutes

---

### **STEP 9: Deploy Container App with Database**

```powershell
# Get your database connection string
$DB_URL = "postgresql://dbadmin:<YOUR_DB_PASSWORD>@chainreach-db.postgres.database.azure.com:5432/chainreach_prod?sslmode=require"

# Deploy the app with environment variables
az containerapp create `
  --name segmentation-agent `
  --resource-group chainreach-ai `
  --environment chainreach-env `
  --image chainreachacr.azurecr.io/segmentation-agent:v1 `
  --target-port 5001 `
  --ingress external `
  --registry-server chainreachacr.azurecr.io `
  --min-replicas 0 `
  --max-replicas 3 `
  --cpu 0.5 `
  --memory 1.0Gi `
  --env-vars "DATABASE_URL=$DB_URL" "USE_CSV_FALLBACK=true"
```

⏱️ **Time:** 2-3 minutes | **Cost:** ~$5/month (scales to zero)

---

### **STEP 10: Get Your API URL**

```powershell
$API_URL = az containerapp show `
  --name segmentation-agent `
  --resource-group chainreach-ai `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "`n✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "🌐 API URL: https://$API_URL" -ForegroundColor Cyan
```

---

## 🧪 TEST YOUR DEPLOYED API

```powershell
# Test health
curl "https://$API_URL/health"

# Test manual segmentation
curl -X POST "https://$API_URL/segment/manual" `
  -H "Content-Type: application/json" `
  -d '{"recency": 10, "frequency": 15, "monetary": 5000}'

# Test customer lookup (should use database)
curl -X POST "https://$API_URL/segment/customer" `
  -H "Content-Type: application/json" `
  -d '{"customer_id": 12347}'

# Test batch segmentation
curl -X POST "https://$API_URL/api/segment" `
  -H "Content-Type: application/json" `
  -d '{"customer_count": 10}'
```

**Expected Response:**
```json
{
  "segment_id": 2,
  "segment_name": "High-Value Frequent",
  "data_source": "database",  // ✅ Confirms database is working!
  "confidence": 0.87,
  ...
}
```

---

## 📊 VERIFY DATABASE USAGE

Check Container App logs to confirm database connection:

```powershell
az containerapp logs show `
  --name segmentation-agent `
  --resource-group chainreach-ai `
  --follow
```

**Look for:**
```
✅ Database connected: chainreach-db.postgres.database.azure.com
✅ ML models loaded successfully
✅ CSV fallback loaded: 4339 customers
✅ Database tables created
```

---

## 💰 COST BREAKDOWN

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| PostgreSQL Flexible | B1ms, 32GB | ~$7 |
| Container Registry | Basic | ~$5 |
| Container Apps | 0.5 vCPU, 1GB RAM | ~$5 (scales to zero) |
| **TOTAL** | | **~$17/month** |

---

## 🎯 NEXT STEPS

1. ✅ Save your API URL: `https://$API_URL`
2. Update dashboard API config with this URL
3. Deploy Agent 3 (Message Generation)
4. Deploy Agent 2 (RAG Content)
5. Test full orchestration

---

## 🔧 TROUBLESHOOTING

### Database Connection Failed
```powershell
# Check database is running
az postgres flexible-server show --name chainreach-db --resource-group chainreach-ai

# Check firewall rules
az postgres flexible-server firewall-rule list --name chainreach-db --resource-group chainreach-ai
```

### App Using CSV Instead of Database
```powershell
# Check environment variables
az containerapp show `
  --name segmentation-agent `
  --resource-group chainreach-ai `
  --query properties.template.containers[0].env

# Update DATABASE_URL if wrong
az containerapp update `
  --name segmentation-agent `
  --resource-group chainreach-ai `
  --set-env-vars "DATABASE_URL=<new-connection-string>"
```

### View Logs
```powershell
az containerapp logs show `
  --name segmentation-agent `
  --resource-group chainreach-ai `
  --tail 100
```

---

## 🎉 SUCCESS CHECKLIST

- [ ] PostgreSQL database created
- [ ] CSV data migrated to database (4339 records)
- [ ] Docker image built and pushed
- [ ] Container App deployed
- [ ] API health check returns 200 OK
- [ ] Customer lookup returns `"data_source": "database"`
- [ ] Saved API URL for dashboard configuration

**When all checked, you're ready to deploy the next API!** 🚀
