'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CampaignDashboardProps {
  campaignId?: string;
}

interface CampaignStep {
  step: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'warning';
  description: string;
}

export default function CampaignDashboard({ campaignId: initialCampaignId }: CampaignDashboardProps) {
  const [campaignId, setCampaignId] = useState(initialCampaignId || '');
  const [campaign, setCampaign] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [messageToValidate, setMessageToValidate] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validatingMessage, setValidatingMessage] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⟳';
      case 'warning':
        return '⚠';
      default:
        return '◯';
    }
  };

  const handleValidateMessage = async () => {
    if (!messageToValidate.trim()) return;

    setValidatingMessage(true);
    try {
      const response = await fetch('/api/campaign/validate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToValidate }),
      });

      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      setValidationResult({ error: 'Failed to validate message' });
    } finally {
      setValidatingMessage(false);
    }
  };

  const handleCreateCampaign = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/campaign/create-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Demo Campaign - 1000 Customers',
          description: 'Testing campaign orchestration',
          customerIds: Array.from({ length: 1000 }, (_, i) => `cust_${i + 1}`),
          messageTemplate: messageToValidate || 'Check out our latest products!',
          targetSegment: 'all',
        }),
      });

      const data = await response.json();
      setCampaign(data);
      setCampaignId(data.campaignId);

      // Fetch analytics after a short delay
      setTimeout(() => fetchAnalytics(data.campaignId), 1000);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (cid: string) => {
    try {
      const response = await fetch(`/api/campaign/roi-analytics/${cid}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    if (initialCampaignId) {
      fetchAnalytics(initialCampaignId);
    }
  }, [initialCampaignId]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Campaign Dashboard</h1>
        <p className="text-gray-600">Create, validate, and track campaigns with full transparency</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Message Validation & Creation */}
        <div className="lg:col-span-1 space-y-4">
          {/* Message Validator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🛡️</span>
                Message Validator
              </CardTitle>
              <CardDescription>Validate message before campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={messageToValidate}
                onChange={(e) => setMessageToValidate(e.target.value)}
                placeholder="Enter your campaign message here..."
                className="w-full p-3 border border-gray-300 rounded text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleValidateMessage}
                disabled={validatingMessage || !messageToValidate.trim()}
                className="w-full"
              >
                {validatingMessage ? '⏳ Validating...' : '✓ Validate'}
              </Button>

              {validationResult && (
                <div className={`p-3 rounded border ${validationResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="font-bold mb-2">
                    {validationResult.valid ? '✓ Valid' : '✗ Invalid'}
                  </div>
                  {validationResult.errors && validationResult.errors.length > 0 && (
                    <div className="text-sm text-red-700 mb-2">
                      <strong>Errors:</strong>
                      {validationResult.errors.map((e: string, i: number) => (
                        <div key={i}>• {e}</div>
                      ))}
                    </div>
                  )}
                  {validationResult.compliance && (
                    <div className="text-xs bg-white p-2 rounded mt-2">
                      <div>Compliance: <Badge className={validationResult.compliance.approved ? 'bg-green-500' : 'bg-red-500'}>
                        {validationResult.compliance.approved ? 'Approved' : 'Blocked'}
                      </Badge></div>
                      <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                        <div>Hate: {validationResult.compliance.categories.hate}</div>
                        <div>Sexual: {validationResult.compliance.categories.sexual}</div>
                        <div>Violence: {validationResult.compliance.categories.violence}</div>
                        <div>Self-Harm: {validationResult.compliance.categories.self_harm}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Campaign Button */}
          {!campaign && (
            <Button
              onClick={handleCreateCampaign}
              disabled={loading || !validationResult?.valid}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
            >
              {loading ? '⏳ Creating...' : '🚀 Launch Campaign'}
            </Button>
          )}
        </div>

        {/* Right Column - Campaign Info & Results */}
        <div className="lg:col-span-2 space-y-4">
          {campaign && (
            <>
              {/* Campaign Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>📢 Campaign Created</span>
                    <Badge className="bg-green-500">{campaign.campaignId}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600">Total Customers</div>
                      <div className="text-2xl font-bold">{campaign.totalCustomers}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Estimated Reach</div>
                      <div className="text-2xl font-bold">{campaign.estimatedReach}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Compliance Status</span>
                    <Badge className={campaign.complianceStatus === 'approved' ? 'bg-green-500' : campaign.complianceStatus === 'warnings' ? 'bg-yellow-500' : 'bg-red-500'}>
                      {campaign.complianceStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📋</span>
                    Campaign Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {campaign.steps.map((step: CampaignStep) => (
                      <div key={step.step} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStatusColor(step.status)}`}>
                          {getStatusIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.step}. {step.name}</div>
                          <div className="text-xs text-gray-600">{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analytics */}
              {analytics && (
                <>
                  {/* Metrics Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>📊</span>
                        Campaign Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="text-xs text-gray-600">Sent</div>
                          <div className="text-xl font-bold">{analytics?.metrics?.totalSent || 0}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <div className="text-xs text-gray-600">Delivered</div>
                          <div className="text-xl font-bold">{analytics?.metrics?.deliveryRate || 0}%</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <div className="text-xs text-gray-600">Opened</div>
                          <div className="text-xl font-bold">{analytics?.metrics?.openRate || 0}%</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                          <div className="text-xs text-gray-600">Converted</div>
                          <div className="text-xl font-bold">{analytics?.metrics?.totalConverted || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ROI & Revenue */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>💰</span>
                        ROI & Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                          <div className="text-3xl font-bold text-green-600">${(analytics?.revenue?.totalRevenue || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">ROI</div>
                          <div className={`text-3xl font-bold ${(analytics?.revenue?.roi || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analytics?.revenue?.roiDisplay || '+0%'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Campaign Cost</div>
                          <div className="text-xl font-bold">${analytics?.revenue?.campaignCost || 0}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Avg Order Value</div>
                          <div className="text-xl font-bold">${analytics?.revenue?.avgOrderValue || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compliance Dashboard */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>🛡️</span>
                        Compliance & Responsible AI
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600">Approval Rate</div>
                          <div className="text-2xl font-bold text-green-600">{analytics?.compliance?.approvalRate || 0}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Approved Messages</div>
                          <div className="text-2xl font-bold">{analytics?.compliance?.approvedMessages || 0}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded">
                        <div className="text-center">
                          <div className="text-xs">Hate</div>
                          <div className="font-bold text-red-600">{analytics?.compliance?.violations?.hate || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs">Sexual</div>
                          <div className="font-bold text-orange-600">{analytics?.compliance?.violations?.sexual || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs">Violence</div>
                          <div className="font-bold text-yellow-600">{analytics?.compliance?.violations?.violence || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs">Self-Harm</div>
                          <div className="font-bold text-pink-600">{analytics?.compliance?.violations?.selfHarm || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upsales */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>📈</span>
                        Upsale Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-600">Upsales</div>
                          <div className="text-2xl font-bold text-blue-600">{analytics?.upsales?.count || 0}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-600">Upsale Rate</div>
                          <div className="text-2xl font-bold text-green-600">{analytics?.upsales?.rate || 0}%</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-600">Avg Value</div>
                          <div className="text-2xl font-bold text-purple-600">${analytics?.upsales?.averageValue || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hourly Engagement Chart */}
                  {analytics.charts?.hourlyEngagement && (
                    <Card>
                      <CardHeader>
                        <CardTitle>📈 Hourly Engagement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-xs">
                          {analytics.charts.hourlyEngagement.slice(0, 12).map((data: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="w-12">{data.hour}</span>
                              <div className="flex gap-1 flex-1">
                                <div className="bg-blue-500 rounded h-4" style={{width: `${(data.sent / Math.max(...analytics.charts.hourlyEngagement.map((d: any) => d.sent))) * 100}%`}} title={`Sent: ${data.sent}`}></div>
                                <div className="bg-green-500 rounded h-4" style={{width: `${(data.opened / Math.max(...analytics.charts.hourlyEngagement.map((d: any) => d.opened))) * 100}%`}} title={`Opened: ${data.opened}`}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Category Breakdown */}
                  {analytics.charts?.categoryBreakdown && (
                    <Card>
                      <CardHeader>
                        <CardTitle>🏷️ Category Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.charts.categoryBreakdown.map((cat: any, idx: number) => (
                            <div key={idx}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{cat.name}</span>
                                <span className="text-xs text-gray-600">{cat.converted} conversions</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                                <div
                                  className="bg-green-500 h-full"
                                  style={{width: `${(cat.converted / Math.max(...analytics.charts.categoryBreakdown.map((c: any) => c.converted))) * 100}%`}}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
