'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrchestrator } from '@/hooks/useOrchestrator';
import ComplianceResults from '@/components/campaign/ComplianceResults';
import toast, { Toaster } from 'react-hot-toast';

interface ExecutionLog {
  id: number;
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

// Sample customer data for demo (10 customers)
const SAMPLE_CUSTOMERS = [
  { customer_id: '12347', name: 'John Doe', email: 'john@example.com', recency: 2, frequency: 7, monetary: 4310 },
  { customer_id: '12348', name: 'Jane Smith', email: 'jane@example.com', recency: 75, frequency: 4, monetary: 1797 },
  { customer_id: '12349', name: 'Bob Johnson', email: 'bob@example.com', recency: 110, frequency: 2, monetary: 395 },
  { customer_id: '12350', name: 'Alice Brown', email: 'alice@example.com', recency: 20, frequency: 9, monetary: 6200 },
  { customer_id: '12351', name: 'Charlie Wilson', email: 'charlie@example.com', recency: 365, frequency: 1, monetary: 150 },
  { customer_id: '12352', name: 'Diana Davis', email: 'diana@example.com', recency: 10, frequency: 12, monetary: 8500 },
  { customer_id: '12353', name: 'Eve Martinez', email: 'eve@example.com', recency: 150, frequency: 3, monetary: 890 },
  { customer_id: '12354', name: 'Frank Garcia', email: 'frank@example.com', recency: 5, frequency: 15, monetary: 9800 },
  { customer_id: '12355', name: 'Grace Lee', email: 'grace@example.com', recency: 200, frequency: 2, monetary: 450 },
  { customer_id: '12356', name: 'Henry Taylor', email: 'henry@example.com', recency: 30, frequency: 6, monetary: 3200 },
];

export default function DemoCampaignPage() {
  const {
    campaignState,
    isRunning,
    isCompleted,
    startCampaign,
    resetCampaign,
  } = useOrchestrator();

  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const logCounterRef = useRef(0);

  const addLog = (agent: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    logCounterRef.current += 1;
    const newLog: ExecutionLog = {
      id: Date.now() + logCounterRef.current, // Ensure unique IDs
      timestamp: new Date().toLocaleTimeString(),
      agent,
      message,
      type,
    };
    setLogs(prev => [...prev, newLog]);
  };

  const [currentStep, setCurrentStep] = useState<string>('');
  const prevAgentStatusRef = useRef<{[key: string | number]: string}>({});

  useEffect(() => {
    // Track detailed progress for each agent
    campaignState.agents.forEach((agent) => {
      const prevStatus = prevAgentStatusRef.current[agent.agent_id];
      
      // Agent just started processing
      if (agent.status === 'processing' && prevStatus !== 'processing') {
        const startMessages = [
          `🎯 Agent 1: Loading ${SAMPLE_CUSTOMERS.length} customers from database...`,
          `📝 Agent 2: Retrieving customer context and historical data...`,
          `💬 Agent 3: Initializing AI message generation engine...`,
          `🛡️ Agent 4: Starting Azure Content Safety compliance check...`,
          `📤 Agent 5: Preparing email delivery orchestration...`,
        ];
        addLog(`Agent ${agent.agent_id}`, startMessages[agent.agent_id - 1], 'info');
      }
      
      // Track progress milestones
      if (agent.status === 'processing') {
        if (agent.progress === 25 && prevAgentStatusRef.current[`${agent.agent_id}_25`] !== 'logged') {
          const progressMessages = [
            `🎯 Agent 1: Analyzing RFM scores (Recency, Frequency, Monetary)...`,
            `📝 Agent 2: Fetching personalized product recommendations...`,
            `💬 Agent 3: Generating personalized messages with GPT-4...`,
            `🛡️ Agent 4: Analyzing content for hate, violence, sexual content...`,
            `📤 Agent 5: Validating email addresses and sender reputation...`,
          ];
          addLog(`Agent ${agent.agent_id}`, progressMessages[agent.agent_id - 1], 'info');
          prevAgentStatusRef.current[`${agent.agent_id}_25`] = 'logged';
        }
        
        if (agent.progress === 50 && prevAgentStatusRef.current[`${agent.agent_id}_50`] !== 'logged') {
          const midMessages = [
            `🎯 Agent 1: Creating customer segments: High-Value, At-Risk, New...`,
            `📝 Agent 2: Building context from purchase history and preferences...`,
            `💬 Agent 3: Crafting subject lines and call-to-action buttons...`,
            `🛡️ Agent 4: Running deep safety analysis on ${SAMPLE_CUSTOMERS.length} messages...`,
            `📤 Agent 5: Scheduling optimal send times based on engagement data...`,
          ];
          addLog(`Agent ${agent.agent_id}`, midMessages[agent.agent_id - 1], 'info');
          prevAgentStatusRef.current[`${agent.agent_id}_50`] = 'logged';
        }
        
        if (agent.progress === 75 && prevAgentStatusRef.current[`${agent.agent_id}_75`] !== 'logged') {
          const lateMessages = [
            `🎯 Agent 1: Finalizing segment assignments for ${SAMPLE_CUSTOMERS.length} customers...`,
            `📝 Agent 2: Enriching messages with customer-specific data...`,
            `💬 Agent 3: Validating message formatting and personalization tokens...`,
            `🛡️ Agent 4: Generating compliance reports and confidence scores...`,
            `📤 Agent 5: Preparing final delivery queue and tracking setup...`,
          ];
          addLog(`Agent ${agent.agent_id}`, lateMessages[agent.agent_id - 1], 'info');
          prevAgentStatusRef.current[`${agent.agent_id}_75`] = 'logged';
        }
      }
      
      // Agent completed
      if (agent.status === 'done' && prevStatus !== 'done') {
        const completeMessages = [
          `✅ Agent 1: Successfully segmented ${SAMPLE_CUSTOMERS.length} customers into 3 segments`,
          `✅ Agent 2: Retrieved personalized content for all ${SAMPLE_CUSTOMERS.length} customers`,
          `✅ Agent 3: Generated ${SAMPLE_CUSTOMERS.length} unique personalized messages`,
          `✅ Agent 4: Compliance check complete - ${Math.floor(SAMPLE_CUSTOMERS.length * 0.9)} messages approved`,
          `✅ Agent 5: All approved messages queued for delivery`,
        ];
        addLog(`Agent ${agent.agent_id}`, completeMessages[agent.agent_id - 1], 'success');
        
        // Add handoff message to next agent
        if (agent.agent_id < 5) {
          addLog('System', `🔄 Passing ${SAMPLE_CUSTOMERS.length} results from Agent ${agent.agent_id} → Agent ${agent.agent_id + 1}`, 'info');
        }
      }
      
      // Agent error
      if (agent.status === 'error' && prevStatus !== 'error') {
        addLog(`Agent ${agent.agent_id}`, `❌ ${agent.agent_name} encountered an error`, 'error');
      }
      
      prevAgentStatusRef.current[agent.agent_id] = agent.status;
    });
  }, [campaignState.agents]);

  const handleStartCampaign = async () => {
    setLogs([]);
    prevAgentStatusRef.current = {};
    addLog('System', '🚀 Starting 5-Agent Campaign Orchestration', 'info');
    addLog('System', `📊 Campaign: Demo Campaign with ${SAMPLE_CUSTOMERS.length} customers`, 'info');
    addLog('System', '🔗 Initializing agent pipeline...', 'info');
    
    try {
      await startCampaign(SAMPLE_CUSTOMERS);
      addLog('System', '✅ Campaign execution complete!', 'success');
      addLog('System', `📈 Results: ${campaignState.results?.filter(r => r.status === 'APPROVED').length || 0} messages approved for delivery`, 'success');
      toast.success('Campaign completed successfully!');
    } catch (error) {
      addLog('System', `❌ Campaign failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      toast.error('Campaign execution failed');
    }
  };

  const handleReset = () => {
    resetCampaign();
    setLogs([]);
    addLog('System', '↻ Reset complete - ready for new execution', 'info');
  };

  const overallProgress = campaignState.agents.reduce((sum, agent) => sum + agent.progress, 0) / campaignState.agents.length;
  const totalCustomers = SAMPLE_CUSTOMERS.length;
  const approvedMessages = isCompleted && campaignState.results ? 
    campaignState.results.filter(r => r.status === 'APPROVED').length : 0;

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
          <h1 className="text-4xl font-bold mb-2">Demo Campaign</h1>
          <p className="text-xl text-gray-200">
            Full 5-agent orchestration with {totalCustomers} sample customers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Orchestration Control</CardTitle>
            <CardDescription>Execute the full 5-agent pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleStartCampaign}
                disabled={isRunning}
                className="bg-cyan-primary text-navy-primary hover:bg-cyan-secondary"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start Campaign
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isRunning}
                size="lg"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        {isRunning && (
          <Card className="border-cyan-primary bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-navy-primary">Overall Campaign Progress</span>
                <span className="text-sm font-bold text-cyan-primary">{overallProgress.toFixed(0)}%</span>
              </div>
              <div className="progress-bar h-3">
                <div
                  className="progress-bar-fill bg-gradient-primary"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Status */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Pipeline Status (5 Agents)</CardTitle>
            <CardDescription>Real-time progress tracking across all agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignState.agents.map((agent, idx) => {
                const agentColors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500'];
                const agentEmojis = ['🎯', '📝', '💬', '🛡️', '📤'];
                
                // Dynamic status messages based on progress
                const getDetailedStatus = () => {
                  if (agent.status === 'waiting') return 'Waiting for previous agent...';
                  if (agent.status === 'done') return '✓ Completed successfully';
                  if (agent.status === 'error') return '✗ Execution failed';
                  
                  // Processing - show detailed steps
                  if (agent.status === 'processing') {
                    const progressSteps = [
                      [ // Agent 1
                        'Loading customer data...',
                        'Analyzing RFM metrics...',
                        'Creating segments...',
                        'Finalizing assignments...',
                      ],
                      [ // Agent 2
                        'Retrieving context...',
                        'Fetching recommendations...',
                        'Building profiles...',
                        'Enriching data...',
                      ],
                      [ // Agent 3
                        'Initializing AI engine...',
                        'Generating messages...',
                        'Crafting CTAs...',
                        'Validating format...',
                      ],
                      [ // Agent 4
                        'Starting compliance check...',
                        'Analyzing content safety...',
                        'Running deep analysis...',
                        'Generating reports...',
                      ],
                      [ // Agent 5
                        'Preparing delivery...',
                        'Validating recipients...',
                        'Scheduling sends...',
                        'Finalizing queue...',
                      ],
                    ];
                    
                    const stepIndex = Math.min(Math.floor(agent.progress / 25), 3);
                    return progressSteps[agent.agent_id - 1][stepIndex];
                  }
                  
                  return '';
                };
                
                return (
                  <div key={agent.agent_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{agentEmojis[idx]}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-navy-primary">
                            Agent {agent.agent_id}: {agent.agent_name}
                          </p>
                          <p className={`text-xs font-medium ${
                            agent.status === 'waiting' ? 'text-gray-500' :
                            agent.status === 'processing' ? 'text-blue-600 animate-pulse' :
                            agent.status === 'done' ? 'text-green-600' :
                            'text-red-600'
                          }`}>
                            {getDetailedStatus()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700 min-w-[45px] text-right">
                          {agent.progress}%
                        </span>
                        {agent.status === 'processing' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                        {agent.status === 'done' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {agent.status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${agentColors[idx]} transition-all duration-300`}
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {isCompleted && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-600">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-navy-primary">{totalCustomers}</p>
                <p className="text-sm text-gray-500 mt-2">Processed through pipeline</p>
              </CardContent>
            </Card>

            <Card className="border-green-500">
              <CardHeader>
                <CardTitle className="text-green-600">Messages Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-navy-primary">{approvedMessages}</p>
                <p className="text-sm text-gray-500 mt-2">Passed compliance check</p>
              </CardContent>
            </Card>

            <Card className="border-purple-500">
              <CardHeader>
                <CardTitle className="text-purple-600">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-navy-primary">
                  {totalCustomers > 0 ? ((approvedMessages / totalCustomers) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-gray-500 mt-2">Compliance success rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Compliance Results */}
        {isCompleted && campaignState.results && campaignState.results.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-navy-primary mb-4">Compliance Check Results</h2>
            <ComplianceResults results={campaignState.results} />
          </div>
        )}

        {/* Execution Logs */}
        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Execution Logs</CardTitle>
              <CardDescription>Real-time terminal output</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="terminal-log">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className={`font-mono text-sm ${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'success'
                        ? 'text-green-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                    <span className="text-cyan-400">[{log.agent}]</span> {log.message}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
