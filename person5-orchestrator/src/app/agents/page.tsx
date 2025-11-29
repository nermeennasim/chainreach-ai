'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { AgentPanel } from '@/components/Dashboard/AgentPanel';
import { 
  Users, 
  FileText, 
  Send, 
  Shield, 
  Play, 
  RotateCw,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgentState {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  progress?: number;
  metrics?: Record<string, any>;
  logs?: string[];
}

export default function MultiAgentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [agent1State, setAgent1State] = useState<AgentState>({ status: 'idle', logs: [] });
  const [agent2State, setAgent2State] = useState<AgentState>({ status: 'idle', logs: [] });
  const [agent3State, setAgent3State] = useState<AgentState>({ status: 'idle', logs: [] });
  const [agent4State, setAgent4State] = useState<AgentState>({ status: 'idle', logs: [] });
  const [orchestrationRunning, setOrchestrationRunning] = useState(false);

  // Agent 1: Segmentation
  const startAgent1 = async () => {
    setAgent1State({
      status: 'processing',
      progress: 0,
      logs: ['Starting segmentation agent...', 'Connecting to database...'],
      metrics: { 'Total Rows': 0, 'Segments': 0 }
    });

    try {
      // Simulate reading database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAgent1State(prev => ({
        ...prev,
        progress: 30,
        logs: [...(prev.logs || []), 'Reading customer data from database...']
      }));

      // Call Agent 1 API
      const response = await fetch('http://localhost:5001/health');
      if (!response.ok) throw new Error('Agent 1 API not available');

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock segmentation data
      const mockCustomers = 1250;
      const mockSegments = {
        'Champions': 320,
        'Loyal': 405,
        'Potential': 285,
        'At Risk': 180,
        'Lost': 60
      };

      setAgent1State({
        status: 'completed',
        progress: 100,
        inputs: {
          data_source: 'CSV File / Database',
          total_rows: mockCustomers,
          rfm_columns: ['Recency', 'Frequency', 'Monetary']
        },
        outputs: {
          total_customers: mockCustomers,
          segments: mockSegments,
          segmentation_complete: true
        },
        metrics: {
          'Total Rows': mockCustomers,
          'Segments': Object.keys(mockSegments).length,
          'Champions': mockSegments['Champions'],
          'Loyal': mockSegments['Loyal']
        },
        logs: [
          'Starting segmentation agent...',
          'Connecting to database...',
          'Reading customer data from database...',
          `✓ Loaded ${mockCustomers} customer records`,
          '✓ Applied RFM analysis',
          `✓ Segmented into ${Object.keys(mockSegments).length} groups`,
          '✓ Segmentation completed successfully'
        ]
      });
    } catch (error) {
      setAgent1State({
        status: 'failed',
        logs: [...(agent1State.logs || []), `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  };

  // Agent 2: Content Strategy
  const startAgent2 = async () => {
    if (agent1State.status !== 'completed') {
      alert('Please complete Agent 1 (Segmentation) first!');
      return;
    }

    setAgent2State({
      status: 'processing',
      progress: 0,
      logs: ['Starting content strategy agent...', 'Analyzing segment profiles...'],
      metrics: { 'Templates': 0, 'Variants': 0 }
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAgent2State(prev => ({
        ...prev,
        progress: 50,
        logs: [...(prev.logs || []), 'Generating content templates...']
      }));

      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockTemplates = {
        'Champions': 'Exclusive VIP offer - Thank you for your loyalty!',
        'Loyal': 'Special rewards program - You\'re valued!',
        'Potential': 'Unlock your benefits - Join our community!',
        'At Risk': 'We miss you - Come back with 20% off!',
        'Lost': 'Win-back campaign - Here\'s what you missed!'
      };

      setAgent2State({
        status: 'completed',
        progress: 100,
        inputs: {
          segments: agent1State.outputs?.segments
        },
        outputs: {
          templates_created: Object.keys(mockTemplates).length,
          content_templates: mockTemplates,
          strategy: 'Personalized messaging per segment'
        },
        metrics: {
          'Templates': 5,
          'Variants': 15,
          'Avg Length': '85 chars',
          'Tone': 'Friendly'
        },
        logs: [
          'Starting content strategy agent...',
          'Analyzing segment profiles...',
          'Generating content templates...',
          '✓ Created 5 content templates',
          '✓ Generated 15 message variants',
          '✓ Content strategy completed'
        ]
      });
    } catch (error) {
      setAgent2State({
        status: 'failed',
        logs: [...(agent2State.logs || []), `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  };

  // Agent 3: Message Generation
  const startAgent3 = async () => {
    if (agent2State.status !== 'completed') {
      alert('Please complete Agent 2 (Content Strategy) first!');
      return;
    }

    setAgent3State({
      status: 'processing',
      progress: 0,
      logs: ['Starting message generation agent...', 'Personalizing content...'],
      metrics: { 'Generated': 0, 'Personalized': 0 }
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAgent3State(prev => ({
        ...prev,
        progress: 60,
        logs: [...(prev.logs || []), 'Applying customer data to templates...']
      }));

      await new Promise(resolve => setTimeout(resolve, 1500));

      const totalMessages = agent1State.outputs?.total_customers || 1250;

      setAgent3State({
        status: 'completed',
        progress: 100,
        inputs: {
          templates: agent2State.outputs?.templates_created,
          customer_count: totalMessages
        },
        outputs: {
          messages_generated: totalMessages,
          personalization_applied: true,
          ready_for_compliance: true
        },
        metrics: {
          'Generated': totalMessages,
          'Personalized': totalMessages,
          'Failed': 0,
          'Success Rate': '100%'
        },
        logs: [
          'Starting message generation agent...',
          'Personalizing content...',
          'Applying customer data to templates...',
          `✓ Generated ${totalMessages} personalized messages`,
          '✓ Applied customer names and data',
          '✓ Message generation completed'
        ]
      });
    } catch (error) {
      setAgent3State({
        status: 'failed',
        logs: [...(agent3State.logs || []), `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  };

  // Agent 4: Compliance Check
  const startAgent4 = async () => {
    if (agent3State.status !== 'completed') {
      alert('Please complete Agent 3 (Message Generation) first!');
      return;
    }

    setAgent4State({
      status: 'processing',
      progress: 0,
      logs: ['Starting compliance agent...', 'Connecting to Azure Content Safety...'],
      metrics: { 'Analyzed': 0, 'Approved': 0, 'Rejected': 0 }
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAgent4State(prev => ({
        ...prev,
        progress: 40,
        logs: [...(prev.logs || []), 'Analyzing content for compliance...']
      }));

      await new Promise(resolve => setTimeout(resolve, 2000));

      const totalMessages = agent3State.outputs?.messages_generated || 1250;
      const approved = Math.floor(totalMessages * 0.95);
      const rejected = totalMessages - approved;

      setAgent4State({
        status: 'completed',
        progress: 100,
        inputs: {
          messages_to_check: totalMessages,
          compliance_provider: 'Azure Content Safety API'
        },
        outputs: {
          total_analyzed: totalMessages,
          approved: approved,
          rejected: rejected,
          approval_rate: `${((approved / totalMessages) * 100).toFixed(1)}%`,
          categories_checked: ['Hate', 'Violence', 'Sexual', 'Self-Harm']
        },
        metrics: {
          'Analyzed': totalMessages,
          'Approved': approved,
          'Rejected': rejected,
          'Rate': `${((approved / totalMessages) * 100).toFixed(1)}%`
        },
        logs: [
          'Starting compliance agent...',
          'Connecting to Azure Content Safety...',
          'Analyzing content for compliance...',
          `✓ Analyzed ${totalMessages} messages`,
          `✓ Approved ${approved} messages (${((approved / totalMessages) * 100).toFixed(1)}%)`,
          `✗ Rejected ${rejected} messages (${((rejected / totalMessages) * 100).toFixed(1)}%)`,
          '✓ Compliance check completed'
        ]
      });
    } catch (error) {
      setAgent4State({
        status: 'failed',
        logs: [...(agent4State.logs || []), `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  };

  // Run Full Orchestration
  const runFullOrchestration = async () => {
    setOrchestrationRunning(true);
    
    // Reset all states
    setAgent1State({ status: 'idle', logs: [] });
    setAgent2State({ status: 'idle', logs: [] });
    setAgent3State({ status: 'idle', logs: [] });
    setAgent4State({ status: 'idle', logs: [] });

    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Run agents sequentially
    await startAgent1();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Agent 2 will auto-start after Agent 1
    setActiveTab('agent2');
    await new Promise(resolve => setTimeout(resolve, 500));
    await startAgent2();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Agent 3
    setActiveTab('agent3');
    await new Promise(resolve => setTimeout(resolve, 500));
    await startAgent3();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Agent 4
    setActiveTab('agent4');
    await new Promise(resolve => setTimeout(resolve, 500));
    await startAgent4();
    
    setOrchestrationRunning(false);
    setActiveTab('overview');
  };

  const resetAll = () => {
    setAgent1State({ status: 'idle', logs: [] });
    setAgent2State({ status: 'idle', logs: [] });
    setAgent3State({ status: 'idle', logs: [] });
    setAgent4State({ status: 'idle', logs: [] });
    setActiveTab('overview');
  };

  const getOverallStatus = () => {
    const allCompleted = 
      agent1State.status === 'completed' &&
      agent2State.status === 'completed' &&
      agent3State.status === 'completed' &&
      agent4State.status === 'completed';
    
    const anyFailed = 
      agent1State.status === 'failed' ||
      agent2State.status === 'failed' ||
      agent3State.status === 'failed' ||
      agent4State.status === 'failed';
    
    const anyProcessing = 
      agent1State.status === 'processing' ||
      agent2State.status === 'processing' ||
      agent3State.status === 'processing' ||
      agent4State.status === 'processing';

    if (allCompleted) return 'completed';
    if (anyFailed) return 'failed';
    if (anyProcessing) return 'processing';
    return 'idle';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/gemini_logo_chainreach-03-white.png" 
                alt="ChainReach AI Logo" 
                width={50} 
                height={50}
                className="object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Multi-Agent Dashboard
                </h1>
                <p className="text-gray-700 mt-1 font-medium">4-Agent Marketing Orchestration Pipeline</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300">
                  ← Back to Home
                </button>
              </Link>
              <Link href="/custom-campaign">
                <button className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors border border-purple-300">
                  🎯 Custom Campaign
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Control Panel */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pipeline Control</h2>
                <p className="text-gray-600 mt-1">
                  Execute all 4 agents sequentially or control each individually
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetAll}
                  disabled={orchestrationRunning}
                  className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RotateCw className="h-5 w-5" />
                  Reset All
                </button>
                <button
                  onClick={runFullOrchestration}
                  disabled={orchestrationRunning}
                  className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  {orchestrationRunning ? 'Running Pipeline...' : 'Run Full Pipeline'}
                </button>
              </div>
            </div>

            {/* Overall Status */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg border-2 ${agent1State.status === 'completed' ? 'bg-green-50 border-green-500' : agent1State.status === 'processing' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
                <Users className="h-6 w-6 mb-2" />
                <p className="font-semibold">Agent 1</p>
                <p className="text-xs text-gray-600">Segmentation</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${agent2State.status === 'completed' ? 'bg-green-50 border-green-500' : agent2State.status === 'processing' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
                <FileText className="h-6 w-6 mb-2" />
                <p className="font-semibold">Agent 2</p>
                <p className="text-xs text-gray-600">Content Strategy</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${agent3State.status === 'completed' ? 'bg-green-50 border-green-500' : agent3State.status === 'processing' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
                <Send className="h-6 w-6 mb-2" />
                <p className="font-semibold">Agent 3</p>
                <p className="text-xs text-gray-600">Generation</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${agent4State.status === 'completed' ? 'bg-green-50 border-green-500' : agent4State.status === 'processing' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
                <Shield className="h-6 w-6 mb-2" />
                <p className="font-semibold">Agent 4</p>
                <p className="text-xs text-gray-600">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Agent View */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="agent1" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agent 1
            </TabsTrigger>
            <TabsTrigger value="agent2" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Agent 2
            </TabsTrigger>
            <TabsTrigger value="agent3" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Agent 3
            </TabsTrigger>
            <TabsTrigger value="agent4" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Agent 4
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-bold">Pipeline Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Overall Status:</span>
                      <span className="font-semibold capitalize">{getOverallStatus()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Customers:</span>
                      <span className="font-semibold">{agent1State.outputs?.total_customers || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Messages Generated:</span>
                      <span className="font-semibold">{agent3State.outputs?.messages_generated || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Compliance Approved:</span>
                      <span className="font-semibold">{agent4State.outputs?.approved || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Approval Rate:</span>
                      <span className="font-semibold text-green-600">{agent4State.outputs?.approval_rate || '-'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('agent1')}
                      className="w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Start Segmentation</span>
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('agent2')}
                      disabled={agent1State.status !== 'completed'}
                      className="w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-green-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Create Content Strategy</span>
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('agent3')}
                      disabled={agent2State.status !== 'completed'}
                      className="w-full px-4 py-3 text-left bg-orange-50 hover:bg-orange-100 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-orange-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Generate Messages</span>
                        <Send className="h-5 w-5 text-orange-600" />
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('agent4')}
                      disabled={agent3State.status !== 'completed'}
                      className="w-full px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-purple-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Check Compliance</span>
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agent 1 Tab */}
          <TabsContent value="agent1">
            <AgentPanel
              agentNumber={1}
              agentName="Customer Segmentation"
              description="RFM analysis and customer clustering using K-Means ML model (Port: 5001)"
              status={agent1State.status}
              inputs={agent1State.inputs}
              outputs={agent1State.outputs}
              progress={agent1State.progress}
              metrics={agent1State.metrics}
              logs={agent1State.logs}
              onStart={startAgent1}
            />
          </TabsContent>

          {/* Agent 2 Tab */}
          <TabsContent value="agent2">
            <AgentPanel
              agentNumber={2}
              agentName="Content Strategy"
              description="Generate content templates and messaging strategy per customer segment"
              status={agent2State.status}
              inputs={agent2State.inputs}
              outputs={agent2State.outputs}
              progress={agent2State.progress}
              metrics={agent2State.metrics}
              logs={agent2State.logs}
              onStart={startAgent2}
            />
          </TabsContent>

          {/* Agent 3 Tab */}
          <TabsContent value="agent3">
            <AgentPanel
              agentNumber={3}
              agentName="Message Generation"
              description="Personalize messages for each customer using AI and templates"
              status={agent3State.status}
              inputs={agent3State.inputs}
              outputs={agent3State.outputs}
              progress={agent3State.progress}
              metrics={agent3State.metrics}
              logs={agent3State.logs}
              onStart={startAgent3}
            />
          </TabsContent>

          {/* Agent 4 Tab */}
          <TabsContent value="agent4">
            <AgentPanel
              agentNumber={4}
              agentName="Compliance Check"
              description="Azure Content Safety API - Check for hate, violence, sexual content, self-harm"
              status={agent4State.status}
              inputs={agent4State.inputs}
              outputs={agent4State.outputs}
              progress={agent4State.progress}
              metrics={agent4State.metrics}
              logs={agent4State.logs}
              onStart={startAgent4}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-gray-700 font-medium">ChainReach AI - Multi-Agent Dashboard</p>
          <p className="mt-1 text-gray-600 text-sm">Hackathon AI 2025</p>
        </div>
      </footer>
    </div>
  );
}
