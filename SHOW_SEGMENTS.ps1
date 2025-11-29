Start-Sleep -Seconds 2

Write-Host "`n" -ForegroundColor White
Write-Host "Calling Segmentation Agent API on port 5001..." -ForegroundColor Cyan
Write-Host ""

try {
    $segments = Invoke-RestMethod -Uri "http://localhost:5001/api/segments" -TimeoutSec 10
    
    Write-Host "SUCCESS - Segments Retrieved" -ForegroundColor Green
    Write-Host "Total Segments: $($segments.data.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    $segments.data | ForEach-Object {
        Write-Host "ID: $($_.id) | Name: $($_.name)" -ForegroundColor White
        Write-Host "  Description: $($_.description)" -ForegroundColor Gray
        Write-Host "  Customers: $($_.customer_count)" -ForegroundColor Yellow
        Write-Host ""
    }
    
    Write-Host "Full JSON Response:" -ForegroundColor Yellow
    $segments.data | ConvertTo-Json -Depth 5
} catch {
    Write-Host "ERROR connecting to API" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
