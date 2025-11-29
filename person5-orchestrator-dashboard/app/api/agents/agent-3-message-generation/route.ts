/**
 * MOCK - Agent 3: Message Generation
 * Simulates generating personalized message variants based on customer segments
 * 
 * In production, this would call an LLM/generative AI service
 * For now, returns mock generated variants for demo purposes
 */

import { NextRequest, NextResponse } from 'next/server';

interface Customer {
  customer_id: string;
  name?: string;
  email?: string;
  recency?: number;
  frequency?: number;
  monetary?: number;
}

interface GeneratedVariant {
  variant_id: string;
  customer_id: string;
  customer_name: string;
  segment: string;
  variant_type: 'A' | 'B' | 'C';
  message: string;
  personalization_score: number;
  generated_at: string;
}

/**
 * Generate 3 variants (A, B, C) for each customer
 * Each variant has different tone and messaging approach
 */
function generateVariants(customer: Customer, segmentInfo: any): GeneratedVariant[] {
  const customerName = customer.name || 'Valued Customer';
  const segment = segmentInfo?.segment || 'general';
  const variants: GeneratedVariant[] = [];

  const baseMessages = {
    premium: {
      A: `Hi {name}, exclusive premium access awaits you. Our enterprise solutions are designed for success stories like yours. Claim your VIP benefits today.`,
      B: `{name}, we noticed you're in our premium segment. Access exclusive features and priority support designed for high-value partners like you.`,
      C: `Dear {name}, special invitation inside! Your exclusive premium membership offers unmatched benefits and personalized enterprise support.`,
    },
    high_value: {
      A: `Hi {name}, we have something special for our most valued customers. Premium offers and early access to new innovations are waiting for you.`,
      B: `{name}, as a high-value customer, enjoy priority benefits and exclusive deals on our latest enterprise solutions.`,
      C: `Dear {name}, thank you for being a valued partner. Here's an exclusive offer crafted just for you and your success.`,
    },
    engaged: {
      A: `Hi {name}, we love your engagement! Continue your journey with us and unlock exclusive benefits reserved for active community members.`,
      B: `{name}, keep the momentum going! Access new features and exclusive content designed for engaged customers like you.`,
      C: `Dear {name}, your loyalty matters! Enjoy exclusive perks and early access to innovations your community values most.`,
    },
    retention: {
      A: `Hi {name}, we miss you! Come back to exclusive offers and new features we've built based on your preferences.`,
      B: `{name}, your business matters to us. Return today and enjoy special comeback offers and premium support.`,
      C: `Dear {name}, we've added exciting features you'll love. Return for exclusive offers designed to enhance your experience.`,
    },
    general: {
      A: `Hi {name}, explore our latest solutions designed to transform your business. Discover what innovation looks like.`,
      B: `{name}, join hundreds of satisfied customers enjoying enterprise solutions that drive real results.`,
      C: `Dear {name}, your success is our mission. Let's explore how our solutions can help you achieve more.`,
    },
  };

  const messages = (baseMessages as any)[segment] || baseMessages.general;

  // Generate Variant A
  variants.push({
    variant_id: `VAR${String(Math.random()).slice(2, 8)}_A`,
    customer_id: customer.customer_id,
    customer_name: customerName,
    segment,
    variant_type: 'A',
    message: messages.A.replace('{name}', customerName),
    personalization_score: 0.85,
    generated_at: new Date().toISOString(),
  });

  // Generate Variant B
  variants.push({
    variant_id: `VAR${String(Math.random()).slice(2, 8)}_B`,
    customer_id: customer.customer_id,
    customer_name: customerName,
    segment,
    variant_type: 'B',
    message: messages.B.replace('{name}', customerName),
    personalization_score: 0.78,
    generated_at: new Date().toISOString(),
  });

  // Generate Variant C
  variants.push({
    variant_id: `VAR${String(Math.random()).slice(2, 8)}_C`,
    customer_id: customer.customer_id,
    customer_name: customerName,
    segment,
    variant_type: 'C',
    message: messages.C.replace('{name}', customerName),
    personalization_score: 0.82,
    generated_at: new Date().toISOString(),
  });

  return variants;
}

interface RequestBody {
  customers: Customer[];
  template_id?: string;
  segment?: string;
  variants_per_customer?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const {
      customers = [],
      template_id = 'default',
      segment = 'general',
      variants_per_customer = 3,
    } = body;

    // Simulate processing time based on customer count
    const processingTime = Math.min(100 + customers.length * 50, 2000);
    await new Promise(resolve => setTimeout(resolve, processingTime));

    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No customers provided',
        },
        { status: 400 }
      );
    }

    // Generate variants for all customers
    const allVariants: GeneratedVariant[] = [];
    customers.forEach(customer => {
      const variants = generateVariants(customer, { segment });
      // Limit to requested variants per customer
      allVariants.push(...variants.slice(0, variants_per_customer));
    });

    return NextResponse.json(
      {
        success: true,
        source: 'MOCK_AGENT_3_MESSAGE_GENERATION',
        template_id,
        segment,
        customers_processed: customers.length,
        total_variants_generated: allVariants.length,
        variants_per_customer: variants_per_customer,
        variants: allVariants,
        metadata: {
          processing_time_ms: processingTime,
          average_personalization_score: (
            allVariants.reduce((sum, v) => sum + v.personalization_score, 0) /
            allVariants.length
          ).toFixed(2),
          is_mock: true,
          note: 'This is mock data. In production, variants would be generated by an LLM service.',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Agent 3 Mock] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate message variants',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check for Agent 3
  return NextResponse.json(
    {
      agent: 'Agent 3 - Message Generation',
      status: 'healthy',
      type: 'mock',
      capabilities: ['variant_generation', 'personalization', 'segment_targeting'],
      max_customers_per_request: 1000,
      variants_per_customer: [1, 2, 3, 5],
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
