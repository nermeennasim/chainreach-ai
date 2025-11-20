import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/lib/orchestrator';

/**
 * POST /api/campaign
 * Run a complete marketing campaign across all services
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    
    // Support both formats:
    // 1. { customers: [...], format: "email" } - from CampaignRunner
    // 2. { customerIds: [...], campaignName: "..." } - direct API calls
    const { customers, format, customerIds: directCustomerIds, campaignName } = body;

    let customerIds: string[];
    let campaignFormat = format || 'email';
    let campaignTitle = campaignName || `Campaign-${campaignFormat}-${Date.now()}`;

    // Handle both input formats
    if (customers && Array.isArray(customers) && customers.length > 0) {
      // Format 1: Full customer objects
      customerIds = customers.map((c: any) => c.id);
      console.log(`Processing ${customers.length} customers with format: ${campaignFormat}`);
    } else if (directCustomerIds && Array.isArray(directCustomerIds) && directCustomerIds.length > 0) {
      // Format 2: Direct customer IDs
      customerIds = directCustomerIds;
      console.log(`Processing ${directCustomerIds.length} customer IDs`);
    } else {
      console.error('Validation failed: No customers or customerIds');
      return NextResponse.json(
        { error: 'customers array or customerIds array is required' },
        { status: 400 }
      );
    }

    console.log('Customer IDs:', customerIds);
    
    // Run the campaign orchestration
    const summary = await orchestrator.runCampaign({
      customerIds,
      campaignName: campaignTitle,
      description: body.description || `${campaignFormat} campaign for ${customerIds.length} customers`,
    });

    console.log('Campaign completed:', summary);

    return NextResponse.json({
      success: true,
      metrics: {
        total_customers: summary.totalCustomers,
        approved_count: summary.approvedCount,
        rejected_count: summary.rejectedCount,
        success_rate: `${summary.successRate.toFixed(1)}%`,
      },
      results: summary.results.map((r) => ({
        customer_id: r.customerId,
        customer_name: customers 
          ? customers.find((c: any) => c.id === r.customerId)?.name 
          : r.customerId, // Use ID if no customer objects provided
        segment: r.segment,
        confidence: r.traits ? 0.85 : 0.5, // Mock confidence
        variant: r.assignedVariant,
        format: campaignFormat,
        message_preview: r.messagePreview,
        compliance_status: r.approved ? 'approved' : 'rejected',
        compliance_issues: r.complianceIssues || [],
        timestamp: new Date().toISOString(),
      })),
    });
  } catch (error) {
    console.error('Campaign execution error:', error);
    return NextResponse.json(
      {
        success: false,
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
