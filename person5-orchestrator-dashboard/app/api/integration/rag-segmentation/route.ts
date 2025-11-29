import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * POST /api/integration/rag-segmentation
 * 
 * Workflow:
 * 1. Fetch segments from Segmentation Agent
 * 2. For each segment, call RAG API to generate content
 * 3. Return integrated results with segments + generated content
 */
export async function POST(request: NextRequest) {
  try {
    const { segmentationApiUrl, ragApiUrl, generateContent = true } = await request.json();

    const SEGMENTATION_API = segmentationApiUrl || process.env.SEGMENTATION_API_URL || 'http://localhost:3001';
    const RAG_API = ragApiUrl || process.env.RAG_API_URL || 'http://localhost:8000';

    console.log(`[Integration] Starting RAG + Segmentation workflow`);
    console.log(`[Integration] Segmentation API: ${SEGMENTATION_API}`);
    console.log(`[Integration] RAG API: ${RAG_API}`);

    // Step 1: Fetch segments from Segmentation Agent
    console.log(`[Integration] Fetching segments...`);
    const segmentsResponse = await axios.get(
      `${SEGMENTATION_API}/api/segments`,
      { timeout: 10000 }
    );

    const segments = segmentsResponse.data.segments || segmentsResponse.data.data || [];

    if (!Array.isArray(segments) || segments.length === 0) {
      console.warn('[Integration] No segments received from Segmentation API');
      return NextResponse.json(
        { error: 'No segments available from Segmentation API' },
        { status: 404 }
      );
    }

    console.log(`[Integration] Retrieved ${segments.length} segments`);

    // Step 2: Generate content for each segment using RAG API
    let generatedContent: any[] = [];

    if (generateContent) {
      console.log(`[Integration] Generating content for each segment...`);

      for (const segment of segments) {
        try {
          const segmentName = segment.name || segment.segment_name || 'Unknown';
          const segmentDesc = segment.description || segment.segment_description || segmentName;
          const segmentCriteria = segment.criteria || {};

          console.log(`[Integration] Generating content for: ${segmentName}`);

          const contentResponse = await axios.post(
            `${RAG_API}/api/generate-content`,
            {
              segment: segmentName,
              description: segmentDesc,
              criteria: segmentCriteria,
            },
            { timeout: 15000 }
          );

          if (contentResponse.data.success && contentResponse.data.content) {
            generatedContent.push({
              segment: segmentName,
              content: contentResponse.data.content,
              generatedAt: new Date().toISOString(),
            });
            console.log(`[Integration] Generated ${contentResponse.data.content.length} content items for ${segmentName}`);
          }
        } catch (segmentError: any) {
          console.warn(`[Integration] Failed to generate content for segment: ${segment.name}`);
          console.warn(`[Integration] Error: ${segmentError.message}`);
          // Continue with other segments
        }
      }
    }

    // Step 3: Combine results
    const integratedResults = {
      success: true,
      workflow: 'rag-segmentation-integration',
      timestamp: new Date().toISOString(),
      segmentation: {
        apiUrl: SEGMENTATION_API,
        segmentsCount: segments.length,
        segments: segments.map((s: any) => ({
          id: s.id || s.segment_id,
          name: s.name || s.segment_name,
          description: s.description || s.segment_description,
          customerCount: s.customer_count || s.customers?.length || 0,
          criteria: s.criteria,
        })),
      },
      contentGeneration: {
        apiUrl: RAG_API,
        enabled: generateContent,
        generatedFor: generatedContent.length,
        content: generatedContent,
      },
      metrics: {
        totalSegments: segments.length,
        contentGenerationSuccessRate: generatedContent.length > 0 
          ? Math.round((generatedContent.length / segments.length) * 100)
          : 0,
        totalContentItems: generatedContent.reduce((sum: number, g: any) => 
          sum + (g.content?.length || 0), 0),
      },
    };

    return NextResponse.json(integratedResults, { status: 200 });
  } catch (error: any) {
    console.error('[Integration] Error:', error.message);

    // Provide helpful error messages
    let errorMessage = 'Integration workflow failed';
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Could not connect to one or more services. Ensure Segmentation Agent and RAG API are running.';
      statusCode = 503;
    } else if (error.response?.status === 404) {
      errorMessage = 'One of the required endpoints was not found';
      statusCode = 404;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS resolution failed. Check API URLs.';
      statusCode = 503;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/integration/rag-segmentation
 * 
 * Health check and service status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const segmentationApiUrl = searchParams.get('segmentationUrl') || process.env.SEGMENTATION_API_URL || 'http://localhost:3001';
    const ragApiUrl = searchParams.get('ragUrl') || process.env.RAG_API_URL || 'http://localhost:8000';

    console.log('[Integration] Health check requested');

    // Check Segmentation API
    let segmentationStatus = { healthy: false, error: null };
    try {
      const segRes = await axios.get(`${segmentationApiUrl}/health`, { timeout: 5000 });
      segmentationStatus = { healthy: segRes.status === 200, error: null };
    } catch (err: any) {
      segmentationStatus = { healthy: false, error: err.message };
    }

    // Check RAG API
    let ragStatus = { healthy: false, error: null };
    try {
      const ragRes = await axios.get(`${ragApiUrl}/health`, { timeout: 5000 });
      ragStatus = { healthy: ragRes.status === 200, error: null };
    } catch (err: any) {
      ragStatus = { healthy: false, error: err.message };
    }

    const allHealthy = segmentationStatus.healthy && ragStatus.healthy;

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        segmentationAgent: {
          url: segmentationApiUrl,
          status: segmentationStatus.healthy ? 'online' : 'offline',
          error: segmentationStatus.error,
        },
        ragApi: {
          url: ragApiUrl,
          status: ragStatus.healthy ? 'online' : 'offline',
          error: ragStatus.error,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
