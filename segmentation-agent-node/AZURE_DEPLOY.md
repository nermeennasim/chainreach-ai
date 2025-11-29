# ChainReach Segmentation Agent - Azure Deployment Guide

## Prerequisites

- Azure CLI installed and logged in
- Azure subscription with appropriate permissions
- PostgreSQL database (Azure Database for PostgreSQL or existing)

## Step 1: Create Azure Resources

### Create Resource Group (if not exists)
```powershell
az group create `
  --name chainreach-ai `
  --location centralus
```

### Create Azure Database for PostgreSQL
```powershell
# Create PostgreSQL server
az postgres flexible-server create `
  --name chainreach-db-node `
  --resource-group chainreach-ai `
  --location centralus `
  --admin-user dbadmin `
  --admin-password "<YOUR_DB_ADMIN_PASSWORD>" `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 15

# Create database
az postgres flexible-server db create `
  --resource-group chainreach-ai `
  --server-name chainreach-db-node `
  --database-name chainreach_db

# Allow Azure services
az postgres flexible-server firewall-rule create `
  --resource-group chainreach-ai `
  --name chainreach-db-node `
  --rule-name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0
```

### Initialize Database Schema
```powershell
# Connect and run init script
psql "host=chainreach-db-node.postgres.database.azure.com port=5432 dbname=chainreach_db user=dbadmin password=<YOUR_DB_PASSWORD> sslmode=require" -f scripts/init-db.sql
```

## Step 2: Build Application

```powershell
cd segmentation-agent-node

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create deployment package
Compress-Archive -Path dist,package.json,package-lock.json -DestinationPath deploy.zip -Force
```

## Step 3: Deploy to Azure App Service

### Create App Service Plan
```powershell
az appservice plan create `
  --name chainreach-node-plan `
  --resource-group chainreach-ai `
  --sku B1 `
  --is-linux
```

### Create Web App
```powershell
az webapp create `
  --resource-group chainreach-ai `
  --plan chainreach-node-plan `
  --name chainreach-segmentation-node `
  --runtime "NODE:18-lts"
```

### Configure Application Settings
```powershell
az webapp config appsettings set `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --settings `
    NODE_ENV=production `
    PORT=8080 `
    DB_HOST="chainreach-db-node.postgres.database.azure.com" `
    DB_PORT=5432 `
    DB_NAME="chainreach_db" `
    DB_USER="dbadmin" `
    DB_PASSWORD="<YOUR_DB_PASSWORD>" `
    DB_SSL=true `
    AZURE_OPENAI_ENDPOINT="YOUR_ENDPOINT" `
    AZURE_OPENAI_KEY="YOUR_KEY" `
    AZURE_OPENAI_DEPLOYMENT="gpt-4" `
    RATE_LIMIT_WINDOW_MS=900000 `
    RATE_LIMIT_MAX_REQUESTS=100 `
    ALLOWED_ORIGINS="https://yourapp.azurewebsites.net,http://localhost:3000"
```

### Configure Startup Command
```powershell
az webapp config set `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --startup-file "node dist/app.js"
```

### Deploy Application
```powershell
az webapp deploy `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --src-path deploy.zip `
  --type zip
```

## Step 4: Verify Deployment

```powershell
# Check health
Invoke-RestMethod -Uri "https://chainreach-segmentation-node.azurewebsites.net/health"

# Test API
Invoke-RestMethod -Uri "https://chainreach-segmentation-node.azurewebsites.net/api/segments"
```

## Step 5: Configure CORS for Dashboard

```powershell
az webapp cors add `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --allowed-origins "https://your-dashboard.azurewebsites.net"
```

## Alternative: Docker Deployment to Container Apps

### Build and Push Docker Image
```powershell
# Login to ACR
az acr login --name chainreachacr

# Build image
docker build -t chainreachacr.azurecr.io/segmentation-agent-node:v1 .

# Push image
docker push chainreachacr.azurecr.io/segmentation-agent-node:v1
```

### Deploy to Container Apps
```powershell
az containerapp create `
  --name segmentation-agent-node `
  --resource-group chainreach-ai `
  --image chainreachacr.azurecr.io/segmentation-agent-node:v1 `
  --target-port 8001 `
  --ingress external `
  --registry-server chainreachacr.azurecr.io `
  --environment chainreach-env `
  --cpu 0.5 --memory 1.0Gi `
  --min-replicas 1 --max-replicas 3 `
  --env-vars `
    DB_HOST="chainreach-db-node.postgres.database.azure.com" `
    DB_PORT=5432 `
    DB_NAME="chainreach_db" `
    DB_USER="dbadmin" `
    DB_PASSWORD="<YOUR_DB_PASSWORD>" `
    DB_SSL=true `
    AZURE_OPENAI_ENDPOINT="YOUR_ENDPOINT" `
    AZURE_OPENAI_KEY="YOUR_KEY"
```

## Monitoring

### View Logs
```powershell
az webapp log tail `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node
```

### Enable Application Insights
```powershell
az monitor app-insights component create `
  --app chainreach-segmentation-insights `
  --location centralus `
  --resource-group chainreach-ai

# Get instrumentation key
$INSIGHTS_KEY = az monitor app-insights component show `
  --app chainreach-segmentation-insights `
  --resource-group chainreach-ai `
  --query instrumentationKey -o tsv

# Add to app settings
az webapp config appsettings set `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --settings AZURE_APP_INSIGHTS_KEY=$INSIGHTS_KEY
```

## Troubleshooting

### Check Application Logs
```powershell
az webapp log download `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --log-file logs.zip
```

### Restart Application
```powershell
az webapp restart `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node
```

### Test Database Connection
```bash
psql "host=chainreach-db-node.postgres.database.azure.com port=5432 dbname=chainreach_db user=dbadmin password=<YOUR_DB_PASSWORD> sslmode=require" -c "SELECT NOW();"
```

## Cost Optimization

- **B1 App Service Plan**: ~$13/month
- **B1ms PostgreSQL**: ~$12/month
- **Total**: ~$25/month

## Next Steps

1. Import your customer data using the API
2. Run AI-powered segmentation analysis
3. Integrate with person5-orchestrator-dashboard
4. Configure Agent 2 (RAG) to use segment data
5. Set up monitoring and alerts

## API Endpoint

Your deployed API will be available at:
```
https://chainreach-segmentation-node.azurewebsites.net
```

Update your dashboard configuration to use this URL.
