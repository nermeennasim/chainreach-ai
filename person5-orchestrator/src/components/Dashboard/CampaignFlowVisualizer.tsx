'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  Target, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Send,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface PipelineStatus {
  campaignId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentStage: 'segmentation' | 'content' | 'generation' | 'compliance' | 'sending' | 'completed';
  progress: number;
  
  stats: {
    totalCustomers: number;
    processed: number;
    
    agent1: {
      status: 'pending' | 'active' | 'completed' | 'error';
      processed: number;
      avgDuration: number;
    };
    agent2: {
      status: 'pending' | 'active' | 'completed' | 'error';
      processed: number;
      avgDuration: number;
    };
    agent3: {
      status: 'pending' | 'active' | 'completed' | 'error';
      processed: number;
      variantsGenerated: number;
      avgDuration: number;
    };
    agent4: {
      status: 'pending' | 'active' | 'completed' | 'error';
      processed: number;
      approved: number;
      rejected: number;
      avgDuration: number;
    };
    
    output: {
      sent: number;
      failed: number;
    };
  };
  
  startTime: Date;
  estimatedCompletion: Date;
  errors: Array<{
    agent: number;
    message: string;
    timestamp: Date;
  }>;
}

const stages = [
  {
    key: 'input',
    icon: Users,
    title: 'Input',
    subtitle: 'Customers',
    color: 'blue',
  },
  {
    key: 'agent1',
    icon: Target,
    title: 'Agent 1',
    subtitle: 'Segmentation',
    color: 'purple',
  },
  {
    key: 'agent2',
    icon: FileText,
    title: 'Agent 2',
    subtitle: 'Content',
    color: 'green',
  },
  {
    key: 'agent3',
    icon: Sparkles,
    title: 'Agent 3',
    subtitle: 'GPT-4 Generate',
    color: 'orange',
  },
  {
    key: 'agent4',
    icon: ShieldCheck,
    title: 'Agent 4',
    subtitle: 'Compliance',
    color: 'red',
  },
  {
    key: 'output',
    icon: Send,
    title: 'Output',
    subtitle: 'Messages Sent',
    color: 'emerald',
  },
];

const statusIcons = {
  pending: { icon: null, className: 'opacity-40' },
  active: { icon: Loader2, className: 'animate-spin text-primary' },
  completed: { icon: CheckCircle2, className: 'text-green-500' },
  error: { icon: XCircle, className: 'text-red-500' },
};

export function CampaignFlowVisualizer() {
  const [data, setData] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/pipeline/status');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch pipeline status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Auto-refresh every 1 second when running
    const interval = setInterval(() => {
      fetchStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading pipeline status...</span>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center text-gray-500">
        Failed to load pipeline status
      </Card>
    );
  }

  const isIdle = data.status === 'idle';
  const isRunning = data.status === 'running';
  const isCompleted = data.status === 'completed';

  const getStageStatus = (stageKey: string) => {
    if (stageKey === 'input') {
      return isIdle ? 'pending' : 'completed';
    }
    if (stageKey === 'output') {
      return isCompleted ? 'completed' : isRunning ? 'pending' : 'pending';
    }
    
    const agent = data.stats[stageKey as keyof typeof data.stats];
    if (agent && typeof agent === 'object' && 'status' in agent) {
      return agent.status;
    }
    return 'pending';
  };

  const getStageData = (stageKey: string) => {
    if (stageKey === 'input') {
      return {
        count: data.stats.totalCustomers,
        label: `${data.stats.totalCustomers} customers`,
        detail: null,
      };
    }
    if (stageKey === 'output') {
      return {
        count: data.stats.output.sent,
        label: `${data.stats.output.sent} sent`,
        detail: data.stats.output.failed > 0 ? `${data.stats.output.failed} failed` : null,
      };
    }

    const agent = data.stats[stageKey as keyof typeof data.stats];
    if (agent && typeof agent === 'object') {
      if ('processed' in agent && 'avgDuration' in agent) {
        const processed = agent.processed || 0;
        const total = data.stats.totalCustomers;
        const avgDuration = agent.avgDuration || 0;
        
        let detail = null;
        if ('variantsGenerated' in agent && agent.variantsGenerated) {
          detail = `${agent.variantsGenerated} variants`;
        } else if ('approved' in agent && 'rejected' in agent) {
          detail = `${agent.approved} ✅ ${agent.rejected} ❌`;
        }

        return {
          count: processed,
          label: `${processed}/${total}`,
          detail: detail || (avgDuration ? `${avgDuration}ms avg` : null),
        };
      }
    }

    return {
      count: 0,
      label: '0/0',
      detail: null,
    };
  };

  const elapsedSeconds = data.startTime 
    ? Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000)
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Campaign Execution Flow</h2>
          {!isIdle && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Elapsed:</span>
                <span className="font-mono font-semibold">{formatTime(elapsedSeconds)}</span>
              </div>
              {isRunning && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-primary font-semibold">Running...</span>
                </div>
              )}
              {isCompleted && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-semibold">Completed!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pipeline Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 lg:gap-2">
          {stages.map((stage, index) => {
            const StageIcon = stage.icon;
            const status = getStageStatus(stage.key);
            const statusConfig = statusIcons[status as keyof typeof statusIcons];
            const StatusIcon = statusConfig?.icon;
            const stageData = getStageData(stage.key);

            const colorClasses = {
              blue: 'border-blue-200 bg-blue-50',
              purple: 'border-purple-200 bg-purple-50',
              green: 'border-green-200 bg-green-50',
              orange: 'border-orange-200 bg-orange-50',
              red: 'border-red-200 bg-red-50',
              emerald: 'border-emerald-200 bg-emerald-50',
            };

            const activeClasses = status === 'active' 
              ? 'border-primary shadow-lg shadow-primary/20 animate-pulse' 
              : '';
            const completedClasses = status === 'completed'
              ? 'border-green-400 bg-green-50'
              : '';

            return (
              <div key={stage.key} className="flex items-center gap-2">
                {/* Stage Box */}
                <Card className={`
                  flex-1 p-4 border-2 transition-all
                  ${colorClasses[stage.color as keyof typeof colorClasses]}
                  ${activeClasses}
                  ${completedClasses}
                  ${statusConfig?.className}
                `}>
                  <div className="space-y-2">
                    {/* Icon & Title */}
                    <div className="flex items-center justify-between">
                      <StageIcon className={`h-6 w-6 text-${stage.color}-600`} />
                      {StatusIcon && <StatusIcon className="h-5 w-5" />}
                    </div>

                    {/* Title */}
                    <div>
                      <div className="text-xs font-medium text-gray-600">{stage.title}</div>
                      <div className="text-sm font-semibold text-gray-900">{stage.subtitle}</div>
                    </div>

                    {/* Stats */}
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-gray-900">{stageData.label}</div>
                      {stageData.detail && (
                        <div className="text-gray-600">{stageData.detail}</div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Arrow */}
                {index < stages.length - 1 && (
                  <ArrowRight className={`
                    hidden lg:block h-6 w-6 flex-shrink-0
                    ${status === 'completed' ? 'text-green-500' : 'text-gray-300'}
                    ${status === 'active' ? 'animate-pulse text-primary' : ''}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        {!isIdle && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Pipeline Progress</span>
              <span className="font-bold text-gray-900">{data.progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Idle State Message */}
        {isIdle && (
          <div className="text-center py-4 text-gray-500">
            <p className="font-medium">No campaign running</p>
            <p className="text-sm">Click "Run Sample Campaign" to start a demo</p>
          </div>
        )}

        {/* Errors */}
        {data.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="font-semibold text-red-800 mb-2">⚠️ Errors</div>
            <div className="space-y-1 text-sm text-red-700">
              {data.errors.map((error, i) => (
                <div key={i}>
                  Agent {error.agent}: {error.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
