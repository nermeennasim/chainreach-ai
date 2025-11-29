#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Test the RAG + Segmentation Integration

.DESCRIPTION
    Verifies that the Segmentation Agent, RAG API, and Orchestrator Dashboard
    are all running and can communicate with each other.

.EXAMPLE
    .\test-rag-segmentation-integration.ps1
#>

param(
    [string]$SegmentationUrl = "http://localhost:3001",
    [string]$RagUrl = "http://localhost:8000",
    [string]$DashboardUrl = "http://localhost:3000"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RAG + Segmentation Integration Test                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Color functions
function Write-Success { param([string]$message); Write-Host "✓ $message" -ForegroundColor Green }
function Write-Error { param([string]$message); Write-Host "✗ $message" -ForegroundColor Red }
function Write-Warning { param([string]$message); Write-Host "⚠ $message" -ForegroundColor Yellow }
function Write-Info { param([string]$message); Write-Host "ℹ $message" -ForegroundColor Blue }

# Test results
$results = @{
    SegmentationAgent = $false
    RagApi = $false
    Dashboard = $false
    Integration = $false
}

# 1. Test Segmentation Agent Health
Write-Host "1. Testing Segmentation Agent..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$SegmentationUrl/health" -Method Get -TimeoutSec 5
    if ($response.status -eq "healthy") {
        Write-Success "Segmentation Agent is running"
        Write-Info "Service: $($response.service) v$($response.version)"
        $results.SegmentationAgent = $true
    }
}
catch {
    Write-Error "Segmentation Agent health check failed: $($_.Exception.Message)"
}

# 2. Test RAG API Health
Write-Host ""
Write-Host "2. Testing RAG API..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$RagUrl/health" -Method Get -TimeoutSec 5
    if ($response.status -eq "healthy") {
        Write-Success "RAG API is running"
        Write-Info "Service: $($response.service) v$($response.version)"
        $results.RagApi = $true
    }
}
catch {
    Write-Error "RAG API health check failed: $($_.Exception.Message)"
}

# 3. Test Dashboard Health
Write-Host ""
Write-Host "3. Testing Orchestrator Dashboard..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$DashboardUrl/" -Method Get -TimeoutSec 5
    Write-Success "Dashboard is running"
    $results.Dashboard = $true
}
catch {
    Write-Error "Dashboard is not responding: $($_.Exception.Message)"
}

# 4. Test Integration Endpoint
Write-Host ""
Write-Host "4. Testing Integration Workflow..." -ForegroundColor Cyan
if ($results.Dashboard) {
    try {
        $payload = @{
            segmentationApiUrl = $SegmentationUrl
            ragApiUrl = $RagUrl
            generateContent = $false
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$DashboardUrl/api/integration/rag-segmentation" `
            -Method Post `
            -ContentType "application/json" `
            -Body $payload `
            -TimeoutSec 15

        if ($response.success) {
            Write-Success "Integration workflow executed successfully"
            Write-Info "Segments retrieved: $($response.segmentation.segmentsCount)"
            $results.Integration = $true
        }
        else {
            Write-Error "Integration returned error: $($response.error)"
        }
    }
    catch {
        Write-Error "Integration test failed: $($_.Exception.Message)"
    }
}
else {
    Write-Warning "Skipping integration test (Dashboard not running)"
}

# 5. Test Segmentation Endpoint
Write-Host ""
Write-Host "5. Testing Segmentation Endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$SegmentationUrl/api/segments" -Method Get -TimeoutSec 5
    $segmentCount = if ($response.segments) { $response.segments.Count } else { 0 }
    if ($segmentCount -gt 0) {
        Write-Success "Segmentation Agent returned $segmentCount segments"
        $response.segments | ForEach-Object {
            Write-Info "  - $($_.name): $($_.customer_count) customers"
        }
    }
    else {
        Write-Warning "No segments returned from Segmentation Agent"
    }
}
catch {
    Write-Error "Segmentation endpoint test failed: $($_.Exception.Message)"
}

# 6. Test RAG Content Endpoint
Write-Host ""
Write-Host "6. Testing RAG Content Endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$RagUrl/api/content?limit=3" -Method Get -TimeoutSec 5
    if ($response.items) {
        Write-Success "RAG API returned $($response.total) content items"
        $response.items | ForEach-Object {
            Write-Info "  - $($_.title) [$($_.content_type)]"
        }
    }
}
catch {
    Write-Error "RAG content endpoint test failed: $($_.Exception.Message)"
}

# 7. Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Test Summary                                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$totalTests = $results.Count
$passedTests = ($results.Values | Where-Object { $_ -eq $true }).Count

Write-Host "Segmentation Agent: $(if ($results.SegmentationAgent) { '✓ PASS' } else { '✗ FAIL' })" `
    -ForegroundColor $(if ($results.SegmentationAgent) { 'Green' } else { 'Red' })
Write-Host "RAG API:           $(if ($results.RagApi) { '✓ PASS' } else { '✗ FAIL' })" `
    -ForegroundColor $(if ($results.RagApi) { 'Green' } else { 'Red' })
Write-Host "Dashboard:         $(if ($results.Dashboard) { '✓ PASS' } else { '✗ FAIL' })" `
    -ForegroundColor $(if ($results.Dashboard) { 'Green' } else { 'Red' })
Write-Host "Integration:       $(if ($results.Integration) { '✓ PASS' } else { '✗ FAIL' })" `
    -ForegroundColor $(if ($results.Integration) { 'Green' } else { 'Red' })

Write-Host ""
Write-Host "Overall: $passedTests/$totalTests tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { 'Green' } else { 'Yellow' })

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
if ($passedTests -eq $totalTests) {
    Write-Host "✓ All services are running and integrated!"
    Write-Host "✓ Visit: http://localhost:3000/integration"
    Write-Host "✓ Click 'Start Workflow' to test the full integration"
}
else {
    Write-Host "✗ Some services are not running. Please start them:"
    if (-not $results.SegmentationAgent) {
        Write-Host "  - Segmentation Agent: cd segmentation-agent-node && npm run dev"
    }
    if (-not $results.RagApi) {
        Write-Host "  - RAG API: cd person2-rag-nodejs && npm run dev"
    }
    if (-not $results.Dashboard) {
        Write-Host "  - Dashboard: cd person5-orchestrator-dashboard && npm run dev"
    }
}

Write-Host ""
