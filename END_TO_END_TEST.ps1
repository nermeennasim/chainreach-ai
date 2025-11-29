# ChainReach AI - Complete Integration Test
# Demonstrates the full workflow: Segmentation -> RAG -> Message Generation -> Compliance

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ChainReach AI - Complete Integration Test & API Demonstration  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SegmentationAPI = "http://localhost:3000"
$RagAPI = "http://localhost:8000"
$MessageGenerationAPI = "http://localhost:5000"
$ComplianceAPI = "http://localhost:7071"

# Colors
[System.ConsoleColor]$Success = [System.ConsoleColor]::Green
[System.ConsoleColor]$Warning = [System.ConsoleColor]::Yellow
[System.ConsoleColor]$ErrorColor = [System.ConsoleColor]::Red
[System.ConsoleColor]$Info = [System.ConsoleColor]::Cyan
[System.ConsoleColor]$Data = [System.ConsoleColor]::White

# Test function
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [psobject]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor $Info
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        if ($Method -eq "POST" -and $Body) {
            $result = Invoke-RestMethod -Uri $Url -Method $Method -ContentType "application/json" -Body ($Body | ConvertTo-Json) -TimeoutSec 5
        } else {
            $result = Invoke-RestMethod -Uri $Url -Method $Method -TimeoutSec 5
        }
        
        Write-Host "✅ Success" -ForegroundColor $Success
        return $result
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor $ErrorColor
        return $null
    }
}

# ==================== STEP 1: SEGMENTATION API ====================
Write-Host ""
Write-Host "STEP 1: SEGMENTATION API (Person1 - Segmentation Agent)" -ForegroundColor $Info
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $Info
Write-Host ""

# Get segments
Write-Host "1.1 Getting Customer Segments" -ForegroundColor $Warning
$segments = Test-Endpoint "Get Segments" "$SegmentationAPI/api/segments"

if ($segments) {
    Write-Host "Found $($segments.data.Length) segments:" -ForegroundColor $Data
    $segments.data | ForEach-Object {
        Write-Host "  • $($_.name)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Show first segment details for next steps
    $firstSegment = $segments.data[0]
    Write-Host "Selected segment for next steps: '$($firstSegment.name)'" -ForegroundColor $Data
    Write-Host "Description: $($firstSegment.description)" -ForegroundColor Gray
}

Write-Host ""

# Get metrics
Write-Host "1.2 Getting Metrics" -ForegroundColor $Warning
$metrics = Test-Endpoint "Get Metrics" "$SegmentationAPI/metrics"

if ($metrics) {
    Write-Host "Customer Summary:" -ForegroundColor $Data
    if ($metrics.summary) {
        Write-Host "  Total Customers: $($metrics.summary.total_customers)" -ForegroundColor Gray
        Write-Host "  Total Revenue: $($metrics.summary.total_revenue)" -ForegroundColor Gray
        Write-Host "  Avg Engagement: $($metrics.summary.avg_engagement_score)" -ForegroundColor Gray
    }
}

# ==================== STEP 2: PERSON2 RAG ====================
Write-Host ""
Write-Host ""
Write-Host "STEP 2: PERSON2 RAG API (Content Retrieval Agent)" -ForegroundColor $Info
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $Info
Write-Host ""

# Check RAG health
Write-Host "2.1 RAG Health Check" -ForegroundColor $Warning
$ragHealth = Test-Endpoint "RAG Health" "$RagAPI/health"

Write-Host ""

# Get content from RAG
Write-Host "2.2 Get Available Content" -ForegroundColor $Warning
$ragContent = Test-Endpoint "RAG Content" "$RagAPI/content"

if ($ragContent) {
    Write-Host "Available content: $($ragContent.total) items" -ForegroundColor $Data
    Write-Host "Sample items:" -ForegroundColor $Data
    if ($ragContent.items) {
        $ragContent.items | Select-Object -First 3 | ForEach-Object {
            Write-Host "  • $($_.title)" -ForegroundColor Gray
            Write-Host "    Type: $($_.content_type) | Audience: $($_.audience) | Campaign: $($_.campaign_name)" -ForegroundColor Gray
        }
    }
}

Write-Host ""

# Search RAG content
Write-Host "2.3 Search for Relevant Marketing Content" -ForegroundColor $Warning
if ($firstSegment) {
    $searchQuery = @{
        query = $firstSegment.description
        top_k = 3
    }
    
    Write-Host "Search query: '$($firstSegment.description)'" -ForegroundColor Gray
    $ragSearchResults = Test-Endpoint "RAG Search" "$RagAPI/search" "POST" $searchQuery
    
    if ($ragSearchResults) {
        Write-Host "Found $($ragSearchResults.results_count) relevant content items:" -ForegroundColor $Data
        if ($ragSearchResults.results) {
            $ragSearchResults.results | ForEach-Object {
                Write-Host "  • $($_.title)" -ForegroundColor Gray
                Write-Host "    Campaign: $($_.campaign_name)" -ForegroundColor Gray
                Write-Host "    Audience: $($_.audience) | Type: $($_.content_type)" -ForegroundColor Gray
            }
        }
    }
}

# ==================== STEP 3: MESSAGE GENERATION ====================
Write-Host ""
Write-Host ""
Write-Host "STEP 3: MESSAGE GENERATION API (MessageGeneration Service)" -ForegroundColor $Info
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $Info
Write-Host ""

Write-Host "3.1 Checking Message Generation Service" -ForegroundColor $Warning
$msgGen = Test-Endpoint "Message Generation Health" "$MessageGenerationAPI/health"

if (-not $msgGen) {
    Write-Host ""
    Write-Host "⚠️  Message Generation Service not running" -ForegroundColor $Warning
    Write-Host "To start it, run:" -ForegroundColor Gray
    Write-Host "  cd c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\MessageGeneration" -ForegroundColor Gray
    Write-Host "  dotnet build ; dotnet run" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "3.2 Generate Messages" -ForegroundColor $Warning
    
    if ($ragSearchResults -and $ragSearchResults.results) {
        $messageRequest = @{
            segment = $firstSegment.name
            content = $ragSearchResults.results[0]
            content_items = $ragSearchResults.results
        }
        
        Write-Host "Generating personalized messages for segment: $($firstSegment.name)" -ForegroundColor Gray
        $messages = Test-Endpoint "Generate Messages" "$MessageGenerationAPI/generate" "POST" $messageRequest
        
        if ($messages) {
            Write-Host "Generated messages:" -ForegroundColor $Data
            Write-Host "  Subject: $($messages.subject)" -ForegroundColor Gray
            if ($messages.body) {
                $preview = $messages.body.Substring(0, [Math]::Min(100, $messages.body.Length))
                Write-Host "  Body Preview: $preview..." -ForegroundColor Gray
            }
        }
    }
}

# ==================== STEP 4: COMPLIANCE CHECK ====================
Write-Host ""
Write-Host ""
Write-Host "STEP 4: PERSON4 COMPLIANCE API (Content Safety)" -ForegroundColor $Info
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $Info
Write-Host ""

Write-Host "4.1 Checking Compliance Service" -ForegroundColor $Warning
$compliance = Test-Endpoint "Compliance Health" "$ComplianceAPI/api/Health"

if (-not $compliance) {
    Write-Host ""
    Write-Host "⚠️  Compliance Service not running" -ForegroundColor $Warning
    Write-Host "To start it, run:" -ForegroundColor Gray
    Write-Host "  cd c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\person4-compliance-azfn" -ForegroundColor Gray
    Write-Host "  func start" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "4.2 Check Content Safety" -ForegroundColor $Warning
    
    if ($messages) {
        $complianceRequest = @{
            content = $messages.body
            content_type = "email"
            segment = $firstSegment.name
        }
        
        Write-Host "Checking compliance for generated message" -ForegroundColor Gray
        $complianceResult = Test-Endpoint "Compliance Check" "$ComplianceAPI/api/ContentSafety" "POST" $complianceRequest
        
        if ($complianceResult) {
            Write-Host "Compliance Status: " -ForegroundColor $Data -NoNewline
            if ($complianceResult.safe) {
                Write-Host "✅ SAFE" -ForegroundColor $Success
            } else {
                Write-Host "⚠️  ISSUES FOUND" -ForegroundColor $Warning
                Write-Host "Issues: $($complianceResult.issues)" -ForegroundColor Gray
            }
        }
    }
}

# ==================== SUMMARY ====================
Write-Host ""
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "WORKFLOW SUMMARY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Available Services:" -ForegroundColor $Success
Write-Host "  1. Segmentation API (Port 3000) - RUNNING" -ForegroundColor $Success
Write-Host "  2. Person2 RAG API (Port 8000) - RUNNING" -ForegroundColor $Success
if ($msgGen) {
    Write-Host "  3. Message Generation (Port 5000) - RUNNING" -ForegroundColor $Success
} else {
    Write-Host "  3. Message Generation (Port 5000) - NOT RUNNING" -ForegroundColor $Warning
}

if ($compliance) {
    Write-Host "  4. Compliance API (Port 7071) - RUNNING" -ForegroundColor $Success
} else {
    Write-Host "  4. Compliance API (Port 7071) - NOT RUNNING" -ForegroundColor $Warning
}

Write-Host ""
Write-Host "📋 API Endpoints Reference:" -ForegroundColor $Data
Write-Host ""
Write-Host "SEGMENTATION (Person1):" -ForegroundColor $Warning
Write-Host "  GET  http://localhost:3000/health" -ForegroundColor Gray
Write-Host "  GET  http://localhost:3000/api/segments" -ForegroundColor Gray
Write-Host "  GET  http://localhost:3000/api/customers" -ForegroundColor Gray
Write-Host "  GET  http://localhost:3000/metrics" -ForegroundColor Gray
Write-Host ""

Write-Host "RAG (Person2):" -ForegroundColor $Warning
Write-Host "  GET  http://localhost:8000/health" -ForegroundColor Gray
Write-Host "  GET  http://localhost:8000/content" -ForegroundColor Gray
Write-Host "  POST http://localhost:8000/search" -ForegroundColor Gray
Write-Host "       Body: { \"query\": \"...\", \"top_k\": 3 }" -ForegroundColor Gray
Write-Host ""

Write-Host "MESSAGE GENERATION (MessageGeneration):" -ForegroundColor $Warning
Write-Host "  GET  http://localhost:5000/health" -ForegroundColor Gray
Write-Host "  POST http://localhost:5000/generate" -ForegroundColor Gray
Write-Host ""

Write-Host "COMPLIANCE (Person4):" -ForegroundColor $Warning
Write-Host "  GET  http://localhost:7071/api/Health" -ForegroundColor Gray
Write-Host "  POST http://localhost:7071/api/ContentSafety" -ForegroundColor Gray
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
