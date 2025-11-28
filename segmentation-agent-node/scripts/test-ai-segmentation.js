// AI Segmentation Test - Works with OpenAI or Azure OpenAI
// Tests AI-powered customer segmentation

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

async function testAISegmentation() {
  console.log('AI Segmentation Test - ChainReach');
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
    const useAzure = process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY && 
                     !process.env.AZURE_OPENAI_ENDPOINT.includes('your-openai') &&
                     !process.env.AZURE_OPENAI_KEY.includes('your-azure');
    const useOpenAI = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-key');

    if (!useAzure && !useOpenAI) {
      console.log('⚠️  AI NOT CONFIGURED');
      console.log('');
      console.log('To enable AI segmentation, add ONE of these to your .env file:');
      console.log('');
      console.log('Option A - Azure OpenAI (Recommended):');
      console.log('  AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/');
      console.log('  AZURE_OPENAI_KEY=your-key-here');
      console.log('  AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo-deployment');
      console.log('');
      console.log('Option B - OpenAI (Faster to test):');
      console.log('  OPENAI_API_KEY=sk-...');
      console.log('');
      console.log('Get started: See setup-azure-openai.md or AI_QUICKSTART.md');
      console.log('');
      console.log('=' .repeat(60));
      console.log('Test Result: SKIPPED (AI not configured)');
      console.log('=' .repeat(60));
      process.exit(0);
    }

    // 5. Call AI service
    console.log(`Step 4: Calling ${useAzure ? 'Azure OpenAI' : 'OpenAI'}...`);
    console.log('  This may take 10-15 seconds...');
    console.log('');
    
    const OpenAI = require('openai').default;
    let aiClient;
    let modelName;

    if (useAzure) {
      console.log('  Using Azure OpenAI');
      console.log(`  Endpoint: ${process.env.AZURE_OPENAI_ENDPOINT}`);
      console.log(`  Deployment: ${process.env.AZURE_OPENAI_DEPLOYMENT}`);
      aiClient = new OpenAI({
        apiKey: process.env.AZURE_OPENAI_KEY,
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
        defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
      });
      modelName = process.env.AZURE_OPENAI_DEPLOYMENT;
    } else {
      console.log('  Using OpenAI');
      aiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      modelName = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    }

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

    const response = await aiClient.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are a B2B marketing analyst. Return only valid JSON arrays with no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

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
    console.log('Next Steps:');
    console.log('  1. Review the AI suggestions above');
    console.log('  2. Create segments you like:');
    console.log('     POST http://localhost:8001/api/segments');
    console.log('     Body: { name, description, criteria, ai_generated: true }');
    console.log('  3. Apply to all customers:');
    console.log('     POST http://localhost:8001/api/segment/refresh');
    console.log('  4. Check results:');
    console.log('     GET http://localhost:8001/api/metrics');
    console.log('');
    console.log('Cost: ~$0.05 for this test (100 customers with GPT-3.5-turbo)');
    console.log('');
    console.log('=' .repeat(60));
    console.log('✅ AI TEST PASSED!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('');
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    if (error.code === 'ENOTFOUND') {
      console.error('');
      console.error('Network error: Cannot reach AI service.');
      console.error('Check your endpoint URL and internet connection.');
    }
    if (error.status === 401) {
      console.error('');
      console.error('Authentication error: Check your API key is correct.');
    }
  } finally {
    await pool.end();
  }
}

testAISegmentation();
