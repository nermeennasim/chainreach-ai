/**
 * GET /api/campaign/[id]
 * 
 * Get campaign results (approved/rejected messages) from Agent 4
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComplianceAgentClient } from '@/lib/agents';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    console.log('[API] Fetching campaign results for:', campaignId);

    // Call Agent 4 directly to get campaign results
    const agent4 = new ComplianceAgentClient();
    const results = await agent4.getCampaignResults(campaignId);

    return NextResponse.json({
      success: true,
      campaign_id: campaignId,
      results: {
        approved_messages: results.approved_messages,
        rejected_messages: results.rejected_messages,
        total_approved: results.total_approved,
        total_rejected: results.total_rejected,
        total_checked: results.total_checked,
        message: results.message,
      },
    });

  } catch (error: any) {
    console.error('[API] Error fetching campaign results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign results', details: error.message },
      { status: 500 }
    );
  }
}
