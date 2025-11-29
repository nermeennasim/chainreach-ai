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

  useEffect(() => {
    // Log agent status changes
    campaignState.agents.forEach((agent) => {
      if (agent.status === 'processing' && agent.progress > 0) {
        // Only log when actually processing
      } else if (agent.status === 'done') {
        addLog(`Agent ${agent.agent_id}`, `${agent.agent_name} completed`, 'success');
      } else if (agent.status === 'error') {
        addLog(`Agent ${agent.agent_id}`, `${agent.agent_name} failed`, 'error');
      }
    });
  }, [campaignState.agents.map(a => a.status).join(',')]);

  const handleStartCampaign = async () => {
    setLogs([]);
    addLog('System', '🚀 Starting 5-Agent Campaign Orchestration', 'info');
    
    try {
      await startCampaign(SAMPLE_CUSTOMERS);
      addLog('System', '✅ Campaign execution complete!', 'success');
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
                
                return (
                  <div key={agent.agent_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{agentEmojis[idx]}</span>
                        <div>
                          <p className="font-semibold text-navy-primary">
                            Agent {agent.agent_id}: {agent.agent_name}
                          </p>
                          <p className={`text-sm font-medium ${
                            agent.status === 'waiting' ? 'text-gray-500' :
                            agent.status === 'processing' ? 'text-blue-600' :
                            agent.status === 'done' ? 'text-green-600' :
                            'text-red-600'
                          }`}>
                            {agent.status === 'waiting' && 'Waiting...'}
                            {agent.status === 'processing' && 'Processing...'}
                            {agent.status === 'done' && '✓ Completed'}
                            {agent.status === 'error' && '✗ Error'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">
                          {agent.progress}%
                        </span>
                        {agent.status === 'processing' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                        {agent.status === 'done' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {agent.status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${agentColors[idx]}`}
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
