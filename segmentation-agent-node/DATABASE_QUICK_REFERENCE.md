# ChainReach Database Quick Access Commands

## 🔌 Connect to Database (Interactive)
```powershell
$env:PGPASSWORD = "ChainReach2025!"
psql "host=chainreach-db.postgres.database.azure.com port=5432 dbname=chainreach_prod user=dbadmin sslmode=require"
```

## 📊 Quick Queries (One-liners)

### Count all customers
```powershell
$env:PGPASSWORD = "ChainReach2025!"; psql "host=chainreach-db.postgres.database.azure.com port=5432 dbname=chainreach_prod user=dbadmin sslmode=require" -c "SELECT COUNT(*) FROM customers;"
```

### View all segments
```powershell
$env:PGPASSWORD = "ChainReach2025!"; psql "host=chainreach-db.postgres.database.azure.com port=5432 dbname=chainreach_prod user=dbadmin sslmode=require" -c "SELECT * FROM segments;"
```

### Customer distribution by segment
```powershell
$env:PGPASSWORD = "ChainReach2025!"; psql "host=chainreach-db.postgres.database.azure.com port=5432 dbname=chainreach_prod user=dbadmin sslmode=require" -c "SELECT segment_name, COUNT(*) as count FROM customers WHERE segment_name IS NOT NULL GROUP BY segment_name;"
```

### Top 10 customers by revenue
```powershell
$env:PGPASSWORD = "ChainReach2025!"; psql "host=chainreach-db.postgres.database.azure.com port=5432 dbname=chainreach_prod user=dbadmin sslmode=require" -c "SELECT customer_id, name, company, total_purchases FROM customers ORDER BY total_purchases DESC LIMIT 10;"
```

### Recent customers (last 250)
```powershell
$env:PGPASSWORD = "ChainReach2025!"; psql "host=chainreach-db.postgres.database.azure.com port=5432 dbname=chainreach_prod user=dbadmin sslmode=require" -c "SELECT customer_id, name, email, company, created_at FROM customers ORDER BY created_at DESC LIMIT 250;"
```

### Export all customers to JSON
```powershell
$env:PGPASSWORD = "ChainReach2025!"; psql "host=chainreach-db.postgres.database.azure.com port=5432 dbname=chainreach_prod user=dbadmin sslmode=require" -t -c "SELECT json_agg(row_to_json(customers)) FROM customers;" > customers.json
```

### Export to CSV
```powershell
$env:PGPASSWORD = "ChainReach2025!"; psql "host=chainreach-db.postgres.database.azure.com port=5432 dbname=chainreach_prod user=dbadmin sslmode=require" -c "\COPY customers TO 'customers.csv' WITH CSV HEADER"
```

## 📋 Database Schema

### Tables:
- **customers** - All customer data with engagement metrics
- **segments** - Segment definitions and criteria
- **segment_analytics** - View with aggregated segment statistics

### Key Columns in `customers`:
- customer_id (unique identifier)
- name, email, company, industry
- total_purchases, purchase_count
- email_opens, email_clicks, website_visits
- engagement_score
- segment_id, segment_name

### Key Columns in `segments`:
- id, name, description
- criteria (JSONB)
- customer_count
- ai_generated

## 🔍 Useful Queries

### Get segment analytics
```sql
SELECT * FROM segment_analytics ORDER BY customer_count DESC;
```

### Find customers without segments
```sql
SELECT COUNT(*) FROM customers WHERE segment_id IS NULL;
```

### Get engagement distribution
```sql
SELECT 
    CASE 
        WHEN engagement_score >= 80 THEN 'High (80+)'
        WHEN engagement_score >= 50 THEN 'Medium (50-79)'
        ELSE 'Low (<50)'
    END as engagement_level,
    COUNT(*) as customer_count
FROM customers
GROUP BY engagement_level
ORDER BY MIN(engagement_score) DESC;
```

### Revenue by segment
```sql
SELECT 
    segment_name,
    COUNT(*) as customers,
    SUM(total_purchases) as total_revenue,
    AVG(total_purchases) as avg_revenue
FROM customers
WHERE segment_name IS NOT NULL
GROUP BY segment_name
ORDER BY total_revenue DESC;
```
