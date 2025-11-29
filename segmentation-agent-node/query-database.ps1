# Connect to ChainReach Azure PostgreSQL Database
# Database credentials from .env file

$DB_HOST = "chainreach-db.postgres.database.azure.com"
$DB_PORT = "5432"
$DB_NAME = "chainreach_prod"
$DB_USER = "dbadmin"
$DB_PASSWORD = "ChainReach2025!"

Write-Host "🔌 Connecting to ChainReach Database..." -ForegroundColor Cyan
Write-Host "Host: $DB_HOST" -ForegroundColor Gray
Write-Host "Database: $DB_NAME" -ForegroundColor Gray
Write-Host ""

# Set password as environment variable for psql
$env:PGPASSWORD = $DB_PASSWORD

# Common queries
$queries = @{
    "1" = @{
        Name = "Count all customers"
        Query = "SELECT COUNT(*) as total_customers FROM customers;"
    }
    "2" = @{
        Name = "View all segments"
        Query = "SELECT * FROM segments ORDER BY id;"
    }
    "3" = @{
        Name = "Customer segment distribution"
        Query = "SELECT segment_name, COUNT(*) as count FROM customers WHERE segment_name IS NOT NULL GROUP BY segment_name ORDER BY count DESC;"
    }
    "4" = @{
        Name = "Top 10 customers by revenue"
        Query = "SELECT customer_id, name, company, total_purchases, segment_name FROM customers ORDER BY total_purchases DESC LIMIT 10;"
    }
    "5" = @{
        Name = "Segment analytics"
        Query = "SELECT * FROM segment_analytics ORDER BY customer_count DESC;"
    }
    "6" = @{
        Name = "Recent customers (last 24 hours)"
        Query = "SELECT customer_id, name, email, company, created_at FROM customers WHERE created_at > NOW() - INTERVAL '24 hours' ORDER BY created_at DESC;"
    }
}

Write-Host "📊 Available Queries:" -ForegroundColor Green
foreach ($key in $queries.Keys | Sort-Object) {
    Write-Host "  $key. $($queries[$key].Name)" -ForegroundColor Yellow
}
Write-Host "  7. Custom query (interactive)" -ForegroundColor Yellow
Write-Host "  8. Export customers to CSV" -ForegroundColor Yellow
Write-Host "  0. Exit" -ForegroundColor Gray
Write-Host ""

while ($true) {
    $choice = Read-Host "Select a query (0-8)"
    
    if ($choice -eq "0") {
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        break
    }
    
    if ($choice -eq "7") {
        Write-Host "`n💡 Enter your SQL query (press Enter twice when done):" -ForegroundColor Cyan
        $customQuery = ""
        while ($true) {
            $line = Read-Host
            if ($line -eq "") { break }
            $customQuery += $line + "`n"
        }
        
        if ($customQuery.Trim() -ne "") {
            Write-Host "`n🔍 Executing query..." -ForegroundColor Yellow
            psql "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER sslmode=require" -c $customQuery
        }
    }
    elseif ($choice -eq "8") {
        $outputFile = "customers_export_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
        Write-Host "`n📥 Exporting customers to $outputFile..." -ForegroundColor Yellow
        psql "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER sslmode=require" `
            -c "COPY (SELECT * FROM customers) TO STDOUT WITH CSV HEADER" > $outputFile
        Write-Host "✅ Exported to $outputFile" -ForegroundColor Green
    }
    elseif ($queries.ContainsKey($choice)) {
        $query = $queries[$choice]
        Write-Host "`n🔍 Executing: $($query.Name)" -ForegroundColor Yellow
        Write-Host "Query: $($query.Query)" -ForegroundColor Gray
        Write-Host ""
        psql "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER sslmode=require" -c $query.Query
    }
    else {
        Write-Host "❌ Invalid choice. Please select 0-8." -ForegroundColor Red
    }
    
    Write-Host "`n" -NoNewline
}

# Clear password from environment
$env:PGPASSWORD = $null
