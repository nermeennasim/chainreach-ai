import { NextResponse } from 'next/server';
import { generateAgentStatuses } from '@/lib/mock-data';

/**
 * GET /api/agents/health
 * Returns health status of all 4 agents
 */
export async function GET() {
  try {
    const agents = generateAgentStatuses();
    
    const overall = agents.every(a => a.status === 'healthy') 
      ? 'healthy' 
      : agents.some(a => a.status === 'down')
      ? 'down'
      : 'degraded';
    
    return NextResponse.json({
      agents,
      overall,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Agent health check error:', error);
    return NextResponse.json(
      { error: 'Failed to check agent health' },
      { status: 500 }
    );
  }
}
