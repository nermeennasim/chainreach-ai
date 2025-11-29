/**
 * POST /api/pipeline/start
 * 
 * Start a new pipeline execution
 */

import { NextRequest, NextResponse } from 'next/server';
import { PipelineExecutor } from '@/lib/orchestration/pipeline-executor';
import type { StartPipelineRequest, StartPipelineResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: StartPipelineRequest = await request.json();

    // Validate request
    if (!body.campaign_name) {
      return NextResponse.json(
        { error: 'campaign_name is required' },
        { status: 400 }
      );
    }

    if (!body.customer_id && !body.customer_ids?.length) {
      return NextResponse.json(
        { error: 'Either customer_id or customer_ids is required' },
        { status: 400 }
      );
    }

    console.log('[API] Starting new pipeline:', {
      campaign_name: body.campaign_name,
      customer_id: body.customer_id,
      customer_ids: body.customer_ids,
    });

    // Create executor
    const executor = new PipelineExecutor();
    
    // Start pipeline execution (returns immediately with pipeline_id)
    // The pipeline runs in the background
    const result = await executor.executePipeline({
      customer_id: body.customer_id,
      customer_ids: body.customer_ids,
      campaign_name: body.campaign_name,
      trigger_type: 'manual',
      trigger_data: body.trigger_data,
    });

    console.log('[API] Pipeline completed:', result.pipeline_id);
    
    const response: StartPipelineResponse = {
      success: true,
      pipeline_id: result.pipeline_id,
      message: 'Pipeline completed successfully',
      status_url: `/api/pipeline/status/${result.pipeline_id}`,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('[API] Error starting pipeline:', error);
    return NextResponse.json(
      { 
        error: 'Failed to start pipeline',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET /api/pipeline/start - Get all active pipelines
export async function GET() {
  try {
    const { stateManager } = await import('@/lib/orchestration/state-manager');
    const activePipelines = await stateManager.getAllActivePipelines();

    return NextResponse.json({
      success: true,
      count: activePipelines.length,
      pipelines: activePipelines,
    });

  } catch (error: any) {
    console.error('[API] Error fetching active pipelines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipelines', details: error.message },
      { status: 500 }
    );
  }
}
