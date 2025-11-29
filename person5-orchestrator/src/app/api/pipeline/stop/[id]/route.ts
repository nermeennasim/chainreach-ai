/**
 * POST /api/pipeline/stop/[id]
 * 
 * Stop a running pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { PipelineExecutor } from '@/lib/orchestration/pipeline-executor';

export async function POST(
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

    console.log('[API] Stopping pipeline:', pipelineId);

    const executor = new PipelineExecutor();
    await executor.stopPipeline(pipelineId);

    return NextResponse.json({
      success: true,
      message: `Pipeline ${pipelineId} stopped successfully`,
    });

  } catch (error: any) {
    console.error('[API] Error stopping pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to stop pipeline', details: error.message },
      { status: 500 }
    );
  }
}
