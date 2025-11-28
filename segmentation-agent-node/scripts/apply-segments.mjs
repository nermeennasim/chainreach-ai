// Apply AI Segments Directly to Database
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function applySegments() {
  console.log('Applying AI Segments to All Customers...');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Reset all segments
    console.log('Step 1: Resetting all segment assignments...');
    await pool.query('UPDATE customers SET segment_id = NULL, segment_name = NULL');
    console.log('  ✅ Reset complete');
    console.log('');

    // Step 2: Apply each segment based on criteria
    console.log('Step 2: Applying segments based on AI criteria...');
    console.log('');

    // Elite High Spenders (ID: 12)
    let result = await pool.query(`
      UPDATE customers 
      SET segment_id = 12, segment_name = 'Elite High Spenders'
      WHERE total_purchases >= 50000 AND engagement_score = 100
      RETURNING id
    `);
    console.log(`  ✅ Elite High Spenders: ${result.rowCount} customers`);

    // Consistent Volume Buyers (ID: 13)
    result = await pool.query(`
      UPDATE customers 
      SET segment_id = 13, segment_name = 'Consistent Volume Buyers'
      WHERE segment_id IS NULL 
        AND total_purchases >= 30000 AND total_purchases < 50000 
        AND engagement_score >= 85
      RETURNING id
    `);
    console.log(`  ✅ Consistent Volume Buyers: ${result.rowCount} customers`);

    // Emerging Growth Customers (ID: 14)
    result = await pool.query(`
      UPDATE customers 
      SET segment_id = 14, segment_name = 'Emerging Growth Customers'
      WHERE segment_id IS NULL 
        AND total_purchases >= 20000 AND total_purchases < 30000 
        AND engagement_score >= 70
      RETURNING id
    `);
    console.log(`  ✅ Emerging Growth Customers: ${result.rowCount} customers`);

    // High Engagement Aspirants (ID: 15)
    result = await pool.query(`
      UPDATE customers 
      SET segment_id = 15, segment_name = 'High Engagement Aspirants'
      WHERE segment_id IS NULL 
        AND total_purchases >= 10000 AND total_purchases < 20000 
        AND engagement_score >= 90
      RETURNING id
    `);
    console.log(`  ✅ High Engagement Aspirants: ${result.rowCount} customers`);

    // Low Engagement Value Buyers (ID: 16)
    result = await pool.query(`
      UPDATE customers 
      SET segment_id = 16, segment_name = 'Low Engagement Value Buyers'
      WHERE segment_id IS NULL 
        AND total_purchases >= 2172.6 AND total_purchases < 10000 
        AND engagement_score < 70
      RETURNING id
    `);
    console.log(`  ✅ Low Engagement Value Buyers: ${result.rowCount} customers`);

    console.log('');
    console.log('='.repeat(60));
    console.log('Step 3: Summary Statistics');
    console.log('='.repeat(60));
    console.log('');

    // Get summary for each segment
    const summary = await pool.query(`
      SELECT 
        COALESCE(segment_name, 'Unassigned') as segment,
        COUNT(*) as customer_count,
        ROUND(AVG(total_purchases)::numeric, 2) as avg_purchases,
        ROUND(AVG(engagement_score)::numeric, 1) as avg_engagement,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM customers))::numeric, 1) as percentage
      FROM customers
      WHERE segment_id IN (12, 13, 14, 15, 16) OR segment_id IS NULL
      GROUP BY segment_name
      ORDER BY customer_count DESC
    `);

    console.log('Segment Distribution:');
    console.log('');
    summary.rows.forEach(row => {
      console.log(`${row.segment}`);
      console.log(`  Customers: ${row.customer_count} (${row.percentage}%)`);
      console.log(`  Avg Purchases: $${row.avg_purchases}`);
      console.log(`  Avg Engagement: ${row.avg_engagement}/100`);
      console.log('');
    });

    // Total check
    const total = await pool.query('SELECT COUNT(*) as total FROM customers');
    const assigned = await pool.query('SELECT COUNT(*) as assigned FROM customers WHERE segment_id IS NOT NULL');
    
    console.log('='.repeat(60));
    console.log('✅ SEGMENT ASSIGNMENT COMPLETE!');
    console.log('='.repeat(60));
    console.log('');
    console.log(`Total Customers: ${total.rows[0].total}`);
    console.log(`Assigned: ${assigned.rows[0].assigned}`);
    console.log(`Unassigned: ${total.rows[0].total - assigned.rows[0].assigned}`);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
  } finally {
    await pool.end();
  }
}

applySegments();
