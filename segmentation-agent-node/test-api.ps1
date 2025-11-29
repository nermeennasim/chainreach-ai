# ChainReach Segmentation API Test Script
# This script tests all API endpoints with sample data

$baseUrl = "http://localhost:8001"

Write-Host "🚀 Testing ChainReach Segmentation API" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health Check:" -ForegroundColor Green
    $health | ConvertTo-Json | Write-Host
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: List All Segments
Write-Host "2️⃣  Testing List Segments..." -ForegroundColor Yellow
try {
    $segments = Invoke-RestMethod -Uri "$baseUrl/api/segments" -Method Get
    Write-Host "✅ Found $($segments.Length) segments:" -ForegroundColor Green
    $segments | ForEach-Object {
        Write-Host "   - [$($_.id)] $($_.name): $($_.customer_count) customers" -ForegroundColor White
    }
} catch {
    Write-Host "❌ List segments failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get Specific Segment with Customers
Write-Host "3️⃣  Testing Get Segment Details (ID: 1)..." -ForegroundColor Yellow
try {
    $segment = Invoke-RestMethod -Uri "$baseUrl/api/segments/1?limit=5" -Method Get
    Write-Host "✅ Segment: $($segment.name)" -ForegroundColor Green
    Write-Host "   Description: $($segment.description)" -ForegroundColor White
    Write-Host "   Total Customers: $($segment.customer_count)" -ForegroundColor White
    Write-Host "   Sample Customers:" -ForegroundColor White
    $segment.customers | ForEach-Object {
        Write-Host "      - $($_.name) ($($_.email)) - Score: $($_.engagement_score)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get segment failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: List Customers (with pagination)
Write-Host "4️⃣  Testing List Customers..." -ForegroundColor Yellow
try {
    $customers = Invoke-RestMethod -Uri "$baseUrl/api/customers?limit=10&offset=0" -Method Get
    Write-Host "✅ Found $($customers.total) total customers (showing first 10):" -ForegroundColor Green
    $customers.customers | ForEach-Object {
        Write-Host "   - $($_.name): $($_.email) (Segment: $($_.segment_name), Score: $($_.engagement_score))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ List customers failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Specific Customer
Write-Host "5️⃣  Testing Get Customer by ID..." -ForegroundColor Yellow
try {
    $customer = Invoke-RestMethod -Uri "$baseUrl/api/customers/CUST-0001" -Method Get
    Write-Host "✅ Customer Details:" -ForegroundColor Green
    Write-Host "   Name: $($customer.name)" -ForegroundColor White
    Write-Host "   Email: $($customer.email)" -ForegroundColor White
    Write-Host "   Location: $($customer.location)" -ForegroundColor White
    Write-Host "   Total Purchases: `$$($customer.total_purchases)" -ForegroundColor White
    Write-Host "   Engagement Score: $($customer.engagement_score)" -ForegroundColor White
    Write-Host "   Segment: $($customer.segment_name)" -ForegroundColor White
} catch {
    Write-Host "❌ Get customer failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Filter Customers by Segment
Write-Host "6️⃣  Testing Filter Customers by Segment..." -ForegroundColor Yellow
try {
    $filtered = Invoke-RestMethod -Uri "$baseUrl/api/customers?segment_id=1&limit=5" -Method Get
    Write-Host "✅ Customers in Segment 1: $($filtered.total)" -ForegroundColor Green
    $filtered.customers | ForEach-Object {
        Write-Host "   - $($_.name): Score $($_.engagement_score)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Filter customers failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Create a New Segment
Write-Host "7️⃣  Testing Create New Segment..." -ForegroundColor Yellow
try {
    $newSegment = @{
        name = "Test Demo Segment"
        description = "Test segment created via API"
        criteria = @{
            min_engagement_score = 70
            min_total_purchases = 1000
        }
        ai_generated = $false
    } | ConvertTo-Json

    $created = Invoke-RestMethod -Uri "$baseUrl/api/segments" -Method Post -Body $newSegment -ContentType "application/json"
    Write-Host "✅ Created segment: $($created.name) (ID: $($created.id))" -ForegroundColor Green
} catch {
    Write-Host "❌ Create segment failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 8: Calculate Engagement Scores
Write-Host "8️⃣  Testing Calculate Engagement Scores..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/api/segment/calculate-engagement" -Method Post
    Write-Host "✅ Updated engagement scores for $($result.updated) customers" -ForegroundColor Green
} catch {
    Write-Host "❌ Calculate engagement failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 9: Refresh Segmentation
Write-Host "9️⃣  Testing Refresh Segmentation..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/api/segment/refresh" -Method Post
    Write-Host "✅ Segmentation refreshed" -ForegroundColor Green
    Write-Host "   Segments updated:" -ForegroundColor White
    $result | ForEach-Object {
        Write-Host "      - Segment $($_.segment_id): $($_.customers_assigned) customers assigned" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Refresh segmentation failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ API Testing Complete!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
