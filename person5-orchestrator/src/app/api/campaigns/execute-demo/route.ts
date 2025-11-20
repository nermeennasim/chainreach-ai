import { NextRequest, NextResponse } from 'next/server';
import { startDemoCampaign } from '@/lib/mock-data';

/**
 * POST /api/campaigns/execute-demo
 * Starts a demo campaign execution
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customerCount = 100 } = body;
    
    const executionId = startDemoCampaign(customerCount);
    
    return NextResponse.json({
      success: true,
      executionId,
      message: `Demo campaign started with ${customerCount} customers`,
    });
  } catch (error) {
    console.error('Demo campaign execution error:', error);
    return NextResponse.json(
      { error: 'Failed to start demo campaign' },
      { status: 500 }
    );
  }
}
