import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/lib/orchestrator';
import type { CampaignRequest } from '@/types';

/**
 * POST /api/campaign
 * Run a complete marketing campaign across all services
 */
export async function POST(request: NextRequest) {
  try {
    const body: CampaignRequest = await request.json();

    // Validate request
    if (!body.customerIds || body.customerIds.length === 0) {
      return NextResponse.json(
        { error: 'customerIds array is required' },
        { status: 400 }
      );
    }

    if (!body.campaignName) {
      return NextResponse.json(
        { error: 'campaignName is required' },
        { status: 400 }
      );
    }

    // Run the campaign orchestration
    const summary = await orchestrator.runCampaign(body);

    return NextResponse.json({
      success: true,
      data: summary,
      message: `Campaign "${body.campaignName}" completed successfully`,
    });
  } catch (error) {
    console.error('Campaign execution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to execute campaign',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/campaign
 * Get campaign status (placeholder for future)
 */
export async function GET() {
  return NextResponse.json({
    message: 'Campaign API is running',
    endpoints: {
      runCampaign: 'POST /api/campaign',
    },
  });
}
