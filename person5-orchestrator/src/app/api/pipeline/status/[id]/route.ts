/**
 * GET /api/pipeline/status/[id]
 * 
 * Get real-time status of a pipeline execution
 */

import { NextRequest, NextResponse } from 'next/server';
import { stateManager } from '@/lib/orchestration/state-manager';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pipelineId = params.id;

    if (!pipelineId) {
      return NextResponse.json(
        { error: 'Pipeline ID is required' },
        { status: 400 }
      );
    }

    const state = await stateManager.getState(pipelineId);

    if (!state) {
      return NextResponse.json(
        { error: `Pipeline ${pipelineId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pipeline: state,
    });

  } catch (error: any) {
    console.error('[API] Error fetching pipeline status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline status', details: error.message },
      { status: 500 }
    );
  }
}
