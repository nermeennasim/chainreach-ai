// Import Excel data to PostgreSQL database
const XLSX = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function importExcel(filePath) {
  try {
    console.log('📂 Reading Excel file:', filePath);
    const workbook = XLSX.readFile(filePath);
    
    // Look for the "All Customers" sheet
    let sheetName = workbook.SheetNames.find(name => name.includes('All Customers') || name.includes('Customer'));
    if (!sheetName) {
      sheetName = workbook.SheetNames[1]; // Try second sheet if first is dashboard
    }
    
    console.log(`📋 Using sheet: "${sheetName}"`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${data.length} rows in Excel`);

    if (data.length === 0) {
      console.log('⚠️  No data found in Excel file');
      return;
    }

    console.log('📋 Sample row:', JSON.stringify(data[0], null, 2));
    console.log('');

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Map Excel columns (your file uses specific column names)
        const customerId = row['Customer ID'] || row.customer_id || row.CustomerID || `CUST-${Date.now()}-${i}`;
        const name = row.Name || row.name || 'Unknown';
        const email = row.Email || row.email || `customer${i}@example.com`;
        const phone = row.Phone || row.phone || null;
        const company = null; // Not in source data
        const industry = null; // Not in source data
        const revenue = null; // Not in source data
        // Handle Age - round decimals to integer
        const employeeCount = row.Age ? Math.round(parseFloat(row.Age)) : null;
        const location = row.Location || row.location || null;
        const country = 'USA'; // Assuming USA based on state data
        
        // Purchase data  
        const totalPurchases = parseFloat(row['Lifetime Value'] || row['Total Purchases'] || 0);
        const purchaseCount = Math.round(parseFloat(row['Total Purchases'] || row['Purchase Count'] || 0)); // Handle decimals
        const avgPurchaseValue = parseFloat(row['Avg Order Value'] || 0);
        
        // Calculate last purchase date from "Last Purchase (Days Ago)"
        let lastPurchaseDate = null;
        const daysAgoRaw = row['Last Purchase (Days Ago)'] || 0;
        const daysAgo = Math.round(parseFloat(daysAgoRaw)); // Handle decimal days
        if (daysAgo > 0) {
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          lastPurchaseDate = date.toISOString();
        }
        
        // Engagement data
        const emailOpens = row['Opens Emails'] ? 50 : 10; // Convert boolean to count estimate
        const emailClicks = row['Clicks Links'] ? 20 : 2;
        const websiteVisits = Math.round(parseFloat(row['Engagement Score'] || 0) / 2); // Estimate from engagement score
        
        // Use engagement score from Excel (already calculated)
        const engagementScore = Math.round(parseFloat(row['Engagement Score'] || 0));

        await pool.query(
          `INSERT INTO customers (
            customer_id, name, email, phone, company, industry,
            revenue, employee_count, location, country,
            total_purchases, purchase_count, avg_purchase_value,
            last_purchase_date, email_opens, email_clicks, website_visits,
            engagement_score
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            total_purchases = EXCLUDED.total_purchases,
            purchase_count = EXCLUDED.purchase_count,
            engagement_score = EXCLUDED.engagement_score,
            updated_at = NOW()`,
          [
            customerId,
            name,
            email,
            phone,
            company,
            industry,
            revenue,
            employeeCount,
            location,
            country,
            totalPurchases,
            purchaseCount,
            avgPurchaseValue,
            lastPurchaseDate,
            emailOpens,
            emailClicks,
            websiteVisits,
            engagementScore,
          ]
        );
        
        imported++;
        
        // Progress indicator
        if ((i + 1) % 100 === 0) {
          console.log(`⏳ Progress: ${i + 1}/${data.length} rows processed...`);
        }
      } catch (err) {
        if (err.code === '23505') { // Unique constraint violation
          skipped++;
        } else {
          console.error(`❌ Error importing row ${i + 1}:`, err.message);
          errors++;
        }
      }
    }

    console.log('');
    console.log('✅ Import complete!');
    console.log(`   ✓ Imported: ${imported} customers`);
    console.log(`   ⊘ Skipped (duplicates): ${skipped}`);
    if (errors > 0) {
      console.log(`   ✗ Errors: ${errors}`);
    }
    
    // Display customer count by segment
    const stats = await pool.query(`
      SELECT 
        COALESCE(segment_name, 'Unassigned') as segment,
        COUNT(*) as count
      FROM customers
      GROUP BY segment_name
      ORDER BY count DESC
    `);
    
    console.log('');
    console.log('📊 Customer Distribution:');
    stats.rows.forEach(row => {
      console.log(`   ${row.segment}: ${row.count} customers`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get file path from command line or use default
const filePath = process.argv[2] || './ChainReach_AI_Customers_1000.xlsx';

console.log('🚀 ChainReach AI - Excel Import Tool');
console.log('=====================================');
console.log('');

importExcel(filePath);
