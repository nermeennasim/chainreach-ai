# 🚀 Quick API Test Commands

Copy and paste these PowerShell commands to test all endpoints quickly.

## Prerequisites
```powershell
# Make sure server is running
# Replace with your actual path
cd "path\to\chainreach-ai\segmentation-agent-node"
npm run dev
```

---

## 📊 Information Endpoints

### Health Check
```powershell
Invoke-RestMethod -Uri http://localhost:8001/health | ConvertTo-Json
```

### Status with Database Info
```powershell
Invoke-RestMethod -Uri http://localhost:8001/status | ConvertTo-Json -Depth 5
```

### Metrics Dashboard
```powershell
Invoke-RestMethod -Uri http://localhost:8001/metrics | ConvertTo-Json -Depth 5
```

### API Documentation
```powershell
Invoke-RestMethod -Uri http://localhost:8001/ | ConvertTo-Json
```

---

## 🎯 Segment Endpoints

### List All Segments
```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segments | ConvertTo-Json -Depth 3
```

### Get Segment with Customers (ID: 1, limit 10)
```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/segments/1?limit=10" | ConvertTo-Json -Depth 3
```

### Create New Segment
```powershell
$body = @{
    name = "VIP Premium Customers"
    description = "Ultra high value customers"
    criteria = @{
        min_engagement_score = 95
        min_total_purchases = 50000
    }
    ai_generated = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8001/api/segments -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 3
```

### Generate AI Marketing Message for Segment
```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segments/1/generate-message -Method Post | ConvertTo-Json -Depth 2
```

---

## 👥 Customer Endpoints

### List Customers (Paginated)
```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/customers?limit=20&offset=0" | ConvertTo-Json -Depth 2
```

### Get Customer by ID
```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/customers/CUST-0001 | ConvertTo-Json -Depth 2
```

### Filter Customers by Segment
```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/customers?segment_id=1&limit=10" | ConvertTo-Json -Depth 2
```

### Create New Customer
```powershell
$body = @{
    customer_id = "CUST-DEMO-001"
    name = "Demo Customer"
    email = "demo@example.com"
    location = "New York, NY"
    country = "USA"
    total_purchases = 25000
    purchase_count = 50
    engagement_score = 90
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8001/api/customers -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 2
```

### Update Customer
```powershell
$body = @{
    engagement_score = 95
    total_purchases = 30000
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8001/api/customers/CUST-DEMO-001 -Method Put -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 2
```

### Delete Customer
```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/customers/CUST-DEMO-001 -Method Delete | ConvertTo-Json
```

---

## 🤖 AI & Segmentation Operations

### Calculate Engagement Scores (All Customers)
```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segment/calculate-engagement -Method Post | ConvertTo-Json
```

### Refresh All Segmentation
```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segment/refresh -Method Post | ConvertTo-Json -Depth 2
```

### AI-Powered Segment Analysis
```powershell
Invoke-RestMethod -Uri http://localhost:8001/api/segment/analyze -Method Post | ConvertTo-Json -Depth 4
```

---

## 🔄 Complete Test Flow

Run all tests in sequence:

```powershell
# 1. Health check
Write-Host "Testing Health..." -ForegroundColor Cyan
Invoke-RestMethod -Uri http://localhost:8001/health | ConvertTo-Json

# 2. Get segments
Write-Host "`nTesting Segments..." -ForegroundColor Cyan
$segments = Invoke-RestMethod -Uri http://localhost:8001/api/segments
Write-Host "Found $($segments.data.Length) segments"

# 3. Get customers
Write-Host "`nTesting Customers..." -ForegroundColor Cyan
$customers = Invoke-RestMethod -Uri "http://localhost:8001/api/customers?limit=5"
Write-Host "Found $($customers.pagination.total) total customers"

# 4. Create test customer
Write-Host "`nCreating Test Customer..." -ForegroundColor Cyan
$newCustomer = @{
    customer_id = "CUST-TEST-$(Get-Random)"
    name = "Test User"
    email = "test@example.com"
    total_purchases = 15000
    purchase_count = 25
} | ConvertTo-Json
$created = Invoke-RestMethod -Uri http://localhost:8001/api/customers -Method Post -Body $newCustomer -ContentType "application/json"
Write-Host "Created: $($created.data.customer_id)"

# 5. Update customer
Write-Host "`nUpdating Customer..." -ForegroundColor Cyan
$update = @{ engagement_score = 90 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8001/api/customers/$($created.data.customer_id)" -Method Put -Body $update -ContentType "application/json" | Out-Null
Write-Host "Updated engagement score to 90"

# 6. Refresh segmentation
Write-Host "`nRefreshing Segmentation..." -ForegroundColor Cyan
$refresh = Invoke-RestMethod -Uri http://localhost:8001/api/segment/refresh -Method Post
Write-Host "Refreshed $($refresh.data.results.Length) segments"

# 7. Delete test customer
Write-Host "`nDeleting Test Customer..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:8001/api/customers/$($created.data.customer_id)" -Method Delete | Out-Null
Write-Host "Deleted test customer"

Write-Host "`n✅ All Tests Complete!" -ForegroundColor Green
```

---

## 🎨 Testing AI Features

### Generate Marketing Message for Each Segment
```powershell
# Get all segments
$segments = (Invoke-RestMethod -Uri http://localhost:8001/api/segments).data

# Generate message for each
foreach ($segment in $segments | Select-Object -First 3) {
    Write-Host "`nGenerating message for: $($segment.name)" -ForegroundColor Cyan
    $msg = Invoke-RestMethod -Uri "http://localhost:8001/api/segments/$($segment.id)/generate-message" -Method Post
    Write-Host "$($msg.data.message.Substring(0, 200))..." -ForegroundColor Gray
}
```

### Run AI Segment Analysis and Create Suggested Segments
```powershell
# Get AI suggestions
Write-Host "Running AI Analysis..." -ForegroundColor Cyan
$analysis = Invoke-RestMethod -Uri http://localhost:8001/api/segment/analyze -Method Post

# Show suggestions
Write-Host "`nAI Suggested Segments:" -ForegroundColor Green
foreach ($suggestion in $analysis.data.suggestedSegments) {
    Write-Host "`n  • $($suggestion.name)" -ForegroundColor Yellow
    Write-Host "    $($suggestion.description)" -ForegroundColor Gray
    Write-Host "    Strategy: $($suggestion.marketing_strategy)" -ForegroundColor Cyan
}

# Create first suggested segment
Write-Host "`nCreating first suggested segment..." -ForegroundColor Cyan
$newSegment = @{
    name = $analysis.data.suggestedSegments[0].name
    description = $analysis.data.suggestedSegments[0].description
    criteria = $analysis.data.suggestedSegments[0].criteria
    ai_generated = $true
} | ConvertTo-Json

$created = Invoke-RestMethod -Uri http://localhost:8001/api/segments -Method Post -Body $newSegment -ContentType "application/json"
Write-Host "Created segment: $($created.data.segment.name) with $($created.data.applied.customersUpdated) customers"
```

---

## 📈 Performance Testing

### Test Response Times
```powershell
function Test-ApiPerformance {
    param($url, $method = "Get", $body = $null)
    
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    
    if ($body) {
        Invoke-RestMethod -Uri $url -Method $method -Body $body -ContentType "application/json" | Out-Null
    } else {
        Invoke-RestMethod -Uri $url -Method $method | Out-Null
    }
    
    $sw.Stop()
    return $sw.ElapsedMilliseconds
}

Write-Host "API Performance Test" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8001"

Write-Host "`n/health: $(Test-ApiPerformance "$baseUrl/health")ms"
Write-Host "/status: $(Test-ApiPerformance "$baseUrl/status")ms"
Write-Host "/api/segments: $(Test-ApiPerformance "$baseUrl/api/segments")ms"
Write-Host "/api/customers: $(Test-ApiPerformance "$baseUrl/api/customers?limit=100")ms"
Write-Host "/api/segments/1: $(Test-ApiPerformance "$baseUrl/api/segments/1?limit=10")ms"

Write-Host "`n✅ Performance test complete!" -ForegroundColor Green
```

---

## 🐛 Debugging Commands

### Check if Server is Running
```powershell
try {
    Invoke-RestMethod -Uri http://localhost:8001/health -TimeoutSec 2 | Out-Null
    Write-Host "✅ Server is running on port 8001" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not responding on port 8001" -ForegroundColor Red
    Write-Host "Run: npm run dev" -ForegroundColor Yellow
}
```

### View Recent Logs (if server running in terminal)
```powershell
# In the terminal where server is running, press Ctrl+C to stop
# Scroll up to see logs
```

### Test Database Connection
```powershell
$status = Invoke-RestMethod -Uri http://localhost:8001/status
if ($status.database.connected) {
    Write-Host "✅ Database connected" -ForegroundColor Green
    Write-Host "   Customers: $($status.database.customers)" -ForegroundColor Cyan
    Write-Host "   Segments: $($status.database.segments)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Database not connected" -ForegroundColor Red
}
```

---

## 📝 Notes

- All endpoints use JSON for request/response
- Authentication not required in development
- Rate limiting: 100 requests per 15 minutes
- Large operations (calculate-engagement, refresh) may take 5-30 seconds
- AI operations require Azure OpenAI configuration in `.env`

---

## 🔗 Related Files

- **Full Test Results:** `API_TEST_RESULTS.md`
- **Testing Guide:** `API_TESTING_GUIDE.md`
- **Automated Test Script:** `test-api.ps1`
- **Server Code:** `src/app.ts`
- **Environment Config:** `.env`
