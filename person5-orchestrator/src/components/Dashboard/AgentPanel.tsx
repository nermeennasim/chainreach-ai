'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  CheckCircle2,
  Clock, 
  Database,
  Zap,
  MessageSquare,
  Shield,
  Users,
  FileText,
  Send,
  AlertTriangle
} from 'lucide-react';

interface AgentPanelProps {
  agentNumber: 1 | 2 | 3 | 4;
  agentName: string;
  description: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  progress?: number;
  metrics?: Record<string, any>;
  logs?: string[];
  onStart?: () => void;
  onStop?: () => void;
}

const getAgentIcon = (agentNumber: number) => {
  switch (agentNumber) {
    case 1: return Users;
    case 2: return FileText;
    case 3: return Send;
    case 4: return Shield;
    default: return Zap;
  }
};

const getAgentColor = (agentNumber: number) => {
  switch (agentNumber) {
    case 1: return 'from-blue-500 to-cyan-500';
    case 2: return 'from-green-500 to-emerald-500';
    case 3: return 'from-orange-500 to-amber-500';
    case 4: return 'from-purple-500 to-pink-500';
    default: return 'from-gray-500 to-slate-500';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'processing':
      return <Badge className="bg-blue-500 text-white">Processing</Badge>;
    case 'completed':
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    case 'failed':
      return <Badge className="bg-red-500 text-white">Failed</Badge>;
    default:
      return <Badge className="bg-gray-500 text-white">Idle</Badge>;
  }
};

export function AgentPanel({
  agentNumber,
  agentName,
  description,
  status,
  inputs,
  outputs,
  progress = 0,
  metrics,
  logs = [],
  onStart,
  onStop
}: AgentPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getAgentIcon(agentNumber);
  const colorGradient = getAgentColor(agentNumber);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Agent {agentNumber}: {agentName}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(status)}
            {status === 'idle' && onStart && (
              <button
                onClick={onStart}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Play className="h-4 w-4" />
                Start
              </button>
            )}
            {status === 'processing' && onStop && (
              <button
                onClick={onStop}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Pause className="h-4 w-4" />
                Stop
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        {status === 'processing' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Processing Progress</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Metrics Grid */}
        {metrics && Object.keys(metrics).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 uppercase font-semibold">{key}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{String(value)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Inputs Section */}
        {inputs && Object.keys(inputs).length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-semibold text-gray-700 flex items-center gap-2 hover:text-gray-900"
            >
              <Database className="h-4 w-4" />
              Inputs {expanded ? '▼' : '►'}
            </button>
            {expanded && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(inputs, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Outputs Section */}
        {outputs && Object.keys(outputs).length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Outputs</span>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {JSON.stringify(outputs, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Logs Section */}
        {logs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Activity Logs</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs text-gray-700 mb-1 flex items-start gap-2">
                  <Clock className="h-3 w-3 mt-0.5 text-gray-500" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Idle State Message */}
        {status === 'idle' && !inputs && !outputs && (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Agent is idle. Click Start to begin processing.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
