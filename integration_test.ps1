# ChainReach AI - Integration Test Workflow
# Tests: Segmentation API -> Person2 RAG -> Message Generation -> Compliance Check

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ChainReach AI - Integration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Test Segmentation API
Write-Host "STEP 1: Testing Segmentation API" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Getting segments from Segmentation API..." -ForegroundColor Green
try {
    $segmentResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/segments" -TimeoutSec 5
    Write-Host "✅ Segments retrieved successfully" -ForegroundColor Green
    Write-Host "Total segments: $($segmentResponse.data.Length)" -ForegroundColor White
    
    # Display segments
    $segmentResponse.data | ForEach-Object {
        Write-Host "  - $($_.name): $($_.description)" -ForegroundColor Gray
    }
    
    # Store segments for next step
    $segments = $segmentResponse.data
} catch {
    Write-Host "❌ Failed to get segments: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Getting customers from Segmentation API..." -ForegroundColor Green
try {
    $customersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/customers" -TimeoutSec 5
    Write-Host "✅ Customers retrieved successfully" -ForegroundColor Green
    Write-Host "Total customers: $($customersResponse.data.Length)" -ForegroundColor White
    
    if ($customersResponse.data.Length -eq 0) {
        Write-Host "⚠️  No customers in database yet" -ForegroundColor Yellow
        Write-Host "Next step: Import customer data using person2-rag's import script" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to get customers: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Getting status with metrics..." -ForegroundColor Green
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:3000/status" -TimeoutSec 5
    Write-Host "✅ Status retrieved successfully" -ForegroundColor Green
    Write-Host "Connected to: $($statusResponse.database.connected)" -ForegroundColor White
    Write-Host "Timestamp: $($statusResponse.database.timestamp)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to get status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "SUMMARY OF SEGMENTATION API ENDPOINTS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available endpoints:" -ForegroundColor White
Write-Host "  GET  http://localhost:3000/health          - Health check" -ForegroundColor Gray
Write-Host "  GET  http://localhost:3000/status          - Status with DB info" -ForegroundColor Gray
Write-Host "  GET  http://localhost:3000/metrics         - Customer and segment metrics" -ForegroundColor Gray
Write-Host "  GET  http://localhost:3000/api/segments    - List all segments" -ForegroundColor Gray
Write-Host "  GET  http://localhost:3000/api/customers   - List all customers" -ForegroundColor Gray
Write-Host "  POST http://localhost:3000/api/segment/analyze   - Analyze customers" -ForegroundColor Gray
Write-Host ""

# Step 2: Test Person2 RAG API (if running)
Write-Host "STEP 2: Testing Person2 RAG API" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

$ragPorts = @(8000, 8001, 8002, 5000)
$ragRunning = $false

foreach ($port in $ragPorts) {
    try {
        $ragResponse = Invoke-RestMethod -Uri "http://localhost:$port/health" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Person2 RAG API found on port $port" -ForegroundColor Green
        Write-Host "Status: $($ragResponse.status)" -ForegroundColor Green
        $ragRunning = $true
        $ragPort = $port
        break
    } catch {
        # Continue to next port
    }
}

if (-not $ragRunning) {
    Write-Host "⚠️  Person2 RAG API not running" -ForegroundColor Yellow
    Write-Host "To start it, run in another terminal:" -ForegroundColor Gray
    Write-Host "  cd c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\person2-rag" -ForegroundColor Gray
    Write-Host "  python api.py" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "RAG API available endpoints:" -ForegroundColor White
    Write-Host "  GET  http://localhost:$ragPort/health      - Health check" -ForegroundColor Gray
    Write-Host "  POST http://localhost:$ragPort/search      - Search for content" -ForegroundColor Gray
    Write-Host "  GET  http://localhost:$ragPort/content     - List all content" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Person2 RAG - Import sample data:" -ForegroundColor White
Write-Host "   cd c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\person2-rag" -ForegroundColor Gray
Write-Host "   python ingestion.py" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Person2 RAG - Start API server:" -ForegroundColor White
Write-Host "   python api.py" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test RAG with segment data:" -ForegroundColor White
Write-Host "   Create test queries from segment descriptions" -ForegroundColor Gray
Write-Host ""
Write-Host "4. MessageGeneration - Build and run:" -ForegroundColor White
Write-Host "   cd c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\MessageGeneration" -ForegroundColor Gray
Write-Host "   dotnet build && dotnet run" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Person4 Compliance - Deploy Azure Function:" -ForegroundColor White
Write-Host "   cd c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\person4-compliance-azfn" -ForegroundColor Gray
Write-Host "   func start" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
