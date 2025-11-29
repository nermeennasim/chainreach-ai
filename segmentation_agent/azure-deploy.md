# Segmentation Agent - Azure Deployment Guide

## Option 1: Azure Container Apps (RECOMMENDED - Cheapest)

### Prerequisites
- Azure CLI installed
- Docker installed locally
- Azure subscription

### Step-by-Step Deployment

#### 1. Login to Azure
```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

#### 2. Create Resource Group
```bash
az group create \
  --name rg-chainreach-agents \
  --location eastus
```

#### 3. Create Azure Container Registry (ACR)
```bash
az acr create \
  --resource-group rg-chainreach-agents \
  --name chainreachacr \
  --sku Basic \
  --admin-enabled true
```

#### 4. Build and Push Docker Image
```bash
# Navigate to segmentation_agent folder
cd segmentation_agent

# Login to ACR
az acr login --name chainreachacr

# Build and push image
az acr build \
  --registry chainreachacr \
  --image segmentation-agent:latest \
  --file Dockerfile .
```

#### 5. Create Container Apps Environment
```bash
az containerapp env create \
  --name chainreach-env \
  --resource-group rg-chainreach-agents \
  --location eastus
```

#### 6. Deploy Container App
```bash
# Get ACR password
ACR_PASSWORD=$(az acr credential show --name chainreachacr --query "passwords[0].value" -o tsv)

# Deploy the app
az containerapp create \
  --name segmentation-agent \
  --resource-group rg-chainreach-agents \
  --environment chainreach-env \
  --image chainreachacr.azurecr.io/segmentation-agent:latest \
  --registry-server chainreachacr.azurecr.io \
  --registry-username chainreachacr \
  --registry-password $ACR_PASSWORD \
  --target-port 5001 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1.0Gi
```

#### 7. Get the URL
```bash
az containerapp show \
  --name segmentation-agent \
  --resource-group rg-chainreach-agents \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

### Testing the Deployed API
```bash
# Replace YOUR_APP_URL with the FQDN from step 7
curl https://YOUR_APP_URL/health

# Test segmentation endpoint
curl -X POST https://YOUR_APP_URL/segment/manual \
  -H "Content-Type: application/json" \
  -d '{"recency": 10, "frequency": 15, "monetary": 5000}'
```

### Cost Estimation
- Container Apps: $0 when idle (scales to zero)
- When running: ~$0.00002/vCPU-second
- ACR Basic: ~$5/month
- **Total: ~$5-10/month**

---

## Option 2: Azure App Service (Alternative)

### Deploy using Azure App Service
```bash
# Create App Service Plan (Linux)
az appservice plan create \
  --name chainreach-plan \
  --resource-group rg-chainreach-agents \
  --is-linux \
  --sku B1

# Create Web App with container
az webapp create \
  --resource-group rg-chainreach-agents \
  --plan chainreach-plan \
  --name chainreach-segmentation \
  --deployment-container-image-name chainreachacr.azurecr.io/segmentation-agent:latest

# Configure container registry
az webapp config container set \
  --name chainreach-segmentation \
  --resource-group rg-chainreach-agents \
  --docker-registry-server-url https://chainreachacr.azurecr.io \
  --docker-registry-server-user chainreachacr \
  --docker-registry-server-password $ACR_PASSWORD

# Configure port
az webapp config appsettings set \
  --resource-group rg-chainreach-agents \
  --name chainreach-segmentation \
  --settings WEBSITES_PORT=5001
```

### Cost: ~$13/month for B1 tier

---

## Quick Local Test Before Deployment

```bash
# Build image locally
docker build -t segmentation-agent:local .

# Run container
docker run -p 5001:5001 segmentation-agent:local

# Test endpoints
curl http://localhost:5001/health
curl -X POST http://localhost:5001/segment/manual \
  -H "Content-Type: application/json" \
  -d '{"recency": 10, "frequency": 15, "monetary": 5000}'
```

---

## Environment Variables (if needed later)
Add these to your deployment if you need custom paths:
- MODEL_PATH
- SCALER_PATH  
- PROFILES_PATH
- RFM_PATH

---

## Next Steps After Deployment
1. Update dashboard API config with new URL
2. Test all endpoints
3. Monitor logs: `az containerapp logs show --name segmentation-agent --resource-group rg-chainreach-agents`
4. Set up CI/CD with GitHub Actions (optional)
