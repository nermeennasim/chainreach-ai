import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { OpenAIClient } from '@azure/openai';
import { AzureKeyCredential } from '@azure/core-auth';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Azure OpenAI setup
const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT || '',
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY || '')
);

const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

// Content storage (in-memory cache)
let contentLibrary: any[] = [];

// Initialize content library
async function initializeContentLibrary() {
  console.log('[RAG] Initializing content library...');
  
  // Default marketing content for different segments
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
      content: 'Step-by-step guide to get started',
      segment: 'New Customers',
      campaign: 'Onboarding_2025',
      content_type: 'guide',
      audience: 'New',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Premium Member Benefits',
      content: 'Exclusive benefits for high-value customers',
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
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'person2-rag-nodejs',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get all content
app.get('/api/content', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
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
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { query, top_k = 3 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log(`[RAG] Searching for: ${query}`);
    
    // Simple search based on keywords
    const results = contentLibrary
      .filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.segment.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, top_k);
    
    res.json({
      success: true,
      query,
      results_count: results.length,
      results
    });
  } catch (error: any) {
    console.error('[RAG] Search error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error.message
    });
  }
});

// Generate content for a segment using GPT-4o
app.post('/api/generate-content', async (req: Request, res: Response) => {
  try {
    const { segment, description, criteria } = req.body;
    
    if (!segment || !description) {
      return res.status(400).json({
        error: 'segment and description are required'
      });
    }
    
    console.log(`[RAG] Generating content for segment: ${segment}`);
    
    // Create prompt for GPT-4o
    const prompt = `You are a marketing content specialist. Generate 3 marketing content pieces for a customer segment with these details:

Segment Name: ${segment}
Description: ${description}
Criteria: ${JSON.stringify(criteria || {})}

For each content piece, provide:
1. Title (catchy, benefit-focused)
2. Content summary (2-3 sentences)
3. Content type (promotion, guide, case_study, whitepaper, etc)
4. Audience (who this is for)
5. Campaign name (short, descriptive)

Format your response as a JSON array with these 5 fields for each piece.`;

    const message = await client.getChatCompletions(deploymentId, [
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.7,
      maxTokens: 1000
    });

    const responseText = message.choices[0]?.message?.content || '';
    
    console.log(`[RAG] GPT Response received (${responseText.length} chars)`);
    
    // Try to parse JSON from response
    let generatedContent = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/\[([\s\S]*)\]/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0].replace(/```json\n|```/g, '');
        generatedContent = JSON.parse(jsonStr);
      } else {
        generatedContent = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.log('[RAG] Could not parse JSON, using template response');
      // Fallback to template
      generatedContent = [
        {
          title: `Exclusive Offer for ${segment}`,
          content: `Special content tailored for ${segment} customers`,
          content_type: 'promotion',
          audience: segment,
          campaign: `${segment.replace(/\s+/g, '_')}_Campaign`
        },
        {
          title: `${segment} Success Guide`,
          content: `Learn best practices for ${segment.toLowerCase()}`,
          content_type: 'guide',
          audience: segment,
          campaign: `${segment.replace(/\s+/g, '_')}_Guide`
        }
      ];
    }
    
    // Add to library
    const newContent = generatedContent.map((item: any, idx: number) => ({
      id: contentLibrary.length + idx + 1,
      ...item,
      segment,
      created_at: new Date().toISOString()
    }));
    
    contentLibrary.push(...newContent);
    
    res.json({
      success: true,
      segment,
      generated_count: newContent.length,
      content: newContent
    });
    
  } catch (error: any) {
    console.error('[RAG] Generation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Content generation failed',
      details: error.message
    });
  }
});

// Get segments from Agent 1
app.get('/api/segments', async (req: Request, res: Response) => {
  try {
    const segmentationAPI = process.env.SEGMENTATION_API || 'http://localhost:3000';
    console.log(`[RAG] Fetching segments from ${segmentationAPI}`);
    
    const response = await axios.get(`${segmentationAPI}/api/segments`, {
      timeout: 5000
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('[RAG] Failed to fetch segments:', error.message);
    res.status(503).json({
      success: false,
      error: 'Could not reach Segmentation API',
      details: error.message
    });
  }
});

// Metrics endpoint
app.get('/metrics', (req: Request, res: Response) => {
  res.json({
    service: 'person2-rag-nodejs',
    content_items: contentLibrary.length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
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
╔════════════════════════════════════════════════════════╗
║  Person2 - Content Retrieval Agent (Node.js)           ║
║  Running on http://localhost:${port}                      ║
║  Segmentation API: ${process.env.SEGMENTATION_API || 'http://localhost:3000'}            ║
╚════════════════════════════════════════════════════════╝
    `);
  });
}).catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});

export default app;
