// AI Segmentation Test - Azure OpenAI Compatible
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

async function testAISegmentation() {
  console.log('AI Segmentation Test - Azure AI Foundry');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Fetch 100 sample customers
    console.log('Step 1: Fetching 100 sample customers...');
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
      LIMIT 100
    `);

    const customers = result.rows;
    console.log(`  ✅ Fetched ${customers.length} customers`);
    console.log('');

    // 2. Calculate summary stats
    console.log('Step 2: Analyzing customer data...');
    const avgPurchases = customers.reduce((sum, c) => sum + parseFloat(c.total_purchases), 0) / customers.length;
    const avgEngagement = customers.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / customers.length;
    const industries = [...new Set(customers.map(c => c.industry).filter(i => i))];
    const topRevenue = customers.slice(0, 10);

    const summary = `Total Customers Analyzed: ${customers.length}
Average Total Purchases: $${avgPurchases.toFixed(2)}
Average Engagement Score: ${avgEngagement.toFixed(1)}/100
Industries Represented: ${industries.length} (${industries.slice(0, 5).join(', ')}...)
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
      console.log('Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY in .env');
      process.exit(0);
    }

    // 5. Create Azure OpenAI client
    console.log('Step 4: Connecting to Azure OpenAI...');
    console.log(`  Endpoint: ${endpoint}`);
    console.log(`  Deployment: ${process.env.AZURE_OPENAI_DEPLOYMENT}`);
    console.log('');
    
    const { AzureOpenAI } = await import('openai');
    const client = new AzureOpenAI({
      endpoint: endpoint,
      apiKey: key,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });

    const prompt = `You are an expert marketing analyst. Analyze this customer data and suggest 3-5 optimal customer segments for targeted marketing campaigns.

${summary}

Existing Segments (suggest NEW ones, different from these):
${existingSegments.join(', ')}

Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
[
  {
    "name": "Segment Name",
    "description": "Why this segment matters for marketing",
    "criteria": {
      "min_total_purchases": 5000,
      "min_engagement_score": 60,
      "industries": ["Tech", "Software"]
    },
    "marketing_strategy": "Specific approach to engage this segment",
    "estimated_size_percentage": 15
  }
]

Rules:
- Suggest 3-5 NEW segments (different from existing ones)
- Make criteria specific and actionable
- Base suggestions on the actual customer data provided
- Focus on segments that would be valuable for targeted campaigns`;

    console.log('Step 5: Calling AI model...');
    console.log('  This may take 10-15 seconds...');
    console.log('');

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a B2B marketing analyst. Return only valid JSON arrays with no markdown formatting." },
        { role: "user", content: prompt }
      ],
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      temperature: 0.7,
      max_tokens: 2000,
    });

    if (response?.error !== undefined) {
      throw new Error(`API error: ${response.error.message || 'Unknown error'}`);
    }

    let content = response.choices[0].message.content;
    
    // Clean markdown formatting if present
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/, '').replace(/```\n?$/, '').trim();
    }

    const suggestions = JSON.parse(content);

    // 6. Display results
    console.log('  ✅ AI Analysis Complete!');
    console.log('');
    console.log('='.repeat(60));
    console.log('AI-SUGGESTED SEGMENTS');
    console.log('='.repeat(60));
    console.log('');

    suggestions.forEach((seg, i) => {
      console.log(`${i + 1}. ${seg.name}`);
      console.log(`   Description: ${seg.description}`);
      console.log(`   Estimated Size: ${seg.estimated_size_percentage}% (~${Math.round(1010 * seg.estimated_size_percentage / 100)} of your 1010 customers)`);
      console.log(`   Marketing Strategy: ${seg.marketing_strategy}`);
      console.log(`   Criteria:`);
      Object.entries(seg.criteria).forEach(([key, value]) => {
        console.log(`     - ${key}: ${JSON.stringify(value)}`);
      });
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('');
    console.log('✅ AI TEST PASSED!');
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Review the AI suggestions above');
    console.log('  2. Create segments via API: POST http://localhost:8001/api/segments');
    console.log('  3. Apply to all customers: POST http://localhost:8001/api/segment/refresh');
    console.log('  4. Check results: GET http://localhost:8001/api/metrics');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response);
    }
    if (error.code === 'ENOTFOUND') {
      console.error('Network error: Cannot reach AI service.');
    }
    console.error('');
    console.error('Error details:', error);
  } finally {
    await pool.end();
  }
}

testAISegmentation();
