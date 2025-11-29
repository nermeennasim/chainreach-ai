const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Azure OpenAI Configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const DEPLOYMENT_ID = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
const API_VERSION = '2024-04-01-preview';

// Segmentation API
const SEGMENTATION_API = process.env.SEGMENTATION_API || 'http://localhost:5001';

// Content storage (in-memory cache)
let contentLibrary = [];

// Initialize content library
async function initializeContentLibrary() {
  console.log('[RAG] Initializing content library...');
  
  contentLibrary = [
    {
      id: 1,
      title: 'Enterprise Security Solutions',
      content: 'Comprehensive security framework for large organizations',
      segment: 'VIP Enterprise',
      campaign: 'Enterprise_2025',
      content_type: 'whitepaper',
      audience: 'Enterprise',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'SMB Growth Toolkit',
      content: 'Essential tools for small business expansion',
      segment: 'Engaged SMB',
      campaign: 'SMB_Growth',
      content_type: 'toolkit',
      audience: 'SMB',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Onboarding Guide for New Users',
      content: 'Step-by-step guide to get started with our platform',
      segment: 'New Customers',
      campaign: 'Onboarding_2025',
      content_type: 'guide',
      audience: 'New',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Premium Member Benefits',
      content: 'Exclusive benefits and rewards for high-value customers',
      segment: 'High Value Customers',
      campaign: 'VIP_Benefits',
      content_type: 'promotion',
      audience: 'Premium',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Win-Back Campaign',
      content: 'Special offers to re-engage inactive customers',
      segment: 'At Risk',
      campaign: 'Winback_Campaign',
      content_type: 'promotion',
      audience: 'Inactive',
      created_at: new Date().toISOString()
    }
  ];
  
  console.log(`[RAG] Initialized with ${contentLibrary.length} content items`);
  console.log(`[RAG] Azure OpenAI Endpoint: ${AZURE_OPENAI_ENDPOINT}`);
}

// Call Azure OpenAI GPT-4o to generate content
async function generateContentWithGPT(segment) {
  try {
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY) {
      throw new Error('Azure OpenAI not configured');
    }

    const prompt = `You are a marketing expert. Generate 3 marketing content pieces for this customer segment:

Segment Name: ${segment.name}
Description: ${segment.description}
Criteria: ${JSON.stringify(segment.criteria)}
Customer Count: ${segment.customer_count || 0}

For each content piece, generate a JSON object with these fields:
- title: catchy, benefit-focused title
- content: 2-3 sentence marketing message
- content_type: one of [promotion, guide, whitepaper, case_study, toolkit, newsletter]
- campaign: short campaign name (snake_case)

Return ONLY a valid JSON array with 3 objects, no markdown or extra text.`;

    console.log(`[RAG-GPT] Generating content for segment: ${segment.name}`);

    const response = await axios.post(
      `${AZURE_OPENAI_ENDPOINT}openai/deployments/${DEPLOYMENT_ID}/chat/completions?api-version=${API_VERSION}`,
      {
        messages: [
          {
            role: 'system',
            content: 'You are a marketing content generation expert. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 0.95
      },
      {
        headers: {
          'api-key': AZURE_OPENAI_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const responseText = response.data.choices[0]?.message?.content || '';
    console.log(`[RAG-GPT] Response received (${responseText.length} chars)`);

    // Parse JSON from response
    let generatedContent = [];
    try {
      // Extract JSON array
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      } else {
        generatedContent = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('[RAG-GPT] JSON parse error:', parseError.message);
      // Return parsed text as fallback
      generatedContent = [
        {
          title: `Exclusive Offer for ${segment.name}`,
          content: `Tailored marketing content for our ${segment.name} segment. ${segment.description}`,
          content_type: 'promotion',
          campaign: `${segment.name.replace(/\s+/g, '_')}_Campaign`
        }
      ];
    }

    // Enrich content with segment info
    const enrichedContent = generatedContent.map((item, idx) => ({
      id: contentLibrary.length + idx + 1,
      ...item,
      segment: segment.name,
      audience: segment.name,
      created_at: new Date().toISOString(),
      generated_by: 'gpt-4o'
    }));

    return enrichedContent;
  } catch (error) {
    console.error('[RAG-GPT] Error:', error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'person2-rag-nodejs',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    gpt4o_available: !!AZURE_OPENAI_ENDPOINT
  });
});

// Get all content
app.get('/api/content', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const start = (page - 1) * limit;
  const paginatedContent = contentLibrary.slice(start, start + limit);
  
  res.json({
    success: true,
    total: contentLibrary.length,
    page,
    limit,
    items: paginatedContent
  });
});

// Search content
app.post('/api/search', async (req, res) => {
  try {
    const { query, top_k = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log(`[RAG] Searching for: ${query}`);
    
    // Simple keyword search
    const results = contentLibrary
      .filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        (item.segment && item.segment.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, top_k);
    
    res.json({
      success: true,
      query,
      results_count: results.length,
      results
    });
  } catch (error) {
    console.error('[RAG] Search error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error.message
    });
  }
});

// Generate content for a specific segment using GPT-4o
app.post('/api/generate-content', async (req, res) => {
  try {
    const { segment } = req.body;
    
    if (!segment) {
      return res.status(400).json({
        success: false,
        error: 'segment object is required'
      });
    }
    
    console.log(`[RAG] Generating content for segment: ${segment.name}`);
    
    // Call GPT-4o to generate content
    const generatedContent = await generateContentWithGPT(segment);
    
    // Add to library
    contentLibrary.push(...generatedContent);
    
    res.json({
      success: true,
      segment_name: segment.name,
      generated_count: generatedContent.length,
      content: generatedContent
    });
    
  } catch (error) {
    console.error('[RAG] Generation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Content generation failed',
      details: error.message
    });
  }
});

// Get segments from Agent 1 and generate content for all
app.post('/api/generate-all-segments', async (req, res) => {
  try {
    console.log(`[RAG] Fetching all segments from ${SEGMENTATION_API}`);
    
    // Fetch segments from Segmentation Agent
    const segmentsResponse = await axios.get(`${SEGMENTATION_API}/api/segments`, {
      timeout: 10000
    });
    
    const segments = segmentsResponse.data.data || [];
    console.log(`[RAG] Received ${segments.length} segments from Agent 1`);
    
    const results = [];
    const errors = [];
    
    // Generate content for each segment
    for (const segment of segments) {
      try {
        console.log(`[RAG] Processing segment: ${segment.name}`);
        const generatedContent = await generateContentWithGPT(segment);
        contentLibrary.push(...generatedContent);
        
        results.push({
          segment: segment.name,
          generated_count: generatedContent.length,
          content: generatedContent
        });
      } catch (segmentError) {
        console.error(`[RAG] Error generating content for ${segment.name}:`, segmentError.message);
        errors.push({
          segment: segment.name,
          error: segmentError.message
        });
      }
    }
    
    res.json({
      success: true,
      total_segments: segments.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('[RAG] Batch generation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Batch generation failed',
      details: error.message
    });
  }
});

// Get segments from Agent 1
app.get('/api/segments', async (req, res) => {
  try {
    console.log(`[RAG] Fetching segments from ${SEGMENTATION_API}`);
    
    const response = await axios.get(`${SEGMENTATION_API}/api/segments`, {
      timeout: 10000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('[RAG] Failed to fetch segments:', error.message);
    res.status(503).json({
      success: false,
      error: 'Could not reach Segmentation API',
      details: error.message,
      segmentation_api: SEGMENTATION_API
    });
  }
});

// Get segments with their generated content
app.get('/api/segments-with-content', async (req, res) => {
  try {
    console.log(`[RAG] Fetching segments with content from ${SEGMENTATION_API}`);
    
    const segmentsResponse = await axios.get(`${SEGMENTATION_API}/api/segments`, {
      timeout: 10000
    });
    
    const segments = segmentsResponse.data.data || [];
    const segmentsWithContent = segments.map(segment => {
      const segmentContent = contentLibrary.filter(c => c.segment === segment.name);
      return {
        ...segment,
        content_items_count: segmentContent.length,
        content_items: segmentContent
      };
    });
    
    res.json({
      success: true,
      total_segments: segments.length,
      total_content_items: contentLibrary.length,
      segments: segmentsWithContent
    });
  } catch (error) {
    console.error('[RAG] Failed to fetch segments with content:', error.message);
    res.status(503).json({
      success: false,
      error: 'Could not reach Segmentation API',
      details: error.message
    });
  }
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    service: 'person2-rag-nodejs',
    content_items: contentLibrary.length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    gpt4o_configured: !!AZURE_OPENAI_ENDPOINT
  });
});

// Error handler
app.use((err, req, res) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// Start server
initializeContentLibrary().then(() => {
  app.listen(port, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Person2 - Content Retrieval Agent (Node.js + GPT-4o)        ║
║  Running on http://localhost:${port}                              ║
║  Segmentation API: ${SEGMENTATION_API}                    ║
║  Azure OpenAI: ${AZURE_OPENAI_ENDPOINT ? 'Configured' : 'NOT configured'}                            ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
}).catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});

module.exports = app;
