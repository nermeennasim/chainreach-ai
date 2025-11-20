import { NextResponse } from 'next/server';
import { generateLiveMetrics } from '@/lib/mock-data';

/**
 * GET /api/metrics/live
 * Returns live campaign metrics with real-time updates
 */
export async function GET() {
  try {
    const metrics = generateLiveMetrics();
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Live metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live metrics' },
      { status: 500 }
    );
  }
}
