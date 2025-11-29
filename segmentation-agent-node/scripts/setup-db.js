// Simple database initialization
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

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log('');
    
    await client.query('BEGIN');
    
    // Drop existing tables
    console.log('🗑️  Dropping existing tables...');
    await client.query('DROP TABLE IF EXISTS customers CASCADE');
    await client.query('DROP TABLE IF EXISTS segments CASCADE');
    console.log('✅ Old tables dropped');
    console.log('');
    
    // Create segments table
    console.log('📋 Creating segments table...');
    await client.query(`
      CREATE TABLE segments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        criteria JSONB NOT NULL,
        customer_count INTEGER DEFAULT 0,
        ai_generated BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Segments table created');
    
    // Create customers table
    console.log('📋 Creating customers table...');
    await client.query(`
      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        customer_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        industry VARCHAR(100),
        revenue DECIMAL(15, 2),
        employee_count INTEGER,
        location VARCHAR(255),
        country VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_purchases DECIMAL(15, 2) DEFAULT 0,
        purchase_count INTEGER DEFAULT 0,
        avg_purchase_value DECIMAL(15, 2) DEFAULT 0,
        last_purchase_date TIMESTAMP,
        products_purchased TEXT[],
        email_opens INTEGER DEFAULT 0,
        email_clicks INTEGER DEFAULT 0,
        website_visits INTEGER DEFAULT 0,
        engagement_score DECIMAL(5, 2) DEFAULT 0,
        segment_id INTEGER,
        segment_name VARCHAR(100),
        segment_confidence DECIMAL(5, 2),
        custom_attributes JSONB,
        CONSTRAINT fk_segment FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Customers table created');
    console.log('');
    
    // Create indexes
    console.log('📊 Creating indexes...');
    await client.query('CREATE INDEX idx_customers_email ON customers(email)');
    await client.query('CREATE INDEX idx_customers_segment ON customers(segment_id)');
    await client.query('CREATE INDEX idx_customers_industry ON customers(industry)');
    await client.query('CREATE INDEX idx_customers_country ON customers(country)');
    await client.query('CREATE INDEX idx_customers_engagement ON customers(engagement_score)');
    await client.query('CREATE INDEX idx_customers_total_purchases ON customers(total_purchases)');
    await client.query('CREATE INDEX idx_segments_name ON segments(name)');
    console.log('✅ Indexes created');
    console.log('');
    
    // Insert default segments
    console.log('📝 Creating default segments...');
    const segments = [
      {
        name: 'High Value Customers',
        description: 'Customers with high purchase value and strong engagement',
        criteria: { min_total_purchases: 10000, min_engagement_score: 75 }
      },
      {
        name: 'At Risk',
        description: 'Previously active customers who haven\'t engaged recently',
        criteria: { days_since_last_purchase: 90, max_engagement_score: 30 }
      },
      {
        name: 'New Customers',
        description: 'Recently acquired customers in their first 30 days',
        criteria: { days_since_created: 30 }
      },
      {
        name: 'VIP Enterprise',
        description: 'Large enterprise organizations with significant spending',
        criteria: { min_employee_count: 1000, min_revenue: 50000 }
      },
      {
        name: 'Engaged SMB',
        description: 'Small/medium businesses with high engagement',
        criteria: { max_employee_count: 999, min_engagement_score: 60, min_purchase_count: 5 }
      }
    ];
    
    for (const segment of segments) {
      await client.query(
        'INSERT INTO segments (name, description, criteria) VALUES ($1, $2, $3)',
        [segment.name, segment.description, JSON.stringify(segment.criteria)]
      );
      console.log(`   ✓ ${segment.name}`);
    }
    
    await client.query('COMMIT');
    
    console.log('');
    console.log('🎉 Database initialized successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   ✓ 2 tables created (segments, customers)`);
    console.log(`   ✓ 7 indexes created`);
    console.log(`   ✓ 5 default segments created`);
    console.log('');
    console.log('Next step: Import customer data');
    console.log('Run: node scripts/import-excel.js ChainReach_AI_Customers_1000.xlsx');
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('🚀 ChainReach AI - Database Setup');
console.log('===================================');
console.log('');

initDatabase();
