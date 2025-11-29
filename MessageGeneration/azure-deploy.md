# Message Generation API (.NET) - Azure Deployment Guide

## Prerequisites
- .NET 10 SDK installed
- Azure CLI installed
- Azure subscription

---

## Option 1: Azure App Service (RECOMMENDED for .NET)

### Step-by-Step Deployment

#### 1. Login to Azure
```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

#### 2. Create Resource Group (if not exists)
```bash
az group create \
  --name rg-chainreach-agents \
  --location eastus
```

#### 3. Create App Service Plan
```bash
az appservice plan create \
  --name chainreach-plan \
  --resource-group rg-chainreach-agents \
  --sku B1 \
  --is-linux
```

#### 4. Create Web App
```bash
az webapp create \
  --resource-group rg-chainreach-agents \
  --plan chainreach-plan \
  --name chainreach-messagegen \
  --runtime "DOTNETCORE:10.0"
```

#### 5. Configure Environment Variables (if needed)
```bash
az webapp config appsettings set \
  --resource-group rg-chainreach-agents \
  --name chainreach-messagegen \
  --settings \
    OPENAI_API_KEY="your-key-here" \
    ASPNETCORE_ENVIRONMENT="Production"
```

#### 6. Deploy from Local
```bash
# Navigate to MessageGeneration folder
cd MessageGeneration

# Publish the application
dotnet publish -c Release -o ./publish

# Create deployment package
cd publish
Compress-Archive -Path * -DestinationPath ../deploy.zip -Force
cd ..

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group rg-chainreach-agents \
  --name chainreach-messagegen \
  --src deploy.zip
```

#### 7. Get the URL
```bash
echo "https://chainreach-messagegen.azurewebsites.net"
```

---

## Option 2: Azure Container Apps (Lower Cost)

### Step 1: Create Dockerfile
```dockerfile
# Create this file: MessageGeneration/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy csproj and restore
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "MessageGeneration.dll"]
```

### Step 2: Build and Push to ACR
```bash
# Login to ACR
az acr login --name chainreachacr

# Build and push
az acr build \
  --registry chainreachacr \
  --image message-generation:latest \
  --file Dockerfile .
```

### Step 3: Deploy Container App
```bash
# Get ACR password
ACR_PASSWORD=$(az acr credential show --name chainreachacr --query "passwords[0].value" -o tsv)

# Create container app (if environment exists)
az containerapp create \
  --name message-generation \
  --resource-group rg-chainreach-agents \
  --environment chainreach-env \
  --image chainreachacr.azurecr.io/message-generation:latest \
  --registry-server chainreachacr.azurecr.io \
  --registry-username chainreachacr \
  --registry-password $ACR_PASSWORD \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1.0Gi
```

---

## Testing the Deployed API

### Health Check
```bash
# Replace with your actual URL
curl https://chainreach-messagegen.azurewebsites.net/health

# Or for Container Apps
curl https://YOUR_CONTAINER_APP_URL/health
```

### Test Message Generation Endpoint
```bash
curl -X POST https://chainreach-messagegen.azurewebsites.net/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "segment": "High Value Customers",
    "template": "Welcome message",
    "customer_data": {
      "name": "John Doe",
      "rfm_score": "555"
    }
  }'
```

---

## Local Testing Before Deployment

### Run Locally
```bash
cd MessageGeneration
dotnet restore
dotnet run
```

### Test with curl
```bash
curl http://localhost:5000/health
```

### Test with Docker Locally
```bash
docker build -t message-gen:local -f Dockerfile .
docker run -p 8080:8080 message-gen:local
curl http://localhost:8080/health
```

---

## Environment Variables

Set these in Azure if needed:
```bash
az webapp config appsettings set \
  --resource-group rg-chainreach-agents \
  --name chainreach-messagegen \
  --settings \
    OPENAI_API_KEY="your-openai-key" \
    OPENAI_MODEL="gpt-4" \
    MAX_TOKENS="500"
```

---

## Cost Comparison

### App Service B1
- **Cost:** ~$13/month
- **Always On:** Yes
- **Best for:** Production apps with consistent traffic

### Container Apps
- **Cost:** ~$0 when idle, pay-per-use
- **Scales to Zero:** Yes
- **Best for:** Development/testing, intermittent traffic

---

## Monitoring

### View Logs (App Service)
```bash
az webapp log tail \
  --resource-group rg-chainreach-agents \
  --name chainreach-messagegen
```

### View Logs (Container Apps)
```bash
az containerapp logs show \
  --name message-generation \
  --resource-group rg-chainreach-agents \
  --follow
```

---

## CI/CD with GitHub Actions

### Create `.github/workflows/deploy-messagegen.yml`
```yaml
name: Deploy Message Generation API

on:
  push:
    branches: [main]
    paths:
      - 'MessageGeneration/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '10.0.x'
      
      - name: Publish
        run: |
          cd MessageGeneration
          dotnet publish -c Release -o ./publish
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: chainreach-messagegen
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./MessageGeneration/publish
```

---

## Troubleshooting

### Issue: App not starting
```bash
# Check logs
az webapp log tail --resource-group rg-chainreach-agents --name chainreach-messagegen

# Restart app
az webapp restart --resource-group rg-chainreach-agents --name chainreach-messagegen
```

### Issue: 500 errors
- Check environment variables are set
- Verify OPENAI_API_KEY is valid
- Check application logs

### Issue: Deployment fails
- Verify .NET 10 runtime is installed on Azure
- Check publish profile is correct
- Ensure all dependencies are included

---

## Next Steps
1. Deploy API to Azure
2. Test all endpoints
3. Update dashboard API config:
   ```typescript
   // lib/api/config.ts
   agent3: {
     url: 'https://chainreach-messagegen.azurewebsites.net',
     // ...
   }
   ```
4. Test integration with dashboard
5. Set up monitoring alerts
