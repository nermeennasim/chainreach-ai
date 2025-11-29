/**
 * MOCK - Agent 2: Content Retrieval
 * Simulates retrieving content templates from RAG API
 * 
 * In production, this would call person2-rag-nodejs
 * For now, returns mock content templates for demo purposes
 */

import { NextRequest, NextResponse } from 'next/server';

interface MockTemplate {
  template_id: string;
  template_name: string;
  subject: string;
  body: string;
  category: string;
  approved_date: string;
  approval_status: string;
  tags: string[];
}

const MOCK_TEMPLATES: MockTemplate[] = [
  {
    template_id: 'TEMP001',
    template_name: 'Premium Offer Launch',
    subject: 'Exclusive Premium Access - Limited Time',
    body: 'Hi {customer_name}, we\'re thrilled to offer you exclusive premium access to our newest products. This offer is specially curated for valued customers like you. Act now to secure your premium benefits!',
    category: 'premium',
    approved_date: new Date().toISOString(),
    approval_status: 'APPROVED',
    tags: ['premium', 'launch', 'exclusive', 'enterprise'],
  },
  {
    template_id: 'TEMP002',
    template_name: 'Seasonal Sale Announcement',
    subject: 'Special Seasonal Sale - Save Up to 40%',
    body: 'Dear {customer_name}, our seasonal sale is here! Enjoy special discounts on our premium products. Your personalized savings are waiting. Visit us today to explore your exclusive deals.',
    category: 'sales',
    approved_date: new Date().toISOString(),
    approval_status: 'APPROVED',
    tags: ['sale', 'seasonal', 'discount', 'savings'],
  },
  {
    template_id: 'TEMP003',
    template_name: 'Customer Success Story',
    subject: 'See How {company_name} Achieved Success',
    body: 'Hi {customer_name}, discover how similar businesses transformed their operations with our enterprise solutions. Read this inspiring success story and learn how you could achieve similar results.',
    category: 'engagement',
    approved_date: new Date().toISOString(),
    approval_status: 'APPROVED',
    tags: ['case_study', 'engagement', 'success', 'transformation'],
  },
  {
    template_id: 'TEMP004',
    template_name: 'Product Feature Update',
    subject: 'New Features Available - Enhance Your Experience',
    body: 'Hi {customer_name}, we\'ve just released exciting new features designed to enhance your experience. Learn about the latest innovations that will revolutionize how you work.',
    category: 'product',
    approved_date: new Date().toISOString(),
    approval_status: 'APPROVED',
    tags: ['product', 'feature', 'update', 'innovation'],
  },
  {
    template_id: 'TEMP005',
    template_name: 'VIP Loyalty Reward',
    subject: 'Your VIP Reward - Exclusive Perks Inside',
    body: 'Dear VIP Member {customer_name}, thank you for your loyalty! We\'ve reserved exclusive perks and early access to new offerings just for you. Enjoy your special rewards today.',
    category: 'loyalty',
    approved_date: new Date().toISOString(),
    approval_status: 'APPROVED',
    tags: ['vip', 'loyalty', 'reward', 'exclusive'],
  },
];

interface RequestBody {
  query?: string;
  limit?: number;
  category?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { query = 'general', limit = 5, category } = body;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter templates based on category or query
    let filtered = MOCK_TEMPLATES;

    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }

    if (query && query !== 'general') {
      const queryLower = query.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.template_name.toLowerCase().includes(queryLower) ||
          t.subject.toLowerCase().includes(queryLower) ||
          t.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }

    // Return requested amount
    const results = filtered.slice(0, Math.min(limit, MOCK_TEMPLATES.length));

    return NextResponse.json(
      {
        success: true,
        source: 'MOCK_AGENT_2_CONTENT_RETRIEVAL',
        query,
        limit,
        results_count: results.length,
        results,
        metadata: {
          total_templates_available: MOCK_TEMPLATES.length,
          processing_time_ms: 500,
          is_mock: true,
          note: 'This is mock data. In production, this would retrieve from person2-rag-nodejs',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Agent 2 Mock] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve templates',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check for Agent 2
  return NextResponse.json(
    {
      agent: 'Agent 2 - Content Retrieval',
      status: 'healthy',
      type: 'mock',
      templates_available: MOCK_TEMPLATES.length,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
