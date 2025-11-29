'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft, Send, AlertCircle, CheckCircle2, RotateCcw, FileJson, Shield, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_CONFIG } from '@/lib/api/config';
import toast, { Toaster } from 'react-hot-toast';

interface ComplianceResult {
  message: string;
  status: 'APPROVED' | 'REJECTED';
  safety_scores: {
    hate: number;
    violence: number;
    sexual: number;
    self_harm: number;
  };
  reason: string;
  triggered_by?: string; // Which category triggered the rejection
}

interface ApiResponse {
  results: ComplianceResult[];
}

const DEFAULT_MESSAGES = {
  "messages": [
    "Exclusive 20% discount just for you! Shop now and save big on your favorite items.",
    "We value your loyalty! As a premium member, enjoy early access to our new collection.",
   "My eyes Bleed",
    "Don't miss this limited-time offer - free shipping on all orders this weekend!",
    "Your personalized recommendation is ready. Click here to discover products you'll love.",
    "I hate this stupid product and everyone who uses it!",
    "Kill your offers!"
  ]
};

const SAMPLE_JSON = JSON.stringify(DEFAULT_MESSAGES, null, 2);

export default function MessageValidatorPage() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_MESSAGES, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [copied, setCopied] = useState(false);

  const validateMessages = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // Validate API endpoint is configured
      if (!API_CONFIG?.agent4?.url) {
        throw new Error('Compliance API endpoint not configured');
      }

      // Parse JSON input
      let messages: string[];
      const parsed = JSON.parse(jsonInput);

      // Validate: Must be array OR object with "messages" array
      if (Array.isArray(parsed)) {
        messages = parsed.filter((m: unknown) => typeof m === 'string');
      } else if (typeof parsed === 'object' && parsed !== null && 'messages' in parsed) {
        if (!Array.isArray(parsed.messages)) {
          throw new Error('The "messages" field must be an array');
        }
        messages = parsed.messages.filter((m: unknown) => typeof m === 'string');
      } else {
        throw new Error('JSON must be either:\n• An array: ["message1", "message2"]\n• Or an object: {"messages": ["message1", "message2"]}');
      }

      if (messages.length === 0) {
        throw new Error('No valid string messages found. Ensure each message is in quotes: ["text1", "text2"]');
      }

      toast.loading(`Validating ${messages.length} messages...`, { id: 'validation' });

      // Call real Agent 4 Compliance API with correct endpoint
      const complianceEndpoint = `${API_CONFIG.agent4.url}${API_CONFIG.agent4.endpoints.analyze}`;
      const response = await axios.post<ApiResponse>(
        complianceEndpoint,
        { messages },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );

      console.log('[Message Validator] API Response:', response.data);

      // Validate response structure
      if (!response.data) {
        throw new Error('No data received from compliance API');
      }

      const apiResults = response.data.results;

      if (!apiResults || !Array.isArray(apiResults)) {
        throw new Error('Invalid response format from compliance API');
      }

      // Ensure each result has required fields with fallbacks
      const validatedResults = apiResults.map((result, index) => {
        // Get safety scores with defaults (0-6 scale)
        const scores = result.safety_scores || result.categories || {
          hate: 0,
          violence: 0,
          sexual: 0,
          self_harm: 0
        };

        // Determine status based on Azure Content Safety scores (0-6 scale):
        // 0 = No risk
        // 1-2 = Low risk
        // 3-4 = Medium risk  
        // 5-6 = High risk
        
        const scoreEntries = Object.entries(scores) as [string, number][];
        const allScoresZero = scoreEntries.every(([_, score]) => score === 0);
        
        // Find which category has the highest risk
        const riskyCategories = scoreEntries.filter(([_, score]) => score > 0);
        const maxRiskCategory = riskyCategories.length > 0 
          ? riskyCategories.reduce((max, current) => current[1] > max[1] ? current : max)
          : null;

        // Determine status
        let status: 'APPROVED' | 'REJECTED' = 'APPROVED';
        let reason = 'No safety concerns detected';
        let triggered_by = undefined;

        if (allScoresZero) {
          status = 'APPROVED';
          reason = 'No safety concerns detected - all scores are 0';
        } else if (maxRiskCategory) {
          // If ANY category has a score > 0, reject the message
          status = 'REJECTED';
          const [category, score] = maxRiskCategory;
          triggered_by = category;
          
          let riskLevel = 'Unknown';
          if (score >= 5) riskLevel = 'High Risk';
          else if (score >= 3) riskLevel = 'Medium Risk';
          else if (score >= 1) riskLevel = 'Low Risk';
          
          reason = `${riskLevel} - ${category.charAt(0).toUpperCase() + category.slice(1)} score: ${score}`;
        }

        return {
          message: result.message || result.text || messages[index] || 'Unknown message',
          status,
          safety_scores: scores,
          reason,
          triggered_by
        };
      });

      setResults(validatedResults);
      
      const approved = validatedResults.filter(r => r.status === 'APPROVED').length;
      const rejected = validatedResults.filter(r => r.status === 'REJECTED').length;
      
      toast.success(
        `Validation complete! ${approved} approved, ${rejected} rejected`,
        { id: 'validation' }
      );

    } catch (error: any) {
      console.error('[Message Validator] Validation failed:', error);
      setResults([]);
      toast.dismiss('validation');
      
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format. Please check your input.');
      } else if (error.message?.includes('No valid string messages')) {
        toast.error(error.message);
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error(`Validation failed: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    toast.success('JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setJsonInput(JSON.stringify(DEFAULT_MESSAGES, null, 2));
    setResults([]);
  };

  const approvedCount = results ? results.filter(r => r.status === 'APPROVED').length : 0;
  const rejectedCount = results ? results.filter(r => r.status === 'REJECTED').length : 0;
  const approvalRate = results && results.length > 0 ? ((approvedCount / results.length) * 100).toFixed(1) : '0';

  const getSeverityColor = (score: number): string => {
    // Azure Content Safety uses 0-6 scale
    if (score === 0) return 'text-green-600 font-semibold';
    if (score >= 1 && score <= 2) return 'text-yellow-600 font-medium';
    if (score >= 3 && score <= 4) return 'text-orange-600 font-semibold';
    if (score >= 5) return 'text-red-600 font-bold';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-gradient text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/campaign">
            <Button variant="ghost" className="text-white hover:text-cyan-primary mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaign Hub
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Message Validator</h1>
          </div>
          <p className="text-xl text-gray-200">
            Test message compliance with Azure Content Safety API
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Instructions Card */}
        <Card className="border-agent-4-purple bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileJson className="h-6 w-6 text-agent-4-purple mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-navy-primary mb-2">How to Use Message Validator</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Enter messages</strong> in JSON format: <code className="bg-purple-100 px-1.5 py-0.5 rounded text-xs font-mono">["message 1", "message 2"]</code></li>
                  <li>• <strong>Real-time analysis</strong> using Azure Content Safety via Agent 4 API</li>
                  <li>• <strong>Category scoring</strong>: Hate, Violence, Sexual, Self-Harm (0-6 integer scale)</li>
                  <li>• <strong>Rejection logic</strong>: If ANY category score &gt; 0, message is REJECTED</li>
                  <li>• <strong>Full transparency</strong>: See which category triggered rejection and risk levels</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Message Input</CardTitle>
            <CardDescription>
              Enter messages in JSON format. Default sample includes 5 messages (4 safe, 1 potentially unsafe).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JSON Messages
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-agent-4-purple focus:border-transparent"
                placeholder='["Message 1", "Message 2", "Message 3"]'
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Supports array format: <code>["msg1", "msg2"]</code> or object format: <code>{'{'}&#34;messages&#34;: ["msg1", "msg2"]{'}'}  </code>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={copyToClipboard}
                disabled={isLoading}
                variant="outline"
                size="lg"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy JSON
                  </>
                )}
              </Button>
              <Button
                onClick={validateMessages}
                disabled={isLoading}
                className="flex-1 bg-gradient-primary text-white hover:opacity-90"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Validate Messages
                  </>
                )}
              </Button>
              <Button
                onClick={resetForm}
                disabled={isLoading}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>



        {/* Results Display */}
        {results && results.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-info">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-info">{results.length}</div>
                </CardContent>
              </Card>
              <Card className="border-success">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">{approvedCount}</div>
                </CardContent>
              </Card>
              <Card className="border-error">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-error">{rejectedCount}</div>
                </CardContent>
              </Card>
              <Card className="border-agent-4-purple">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-agent-4-purple">{approvalRate}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Approval Rate</span>
                  <span className="text-sm font-semibold text-agent-4-purple">{approvalRate}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${approvalRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Analysis Results</CardTitle>
                <CardDescription>
                  Real-time analysis powered by Azure Content Safety (0-6 scale)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      result.status === 'APPROVED'
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {result.status === 'APPROVED' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                        )}
                        <Badge
                          className={
                            result.status === 'APPROVED'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }
                        >
                          {result.status === 'APPROVED' ? '✓ APPROVED' : '✗ REJECTED'}
                        </Badge>
                        {result.triggered_by && (
                          <Badge className="bg-orange-600 text-white hover:bg-orange-700">
                            {result.triggered_by.charAt(0).toUpperCase() + result.triggered_by.slice(1)} Detected
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                      <p className="text-gray-900 bg-white p-3 rounded border border-gray-200">
                        {result.message}
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Analysis:</p>
                      <p className={`text-sm font-semibold ${result.status === 'APPROVED' ? 'text-green-700' : 'text-red-700'}`}>
                        {result.reason}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Safety Scores (0-6 scale):</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {result.safety_scores && Object.entries(result.safety_scores).map(([category, score]) => {
                          const isTriggered = result.triggered_by === category && score > 0;
                          return (
                            <div
                              key={category}
                              className={`p-3 rounded border-2 ${
                                isTriggered 
                                  ? 'bg-red-100 border-red-400' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="text-xs font-medium text-gray-600 capitalize">
                                {category.replace('_', ' ')}
                              </div>
                              <div className={`text-2xl font-bold ${getSeverityColor(score as number)}`}>
                                {score}
                              </div>
                              {isTriggered && (
                                <div className="text-xs font-semibold text-red-600 mt-1">⚠️ TRIGGERED</div>
                              )}
                            </div>
                          );
                        })}
                        {!result.safety_scores && (
                          <div className="col-span-4 text-sm text-gray-500 italic">
                            No safety scores available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer Info */}
        <Card className="border-agent-4-purple bg-purple-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-agent-4-purple" />
                <h3 className="font-semibold text-navy-primary">Powered by Azure Content Safety</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Real-time compliance checking with transparency in AI decision-making.
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Safety Score Scale (0 - 6):</strong></div>
                <div><span className="text-green-600 font-semibold">0</span> = Safe/Approved</div>
                <div><span className="text-yellow-600 font-medium">1-2</span> = Low Risk (⚠️ Rejected)</div>
                <div><span className="text-orange-600 font-semibold">3-4</span> = Medium Risk (❌ Rejected)</div>
                <div><span className="text-red-600 font-bold">5-6</span> = High Risk (❌ Rejected)</div>
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <strong>Rule:</strong> If ANY category score &gt; 0, message is REJECTED. Only 0 scores = APPROVED.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
