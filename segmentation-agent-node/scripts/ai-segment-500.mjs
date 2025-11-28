// AI Segmentation - 500 Customer Sample + Auto-Create Segments
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

async function aiSegmentation500() {
  console.log('AI Segmentation - 500 Customer Analysis');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Fetch 500 sample customers
    console.log('Step 1: Fetching 500 sample customers...');
    const result = await pool.query(`
      SELECT 
        company,
        name,
        total_purchases,
        revenue,
        engagement_score,
        industry,
        country,
        employee_count,
        purchase_count
      FROM customers 
      WHERE total_purchases > 0 
      ORDER BY revenue DESC NULLS LAST, total_purchases DESC
      LIMIT 500
    `);

    const customers = result.rows;
    console.log(`  ✅ Fetched ${customers.length} customers`);
    console.log('');

    // 2. Calculate summary stats
    console.log('Step 2: Analyzing customer data...');
    const avgPurchases = customers.reduce((sum, c) => sum + parseFloat(c.total_purchases), 0) / customers.length;
    const avgEngagement = customers.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / customers.length;
    const industries = [...new Set(customers.map(c => c.industry).filter(i => i))];
    const totalRevenue = customers.reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0);
    const topRevenue = customers.slice(0, 10);

    const summary = `Total Customers Analyzed: ${customers.length}
Average Total Purchases: $${avgPurchases.toFixed(2)}
Average Engagement Score: ${avgEngagement.toFixed(1)}/100
Industries Represented: ${industries.length} (${industries.slice(0, 8).join(', ')}...)
Total Revenue: $${totalRevenue.toFixed(2)}
Purchase Range: $${customers[customers.length - 1].total_purchases} - $${customers[0].total_purchases}

Top 10 Customers by Purchases:
${topRevenue.map((c, i) => `  ${i + 1}. ${c.company || c.name} - $${c.total_purchases} (${c.purchase_count} purchases, Engagement: ${c.engagement_score || 0}/100)`).join('\n')}`;

    console.log(summary);
    console.log('');

    // 3. Get existing segments
    const segmentsResult = await pool.query('SELECT name FROM segments');
    const existingSegments = segmentsResult.rows.map(s => s.name);
    console.log('Step 3: Existing segments:', existingSegments.join(', '));
    console.log('');

    // 4. Check if AI is configured
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const key = process.env.AZURE_OPENAI_KEY;
    
    if (!endpoint || !key || endpoint.includes('your-') || key.includes('your-')) {
      console.log('⚠️  AI NOT CONFIGURED');
      process.exit(0);
    }

    // 5. Create Azure OpenAI client
    console.log('Step 4: Calling Azure OpenAI GPT-4o...');
    console.log('  Analyzing 500 customers for optimal segments...');
    console.log('  This may take 15-20 seconds...');
    console.log('');
    
    const { AzureOpenAI } = await import('openai');
    const client = new AzureOpenAI({
      endpoint: endpoint,
      apiKey: key,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });

    const prompt = `You are an expert B2B marketing analyst. Analyze this customer data from a sample of 500 customers (out of 1010 total) and suggest 4-6 optimal customer segments.

${summary}

Existing Segments (suggest DIFFERENT ones):
${existingSegments.join(', ')}

IMPORTANT: Base your segment criteria on the actual data ranges you see above. The purchase range is $${customers[customers.length - 1].total_purchases} - $${customers[0].total_purchases}.

Return ONLY a valid JSON array (no markdown, no code blocks):
[
  {
    "name": "Segment Name",
    "description": "Clear value proposition for marketing",
    "criteria": {
      "min_total_purchases": <number based on actual data>,
      "min_engagement_score": <0-100>,
      "max_total_purchases": <optional, for mid-tier segments>
    },
    "marketing_strategy": "Specific, actionable marketing approach",
    "estimated_size_percentage": <realistic percentage>
  }
]

Create segments that:
- Use realistic thresholds based on the actual data above
- Cover different customer value tiers (high, mid, growing)
- Are actionable for marketing campaigns
- Together cover 70-90% of the customer base`;

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a B2B marketing analyst. Return only valid JSON arrays with no markdown formatting." },
        { role: "user", content: prompt }
      ],
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      temperature: 0.7,
      max_tokens: 2500,
    });

    let content = response.choices[0].message.content;
    
    // Clean markdown formatting
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/, '').replace(/```\n?$/, '').trim();
    }

    const suggestions = JSON.parse(content);
    console.log('  ✅ AI Analysis Complete!');
    console.log('');

    // 6. Display AI suggestions
    console.log('='.repeat(60));
    console.log('AI-SUGGESTED SEGMENTS (from 500 customer analysis)');
    console.log('='.repeat(60));
    console.log('');

    suggestions.forEach((seg, i) => {
      console.log(`${i + 1}. ${seg.name}`);
      console.log(`   Description: ${seg.description}`);
      console.log(`   Estimated Size: ${seg.estimated_size_percentage}% (~${Math.round(1010 * seg.estimated_size_percentage / 100)} of 1010 total customers)`);
      console.log(`   Marketing Strategy: ${seg.marketing_strategy}`);
      console.log(`   Criteria:`);
      Object.entries(seg.criteria).forEach(([key, value]) => {
        console.log(`     - ${key}: ${JSON.stringify(value)}`);
      });
      console.log('');
    });

    // 7. Create segments in database
    console.log('='.repeat(60));
    console.log('Step 5: Creating segments in database...');
    console.log('');

    for (const seg of suggestions) {
      try {
        const insertResult = await pool.query(
          `INSERT INTO segments (name, description, criteria, ai_generated) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id, name`,
          [seg.name, seg.description, JSON.stringify(seg.criteria), true]
        );
        console.log(`  ✅ Created segment: "${seg.name}" (ID: ${insertResult.rows[0].id})`);
      } catch (error) {
        if (error.code === '23505') {
          console.log(`  ⚠️  Segment "${seg.name}" already exists, skipping...`);
        } else {
          console.log(`  ❌ Failed to create "${seg.name}": ${error.message}`);
        }
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ SEGMENTS CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Apply segments to all 1010 customers:');
    console.log('     POST http://localhost:8001/api/segment/refresh');
    console.log('');
    console.log('  2. Check segment distribution:');
    console.log('     GET http://localhost:8001/api/metrics');
    console.log('');
    console.log('  3. View all segments:');
    console.log('     GET http://localhost:8001/api/segments');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response);
    }
    console.error('');
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

aiSegmentation500();
