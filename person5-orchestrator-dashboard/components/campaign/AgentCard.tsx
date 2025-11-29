import { AgentStatus } from '@/lib/types/campaign';
import { CheckCircle2, Loader2, Clock, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface AgentCardProps {
  agent: AgentStatus;
  icon?: string;
}

export default function AgentCard({ agent, icon }: AgentCardProps) {
  const getStatusIcon = () => {
    switch (agent.status) {
      case 'done':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />;
      case 'waiting':
        return <Clock className="w-6 h-6 text-gray-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (agent.status) {
      case 'done':
        return <Badge variant="default">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'waiting':
        return <Badge variant="outline">Waiting</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          {getStatusIcon()}
        </div>
        {getStatusBadge()}
      </div>

      <h3 className="font-semibold text-navy-primary text-sm mb-2">
        Agent {agent.agent_id}: {agent.agent_name}
      </h3>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{agent.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-cyan-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${agent.progress}%` }}
          />
        </div>
      </div>

      {/* Data Count */}
      {agent.data && (
        <div className="text-xs text-gray-600">
          <span className="font-semibold text-navy-primary">
            {typeof agent.data === 'number' ? agent.data : 'Data available'}
          </span>
        </div>
      )}

      {/* Error Message */}
      {agent.error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          {agent.error}
        </div>
      )}
    </div>
  );
}