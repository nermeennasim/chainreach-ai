#!/usr/bin/env pwsh
# Complete Orchestration: Segmentation Agent + RAG API
# This script demonstrates the full workflow of:
# 1. Getting customer segments from Segmentation Agent (Port 8001)
# 2. Finding relevant marketing content from RAG API (Port 8000) for each segment

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  CHAINREACH: SEGMENTATION + CONTENT ORCHESTRATION        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$SEGMENTATION_API = "http://localhost:8001"
$RAG_API = "http://localhost:8000"

Write-Host "Segmentation Agent: $SEGMENTATION_API" -ForegroundColor Yellow
Write-Host "RAG Content API:    $RAG_API" -ForegroundColor Yellow
Write-Host ""

# ============================================================
# STEP 1: Fetch Segments from Segmentation Agent
# ============================================================
Write-Host "STEP 1: Fetching Customer Segments..." -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Green

try {
    $segments = Invoke-RestMethod -Uri "$SEGMENTATION_API/api/segments" `
        -Method Get `
        -TimeoutSec 10
    
    Write-Host "✓ Successfully fetched segments" -ForegroundColor Green
    $segmentData = $segments.data ?? $segments
    $segmentCount = if ($segmentData -is [array]) { $segmentData.Count } else { 1 }
    Write-Host "  Found: $segmentCount segments`n" -ForegroundColor White
}
catch {
    Write-Host "✗ FAILED to fetch segments: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Make sure Segmentation Agent is running on port 8001`n" -ForegroundColor Red
    exit
}

# ============================================================
# STEP 2: Check RAG API Health
# ============================================================
Write-Host "STEP 2: Checking RAG API Health..." -ForegroundColor Green
Write-Host "──────────────────────────────────" -ForegroundColor Green

try {
    $health = Invoke-RestMethod -Uri "$RAG_API/health" `
        -Method Get `
        -TimeoutSec 5
    
    Write-Host "✓ RAG API is healthy" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor White
    Write-Host "  Version: $($health.version)`n" -ForegroundColor White
}
catch {
    Write-Host "✗ FAILED to connect to RAG API: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Make sure RAG API is running on port 8000`n" -ForegroundColor Red
    exit
}

# ============================================================
# STEP 3: Get RAG Statistics
# ============================================================
Write-Host "STEP 3: Checking RAG Content Library..." -ForegroundColor Green
Write-Host "──────────────────────────────────────" -ForegroundColor Green

try {
    $stats = Invoke-RestMethod -Uri "$RAG_API/stats" `
        -Method Get `
        -TimeoutSec 30
    
    Write-Host "✓ RAG Statistics:" -ForegroundColor Green
    Write-Host "  Total Content Items: $($stats.total_content)" -ForegroundColor White
    if ($stats.by_content_type) {
        Write-Host "  By Type:" -ForegroundColor Cyan
        $stats.by_content_type.PSObject.Properties | ForEach-Object {
            Write-Host "    - $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
    }
    Write-Host ""
}
catch {
    Write-Host "⚠ Could not fetch statistics (non-critical): $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================
# STEP 4: For Each Segment, Find Relevant Content
# ============================================================
Write-Host "STEP 4: Finding Relevant Content for Each Segment..." -ForegroundColor Green
Write-Host "───────────────────────────────────────────────────" -ForegroundColor Green
Write-Host ""

$results = @()
$segmentIndex = 1

foreach ($segment in $segmentData) {
    Write-Host "[$segmentIndex/$segmentCount] Processing Segment: $($segment.name)" -ForegroundColor Cyan
    Write-Host "  Description: $($segment.description)" -ForegroundColor Gray
    Write-Host "  Customers: $($segment.customer_count)" -ForegroundColor Gray
    
    # Build search query from segment
    $searchQuery = "$($segment.name): $($segment.description)"
    
    try {
        # Search RAG for relevant content
        $searchBody = @{
            query = $searchQuery
            top_k = 5
        } | ConvertTo-Json
        
        $contentResults = Invoke-RestMethod -Uri "$RAG_API/search" `
            -Method Post `
            -Body $searchBody `
            -ContentType "application/json" `
            -TimeoutSec 30
        
        Write-Host "  ✓ Found $($contentResults.results_count) relevant content items:" -ForegroundColor Green
        
        $contentItems = @()
        $contentResults.results | ForEach-Object {
            Write-Host "      • $($_.title)" -ForegroundColor Yellow
            Write-Host "        Type: $($_.content_type) | Audience: $($_.audience)" -ForegroundColor Gray
            $contentItems += @{
                id = $_.id
                title = $_.title
                type = $_.content_type
                audience = $_.audience
            }
        }
        
        $results += @{
            segment_id = $segment.id
            segment_name = $segment.name
            customer_count = $segment.customer_count
            content_count = $contentResults.results_count
            content_items = $contentItems
        }
    }
    catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            segment_id = $segment.id
            segment_name = $segment.name
            error = $_.Exception.Message
        }
    }
    
    Write-Host ""
    $segmentIndex++
}

# ============================================================
# SUMMARY
# ============================================================
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                      ORCHESTRATION SUMMARY                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Total Segments Processed: $($results.Count)" -ForegroundColor Yellow

$totalContentItems = 0
$results | ForEach-Object {
    if ($_.content_count) {
        $totalContentItems += $_.content_count
    }
}
Write-Host "Total Content Items Found: $totalContentItems" -ForegroundColor Yellow

Write-Host "`nDetailed Results:" -ForegroundColor Cyan
Write-Host "─────────────────" -ForegroundColor Cyan

$results | ForEach-Object {
    Write-Host ""
    Write-Host "Segment: $($_.segment_name)" -ForegroundColor Cyan
    Write-Host "  Customers: $($_.customer_count)" -ForegroundColor White
    
    if ($_.error) {
        Write-Host "  Status: ERROR - $($_.error)" -ForegroundColor Red
    } else {
        Write-Host "  Content Items: $($_.content_count)" -ForegroundColor Green
        $_.content_items | ForEach-Object {
            Write-Host "    • $($_.title)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n" -ForegroundColor Cyan
Write-Host "✓ ORCHESTRATION COMPLETE" -ForegroundColor Green
Write-Host ""
