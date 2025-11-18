'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface AgentStatus {
  agentId: number;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  health: {
    responseTime: number;
    uptime: number;
    totalCalls: number;
    successRate: number;
    lastChecked: Date;
  };
  recentErrors: Array<{
    timestamp: Date;
    message: string;
  }>;
}

interface AgentStatusResponse {
  agents: AgentStatus[];
  overall: 'healthy' | 'degraded' | 'down';
  timestamp: Date;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: '🟢 Healthy',
  },
  degraded: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: '🟡 Degraded',
  },
  down: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: '🔴 Down',
  },
};

export function AgentStatusGrid() {
  const [data, setData] = useState<AgentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentHealth = async () => {
      try {
        const response = await fetch('/api/agents/health');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch agent health:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchAgentHealth();

    // Refresh every 5 seconds
    const interval = setInterval(fetchAgentHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-8">
        Failed to load agent status
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.agents.map((agent) => {
        const config = statusConfig[agent.status];
        const StatusIcon = config.icon;

        return (
          <Card
            key={agent.agentId}
            className={`border-2 ${config.borderColor} ${config.bgColor} transition-all hover:shadow-lg`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                <span>Agent {agent.agentId}</span>
                <Activity className={`h-4 w-4 ${config.color}`} />
              </CardTitle>
              <div className="text-lg font-bold">{agent.name}</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${config.color}`} />
                <span className="text-sm font-medium">{config.label}</span>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="font-medium">{agent.health.responseTime}ms</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Calls:</span>
                  <span className="font-medium">{agent.health.totalCalls.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-green-600">
                    {agent.health.successRate}% ✅
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{agent.health.uptime}%</span>
                </div>
              </div>

              {agent.recentErrors.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-red-600">
                    {agent.recentErrors.length} recent error(s)
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
