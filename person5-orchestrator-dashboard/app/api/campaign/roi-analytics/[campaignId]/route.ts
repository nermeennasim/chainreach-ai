import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/campaign/roi-analytics/:campaignId
 * Get ROI and analytics for a campaign
 * 
 * Response: {
 *   campaignId: string,
 *   totalSent: number,
 *   totalDelivered: number,
 *   totalOpened: number,
 *   totalClicked: number,
 *   totalConverted: number,
 *   roi: number,
 *   upsaleCount: number,
 *   complianceApprovalRate: number,
 *   charts: { ... }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const campaignId = params.campaignId;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Generate realistic demo data based on campaign ID hash
    let seed = campaignId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      seed = (seed * 9301 + 49297) % 233280; // Linear congruential generator
      const hash = Math.sin(seed / 233280) * 10000;
      return Math.floor((hash - Math.floor(hash)) * (max - min + 1)) + min;
    };

    const totalSent = random(900, 1000);
    const deliveryRate = random(75, 85) / 100;
    const totalDelivered = Math.floor(totalSent * deliveryRate);
    const openRate = random(20, 35) / 100;
    const totalOpened = Math.floor(totalDelivered * openRate);
    const clickRate = random(8, 15) / 100;
    const totalClicked = Math.floor(totalOpened * clickRate);
    const conversionRate = random(3, 8) / 100;
    const totalConverted = Math.floor(totalClicked * conversionRate);
    const avgOrderValue = random(150, 500);
    const totalRevenue = totalConverted * avgOrderValue;
    const campaignCost = random(500, 2000);
    const roi = Math.round(((totalRevenue - campaignCost) / campaignCost) * 100);
    const upsaleCount = Math.floor(totalConverted * random(20, 40) / 100);
    const complianceApprovalRate = random(92, 99);

    // Hourly engagement data for chart
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      sent: Math.floor(totalSent / 24 + random(-50, 50)),
      opened: Math.floor(totalOpened / 24 + random(-20, 20)),
      clicked: Math.floor(totalClicked / 24 + random(-10, 10)),
    }));

    // Category breakdown
    const categoryData = [
      { name: 'Electronics', sent: Math.floor(totalSent * 0.3), converted: Math.floor(totalConverted * 0.35) },
      { name: 'Fashion', sent: Math.floor(totalSent * 0.25), converted: Math.floor(totalConverted * 0.25) },
      { name: 'Home & Garden', sent: Math.floor(totalSent * 0.2), converted: Math.floor(totalConverted * 0.2) },
      { name: 'Sports & Outdoors', sent: Math.floor(totalSent * 0.15), converted: Math.floor(totalConverted * 0.15) },
      { name: 'Other', sent: Math.floor(totalSent * 0.1), converted: Math.floor(totalConverted * 0.05) },
    ];

    // Compliance by segment
    const complianceBySegment = [
      { segment: 'High Value', approved: random(95, 99), flagged: random(1, 3), blocked: random(0, 2) },
      { segment: 'New Customers', approved: random(90, 95), flagged: random(3, 7), blocked: random(1, 3) },
      { segment: 'At Risk', approved: random(88, 93), flagged: random(5, 10), blocked: random(2, 4) },
      { segment: 'Premium', approved: random(97, 99), flagged: random(0, 2), blocked: random(0, 1) },
    ];

    return NextResponse.json({
      campaignId,
      status: 'completed',
      metrics: {
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalConverted,
        deliveryRate: Math.round(deliveryRate * 100),
        openRate: Math.round(openRate * 100),
        clickRate: Math.round(clickRate * 100),
        conversionRate: Math.round(conversionRate * 100),
      },
      revenue: {
        totalRevenue,
        avgOrderValue,
        campaignCost,
        roi,
        roiDisplay: `${roi > 0 ? '+' : ''}${roi}%`,
      },
      compliance: {
        totalMessages: totalSent,
        approvedMessages: Math.floor(totalSent * (complianceApprovalRate / 100)),
        approvalRate: complianceApprovalRate,
        violations: {
          hate: random(0, 5),
          sexual: random(0, 3),
          violence: random(0, 4),
          selfHarm: random(0, 2),
        },
      },
      upsales: {
        count: upsaleCount,
        rate: Math.round((upsaleCount / totalConverted) * 100),
        averageValue: random(50, 150),
      },
      charts: {
        hourlyEngagement: hourlyData,
        categoryBreakdown: categoryData,
        complianceBySegment,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve analytics', details: String(error) },
      { status: 500 }
    );
  }
}
