'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Rocket, Loader2, CheckCircle2, XCircle, User, TrendingUp, Clock } from 'lucide-react';

interface CustomerResult {
  customerId: string;
  segment: string;
  messagePreview: string;
  approved: boolean;
  processingTime: number;
  timestamp: string;
}

export default function CampaignPage() {
  const [customerIds, setCustomerIds] = useState('CUST001, CUST002, CUST003');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunCampaign = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Parse customer IDs
      const ids = customerIds.split(',').map(id => id.trim()).filter(id => id);
      
      if (ids.length === 0) {
        throw new Error('Please enter at least one customer ID');
      }

      // Start campaign
      const response = await fetch('/api/campaigns/execute-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerCount: ids.length,
          customerIds: ids,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start campaign');
      }

      setExecutionId(data.executionId);

      // Simulate processing each customer
      for (let i = 0; i < ids.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay per customer
        
        const segments = ['High-Value', 'Engaged', 'At-Risk', 'New', 'VIP'];
        const messages = [
          'Exclusive offer just for you! Get 20% off your next purchase.',
          'We miss you! Come back and enjoy special rewards.',
          'New products tailored to your interests are now available.',
          'Your loyalty matters! Check out our premium benefits.',
          'Limited time offer: Upgrade your experience today!'
        ];
        
        const result: CustomerResult = {
          customerId: ids[i],
          segment: segments[i % segments.length],
          messagePreview: messages[i % messages.length],
          approved: Math.random() > 0.2, // 80% approval rate
          processingTime: Math.floor(Math.random() * 500) + 200,
          timestamp: new Date().toISOString(),
        };

        setResults(prev => [...prev, result]);
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Campaign execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  const approvedCount = results.filter(r => r.approved).length;
  const rejectedCount = results.filter(r => !r.approved).length;
  const avgProcessingTime = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.processingTime, 0) / results.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo_wo_bg.png" 
                alt="ChainReach AI Logo" 
                width={50} 
                height={50}
                className="object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Campaign Runner
                </h1>
                <p className="text-gray-700 mt-1 font-medium">Execute campaigns with custom customer data</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300">
                  ← Back to Home
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors">
                  View Dashboard →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Campaign Input Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-xl text-white shadow-lg">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Rocket className="h-6 w-6" />
                Configure Campaign
              </h2>
              <p className="text-white/90">Enter customer IDs (comma-separated) to run personalized campaigns</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium mb-2">Customer IDs</label>
              <input
                type="text"
                value={customerIds}
                onChange={(e) => setCustomerIds(e.target.value)}
                placeholder="CUST001, CUST002, CUST003..."
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={loading}
              />
              <p className="text-xs text-white/70 mt-2">Example: CUST001, CUST002, CUST003, CUST004, CUST005</p>
            </div>

            <button
              onClick={handleRunCampaign}
              disabled={loading}
              className="w-full px-6 py-3 bg-white text-purple-600 hover:bg-gray-50 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Campaign...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5" />
                  Start Campaign →
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 bg-red-100 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </section>

        {/* Campaign Results */}
        {results.length > 0 && (
          <section className="mb-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Customers</h3>
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{results.length}</p>
                <p className="text-xs text-gray-500 mt-1">Processed</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Approved</h3>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
                <p className="text-xs text-gray-500 mt-1">{rejectedCount} rejected</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {results.length > 0 ? Math.round((approvedCount / results.length) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Compliance rate</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Avg Time</h3>
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-600">{avgProcessingTime}ms</p>
                <p className="text-xs text-gray-500 mt-1">Per customer</p>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Campaign Results</h3>
                <p className="text-sm text-gray-600">Detailed breakdown of each customer</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Segment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message Preview
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Processing Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">{result.customerId}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {result.segment}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 max-w-md truncate">{result.messagePreview}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result.approved ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                              <CheckCircle2 className="h-4 w-4" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                              <XCircle className="h-4 w-4" />
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {result.processingTime}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Information Cards */}
        {results.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Customer Segmentation</h3>
              <p className="text-gray-600 text-sm">
                ML-powered segmentation divides customers into targeted groups based on behavior and preferences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Content Generation</h3>
              <p className="text-gray-600 text-sm">
                GPT-4 creates personalized marketing messages tailored to each customer segment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Compliance Checking</h3>
              <p className="text-gray-600 text-sm">
                Azure Content Safety ensures all messages meet regulatory standards and brand guidelines.
              </p>
            </div>
          </div>
        )}

        {/* Process Flow */}
        <div className="mt-12 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Execution Flow</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h4 className="font-semibold text-gray-900">Customer Segmentation</h4>
                <p className="text-gray-600 text-sm">Agent 1 analyzes customer data and creates targeted segments</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h4 className="font-semibold text-gray-900">Content Strategy</h4>
                <p className="text-gray-600 text-sm">Agent 2 retrieves relevant content templates and strategies from the database</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="font-semibold text-gray-900">Message Generation</h4>
                <p className="text-gray-600 text-sm">Agent 3 uses GPT-4 to create personalized marketing messages</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h4 className="font-semibold text-gray-900">Compliance Validation</h4>
                <p className="text-gray-600 text-sm">Agent 4 checks all content against safety and compliance standards</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">5</div>
              <div>
                <h4 className="font-semibold text-gray-900">Orchestration & Delivery</h4>
                <p className="text-gray-600 text-sm">Agent 5 coordinates the entire workflow and delivers approved messages</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-gray-700 font-medium">ChainReach AI - Built for Hackathon 2025</p>
          <p className="mt-1 text-gray-600 text-sm">Multi-Agent Marketing Orchestration Platform</p>
        </div>
      </footer>
    </div>
  );
}
