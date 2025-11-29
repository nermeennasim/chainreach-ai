/**
 * Compliance Results Dashboard Component
 * 
 * Shows Agent 4 compliance validation results with:
 * - Approved messages (green)
 * - Rejected messages (red) with reasons
 * - AI confidence scores
 * - Category breakdowns (hate, violence, etc.)
 * - Responsible AI transparency
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  TrendingUp,
  Shield,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@radix-ui/react-progress';
import { Badge } from '../ui/badge';


interface ComplianceResult {
  customer_id: string;
  total_checked: number;
  approved: number;
  rejected: number;
  message: string;
  approved_messages: ApprovedMessage[];
  rejected_messages: RejectedMessage[];
}

interface ApprovedMessage {
  message_id: string;
  customer_id: string;
  content: string;
  variant: string;
  channel: string;
  approval_timestamp?: string;
  compliance_score?: number;
  categories?: CategoryScores;
}

interface RejectedMessage {
  message_id: string;
  customer_id: string;
  content?: string;
  variant: string;
  channel: string;
  rejection_reason: string;
  compliance_issues?: CategoryScores;
}

interface CategoryScores {
  hate?: number;
  sexual?: number;
  violence?: number;
  self_harm?: number;
}

export function ComplianceResultsDashboard({ campaignId }: { campaignId?: string }) {
  const [results, setResults] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignId) {
      fetchResults(campaignId);
    }
  }, [campaignId]);

  const fetchResults = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaign/${id}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Failed to fetch results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading compliance results...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return null;
  }

  const approvalRate = results.total_checked > 0 
    ? (results.approved / results.total_checked) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Checked</p>
                <p className="text-3xl font-bold text-gray-900">{results.total_checked}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Approved</p>
                <p className="text-3xl font-bold text-green-900">{results.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Rejected</p>
                <p className="text-3xl font-bold text-red-900">{results.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Approval Rate</p>
                <p className="text-3xl font-bold text-blue-900">{approvalRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Rate Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Compliance Approval Rate
          </CardTitle>
          <CardDescription>
            Percentage of messages that passed AI content safety validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={approvalRate} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{results.approved} approved</span>
            <span>{results.rejected} rejected</span>
          </div>
        </CardContent>
      </Card>

      {/* Responsible AI Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                🛡️ Responsible AI & Transparency
              </h3>
              <p className="text-sm text-blue-800">
                All messages are validated using <strong>Azure Content Safety AI</strong> to ensure compliance 
                with safety standards. Below you can see detailed reasoning for each approval or rejection, 
                including confidence scores and category breakdowns. This transparency helps you understand 
                how AI makes decisions and maintain trust with your customers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approved Messages */}
      {results.approved_messages.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Approved Messages ({results.approved_messages.length})
            </CardTitle>
            <CardDescription>
              Messages that passed compliance validation and are safe to send
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.approved_messages.map((msg, index) => (
              <ApprovedMessageCard key={msg.message_id || index} message={msg} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rejected Messages */}
      {results.rejected_messages.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Rejected Messages ({results.rejected_messages.length})
            </CardTitle>
            <CardDescription>
              Messages that failed compliance validation with detailed reasons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.rejected_messages.map((msg, index) => (
              <RejectedMessageCard key={msg.message_id || index} message={msg} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ApprovedMessageCard({ message }: { message: ApprovedMessage }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-900">Message ID: {message.message_id}</span>
            <Badge variant="outline" className="bg-white">
              {message.channel}
            </Badge>
            <Badge variant="outline" className="bg-white">
              {message.variant}
            </Badge>
          </div>

          <p className="text-gray-900 mb-3 bg-white p-3 rounded border border-green-200">
            {message.content}
          </p>

          {/* Compliance Score */}
          {message.compliance_score !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="text-green-700">
                Compliance Score: <strong>{(message.compliance_score * 100).toFixed(0)}%</strong>
              </span>
            </div>
          )}

          {/* Category Scores */}
          {message.categories && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              <CategoryBadge label="Hate" score={message.categories.hate || 0} />
              <CategoryBadge label="Sexual" score={message.categories.sexual || 0} />
              <CategoryBadge label="Violence" score={message.categories.violence || 0} />
              <CategoryBadge label="Self-Harm" score={message.categories.self_harm || 0} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RejectedMessageCard({ message }: { message: RejectedMessage }) {
  const getSeverityColor = (issues: CategoryScores) => {
    const maxScore = Math.max(
      issues.hate || 0,
      issues.sexual || 0,
      issues.violence || 0,
      issues.self_harm || 0
    );

    if (maxScore >= 4) return 'red';
    if (maxScore >= 2) return 'orange';
    return 'yellow';
  };

  const severityColor = message.compliance_issues 
    ? getSeverityColor(message.compliance_issues)
    : 'red';

  return (
    <div className={`bg-${severityColor}-50 border border-${severityColor}-200 rounded-lg p-4`}>
      <div className="flex items-start gap-4">
        <AlertTriangle className={`h-5 w-5 text-${severityColor}-600 mt-0.5 flex-shrink-0`} />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-red-900">Message ID: {message.message_id}</span>
            <Badge variant="destructive">Rejected</Badge>
            <Badge variant="outline" className="bg-white">
              {message.channel}
            </Badge>
          </div>

          {message.content && (
            <p className="text-gray-900 mb-3 bg-white p-3 rounded border border-red-200">
              {message.content}
            </p>
          )}

          {/* Rejection Reason */}
          <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 text-sm mb-1">Rejection Reason:</p>
                <p className="text-red-800 text-sm">{message.rejection_reason}</p>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          {message.compliance_issues && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">AI Safety Categories:</p>
              <div className="grid grid-cols-4 gap-2">
                <CategoryBadge label="Hate" score={message.compliance_issues.hate || 0} />
                <CategoryBadge label="Sexual" score={message.compliance_issues.sexual || 0} />
                <CategoryBadge label="Violence" score={message.compliance_issues.violence || 0} />
                <CategoryBadge label="Self-Harm" score={message.compliance_issues.self_harm || 0} />
              </div>
            </div>
          )}

          {/* Responsible AI Note */}
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <strong>Note:</strong> This message was automatically flagged by Azure Content Safety AI. 
            Scores range from 0-6 (0=safe, 6=severe). You can review and override if needed.
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ label, score }: { label: string; score: number }) {
  const getColor = (score: number) => {
    if (score === 0) return 'bg-green-100 text-green-800 border-green-300';
    if (score <= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score <= 4) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className={`text-xs px-2 py-1 rounded border ${getColor(score)}`}>
      <div className="font-medium">{label}</div>
      <div className="font-bold">{score}/6</div>
    </div>
  );
}
