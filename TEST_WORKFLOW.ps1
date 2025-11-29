Write-Host "
╔════════════════════════════════════════════════════════════════╗
║     ChainReach AI - Complete Workflow Test                     ║
║     Agent 1 Segmentation -> Agent 2 RAG with GPT-4o           ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "STEP 1: Get Segments from Segmentation Agent" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

try {
    $segments = Invoke-RestMethod -Uri "http://localhost:5001/api/segments" -TimeoutSec 10
    Write-Host "[OK] Retrieved segments from Agent 1 (Segmentation)" -ForegroundColor Green
    Write-Host "Number of segments: $($segments.data.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    $segments.data | ForEach-Object {
        Write-Host "  Segment: $($_.name)" -ForegroundColor White
        Write-Host "    Description: $($_.description)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "[ERROR] Failed to get segments: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 2: Generate Content for All Segments using GPT-4o" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Calling: POST http://localhost:5002/api/generate-all-segments" -ForegroundColor Gray
    Write-Host "This will use GPT-4o to generate content for each segment..." -ForegroundColor Gray
    Write-Host ""
    
    $generationResponse = Invoke-RestMethod -Uri "http://localhost:5002/api/generate-all-segments" -Method POST -ContentType "application/json" -TimeoutSec 60
    
    Write-Host "[OK] Content generation completed!" -ForegroundColor Green
    Write-Host "Total segments processed: $($generationResponse.total_segments)" -ForegroundColor Cyan
    Write-Host "Successful: $($generationResponse.successful)" -ForegroundColor Green
    Write-Host "Failed: $($generationResponse.failed)" -ForegroundColor Yellow
    Write-Host ""
    
    # Show results for each segment
    $generationResponse.results | ForEach-Object {
        Write-Host "  Segment: $($_.segment)" -ForegroundColor Cyan
        Write-Host "    Generated content items: $($_.generated_count)" -ForegroundColor Green
        
        $_.content | ForEach-Object {
            Write-Host "      • $($_.title)" -ForegroundColor Gray
            Write-Host "        Type: $($_.content_type) | Campaign: $($_.campaign)" -ForegroundColor DarkGray
        }
        Write-Host ""
    }
    
    # Show any errors
    if ($generationResponse.errors) {
        Write-Host "Errors encountered:" -ForegroundColor Red
        $generationResponse.errors | ForEach-Object {
            Write-Host "  ✗ $($_.segment): $($_.error)" -ForegroundColor Red
        }
        Write-Host ""
    }
} catch {
    Write-Host "[ERROR] Failed to generate content: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 3: View All Generated Content" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

try {
    $allContent = Invoke-RestMethod -Uri "http://localhost:5002/api/content" -TimeoutSec 10
    
    Write-Host "[OK] Retrieved content from RAG library" -ForegroundColor Green
    Write-Host "Total content items: $($allContent.total)" -ForegroundColor Cyan
    Write-Host ""
    
    $allContent.items | ForEach-Object {
        Write-Host "  Title: $($_.title)" -ForegroundColor White
        Write-Host "    Segment: $($_.segment)" -ForegroundColor Cyan
        Write-Host "    Type: $($_.content_type) | Campaign: $($_.campaign)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "[ERROR] Failed to retrieve content: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "STEP 4: View Segments with Generated Content" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

try {
    $segmentsWithContent = Invoke-RestMethod -Uri "http://localhost:5002/api/segments-with-content" -TimeoutSec 10
    
    Write-Host "[OK] Retrieved segments with their generated content" -ForegroundColor Green
    Write-Host "Total segments: $($segmentsWithContent.total_segments)" -ForegroundColor Cyan
    Write-Host "Total content items: $($segmentsWithContent.total_content_items)" -ForegroundColor Cyan
    Write-Host ""
    
    $segmentsWithContent.segments | ForEach-Object {
        Write-Host "  Segment: $($_.name)" -ForegroundColor Cyan
        Write-Host "    Description: $($_.description)" -ForegroundColor Gray
        Write-Host "    Content items: $($_.content_items_count)" -ForegroundColor White
        
        if ($_.content_items_count -gt 0) {
            $_.content_items | ForEach-Object {
                Write-Host "      • $($_.title)" -ForegroundColor DarkGray
            }
        }
        Write-Host ""
    }
} catch {
    Write-Host "[ERROR] Failed to retrieve segments with content: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "WORKFLOW COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  [OK] Agent 1 (Segmentation) running on port 5001" -ForegroundColor Green
Write-Host "  [OK] Agent 2 (RAG + GPT-4o) running on port 5002" -ForegroundColor Green
Write-Host "  [OK] Content generated using Azure OpenAI GPT-4o" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start Agent 3 (Message Generation) to create personalized messages" -ForegroundColor Gray
Write-Host "  2. Start Agent 4 (Compliance) to check content safety" -ForegroundColor Gray
Write-Host "  3. Use the Orchestrator to coordinate the full workflow" -ForegroundColor Gray
Write-Host ""
