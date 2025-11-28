// Quick Segmentation API Test (No AI needed)
// Tests rule-based segmentation features

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testSegmentationAPI() {
  console.log('Testing ChainReach Segmentation API');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Test 1: Database Connection
    console.log('Test 1: Database Connection');
    const dbTest = await pool.query('SELECT NOW() as current_time');
    console.log('  ✅ Database connected:', dbTest.rows[0].current_time);
    console.log('');

    // Test 2: Customer Count
    console.log('Test 2: Customer Count');
    const customerCount = await pool.query('SELECT COUNT(*) as count FROM customers');
    console.log(`  ✅ Total customers: ${customerCount.rows[0].count}`);
    console.log('');

    // Test 3: Segment Count
    console.log('Test 3: Existing Segments');
    const segments = await pool.query('SELECT id, name, customer_count FROM segments ORDER BY id');
    console.log(`  ✅ Total segments: ${segments.rows.length}`);
    segments.rows.forEach(seg => {
      console.log(`     - ${seg.name}: ${seg.customer_count || 0} customers`);
    });
    console.log('');

    // Test 4: Sample Customers
    console.log('Test 4: Sample Customer Data (Top 5 by Revenue)');
    const topCustomers = await pool.query(`
      SELECT 
        company,
        name,
        total_purchases,
        revenue,
        engagement_score,
        segment_name
      FROM customers 
      WHERE total_purchases > 0 
      ORDER BY revenue DESC 
      LIMIT 5
    `);
    topCustomers.rows.forEach((c, i) => {
      console.log(`     ${i+1}. ${c.company || c.name}`);
      console.log(`        Revenue: $${c.revenue}, Purchases: $${c.total_purchases}`);
      console.log(`        Engagement: ${c.engagement_score || 0}/100`);
      console.log(`        Segment: ${c.segment_name || 'Not assigned'}`);
    });
    console.log('');

    // Test 5: Calculate Engagement Scores
    console.log('Test 5: Calculating Engagement Scores');
    console.log('  Updating engagement scores for all customers...');
    
    // Calculate engagement based on purchases, revenue, and activity
    await pool.query(`
      UPDATE customers
      SET engagement_score = LEAST(100, GREATEST(0, 
        (CASE 
          WHEN total_purchases > 0 THEN 
            (purchase_count * 10) + 
            (LEAST(COALESCE(revenue, 0) / 100, 30)) +
            (CASE WHEN last_purchase_date > NOW() - INTERVAL '30 days' THEN 20 ELSE 0 END) +
            (CASE WHEN total_purchases > 5000 THEN 10 ELSE 0 END)
          ELSE 0 
        END)
      ))
    `);
    
    const avgEngagement = await pool.query('SELECT AVG(engagement_score) as avg FROM customers WHERE engagement_score > 0');
    console.log(`  ✅ Average engagement score: ${parseFloat(avgEngagement.rows[0].avg).toFixed(1)}/100`);
    console.log('');

    // Test 6: Apply Segmentation Rules
    console.log('Test 6: Applying Rule-Based Segmentation');
    
    // Get first segment and apply it
    if (segments.rows.length > 0) {
      const firstSegment = segments.rows[0];
      console.log(`  Applying segment: "${firstSegment.name}"`);
      
      // Get segment criteria
      const segmentData = await pool.query('SELECT criteria FROM segments WHERE id = $1', [firstSegment.id]);
      const criteria = segmentData.rows[0].criteria;
      console.log(`  Criteria: ${JSON.stringify(criteria)}`);
      
      // Build WHERE clause from criteria
      const conditions = [];
      const values = [];
      let valueIndex = 1;

      if (criteria.min_total_purchases) {
        conditions.push(`total_purchases >= $${valueIndex++}`);
        values.push(criteria.min_total_purchases);
      }
      if (criteria.min_engagement_score) {
        conditions.push(`engagement_score >= $${valueIndex++}`);
        values.push(criteria.min_engagement_score);
      }
      if (criteria.min_purchase_count) {
        conditions.push(`purchase_count >= $${valueIndex++}`);
        values.push(criteria.min_purchase_count);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Count matching customers
      const countQuery = `SELECT COUNT(*) as count FROM customers ${whereClause}`;
      const matchCount = await pool.query(countQuery, values);
      console.log(`  ✅ Customers matching criteria: ${matchCount.rows[0].count}`);
      
      // Update customers with this segment
      if (conditions.length > 0) {
        const updateQuery = `
          UPDATE customers 
          SET segment_id = $${valueIndex}, segment_name = $${valueIndex + 1}
          ${whereClause}
        `;
        await pool.query(updateQuery, [...values, firstSegment.id, firstSegment.name]);
        
        // Update segment customer_count
        await pool.query(
          'UPDATE segments SET customer_count = $1 WHERE id = $2',
          [matchCount.rows[0].count, firstSegment.id]
        );
        console.log(`  ✅ Assigned ${matchCount.rows[0].count} customers to "${firstSegment.name}"`);
      }
    }
    console.log('');

    // Test 7: Segment Distribution
    console.log('Test 7: Final Segment Distribution');
    const distribution = await pool.query(`
      SELECT 
        COALESCE(segment_name, 'Unassigned') as segment,
        COUNT(*) as count,
        ROUND(AVG(engagement_score), 1) as avg_engagement,
        SUM(revenue) as total_revenue
      FROM customers
      GROUP BY segment_name
      ORDER BY count DESC
    `);
    
    distribution.rows.forEach(row => {
      console.log(`  ${row.segment}: ${row.count} customers`);
      console.log(`    Avg Engagement: ${row.avg_engagement || 0}/100`);
      console.log(`    Total Revenue: $${parseFloat(row.total_revenue).toFixed(2)}`);
    });
    console.log('');

    // Summary
    console.log('=' .repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('=' .repeat(60));
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Start API server: npm start');
    console.log('  2. Test endpoints: .\\test-api.ps1');
    console.log('  3. For AI segmentation, configure Azure OpenAI or OpenAI API key');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testSegmentationAPI();
