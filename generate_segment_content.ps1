# ChainReach AI - Generate Marketing Content from Segments
# This script fetches customer segments from the segmentation API
# and generates tailored marketing content for each segment

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "ChainReach AI - Content Generation from Segments" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# APIs
$SegmentationAPI = "http://localhost:3000"
$RAGAPI = "http://localhost:8000"
$MessageGenerationAPI = "http://localhost:5000"

# Step 1: Get segments from segmentation API
Write-Host "STEP 1: Fetching Customer Segments from Segmentation API" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    $segments = Invoke-RestMethod -Uri "$SegmentationAPI/api/segments" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[OK] Retrieved $($segments.data.Count) customer segments" -ForegroundColor Green
    Write-Host ""
    
    # Display segments
    Write-Host "Available Segments:" -ForegroundColor White
    $segments.data | ForEach-Object {
        Write-Host "  * $($_.name)" -ForegroundColor Cyan
        Write-Host "    Description: $($_.description)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "[ERROR] Failed to get segments: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: For each segment, search for relevant content from RAG
Write-Host ""
Write-Host "STEP 2: Searching for Relevant Content from RAG API" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

$contentMapping = @{}

$segments.data | ForEach-Object {
    $segment = $_
    $segmentName = $segment.name
    $searchQuery = "$($segment.description). Target audience: professionals"
    
    Write-Host "Searching for content for segment: $segmentName" -ForegroundColor Cyan
    
    try {
        $searchBody = @{
            query = $searchQuery
            top_k = 3
        } | ConvertTo-Json
        
        $searchResult = Invoke-RestMethod -Uri "$RAGAPI/search" -Method POST -Body $searchBody -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
        
        if ($searchResult.results_count -gt 0) {
            Write-Host "  [OK] Found $($searchResult.results_count) relevant content items" -ForegroundColor Green
            
            $contentMapping[$segmentName] = @{
                segment = $segment
                content = $searchResult.results
            }
            
            # Show top content items
            $searchResult.results | Select-Object -First 2 | ForEach-Object {
                Write-Host "    * $($_.title)" -ForegroundColor Gray
                Write-Host "      Campaign: $($_.campaign_name)" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "  [WARN] No content found for this segment" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [ERROR] Error searching content: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Step 3: Generate personalized messages for each segment
Write-Host ""
Write-Host "STEP 3: Generating Personalized Messages" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

$results = @()

$contentMapping.Keys | ForEach-Object {
    $segmentName = $_
    $mapping = $contentMapping[$segmentName]
    $segment = $mapping.segment
    $contentItems = $mapping.content
    
    Write-Host "Generating message for: $segmentName" -ForegroundColor Cyan
    
    # Create a template message
    $templateMessage = @{
        segment = $segmentName
        subject = "Personalized Offer for $segmentName"
        body = "Dear $segmentName customer,`n`nBased on your profile and interests, we have curated exclusive content and offers tailored specifically for you.`n`nWe found $($contentItems.Count) relevant content items for you.`n`nBest regards,`nChainReach AI Team"
        contentItems = $contentItems.Count
    }
    
    Write-Host "  [OK] Message template created" -ForegroundColor Green
    Write-Host "    Subject: $($templateMessage.subject)" -ForegroundColor Gray
    Write-Host "    Content Items: $($contentItems.Count)" -ForegroundColor DarkGray
    
    $results += $templateMessage
    
    Write-Host ""
}

# Step 4: Summary
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "SUMMARY - Content Generated for All Segments" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Segments Processed: $($results.Count)" -ForegroundColor Cyan
Write-Host ""

$results | ForEach-Object {
    Write-Host "Segment: $($_.segment)" -ForegroundColor Cyan
    Write-Host "  Subject: $($_.subject)" -ForegroundColor White
    Write-Host "  Content Items: $($_.contentItems)" -ForegroundColor Gray
    Write-Host ""
}

# Export results to JSON
$exportPath = "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segment_content_results.json"
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $exportPath -Encoding UTF8
Write-Host "[OK] Results exported to: $exportPath" -ForegroundColor Green
Write-Host ""
