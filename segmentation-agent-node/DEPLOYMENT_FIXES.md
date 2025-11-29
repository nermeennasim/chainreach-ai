# ChainReach Segmentation Agent - Deployment Fixes

**Status**: ✅ **LOCAL SERVER RUNNING** - Port 3000

## What Was Fixed

### 1. ✅ Missing Dependencies (FIXED)
**Issue**: `'ts-node-dev' is not recognized`
**Solution**: Ran `npm install` to install all dependencies
**Result**: All 595 packages installed successfully

### 2. ✅ Port Conflict (FIXED)
**Issue**: Port 8001 was in use
**Solution**: Changed PORT in `.env` from 8001 to 3000
**Result**: Server now running on port 3000

### 3. ✅ Azure OpenAI Integration (VERIFIED)
**Status**: Azure OpenAI client is properly initialized
**Output**: `✅ Azure OpenAI client initialized`

### 4. ✅ Database Connection (VERIFIED)
**Status**: Successfully connected to PostgreSQL
**Output**: 
```
✅ Connected to PostgreSQL database
✅ Database connection test successful: 2025-11-28T06:29:26.668Z
```

---

## Quick Start - Local Development

### Start the Server
```powershell
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation-agent-node"
npm run dev
```

**Expected Output:**
```
 ========================================
 ChainReach Segmentation Agent Started
 ========================================
 Server running on port 3000
 Environment: development
 Health check: http://localhost:3000/health
 API docs: http://localhost:3000/
 ========================================
✅ Connected to PostgreSQL database
✅ Database connection test successful
```

### Test the API Locally
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3000/health"

# API root
Invoke-RestMethod -Uri "http://localhost:3000/"

# Status endpoint
Invoke-RestMethod -Uri "http://localhost:3000/status"

# Get segments
Invoke-RestMethod -Uri "http://localhost:3000/api/segments"

# Get customers
Invoke-RestMethod -Uri "http://localhost:3000/api/customers"
```

---

## Azure Deployment - Step by Step

### Prerequisites
- Azure CLI installed: `az login` first
- PowerShell 7+
- Node.js 18+
- PostgreSQL database already created in Azure

### Step 1: Update Environment Variables for Production

Edit `.env` to use production database and settings:

```powershell
# Update to Azure resources
DB_HOST=chainreach-db.postgres.database.azure.com
DB_NAME=chainreach_prod
PORT=8080  # Azure App Service uses 8080
NODE_ENV=production
```

### Step 2: Build the Application

```powershell
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation-agent-node"

# Build TypeScript
npm run build

# Verify dist folder created
dir dist
```

### Step 3: Create Azure Resources (One-Time Setup)

```powershell
# Set variables
$ResourceGroup = "chainreach-ai"
$Location = "eastus2"
$AppName = "chainreach-segmentation-node"
$PlanName = "chainreach-node-plan"

# Create Resource Group (if not exists)
az group create --name $ResourceGroup --location $Location

# Create App Service Plan
az appservice plan create `
  --name $PlanName `
  --resource-group $ResourceGroup `
  --sku B1 `
  --is-linux

# Create Web App
az webapp create `
  --resource-group $ResourceGroup `
  --plan $PlanName `
  --name $AppName `
  --runtime "NODE:18-lts"
```

### Step 4: Configure App Settings

```powershell
# Set all environment variables
az webapp config appsettings set `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --settings `
    NODE_ENV=production `
    PORT=8080 `
    DB_HOST=chainreach-db.postgres.database.azure.com `
    DB_PORT=5432 `
    DB_NAME=chainreach_prod `
    DB_USER=dbadmin `
    DB_PASSWORD=ChainReach2025! `
    DB_SSL=true `
    AZURE_OPENAI_ENDPOINT=https://nerme-mih8otmt-eastus2.cognitiveservices.azure.com/ `
    AZURE_OPENAI_KEY=5dyOUniBaQYZHA5Ttgv4ycPlOTm2AFdnXq4at9IA7pK9fx7SXOQUJQQJ99BKACHYHv6XJ3w3AAAAACOGfUQ6 `
    AZURE_OPENAI_DEPLOYMENT=gpt-4o `
    AZURE_OPENAI_API_VERSION=2024-04-01-preview `
    ALLOWED_ORIGINS=https://chainreach-segmentation-node.azurewebsites.net,https://your-dashboard.azurewebsites.net
```

### Step 5: Deploy the Application

#### Option A: Deploy Using ZIP File (Recommended)

```powershell
# Create deployment package
Compress-Archive -Path dist, package.json, package-lock.json -DestinationPath deploy.zip -Force

# Deploy
az webapp deploy `
  --resource-group chainreach-ai `
  --name chainreach-segmentation-node `
  --src-path deploy.zip `
  --type zip
```

#### Option B: Deploy Using Docker

```powershell
# Build Docker image
docker build -t chainreach-segmentation-node:latest .

# Tag for Azure Container Registry (if using ACR)
docker tag chainreach-segmentation-node:latest chainreachacr.azurecr.io/segmentation-agent-node:latest

# Push to ACR
az acr login --name chainreachacr
docker push chainreachacr.azurecr.io/segmentation-agent-node:latest
```

### Step 6: Verify Deployment

```powershell
# Check deployment status
az webapp show --resource-group chainreach-ai --name chainreach-segmentation-node

# Test health endpoint
Invoke-RestMethod -Uri "https://chainreach-segmentation-node.azurewebsites.net/health"

# View logs
az webapp log tail --resource-group chainreach-ai --name chainreach-segmentation-node
```

---

## Troubleshooting

### Issue: Server won't start locally

**Solution:**
```powershell
# Clear everything
Remove-Item -r -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### Issue: Port already in use

**Solution:**
```powershell
# Find and kill process on port 3000
$process = netstat -ano | Select-String ":3000"
if ($process) { 
  $pid = $process -split '\s+' | Select-Object -Last 1
  taskkill /PID $pid /F
}
```

### Issue: Database connection fails

**Check:**
1. Is Azure PostgreSQL database running?
2. Are credentials correct?
3. Is SSL configured? (Set `DB_SSL=true`)

```powershell
# Test connection
psql "host=chainreach-db.postgres.database.azure.com port=5432 dbname=chainreach_prod user=dbadmin sslmode=require"
```

### Issue: Azure deployment fails

**Check logs:**
```powershell
az webapp log tail --resource-group chainreach-ai --name chainreach-segmentation-node
```

**Common causes:**
- Missing environment variables
- Database not accessible from Azure
- Node.js version mismatch

### Issue: Azure OpenAI not working

**Check:**
1. Endpoint URL format: Should end with `/`
2. API key is valid and not expired
3. Deployment name matches (`gpt-4o`)
4. API version is correct

---

## API Endpoints

### Health & Status
- `GET /health` - Simple health check
- `GET /status` - Detailed status with database info
- `GET /metrics` - Customer and segment metrics
- `GET /` - API documentation

### Segments
- `GET /api/segments` - List all segments
- `GET /api/segments/:id` - Get segment details
- `POST /api/segment/analyze` - Analyze customers
- `POST /api/segment/refresh` - Refresh segments

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers?segment_id={id}` - Customers in segment

---

## Environment Variables Reference

| Variable | Local | Production | Required |
|----------|-------|-----------|----------|
| `NODE_ENV` | `development` | `production` | ✅ |
| `PORT` | `3000` | `8080` | ✅ |
| `DB_HOST` | `localhost` | Azure host | ✅ |
| `DB_PORT` | `5432` | `5432` | ✅ |
| `DB_NAME` | `chainreach_db` | `chainreach_prod` | ✅ |
| `DB_USER` | `postgres` | `dbadmin` | ✅ |
| `DB_PASSWORD` | Your password | Your password | ✅ |
| `DB_SSL` | `false` | `true` | ✅ |
| `AZURE_OPENAI_ENDPOINT` | Your endpoint | Your endpoint | ⚠️ |
| `AZURE_OPENAI_KEY` | Your key | Your key | ⚠️ |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` | `gpt-4o` | ⚠️ |

---

## File Structure

```
segmentation-agent-node/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── config/
│   │   ├── aiClient.ts        # Azure OpenAI client
│   │   ├── azure.ts           # Azure config
│   │   └── database.ts        # PostgreSQL connection
│   ├── controllers/           # API handlers
│   ├── models/                # Data models
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   └── middleware/            # Express middleware
├── scripts/
│   └── init-db.sql            # Database schema
├── dist/                      # Compiled JavaScript (generated)
├── .env                       # Environment variables
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── Dockerfile                # Docker image definition
└── deploy-azure.ps1          # Azure deployment script
```

---

## Next Steps

1. ✅ **Local Development**: Server running on http://localhost:3000
2. **Test API**: Use endpoints listed above
3. **Azure Deployment**: Follow steps above to deploy
4. **Integrate with Dashboard**: Update `person5-orchestrator-dashboard` to use new API URL
5. **Monitor**: Set up Application Insights for production

---

## Support

For issues, check:
1. `.env` file configuration
2. Azure resource logs
3. Database connectivity
4. Azure OpenAI credentials

