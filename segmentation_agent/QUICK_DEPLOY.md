# 🚀 QUICK DEPLOY COMMANDS - Copy & Paste

## Prerequisites
```powershell
# Install Azure CLI if not installed
winget install -e --id Microsoft.AzureCLI

# Login
az login
```

---

## 🎯 DEPLOY NOW (Copy All Commands Below)

```powershell
# Navigate to project
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation_agent"

# 1. Create PostgreSQL Database
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

az postgres flexible-server db create `
  --resource-group chainreach-ai `
  --server-name chainreach-db `
  --database-name chainreach_prod

# 2. Create .env file
@"
DATABASE_URL=postgresql://dbadmin:<YOUR_DB_PASSWORD>@chainreach-db.postgres.database.azure.com:5432/chainreach_prod?sslmode=require
USE_CSV_FALLBACK=true
"@ | Out-File -FilePath .env -Encoding utf8

# 3. Install Python dependencies and migrate data
pip install -r requirements.txt
python migrate_csv_to_db.py

# 4. Create Container Registry
az acr create `
  --resource-group chainreach-ai `
  --name chainreachacr `
  --sku Basic `
  --admin-enabled true

# 5. Build and push Docker image
az acr build `
  --registry chainreachacr `
  --image segmentation-agent:v1 `
  --file Dockerfile .

# 6. Create Container Apps Environment
az containerapp env create `
  --name chainreach-env `
  --resource-group chainreach-ai `
  --location eastus

# 7. Deploy Container App
$DB_URL = "postgresql://dbadmin:<YOUR_DB_PASSWORD>@chainreach-db.postgres.database.azure.com:5432/chainreach_prod?sslmode=require"

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

# 8. Get your API URL
$API_URL = az containerapp show `
  --name segmentation-agent `
  --resource-group chainreach-ai `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "`n✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "🌐 API URL: https://$API_URL" -ForegroundColor Cyan

# 9. Test the API
curl "https://$API_URL/health"

curl -X POST "https://$API_URL/segment/customer" `
  -H "Content-Type: application/json" `
  -d '{"customer_id": 12347}'
```

---

## ⏱️ Total Time: ~25-35 minutes
## 💰 Total Cost: ~$17/month

---

## 📝 Save This URL
After deployment, save your API URL to update the dashboard later:
```
https://<your-app-name>.azurecontainerapps.io
```
