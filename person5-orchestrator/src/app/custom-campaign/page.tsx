'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Send, AlertCircle, CheckCircle2, RotateCw, FileJson } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ComplianceResult {
  id: number;
  text: string;
  approved: boolean;
  reason: string;
  confidence: number;
  categories: {
    [key: string]: number;
  };
}

const DEFAULT_MESSAGES = [
  "Exclusive 20% discount just for you! Shop now and save big on your favorite items.",
  "We value your loyalty! As a premium member, enjoy early access to our new collection.",
  "Don't miss this limited-time offer - free shipping on all orders this weekend!",
  "Your personalized recommendation is ready. Click here to discover products you'll love.",
  "This deal will absolutely kill the competition! Prices so low, it's criminal!"
];

const SAMPLE_JSON = JSON.stringify(DEFAULT_MESSAGES, null, 2);

export default function CustomCampaignPage() {
  const [campaignName, setCampaignName] = useState('Holiday Promo 2025');
  const [customerIds, setCustomerIds] = useState('CUST-001, CUST-002, CUST-003');
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ComplianceResult[] | null>(null);

  const validateAndSend = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
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

      console.log('[Custom Campaign] Analyzing messages with Agent 4 API:', { messages });

      // Call real Agent 4 API
      const response = await fetch('https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messages }),
      });
      
      if (!response.ok) {
        throw new Error(`Agent 4 API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match our UI format
      const apiResults: ComplianceResult[] = data.results.map((result: any) => ({
        id: result.id,
        text: result.text,
        approved: result.approved,
        reason: result.reason,
        confidence: result.confidence,
        categories: {
          'Hate': result.categories.hate,
          'Violence': result.categories.violence,
          'Sexual': result.categories.sexual,
          'SelfHarm': result.categories.self_harm
        }
      }));

      console.log('[Custom Campaign] Agent 4 analysis complete:', apiResults);
      setResults(apiResults);

    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your input.');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCampaignName('Holiday Promo 2025');
    setCustomerIds('CUST-001, CUST-002, CUST-003');
    setJsonInput(SAMPLE_JSON);
    setResults(null);
    setError(null);
  };

  const approvedCount = results?.filter(r => r.approved).length || 0;
  const rejectedCount = results?.filter(r => !r.approved).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/gemini_logo_chainreach-03-white.png" 
                alt="ChainReach AI Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-gray-800">ChainReach AI</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/">
                <button className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
                  HOME
                </button>
              </Link>
              <Link href="/campaigns">
                <button className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
                  CAMPAIGN
                </button>
              </Link>
              <Link href="/custom-campaign">
                <button className="text-gray-900 font-medium border-b-2 border-gray-900">
                  CUSTOM CAMPAIGN
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
                  DASHBOARD
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Custom Campaign Tester
              </h1>
              <p className="text-gray-600 mt-1">Test Agent 4 Compliance with Real Azure Content Safety API</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Instructions Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileJson className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How to Use (Real Azure Content Safety API)</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Enter campaign name and customer IDs</li>
                  <li>• Add messages in JSON format: <code className="bg-blue-100 px-1 rounded">["message 1", "message 2"]</code></li>
                  <li>• Messages analyzed using Azure Content Safety via Agent 4 API</li>
                  <li>• See approved/rejected with real AI confidence scores and category ratings</li>
                  <li>• Full transparency with hate, violence, sexual, and self-harm scores</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Information</CardTitle>
            <CardDescription>
              Enter campaign details and target customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Holiday Promo 2025"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer IDs (comma-separated)
                </label>
                <input
                  type="text"
                  value={customerIds}
                  onChange={(e) => setCustomerIds(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CUST-001, CUST-002"
                  disabled={isLoading}
                />
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
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder='["Message 1", "Message 2", "Message 3"]'
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={validateAndSend}
                disabled={isLoading}
                className="flex-1 px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Validate & Send
                  </>
                )}
              </button>
              <button
                onClick={resetForm}
                disabled={isLoading}
                className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCw className="h-5 w-5" />
                Reset
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-sm text-red-800 whitespace-pre-wrap">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {results && results.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{results.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Analysis Results</CardTitle>
                <CardDescription>
                  Real-time analysis powered by Azure Content Safety
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className={`p-4 rounded-lg border-2 ${
                      result.approved
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {result.approved ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <Badge
                          className={
                            result.approved
                              ? 'bg-green-600'
                              : 'bg-red-600'
                          }
                        >
                          {result.approved ? 'APPROVED' : 'REJECTED'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-600">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                      <p className="text-gray-900 bg-white p-3 rounded border border-gray-200">
                        {result.text}
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Analysis:</p>
                      <p className={`text-sm ${result.approved ? 'text-green-800' : 'text-red-800'}`}>
                        {result.reason}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Category Scores:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(result.categories).map(([category, score]) => (
                          <div key={category} className="bg-white p-2 rounded border border-gray-200">
                            <div className="text-xs text-gray-600">{category}</div>
                            <div className={`text-lg font-bold ${
                              score > 2 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {score.toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer Info */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-purple-900 mb-2">Powered by Azure Content Safety</h3>
              <p className="text-sm text-purple-800">
                Real-time compliance checking with transparency in AI decision-making.
                Category scores range from 0 (safe) to 7 (unsafe).
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
