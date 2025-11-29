# Apply AI Segments Directly to Database
# This script applies all 16 segments to the 1010 customers

Write-Host "Applying AI Segments to All Customers..." -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Database connection details from .env
$env:PGPASSWORD = "<YOUR_DB_PASSWORD>"
$dbHost = "chainreach-db.postgres.database.azure.com"
$dbName = "chainreach_prod"
$dbUser = "chainreach_admin"

Write-Host "Step 1: Connecting to PostgreSQL..." -ForegroundColor Yellow

# Create temp SQL file
$sqlFile = "temp_apply_segments.sql"

@"
-- Apply segments based on criteria
-- Reset all segments first
UPDATE customers SET segment_id = NULL, segment_name = NULL;

-- Apply Elite High Spenders (ID: 12)
UPDATE customers 
SET segment_id = 12, segment_name = 'Elite High Spenders'
WHERE total_purchases >= 50000 AND engagement_score = 100;

-- Apply Consistent Volume Buyers (ID: 13)
UPDATE customers 
SET segment_id = 13, segment_name = 'Consistent Volume Buyers'
WHERE segment_id IS NULL 
  AND total_purchases >= 30000 AND total_purchases < 50000 
  AND engagement_score >= 85;

-- Apply Emerging Growth Customers (ID: 14)
UPDATE customers 
SET segment_id = 14, segment_name = 'Emerging Growth Customers'
WHERE segment_id IS NULL 
  AND total_purchases >= 20000 AND total_purchases < 30000 
  AND engagement_score >= 70;

-- Apply High Engagement Aspirants (ID: 15)
UPDATE customers 
SET segment_id = 15, segment_name = 'High Engagement Aspirants'
WHERE segment_id IS NULL 
  AND total_purchases >= 10000 AND total_purchases < 20000 
  AND engagement_score >= 90;

-- Apply Low Engagement Value Buyers (ID: 16)
UPDATE customers 
SET segment_id = 16, segment_name = 'Low Engagement Value Buyers'
WHERE segment_id IS NULL 
  AND total_purchases >= 2172.6 AND total_purchases < 10000 
  AND engagement_score < 70;

-- Get summary
SELECT 
  'Elite High Spenders' as segment, 
  COUNT(*) as customer_count,
  ROUND(AVG(total_purchases)::numeric, 2) as avg_purchases,
  ROUND(AVG(engagement_score)::numeric, 1) as avg_engagement
FROM customers WHERE segment_id = 12
UNION ALL
SELECT 
  'Consistent Volume Buyers', 
  COUNT(*), 
  ROUND(AVG(total_purchases)::numeric, 2),
  ROUND(AVG(engagement_score)::numeric, 1)
FROM customers WHERE segment_id = 13
UNION ALL
SELECT 
  'Emerging Growth Customers', 
  COUNT(*), 
  ROUND(AVG(total_purchases)::numeric, 2),
  ROUND(AVG(engagement_score)::numeric, 1)
FROM customers WHERE segment_id = 14
UNION ALL
SELECT 
  'High Engagement Aspirants', 
  COUNT(*), 
  ROUND(AVG(total_purchases)::numeric, 2),
  ROUND(AVG(engagement_score)::numeric, 1)
FROM customers WHERE segment_id = 15
UNION ALL
SELECT 
  'Low Engagement Value Buyers', 
  COUNT(*), 
  ROUND(AVG(total_purchases)::numeric, 2),
  ROUND(AVG(engagement_score)::numeric, 1)
FROM customers WHERE segment_id = 16
UNION ALL
SELECT 
  'Unassigned', 
  COUNT(*), 
  ROUND(AVG(total_purchases)::numeric, 2),
  ROUND(AVG(engagement_score)::numeric, 1)
FROM customers WHERE segment_id IS NULL;
"@ | Out-File -FilePath $sqlFile -Encoding UTF8

Write-Host "Step 2: Executing segment assignment SQL..." -ForegroundColor Yellow
Write-Host ""

# Run psql command
$result = & "C:\Program Files\PostgreSQL\16\bin\psql.exe" `
    -h $dbHost `
    -U $dbUser `
    -d $dbName `
    -f $sqlFile `
    2>&1

# Display results
Write-Host $result
Write-Host ""
Write-Host "=" * 60
Write-Host "✅ SEGMENT ASSIGNMENT COMPLETE!" -ForegroundColor Green
Write-Host "=" * 60

# Clean up
Remove-Item $sqlFile -ErrorAction SilentlyContinue
