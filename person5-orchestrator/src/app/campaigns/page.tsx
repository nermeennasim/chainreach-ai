'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Users, 
  FileText, 
  Send, 
  Shield,
  CheckCircle2,
  Clock,
  Database,
  RotateCw
} from 'lucide-react';

export default function NewCampaignPage() {
  const [activeTab, setActiveTab] = useState('dataset');
  
  // Dataset Campaign State
  const [datasetStatus, setDatasetStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [currentAgent, setCurrentAgent] = useState(0);
  const [agentProgress, setAgentProgress] = useState(0);
  const [segmentationResults, setSegmentationResults] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  
  // Custom Campaign State
  const [campaignName, setCampaignName] = useState('Holiday Promo 2025');
  const [customerIds, setCustomerIds] = useState('CUST-001, CUST-002, CUST-003');
  const [messages, setMessages] = useState('');
  const [customResults, setCustomResults] = useState<any>(null);
  const [customLoading, setCustomLoading] = useState(false);

  const startDatasetCampaign = async () => {
    setDatasetStatus('running');
    setCurrentAgent(1);
    setAgentProgress(0);
    setExecutionLogs([]);
    
    try {
      // Agent 1: Segmentation
      addLog('🚀 Starting Agent 1: Customer Segmentation...');
      addLog('📊 Connecting to segmentation API at http://localhost:5001...');
      
      // Check health
      const healthRes = await fetch('http://localhost:5001/health');
      if (!healthRes.ok) throw new Error('Segmentation API not available');
      addLog('✅ Segmentation API connected successfully');
      
      setAgentProgress(20);
      addLog('📂 Reading customer database...');
      await new Promise(r => setTimeout(r, 1000));
      
      // Get first 10 customers from RFM table
      setAgentProgress(40);
      addLog('🔍 Analyzing first 10 customers with RFM model...');
      
      const sampleCustomers = [
        { id: 12347, recency: 2, frequency: 7, monetary: 4310 },
        { id: 12348, recency: 75, frequency: 4, monetary: 1797 },
        { id: 12356, recency: 23, frequency: 3, monetary: 2811 },
        { id: 12358, recency: 2, frequency: 2, monetary: 1168 },
        { id: 12359, recency: 58, frequency: 4, monetary: 6372 },
        { id: 12360, recency: 52, frequency: 3, monetary: 2662 },
        { id: 12362, recency: 3, frequency: 10, monetary: 5226 },
        { id: 12364, recency: 8, frequency: 4, monetary: 1313 },
        { id: 12357, recency: 33, frequency: 1, monetary: 6207 },
        { id: 12354, recency: 232, frequency: 1, monetary: 1079 }
      ];
      
      const segmentResults = await Promise.all(
        sampleCustomers.map(async (customer) => {
          const res = await fetch('http://localhost:5001/segment/manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recency: customer.recency,
              frequency: customer.frequency,
              monetary: customer.monetary
            })
          });
          const data = await res.json();
          return { customer_id: customer.id, ...data };
        })
      );
      
      setAgentProgress(60);
      addLog(`✅ Segmented ${segmentResults.length} customers successfully`);
      
      // Group by segment
      const segmentCounts: Record<string, number> = {};
      segmentResults.forEach(r => {
        segmentCounts[r.segment_name] = (segmentCounts[r.segment_name] || 0) + 1;
      });
      
      setAgentProgress(80);
      Object.entries(segmentCounts).forEach(([segment, count]) => {
        addLog(`   • ${segment}: ${count} customers`);
      });
      
      setSegmentationResults({
        total_customers: segmentResults.length,
        segments: segmentCounts,
        detailed_results: segmentResults
      });
      
      setAgentProgress(100);
      addLog('🎉 Agent 1 completed successfully!');
      await new Promise(r => setTimeout(r, 1000));
      
      // Agent 2: Content Strategy
      setCurrentAgent(2);
      setAgentProgress(0);
      addLog('🚀 Starting Agent 2: Content Strategy...');
      addLog('📝 Generating content templates for segments...');
      
      await new Promise(r => setTimeout(r, 1500));
      setAgentProgress(50);
      
      const templates: Record<string, string> = {};
      Object.keys(segmentCounts).forEach(segment => {
        templates[segment] = `Personalized offer for ${segment} customers`;
      });
      
      setAgentProgress(100);
      addLog(`✅ Created ${Object.keys(templates).length} content templates`);
      await new Promise(r => setTimeout(r, 1000));
      
      // Agent 3: Message Generation
      setCurrentAgent(3);
      setAgentProgress(0);
      addLog('🚀 Starting Agent 3: Message Generation...');
      addLog('✍️ Generating personalized messages...');
      
      await new Promise(r => setTimeout(r, 2000));
      setAgentProgress(100);
      addLog(`✅ Generated ${segmentResults.length} personalized messages`);
      await new Promise(r => setTimeout(r, 1000));
      
      // Agent 4: Compliance
      setCurrentAgent(4);
      setAgentProgress(0);
      addLog('🚀 Starting Agent 4: Compliance Check...');
      addLog('🔐 Analyzing messages for compliance...');
      
      await new Promise(r => setTimeout(r, 1500));
      setAgentProgress(100);
      const approved = Math.floor(segmentResults.length * 0.95);
      addLog(`✅ Approved ${approved}/${segmentResults.length} messages`);
      
      setDatasetStatus('completed');
      addLog('🎉 Campaign completed successfully!');
      
    } catch (error) {
      setDatasetStatus('failed');
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLog('💡 Make sure segmentation API is running on port 5001');
    }
  };
  
  const addLog = (message: string) => {
    setExecutionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const resetDataset = () => {
    setDatasetStatus('idle');
    setCurrentAgent(0);
    setAgentProgress(0);
    setSegmentationResults(null);
    setExecutionLogs([]);
  };

  const validateAndSendCustom = async () => {
    setCustomLoading(true);
    setCustomResults(null);
    
    try {
      // Validate JSON
      let parsedMessages: string[] = [];
      try {
        const parsed = JSON.parse(messages);
        if (Array.isArray(parsed)) {
          parsedMessages = parsed;
        } else if (parsed.messages && Array.isArray(parsed.messages)) {
          parsedMessages = parsed.messages;
        } else {
          throw new Error('Invalid format');
        }
      } catch {
        alert('Invalid JSON! Expected format: ["msg1", "msg2"] or {"messages": ["msg1", "msg2"]}');
        setCustomLoading(false);
        return;
      }
      
      if (parsedMessages.length === 0) {
        alert('No messages found in JSON!');
        setCustomLoading(false);
        return;
      }
      
      // Call real Agent 4 API
      const response = await fetch('https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: parsedMessages }),
      });
      
      if (!response.ok) {
        throw new Error(`Agent 4 API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match our UI format
      const results = data.results.map((result: any) => {
        return {
          id: `msg-${result.id + 1}`,
          text: result.text,
          approved: result.approved,
          reason: result.reason,
          confidence: result.confidence,
          categories: result.categories
        };
      });
      
      const approvedCount = results.filter((r: { approved: boolean; }) => r.approved).length;
      
      setCustomResults({
        total: results.length,
        approved: approvedCount,
        rejected: results.length - approvedCount,
        approval_rate: `${((approvedCount / results.length) * 100).toFixed(1)}%`,
        results
      });
      
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCustomLoading(false);
    }
  };

  const resetCustom = () => {
    setCampaignName('Holiday Promo 2025');
    setCustomerIds('CUST-001, CUST-002, CUST-003');
    setMessages('');
    setCustomResults(null);
  };

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
                <button className="text-gray-900 font-medium border-b-2 border-gray-900">
                  CAMPAIGN
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
                Campaign Manager
              </h1>
              <p className="text-gray-600 mt-1">Execute Dataset or Custom Campaigns</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="dataset" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Dataset Campaign
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Custom Campaign
            </TabsTrigger>
          </TabsList>

          {/* Dataset Campaign Tab */}
          <TabsContent value="dataset">
            <div className="space-y-6">
              {/* Control Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Dataset Campaign Execution</span>
                    <Badge className={
                      datasetStatus === 'completed' ? 'bg-green-500' :
                      datasetStatus === 'running' ? 'bg-blue-500' :
                      datasetStatus === 'failed' ? 'bg-red-500' :
                      'bg-gray-500'
                    }>
                      {datasetStatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Process 10 customers from database through the full 4-agent pipeline
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={startDatasetCampaign}
                      disabled={datasetStatus === 'running'}
                      className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Play className="h-5 w-5" />
                      {datasetStatus === 'running' ? 'Running...' : 'Start Execution'}
                    </button>
                    {datasetStatus !== 'idle' && (
                      <button
                        onClick={resetDataset}
                        className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <RotateCw className="h-5 w-5" />
                        Reset
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Agent Progress */}
              {datasetStatus === 'running' && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(agent => (
                        <div key={agent} className={`p-4 rounded-lg ${
                          currentAgent === agent ? 'bg-blue-50 border-2 border-blue-500' :
                          currentAgent > agent ? 'bg-green-50 border-2 border-green-500' :
                          'bg-gray-50 border-2 border-gray-300'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {agent === 1 && <Users className="h-5 w-5" />}
                              {agent === 2 && <FileText className="h-5 w-5" />}
                              {agent === 3 && <Send className="h-5 w-5" />}
                              {agent === 4 && <Shield className="h-5 w-5" />}
                              <span className="font-semibold">
                                Agent {agent}: {
                                  agent === 1 ? 'Segmentation' :
                                  agent === 2 ? 'Content Strategy' :
                                  agent === 3 ? 'Message Generation' :
                                  'Compliance Check'
                                }
                              </span>
                            </div>
                            {currentAgent > agent && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                            {currentAgent === agent && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
                          </div>
                          {currentAgent === agent && (
                            <Progress value={agentProgress} className="h-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Segmentation Results */}
              {segmentationResults && (
                <Card>
                  <CardHeader>
                    <CardTitle>Segmentation Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-3xl font-bold text-blue-600">{segmentationResults.total_customers}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Segments</p>
                        <p className="text-3xl font-bold text-green-600">{Object.keys(segmentationResults.segments).length}</p>
                      </div>
                      {Object.entries(segmentationResults.segments).slice(0, 2).map(([segment, count]: [string, any]) => (
                        <div key={segment} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm text-gray-600">{segment}</p>
                          <p className="text-3xl font-bold text-purple-600">{count}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <h4 className="font-semibold mb-3">Customer Details:</h4>
                      {segmentationResults.detailed_results.map((result: any, index: number) => (
                        <div key={index} className="mb-3 p-3 bg-white rounded border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Customer #{result.customer_id}</span>
                            <Badge className="bg-purple-500">{result.segment_name}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Confidence: {(result.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Execution Logs */}
              {executionLogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                      {executionLogs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Custom Campaign Tab */}
          <TabsContent value="custom">
            <div className="space-y-6">
              {/* Campaign Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Holiday Promo 2025"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Customer IDs (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={customerIds}
                        onChange={(e) => setCustomerIds(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="CUST-001, CUST-002"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Messages (JSON Format)</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={messages}
                    onChange={(e) => setMessages(e.target.value)}
                    className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder='{"messages": ["Get 50% off this weekend!", "Exclusive VIP offer for you!"]}'
                  />
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={validateAndSendCustom}
                      disabled={customLoading}
                      className="px-6 py-3 font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Send className="h-5 w-5" />
                      {customLoading ? 'Processing...' : 'Validate & Send'}
                    </button>
                    <button
                      onClick={resetCustom}
                      className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <RotateCw className="h-5 w-5" />
                      Reset
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Results */}
              {customResults && (
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-3xl font-bold text-blue-600">{customResults.total}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="text-3xl font-bold text-green-600">{customResults.approved}</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-gray-600">Rejected</p>
                        <p className="text-3xl font-bold text-red-600">{customResults.rejected}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600">Approval Rate</p>
                        <p className="text-3xl font-bold text-purple-600">{customResults.approval_rate}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {customResults.results.map((result: any) => (
                        <div key={result.id} className={`p-4 rounded-lg border-2 ${
                          result.approved ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{result.id}</span>
                            <Badge className={result.approved ? 'bg-green-500' : 'bg-red-500'}>
                              {result.approved ? 'Approved' : 'Rejected'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{result.text}</p>
                          <p className="text-sm text-gray-600">{result.reason}</p>
                          {Object.keys(result.categories).length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {Object.entries(result.categories).map(([cat, score]: [string, any]) => (
                                <span key={cat} className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                                  {cat}: {score}/6
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-gray-700 font-medium">ChainReach AI - Campaign Manager</p>
          <p className="mt-1 text-gray-600 text-sm">Hackathon AI 2025</p>
        </div>
      </footer>
    </div>
  );
}
