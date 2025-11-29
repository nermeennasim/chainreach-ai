import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/campaign/create-campaign
 * Create a new campaign with customers and settings
 * 
 * Body: {
 *   name: string,
 *   description: string,
 *   customerIds: string[],
 *   messageTemplate: string,
 *   targetSegment: string
 * }
 * 
 * Response: {
 *   campaignId: string,
 *   status: 'created' | 'processing',
 *   totalCustomers: number,
 *   estimatedReach: number,
 *   complianceStatus: 'approved' | 'warnings' | 'blocked',
 *   steps: array
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, customerIds = [], messageTemplate, targetSegment } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    if (!messageTemplate || messageTemplate.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message template is required' },
        { status: 400 }
      );
    }

    // Generate campaign ID
    const campaignId = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Validate message compliance
    let complianceStatus = 'approved';
    try {
      const complianceResponse = await fetch(
        'https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [messageTemplate] }),
        }
      );

      if (complianceResponse.ok) {
        const complianceData = await complianceResponse.json();
        if (complianceData.results && complianceData.results[0]) {
          if (!complianceData.results[0].approved) {
            complianceStatus = 'blocked';
          }
        }
      }
    } catch (error) {
      complianceStatus = 'warnings';
    }

    // Calculate estimated reach (80% delivery rate for demo)
    const totalCustomers = customerIds.length || 1000;
    const estimatedReach = Math.floor(totalCustomers * 0.8);

    return NextResponse.json({
      campaignId,
      name,
      description,
      status: 'created',
      totalCustomers,
      estimatedReach,
      complianceStatus,
      targetSegment,
      messageTemplate,
      steps: [
        { step: 1, name: 'Segmentation', status: 'pending', description: 'Identifying target customers' },
        { step: 2, name: 'Message Generation', status: 'pending', description: 'Creating personalized variants' },
        { step: 3, name: 'Compliance Check', status: complianceStatus === 'approved' ? 'completed' : 'warning', description: 'Validating content safety' },
        { step: 4, name: 'Delivery', status: 'pending', description: 'Sending messages to customers' },
        { step: 5, name: 'Analytics', status: 'pending', description: 'Tracking engagement and ROI' },
      ],
      createdAt: new Date().toISOString(),
      estimatedDuration: '5-10 minutes',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create campaign', details: String(error) },
      { status: 500 }
    );
  }
}
