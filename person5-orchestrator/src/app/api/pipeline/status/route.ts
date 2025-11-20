import { NextResponse } from 'next/server';
import { generatePipelineStatus } from '@/lib/mock-data';

/**
 * GET /api/pipeline/status
 * Returns current pipeline execution status with real-time progress
 */
export async function GET() {
  try {
    const status = generatePipelineStatus();
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Pipeline status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline status' },
      { status: 500 }
    );
  }
}
