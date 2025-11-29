// Quick AI Test - Small Sample (100 customers)
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

async function testAI() {
  console.log('🧪 Testing AI Segmentation with 100 customers...\n');

  try {
    // 1. Fetch 100 sample customers
    console.log('📊 Fetching 100 sample customers...');
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
      ORDER BY revenue DESC 
      LIMIT 100
    `);

    const customers = result.rows;
    console.log(`✅ Fetched ${customers.length} customers\n`);

    // 2. Calculate summary stats
    const avgPurchases = customers.reduce((sum, c) => sum + parseFloat(c.total_purchases), 0) / customers.length;
    const avgEngagement = customers.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / customers.length;
    const industries = [...new Set(customers.map(c => c.industry).filter(i => i))];
    const topRevenue = customers.slice(0, 10);

    const summary = `Total Customers Analyzed: ${customers.length}
Average Total Purchases: $${avgPurchases.toFixed(2)}
Average Engagement Score: ${avgEngagement.toFixed(1)}/100
Industries: ${industries.join(', ')}
Revenue Range: $${customers[customers.length - 1].revenue} - $${customers[0].revenue}

Top 10 Customers by Revenue:
${topRevenue.map((c, i) => `${i + 1}. ${c.company || c.name} - $${c.revenue} (${c.purchase_count} purchases)`).join('\n')}`;

    console.log('📈 Customer Summary:\n');
    console.log(summary);
    console.log('\n');

    // 3. Get existing segments
    const segmentsResult = await pool.query('SELECT name FROM segments');
    const existingSegments = segmentsResult.rows.map(s => s.name);

    // 4. Check if AI is configured
    const useAzure = process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY;
    const useOpenAI = process.env.OPENAI_API_KEY;

    if (!useAzure && !useOpenAI) {
      console.log('❌ AI NOT CONFIGURED\n');
      console.log('To enable AI segmentation, you need ONE of:\n');
      console.log('Option A - Azure OpenAI (Recommended):');
      console.log('  AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com');
      console.log('  AZURE_OPENAI_KEY=your-key-here');
      console.log('  AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo\n');
      console.log('Option B - OpenAI (Faster to test):');
      console.log('  OPENAI_API_KEY=sk-...\n');
      console.log('See AI_SETUP_GUIDE.md for detailed instructions.');
      process.exit(1);
    }

    // 5. Call AI service
    console.log(`🤖 Calling ${useAzure ? 'Azure OpenAI' : 'OpenAI'}...\n`);
    
    const OpenAI = require('openai').default;
    let aiClient;
    let modelName;

    if (useAzure) {
      aiClient = new OpenAI({
        apiKey: process.env.AZURE_OPENAI_KEY,
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
        defaultQuery: { 'api-version': '2024-02-15-preview' },
        defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
      });
      modelName = process.env.AZURE_OPENAI_DEPLOYMENT;
    } else {
      aiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      modelName = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    }

    const prompt = `You are an expert marketing analyst. Analyze this customer data and suggest 3-5 optimal customer segments.

${summary}

Existing Segments (suggest NEW ones):
${existingSegments.join(', ')}

Return ONLY a JSON array with this structure:
[
  {
    "name": "Segment Name",
    "description": "Why this segment matters",
    "criteria": {
      "min_total_purchases": 5000,
      "min_engagement_score": 60,
      "industries": ["Tech", "Software"]
    },
    "marketing_strategy": "How to target them",
    "estimated_size_percentage": 15
  }
]`;

    const response = await aiClient.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are a marketing analyst. Return only valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    let content = response.choices[0].message.content;
    
    // Clean markdown
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const suggestions = JSON.parse(content);

    // 6. Display results
    console.log('✅ AI Analysis Complete!\n');
    console.log('='.repeat(60));
    console.log('AI-SUGGESTED SEGMENTS');
    console.log('='.repeat(60) + '\n');

    suggestions.forEach((seg, i) => {
      console.log(`${i + 1}. ${seg.name}`);
      console.log(`   Description: ${seg.description}`);
      console.log(`   Estimated Size: ${seg.estimated_size_percentage}% (~${Math.round(customers.length * seg.estimated_size_percentage / 100)} of sampled customers)`);
      console.log(`   Marketing Strategy: ${seg.marketing_strategy}`);
      console.log(`   Criteria: ${JSON.stringify(seg.criteria, null, 2)}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n💡 Next Steps:');
    console.log('1. Review the AI suggestions above');
    console.log('2. Create segments you like via API:');
    console.log('   POST http://localhost:8001/api/segments');
    console.log('3. Apply to all 1000 customers:');
    console.log('   POST http://localhost:8001/api/segment/refresh');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  } finally {
    await pool.end();
  }
}

testAI();
