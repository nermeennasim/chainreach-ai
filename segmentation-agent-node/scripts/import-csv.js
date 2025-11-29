/**
 * Import customer data from CSV to PostgreSQL
 * Usage: node dist/scripts/import-csv.js <path-to-csv-file>
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function initializeDatabase() {
  console.log('📊 Initializing database schema...');
  
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, '../../scripts/init-db.sql'),
    'utf8'
  );
  
  try {
    await pool.query(schemaSQL);
    console.log('✅ Database schema initialized');
    return true;
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('✅ Database schema already exists');
      return true;
    }
    console.error('❌ Error initializing database:', error.message);
    return false;
  }
}

async function importCSV(csvPath) {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📂 Reading CSV file: ${csvPath}`);
  
  // Read and parse CSV
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    console.error('❌ CSV file is empty or has no data rows');
    process.exit(1);
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  console.log(`📋 Found ${lines.length - 1} rows with columns:`, headers.slice(0, 5).join(', '), '...');

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length < headers.length) {
      console.warn(`⚠️  Row ${i} has fewer columns than headers, skipping`);
      skipped++;
      continue;
    }

    try {
      // Map CSV columns to database fields
      const customerData = {};
      headers.forEach((header, idx) => {
        customerData[header] = values[idx] || null;
      });

      // Generate customer_id if not present
      const customerId = customerData.customer_id || customerData.customerid || `CUST-${Date.now()}-${i}`;
      const name = customerData.name || customerData.description || customerData.stockcode || `Customer ${i}`;
      const email = customerData.email || `customer${i}@chainreach.ai`;

      // Insert into database
      await pool.query(
        `INSERT INTO customers (
          customer_id, name, email, phone, company, industry,
          revenue, employee_count, location, country,
          total_purchases, purchase_count, avg_purchase_value,
          last_purchase_date, email_opens, email_clicks, website_visits
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (email) DO NOTHING`,
        [
          customerId,
          name,
          email,
          customerData.phone || null,
          customerData.company || null,
          customerData.industry || null,
          parseFloat(customerData.revenue || customerData.price || customerData.unitprice || 0),
          parseInt(customerData.employee_count || customerData.quantity || 0),
          customerData.location || null,
          customerData.country || null,
          parseFloat(customerData.total_purchases || customerData.price || customerData.unitprice || 0),
          parseInt(customerData.purchase_count || customerData.quantity || 1),
          parseFloat(customerData.avg_purchase_value || customerData.price || customerData.unitprice || 0),
          customerData.last_purchase_date || customerData.invoicedate || new Date().toISOString(),
          parseInt(customerData.email_opens || 0),
          parseInt(customerData.email_clicks || 0),
          parseInt(customerData.website_visits || 0),
        ]
      );
      imported++;
      
      if (imported % 100 === 0) {
        console.log(`📥 Imported ${imported} customers...`);
      }
    } catch (error) {
      errors++;
      if (errors < 5) {
        console.error(`❌ Error importing row ${i}:`, error.message);
      }
    }
  }

  console.log('');
  console.log('✅ Import complete!');
  console.log(`   ✓ Imported: ${imported}`);
  console.log(`   ⊘ Skipped: ${skipped}`);
  console.log(`   ✗ Errors: ${errors}`);
  
  return imported;
}

async function calculateEngagementScores() {
  console.log('');
  console.log('📊 Calculating engagement scores...');
  
  const result = await pool.query('SELECT COUNT(*)::int as count FROM customers');
  const count = result.rows[0].count;
  
  // Simple engagement score calculation
  await pool.query(`
    UPDATE customers SET 
      engagement_score = LEAST(100, 
        (COALESCE(purchase_count::float / 10, 0) * 30) + 
        (COALESCE(email_opens::float / 50, 0) * 25) + 
        (COALESCE(website_visits::float / 20, 0) * 20) + 
        25
      )
  `);
  
  console.log(`✅ Updated engagement scores for ${count} customers`);
}

async function applyDefaultSegments() {
  console.log('');
  console.log('🎯 Applying default segments...');
  
  const segments = await pool.query('SELECT id FROM segments ORDER BY id');
  
  for (const segment of segments.rows) {
    const result = await pool.query(
      'SELECT COUNT(*)::int as count FROM customers WHERE segment_id = $1',
      [segment.id]
    );
    console.log(`   Segment ${segment.id}: ${result.rows[0].count} customers`);
  }
}

async function main() {
  const csvPath = process.argv[2];
  
  console.log('🚀 ChainReach Customer Data Import');
  console.log('=====================================');
  console.log('');

  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
    console.log('');

    // Initialize database schema
    await initializeDatabase();
    console.log('');

    if (csvPath) {
      // Import CSV data
      const imported = await importCSV(csvPath);
      
      if (imported > 0) {
        // Calculate engagement scores
        await calculateEngagementScores();
        
        // Show segment distribution
        await applyDefaultSegments();
      }
    } else {
      console.log('ℹ️  No CSV file provided. Database initialized with schema only.');
      console.log('   To import data, run: node dist/scripts/import-csv.js <path-to-csv>');
    }

    console.log('');
    console.log('✅ Done! Your database is ready.');
    console.log('   Run: npm start');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
