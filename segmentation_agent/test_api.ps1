# Test Segmentation API Endpoints
# Run this after deployment to test all endpoints

# Set your API URL (replace after deployment)
$API_URL = "YOUR_API_URL_HERE"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Segmentation API Endpoints" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "📋 Test 1: Health Check Endpoint" -ForegroundColor Yellow
Write-Host "GET $API_URL/health`n"
$response1 = Invoke-RestMethod -Uri "$API_URL/health" -Method GET
Write-Host "✅ Response:" -ForegroundColor Green
$response1 | ConvertTo-Json
Write-Host "`n"

# Test 2: Manual Segmentation (with RFM values)
Write-Host "📋 Test 2: Manual Segmentation Endpoint" -ForegroundColor Yellow
Write-Host "POST $API_URL/segment/manual`n"
$body2 = @{
    recency = 10
    frequency = 15
    monetary = 5000
} | ConvertTo-Json

$response2 = Invoke-RestMethod -Uri "$API_URL/segment/manual" -Method POST -Body $body2 -ContentType "application/json"
Write-Host "✅ Response:" -ForegroundColor Green
$response2 | ConvertTo-Json -Depth 4
Write-Host "`n"

# Test 3: Customer Lookup by ID
Write-Host "📋 Test 3: Customer Lookup Endpoint" -ForegroundColor Yellow
Write-Host "POST $API_URL/segment/customer`n"
$body3 = @{
    customer_id = "12347"
} | ConvertTo-Json

$response3 = Invoke-RestMethod -Uri "$API_URL/segment/customer" -Method POST -Body $body3 -ContentType "application/json"
Write-Host "✅ Response:" -ForegroundColor Green
$response3 | ConvertTo-Json -Depth 4
Write-Host "📊 Customer Details:" -ForegroundColor Cyan
Write-Host "   Name: $($response3.customer_name)" -ForegroundColor White
Write-Host "   Email: $($response3.email)" -ForegroundColor White
Write-Host "   Segment: $($response3.segment_name)" -ForegroundColor White
Write-Host "   Data Source: $($response3.data_source)" -ForegroundColor White
Write-Host "`n"

# Test 4: Batch Segmentation
Write-Host "📋 Test 4: Batch Segmentation Endpoint" -ForegroundColor Yellow
Write-Host "POST $API_URL/api/segment`n"
$body4 = @{
    customer_count = 10
} | ConvertTo-Json

$response4 = Invoke-RestMethod -Uri "$API_URL/api/segment" -Method POST -Body $body4 -ContentType "application/json"
Write-Host "✅ Response:" -ForegroundColor Green
Write-Host "Total Customers: $($response4.total_customers)" -ForegroundColor Cyan
Write-Host "Data Source: $($response4.data_source)" -ForegroundColor Cyan
Write-Host "Segments Found: $($response4.segments.Count)`n" -ForegroundColor Cyan

foreach ($segment in $response4.segments) {
    Write-Host "  📊 $($segment.segment_name) (ID: $($segment.segment_id))" -ForegroundColor Yellow
    Write-Host "     Customers: $($segment.customers.Count)" -ForegroundColor White
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ ALL TESTS COMPLETED!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
