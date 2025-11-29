#!/usr/bin/env pwsh
# RAG API Comprehensive Testing & Documentation

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RAG API - COMPREHENSIVE ENDPOINT TEST  " -ForegroundColor Cyan
Write-Host "  Port: 8000" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUri = "http://localhost:8000"
$contentType = "application/json"

# 1. Health Check
Write-Host "1. HEALTH CHECK" -ForegroundColor Yellow
Write-Host "   Endpoint: GET $baseUri/health" -ForegroundColor Gray
try {
    $health = Invoke-RestMethod -Uri "$baseUri/health" -Method Get -TimeoutSec 5
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor White
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. List All Content
Write-Host "2. LIST ALL CONTENT" -ForegroundColor Yellow
Write-Host "   Endpoint: GET $baseUri/content" -ForegroundColor Gray
try {
    $content = Invoke-RestMethod -Uri "$baseUri/content?skip=0&limit=10" -Method Get -TimeoutSec 5
    Write-Host "   Retrieved $($content.Count) items" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. Get Statistics
Write-Host "3. GET STATISTICS" -ForegroundColor Yellow
Write-Host "   Endpoint: GET $baseUri/stats" -ForegroundColor Gray
try {
    $stats = Invoke-RestMethod -Uri "$baseUri/stats" -Method Get -TimeoutSec 5
    Write-Host "   Total Content: $($stats.total_content)" -ForegroundColor Green
    Write-Host "   Content Types: $($stats.by_content_type | ConvertTo-Json -Compress)" -ForegroundColor White
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Search Content
Write-Host "4. SEARCH CONTENT" -ForegroundColor Yellow
Write-Host "   Endpoint: POST $baseUri/search" -ForegroundColor Gray
try {
    $searchBody = @{
        query = "enterprise security"
        top_k = 3
    } | ConvertTo-Json
    
    $searchResults = Invoke-RestMethod -Uri "$baseUri/search" -Method Post -Body $searchBody -ContentType $contentType -TimeoutSec 5
    Write-Host "   Found $($searchResults.results_count) results" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "`n" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host "         RAG API - COMPLETE USAGE GUIDE (Port 8000)        " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Write-Host "BASE URL: $baseUri" -ForegroundColor Yellow
Write-Host ""

Write-Host "ENDPOINT 1: HEALTH CHECK" -ForegroundColor Cyan
Write-Host "  GET /health" -ForegroundColor White
Write-Host "  Purpose: Check API health status" -ForegroundColor Gray
Write-Host ""

Write-Host "ENDPOINT 2: LIST ALL CONTENT" -ForegroundColor Cyan
Write-Host "  GET /content?skip=0&limit=10" -ForegroundColor White
Write-Host "  Parameters:" -ForegroundColor Gray
Write-Host "    - skip: Number of items to skip (default 0)" -ForegroundColor Gray
Write-Host "    - limit: Max items to return, 1-100 (default 10)" -ForegroundColor Gray
Write-Host ""

Write-Host "ENDPOINT 3: GET SPECIFIC CONTENT" -ForegroundColor Cyan
Write-Host "  GET /content/{content_id}" -ForegroundColor White
Write-Host "  Example: GET /content/1" -ForegroundColor Gray
Write-Host "  Returns a single content item with all metadata" -ForegroundColor Gray
Write-Host ""

Write-Host "ENDPOINT 4: SEARCH CONTENT (Semantic)" -ForegroundColor Cyan
Write-Host "  POST /search" -ForegroundColor White
Write-Host "  Required Body:" -ForegroundColor Gray
Write-Host "    {" -ForegroundColor Gray
Write-Host "      'query': 'your search query'," -ForegroundColor Gray
Write-Host "      'top_k': 3" -ForegroundColor Gray
Write-Host "    }" -ForegroundColor Gray
Write-Host "  Optional filters:" -ForegroundColor Gray
Write-Host "    - content_type: email, social, ad, blog" -ForegroundColor Gray
Write-Host "    - campaign_name: filter by campaign" -ForegroundColor Gray
Write-Host "    - audience: B2B, B2C, Enterprise, SMB" -ForegroundColor Gray
Write-Host "    - tags: array of tags" -ForegroundColor Gray
Write-Host ""

Write-Host "ENDPOINT 5: GET STATISTICS" -ForegroundColor Cyan
Write-Host "  GET /stats" -ForegroundColor White
Write-Host "  Returns library statistics including:" -ForegroundColor Gray
Write-Host "    - total_content: Total items" -ForegroundColor Gray
Write-Host "    - by_content_type: Count by type" -ForegroundColor Gray
Write-Host "    - by_audience: Count by audience" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
