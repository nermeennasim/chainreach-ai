# Deploy Segmentation Agent to Azure App Service (No Docker Required)
# Run this script from the segmentation_agent folder

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Segmentation Agent to Azure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Create ZIP file for deployment
Write-Host "Creating deployment package..." -ForegroundColor Yellow
$zipPath = "deploy.zip"
Compress-Archive -Path * -DestinationPath $zipPath -Force
Write-Host "Package created: $zipPath" -ForegroundColor Green
Write-Host ""

# 2. Deploy to Azure App Service
Write-Host "Deploying to Azure App Service..." -ForegroundColor Yellow
az webapp deployment source config-zip `
    --resource-group chainreach-ai `
    --name chainreach-segmentation `
    --src $zipPath

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""

# 3. Configure environment variables
Write-Host "Configuring environment variables..." -ForegroundColor Yellow
$DB_URL = "postgresql://dbadmin:ChainReach2025!@chainreach-db.postgres.database.azure.com:5432/chainreach_prod?sslmode=require"

az webapp config appsettings set `
    --resource-group chainreach-ai `
    --name chainreach-segmentation `
    --settings `
        DATABASE_URL="$DB_URL" `
        USE_CSV_FALLBACK="true" `
        SCM_DO_BUILD_DURING_DEPLOYMENT="true" `
        ENABLE_ORYX_BUILD="true"

Write-Host "Environment configured" -ForegroundColor Green
Write-Host ""

# 4. Get the URL
Write-Host "Getting your API URL..." -ForegroundColor Yellow
$url = az webapp show --resource-group chainreach-ai --name chainreach-segmentation --query defaultHostName -o tsv
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API URL: https://$url" -ForegroundColor White
Write-Host ""
Write-Host "Test endpoints:" -ForegroundColor Yellow
Write-Host "  Health: https://$url/health" -ForegroundColor White
Write-Host "  Manual: https://$url/segment/manual" -ForegroundColor White
Write-Host "  Customer: https://$url/segment/customer" -ForegroundColor White
Write-Host "  Batch: https://$url/api/segment" -ForegroundColor White
Write-Host ""

# Cleanup
Remove-Item $zipPath -Force
