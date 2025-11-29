# Generate 100 Customers for ChainReach AI Segmentation Agent
# This script creates sample customer data and sends it to Agent 1

Write-Host "Generating 100 customers for Agent 1 Segmentation...`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5001"
$customersCreated = 0
$errors = 0

# Sample company names
$companies = @(
    "Tech Solutions Inc", "Digital Ventures", "Cloud Innovators", "Data Insights LLC",
    "Enterprise Systems", "Global Solutions", "Future Tech", "Smart Analytics",
    "Quantum Computing Co", "AI Innovations", "Blockchain Labs", "IoT Solutions",
    "SaaS Platforms", "DevOps Services", "CyberSec Pro", "Network Solutions",
    "Database Systems", "API Gateway", "Microservices Inc", "Container Tech"
)

# Generate customer emails
$domains = @("company.com", "enterprise.io", "tech.co", "innovation.net", "solutions.org")

# Customer data generation
1..100 | ForEach-Object {
    $customerId = $_
    $companyIndex = ($customerId - 1) % $companies.Length
    $domainIndex = ($customerId - 1) % $domains.Length
    
    # Create realistic customer data
    $customer = @{
        customer_id = "CUST-$('{0:00000}' -f $customerId)"
        company_name = "$($companies[$companyIndex]) #$customerId"
        email = "contact$customerId@$($domains[$domainIndex])"
        industry = @("Technology", "Finance", "Healthcare", "Retail", "Manufacturing")[$customerId % 5]
        employee_count = @(50, 100, 250, 500, 1000, 5000)[($customerId - 1) % 6]
        total_purchases = [Math]::Floor([Random]::new($customerId).NextDouble() * 50000 + 1000)
        engagement_score = [Math]::Floor([Random]::new($customerId * 2).NextDouble() * 100)
        last_purchase_date = (Get-Date).AddDays(-[Math]::Floor([Random]::new($customerId * 3).NextDouble() * 365)).ToString("yyyy-MM-dd")
        created_at = (Get-Date).AddDays(-[Math]::Floor([Random]::new($customerId * 4).NextDouble() * 180)).ToString("yyyy-MM-dd")
    } | ConvertTo-Json
    
    try {
        # Create customer
        $response = Invoke-RestMethod -Uri "$baseUrl/api/customers" `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $customer `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        $customersCreated++
        
        # Print progress every 10 customers
        if ($customersCreated % 10 -eq 0) {
            Write-Host "[OK] Created $customersCreated customers..." -ForegroundColor Green
        }
    } catch {
        $errors++
        if ($errors -le 3) {
            Write-Host "[ERROR] Failed to create customer $customerId : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CUSTOMER CREATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Successfully created: $customersCreated customers" -ForegroundColor Green
Write-Host "Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""

# Get updated metrics
Write-Host "Fetching updated metrics from Agent 1..." -ForegroundColor Yellow
Write-Host ""

try {
    $metrics = Invoke-RestMethod -Uri "$baseUrl/metrics" -TimeoutSec 5
    
    Write-Host "Current Database Status:" -ForegroundColor Cyan
    Write-Host "  Total Customers: $($metrics.summary.total_customers)" -ForegroundColor White
    Write-Host "  Active Segments: $($metrics.summary.active_segments)" -ForegroundColor White
    Write-Host "  Avg Engagement Score: $($metrics.summary.avg_engagement_score)" -ForegroundColor White
    Write-Host "  Total Revenue: $($metrics.summary.total_revenue)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Customers by Segment:" -ForegroundColor Cyan
    $metrics.segments | ForEach-Object {
        Write-Host "  - $($_.segment_name): $($_.customer_count) customers" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to fetch metrics: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next step: Run RAG Agent to generate content" -ForegroundColor Yellow
Write-Host "Endpoint: POST http://localhost:5002/api/generate-all-segments" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
