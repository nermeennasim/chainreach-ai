// Initialize database schema using Node.js (no psql required)
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
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
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log('');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database successfully!');
    console.log('');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Executing database initialization script...');
    console.log('');
    
    // Execute SQL (split by semicolon and execute each statement)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await pool.query(statement);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists')) {
            console.warn(`⚠️  Warning: ${err.message.split('\n')[0]}`);
          }
        }
      }
    }
    
    console.log('✅ Database schema initialized successfully!');
    console.log('');
    
    // Verify tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 Tables created:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    console.log('');
    
    // Check segments
    const segments = await pool.query('SELECT id, name FROM segments ORDER BY id');
    console.log(`✅ ${segments.rows.length} default segments created:`);
    segments.rows.forEach(row => {
      console.log(`   ${row.id}. ${row.name}`);
    });
    console.log('');
    
    console.log('🎉 Database is ready for data import!');
    console.log('');
    console.log('Next step: Import your customer data');
    console.log('Run: node scripts/import-excel.js ChainReach_AI_Customers_1000.xlsx');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check your .env file has correct database credentials');
    console.error('2. Ensure your IP is whitelisted in Azure PostgreSQL firewall');
    console.error('3. Verify the database exists: chainreach_prod');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

console.log('🚀 ChainReach AI - Database Initialization');
console.log('==========================================');
console.log('');

initDatabase();
