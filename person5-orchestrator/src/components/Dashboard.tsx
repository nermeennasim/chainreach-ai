'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Users, TrendingUp, Mail, MessageSquare, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CampaignResult {
  customer_id: string;
  customer_name: string;
  segment: string;
  confidence: number;
  variant: string;
  format: string;
  message_preview: string;
  compliance_status: 'approved' | 'rejected';
  compliance_issues: string[];
}

interface DashboardProps {
  data: {
    metrics: {
      total_customers: number;
      approved_count: number;
      rejected_count: number;
      success_rate: string;
    };
    results: CampaignResult[];
  } | null;
  loading?: boolean;
}

export function Dashboard({ data, loading }: DashboardProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No campaign data yet</p>
          <p className="text-sm text-muted-foreground">Run a campaign to see results here</p>
        </CardContent>
      </Card>
    );
  }

  const { metrics, results } = data;

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'social': return <Share2 className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      'high-value': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'engaged': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'at-risk': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'dormant': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[segment] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_customers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.approved_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.rejected_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.success_rate}</div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Results</CardTitle>
          <CardDescription>
            Detailed results for each customer in the campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.customer_id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {result.compliance_status === 'approved' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{result.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{result.customer_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(result.segment)}`}>
                        {result.segment}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getFormatIcon(result.format)}
                        {result.format}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Variant:</span> {result.variant} | 
                    <span className="font-medium"> Confidence:</span> {(result.confidence * 100).toFixed(1)}%
                  </p>

                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm">{result.message_preview}</p>
                  </div>

                  {result.compliance_issues.length > 0 && (
                    <div className="flex items-start gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Compliance Issues:</p>
                        <ul className="list-disc list-inside">
                          {result.compliance_issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
