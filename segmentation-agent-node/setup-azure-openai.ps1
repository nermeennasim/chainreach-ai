# Azure OpenAI Setup Script
# Run this in a NEW PowerShell window (restart PowerShell first)

Write-Host "ChainReach Azure OpenAI Setup" -ForegroundColor Cyan
Write-Host ("=" * 60)
Write-Host ""

# Add Azure CLI to PATH if not already there
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    $env:Path += ";C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin"
}

# Variables
$resourceGroup = "chainreach-ai-rg"
$location = "eastus"
$openaiName = "chainreach-openai"
$deploymentName = "gpt-35-turbo-deployment"
$modelName = "gpt-35-turbo"
$modelVersion = "0125"

# Step 1: Login to Azure
Write-Host "Step 1: Logging into Azure with device code..." -ForegroundColor Yellow
Write-Host "A browser will open or you'll get a code to enter at https://microsoft.com/devicelogin" -ForegroundColor Gray
Write-Host ""
az login --use-device-code

if ($LASTEXITCODE -ne 0) {
    Write-Host "Azure login failed. Please try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Show current subscription
Write-Host "Step 2: Current Azure Subscription:" -ForegroundColor Yellow
az account show --query "{Name:name, SubscriptionId:id}" -o table
Write-Host ""

$confirm = Read-Host "Is this the correct subscription? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Run: az account list" -ForegroundColor Yellow
    Write-Host "Then: az account set --subscription <subscription-id>" -ForegroundColor Yellow
    exit 0
}

# Step 3: Create Resource Group (if doesn't exist)
Write-Host "Step 3: Creating resource group '$resourceGroup'..." -ForegroundColor Yellow
az group create --name $resourceGroup --location $location --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Resource group ready!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Resource group might already exist (that's OK)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Create Azure OpenAI Resource
Write-Host "Step 4: Creating Azure OpenAI resource '$openaiName'..." -ForegroundColor Yellow
Write-Host "⏳ This takes 2-3 minutes..." -ForegroundColor Gray

az cognitiveservices account create `
    --name $openaiName `
    --resource-group $resourceGroup `
    --kind OpenAI `
    --sku S0 `
    --location $location `
    --yes `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create Azure OpenAI resource" -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Name already taken - try: chainreach-openai-$((Get-Random -Maximum 9999))" -ForegroundColor Gray
    Write-Host "  2. Azure OpenAI not available in region - try: westeurope" -ForegroundColor Gray
    Write-Host "  3. Need approval - contact Azure admin" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Azure OpenAI resource created!" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy GPT-3.5-Turbo Model
Write-Host "Step 5: Deploying GPT-3.5-Turbo model..." -ForegroundColor Yellow
Write-Host "⏳ This takes 1-2 minutes..." -ForegroundColor Gray

az cognitiveservices account deployment create `
    --name $openaiName `
    --resource-group $resourceGroup `
    --deployment-name $deploymentName `
    --model-name $modelName `
    --model-version $modelVersion `
    --model-format OpenAI `
    --sku-capacity 30 `
    --sku-name Standard `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy model" -ForegroundColor Red
    Write-Host "Try manually via Azure OpenAI Studio" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GPT-3.5-Turbo deployed!" -ForegroundColor Green
Write-Host ""

# Step 6: Get Credentials
Write-Host "Step 6: Getting credentials..." -ForegroundColor Yellow

$endpoint = az cognitiveservices account show `
    --name $openaiName `
    --resource-group $resourceGroup `
    --query "properties.endpoint" `
    --output tsv

$key = az cognitiveservices account keys list `
    --name $openaiName `
    --resource-group $resourceGroup `
    --query "key1" `
    --output tsv

if ([string]::IsNullOrEmpty($endpoint) -or [string]::IsNullOrEmpty($key)) {
    Write-Host "❌ Failed to get credentials" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Credentials retrieved!" -ForegroundColor Green
Write-Host ""

# Step 7: Display Credentials
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "YOUR AZURE OPENAI CREDENTIALS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoint: " -NoNewline -ForegroundColor Yellow
Write-Host $endpoint -ForegroundColor White
Write-Host "Key: " -NoNewline -ForegroundColor Yellow
Write-Host $key -ForegroundColor White
Write-Host "Deployment: " -NoNewline -ForegroundColor Yellow
Write-Host $deploymentName -ForegroundColor White
Write-Host ""

# Step 8: Update .env file
Write-Host "Step 7: Updating .env file..." -ForegroundColor Yellow

$envPath = ".\..env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Update values
    $envContent = $envContent -replace "AZURE_OPENAI_ENDPOINT=.*", "AZURE_OPENAI_ENDPOINT=$endpoint"
    $envContent = $envContent -replace "AZURE_OPENAI_KEY=.*", "AZURE_OPENAI_KEY=$key"
    $envContent = $envContent -replace "AZURE_OPENAI_DEPLOYMENT=.*", "AZURE_OPENAI_DEPLOYMENT=$deploymentName"
    
    Set-Content $envPath $envContent
    
    Write-Host "✅ .env file updated!" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found at $envPath" -ForegroundColor Yellow
    Write-Host "Please manually add these to your .env file" -ForegroundColor Yellow
}
Write-Host ""

# Step 9: Test AI
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "READY TO TEST!" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
Write-Host "Run this command to test AI on 100 customers:" -ForegroundColor Yellow
Write-Host "  node scripts/test-ai-small.js" -ForegroundColor White
Write-Host ""

$runTest = Read-Host "Run test now? (y/n)"
if ($runTest -eq "y") {
    Write-Host ""
    Write-Host "Running AI test..." -ForegroundColor Cyan
    Write-Host ""
    node scripts/test-ai-small.js
}

Write-Host ""
Write-Host "✅ Setup complete! Your AI is ready." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review AI-suggested segments" -ForegroundColor Gray
Write-Host "  2. Create segments via API" -ForegroundColor Gray
Write-Host "  3. Apply to all 1000 customers" -ForegroundColor Gray
Write-Host "  4. Check results at /api/metrics" -ForegroundColor Gray
Write-Host ""
