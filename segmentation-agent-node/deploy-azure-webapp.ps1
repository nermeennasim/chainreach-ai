# ChainReach Segmentation Agent - Azure Web App Deployment
# Deploys Node.js/TypeScript API to Azure App Service

param(
    [string]$ResourceGroup = "chainreach-ai",
    [string]$Location = "eastus2",
    [string]$AppName = "chainreach-segmentation-node",
    [string]$PlanName = "chainreach-node-plan"
)

Write-Host ""
Write-Host "=========================================="
Write-Host "ChainReach - Azure Web App Deployment"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Check Azure CLI" -ForegroundColor Yellow
$account = az account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Not logged in to Azure" -ForegroundColor Red
    Write-Host "Run: az login" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Logged in" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 2: Build Application" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build successful" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 3: Create Resource Group" -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location
Write-Host "[OK] Resource group ready" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 4: Create App Service Plan" -ForegroundColor Yellow
az appservice plan create --name $PlanName --resource-group $ResourceGroup --sku B1 --is-linux
Write-Host "[OK] App Service Plan ready" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 5: Create Web App" -ForegroundColor Yellow
az webapp create --resource-group $ResourceGroup --plan $PlanName --name $AppName --runtime "NODE:18-lts"
Write-Host "[OK] Web App created" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 6: Configure Settings" -ForegroundColor Yellow
$settings = @(
    "NODE_ENV=production",
    "PORT=8080",
    "DB_HOST=chainreach-db.postgres.database.azure.com",
    "DB_PORT=5432",
    "DB_NAME=chainreach_prod",
    "DB_USER=dbadmin",
    "DB_PASSWORD=ChainReach2025!",
    "DB_SSL=true",
    "AZURE_OPENAI_ENDPOINT=https://nerme-mih8otmt-eastus2.cognitiveservices.azure.com/",
    "AZURE_OPENAI_KEY=5dyOUniBaQYZHA5Ttgv4ycPlOTm2AFdnXq4at9IA7pK9fx7SXOQUJQQJ99BKACHYHv6XJ3w3AAAAACOGfUQ6",
    "AZURE_OPENAI_DEPLOYMENT=gpt-4o",
    "AZURE_OPENAI_API_VERSION=2024-04-01-preview",
    "WEBSITE_NODE_DEFAULT_VERSION=18.20.0"
)

az webapp config appsettings set --resource-group $ResourceGroup --name $AppName --settings $settings
Write-Host "[OK] Settings configured" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 7: Set Startup Command" -ForegroundColor Yellow
az webapp config set --resource-group $ResourceGroup --name $AppName --startup-file "node dist/app.js"
Write-Host "[OK] Startup command set" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 8: Enable Logging" -ForegroundColor Yellow
az webapp log config --name $AppName --resource-group $ResourceGroup --application-logging filesystem --level information
Write-Host "[OK] Logging enabled" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 9: Create Deployment Package" -ForegroundColor Yellow
if (Test-Path "deploy.zip") {
    Remove-Item "deploy.zip" -Force
}
Compress-Archive -Path dist, node_modules, package.json, package-lock.json -DestinationPath deploy.zip -Force
Write-Host "[OK] Package ready" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 10: Deploy to Azure" -ForegroundColor Yellow
az webapp deploy --resource-group $ResourceGroup --name $AppName --src-path deploy.zip --type zip
Write-Host "[OK] Deployment uploaded" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================="
Write-Host "DEPLOYMENT COMPLETE"
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your API: https://$AppName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "Health: https://$AppName.azurewebsites.net/health" -ForegroundColor Cyan
Write-Host "Logs: az webapp log tail --resource-group $ResourceGroup --name $AppName" -ForegroundColor Green
Write-Host ""
