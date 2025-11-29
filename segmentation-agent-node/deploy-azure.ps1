pm i# Deploy to Azure - Automated Script
# Prerequisites: Azure CLI installed and logged in

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "chainreach-ai",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "centralus",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "chainreach-segmentation-node",
    
    [Parameter(Mandatory=$false)]
    [string]$PlanName = "chainreach-node-plan",
    
    [Parameter(Mandatory=$false)]
    [string]$DBServer = "chainreach-db-node",
    
    [Parameter(Mandatory=$false)]
    [string]$DBPassword = "<YOUR_DB_PASSWORD>",
    
    [Parameter(Mandatory=$false)]
    [string]$AzureOpenAIEndpoint = "",
    
    [Parameter(Mandatory=$false)]
    [string]$AzureOpenAIKey = ""
)

Write-Host "🚀 ChainReach Segmentation Agent - Azure Deployment" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to Azure
Write-Host "🔐 Checking Azure CLI login..." -ForegroundColor Yellow
$account = az account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Azure CLI" -ForegroundColor Red
    Write-Host "Please run: az login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Logged in to Azure" -ForegroundColor Green

# Build application
Write-Host ""
Write-Host "🏗️  Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

# Create deployment package
Write-Host ""
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "deploy.zip") {
    Remove-Item "deploy.zip"
}
Compress-Archive -Path dist,package.json,package-lock.json -DestinationPath deploy.zip -Force
Write-Host "✅ Deployment package created" -ForegroundColor Green

# Create App Service Plan if it doesn't exist
Write-Host ""
Write-Host "🔍 Checking App Service Plan..." -ForegroundColor Yellow
$planExists = az appservice plan show --name $PlanName --resource-group $ResourceGroup 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "📋 Creating App Service Plan..." -ForegroundColor Yellow
    az appservice plan create `
        --name $PlanName `
        --resource-group $ResourceGroup `
        --sku B1 `
        --is-linux
    Write-Host "✅ App Service Plan created" -ForegroundColor Green
} else {
    Write-Host "✅ App Service Plan exists" -ForegroundColor Green
}

# Create Web App if it doesn't exist
Write-Host ""
Write-Host "🔍 Checking Web App..." -ForegroundColor Yellow
$appExists = az webapp show --name $AppName --resource-group $ResourceGroup 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🌐 Creating Web App..." -ForegroundColor Yellow
    az webapp create `
        --resource-group $ResourceGroup `
        --plan $PlanName `
        --name $AppName `
        --runtime "NODE:18-lts"
    Write-Host "✅ Web App created" -ForegroundColor Green
} else {
    Write-Host "✅ Web App exists" -ForegroundColor Green
}

# Configure App Settings
Write-Host ""
Write-Host "⚙️  Configuring application settings..." -ForegroundColor Yellow

$settings = @(
    "NODE_ENV=production",
    "PORT=8080",
    "DB_HOST=$DBServer.postgres.database.azure.com",
    "DB_PORT=5432",
    "DB_NAME=chainreach_db",
    "DB_USER=dbadmin",
    "DB_PASSWORD=$DBPassword",
    "DB_SSL=true",
    "RATE_LIMIT_WINDOW_MS=900000",
    "RATE_LIMIT_MAX_REQUESTS=100",
    "ALLOWED_ORIGINS=https://$AppName.azurewebsites.net,http://localhost:3000"
)

if ($AzureOpenAIEndpoint) {
    $settings += "AZURE_OPENAI_ENDPOINT=$AzureOpenAIEndpoint"
}

if ($AzureOpenAIKey) {
    $settings += "AZURE_OPENAI_KEY=$AzureOpenAIKey"
}

az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --settings $settings

Write-Host "✅ Application settings configured" -ForegroundColor Green

# Configure startup command
Write-Host ""
Write-Host "🎯 Configuring startup command..." -ForegroundColor Yellow
az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --startup-file "node dist/app.js"
Write-Host "✅ Startup command configured" -ForegroundColor Green

# Deploy application
Write-Host ""
Write-Host "🚀 Deploying application..." -ForegroundColor Yellow
az webapp deploy `
    --resource-group $ResourceGroup `
    --name $AppName `
    --src-path deploy.zip `
    --type zip

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 Your API is available at:" -ForegroundColor White
    Write-Host "   https://$AppName.azurewebsites.net" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🧪 Test your deployment:" -ForegroundColor White
    Write-Host "   Invoke-RestMethod -Uri https://$AppName.azurewebsites.net/health" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📊 View logs:" -ForegroundColor White
    Write-Host "   az webapp log tail --resource-group $ResourceGroup --name $AppName" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check logs with:" -ForegroundColor Yellow
    Write-Host "az webapp log tail --resource-group $ResourceGroup --name $AppName" -ForegroundColor Gray
    exit 1
}
