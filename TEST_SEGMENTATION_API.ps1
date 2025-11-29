# Segmentation Agent API Test Script
# Tests against http://localhost:8001

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SEGMENTATION AGENT API TEST" -ForegroundColor Cyan
Write-Host "  Server: http://localhost:8001" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Wait for server to be ready
Start-Sleep -Seconds 2

# 1. Health Check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8001/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Health Check PASSED" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Service: $($health.service)" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host "❌ Health Check FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 2. Get All Segments
Write-Host "2️⃣  Fetching All Segments..." -ForegroundColor Yellow
try {
    $segments = Invoke-RestMethod -Uri "http://localhost:8001/api/segments" -TimeoutSec 5 -ErrorAction Stop
    $segmentCount = if ($segments -is [array]) { $segments.Count } else { 1 }
    Write-Host "✅ Segments Retrieved: $segmentCount segments found" -ForegroundColor Green
    Write-Host ""
    
    $segments | ForEach-Object {
        Write-Host "   📊 $($_.name)" -ForegroundColor Cyan
        Write-Host "      ID: $($_.id)" -ForegroundColor Gray
        Write-Host "      Description: $($_.description)" -ForegroundColor Gray
        Write-Host "      Customers: $($_.customer_count)" -ForegroundColor Yellow
        Write-Host "      Criteria: $($_.criteria | ConvertTo-Json -Compress)" -ForegroundColor DarkGray
        Write-Host ""
    }
    
    Write-Host "Full JSON Output:" -ForegroundColor Yellow
    $segments | ConvertTo-Json -Depth 10
    Write-Host ""
}
catch {
    Write-Host "❌ Failed to fetch segments: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 3. Get Customers (paginated)
Write-Host "`n3️⃣  Fetching Customers (first 5)..." -ForegroundColor Yellow
try {
    $customers = Invoke-RestMethod -Uri "http://localhost:8001/api/customers?limit=5" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Customers Retrieved" -ForegroundColor Green
    Write-Host "   Total customers: $($customers.total)" -ForegroundColor White
    Write-Host "   Returned: $($customers.customers.Count) customers" -ForegroundColor White
    Write-Host ""
    
    if ($customers.customers) {
        $customers.customers | ForEach-Object {
            Write-Host "   👤 $($_.customer_id) - $($_.name)" -ForegroundColor Cyan
            Write-Host "      Segment: $($_.segment_name)" -ForegroundColor Gray
            Write-Host "      Purchases: $($_.total_purchases)" -ForegroundColor Yellow
            Write-Host "      Engagement: $($_.engagement_score)" -ForegroundColor Yellow
            Write-Host ""
        }
    }
    
    Write-Host "Full JSON Output (first customer):" -ForegroundColor Yellow
    $customers.customers[0] | ConvertTo-Json -Depth 10
    Write-Host ""
}
catch {
    Write-Host "❌ Failed to fetch customers: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  API TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
