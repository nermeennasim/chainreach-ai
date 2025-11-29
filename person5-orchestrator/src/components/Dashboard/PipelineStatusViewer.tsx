/**
 * Pipeline Status Component
 * 
 * Real-time visualization of pipeline execution
 * Shows Agent 1 → 2 → 3 → 4 flow with live status updates
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  XCircle,
  ArrowRight,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PipelineStep {
  step_number: number;
  agent_name: string;
  agent_url: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  attempts: number;
  max_attempts: number;
  error?: string;
}

interface PipelineState {
  pipeline_id: string;
  campaign_name?: string;
  customer_id?: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  total_steps: number;
  started_at: string;
  completed_at?: string;
  total_duration_ms?: number;
  steps: PipelineStep[];
}

export function PipelineStatusViewer({ pipelineId }: { pipelineId: string }) {
  const [state, setState] = useState<PipelineState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pipelineId) return;

    // Initial fetch
    fetchStatus();

    // Poll every 2 seconds if running
    const interval = setInterval(() => {
      if (state?.status === 'running') {
        fetchStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pipelineId, state?.status]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/pipeline/status/${pipelineId}`);
      const data = await response.json();

      if (data.success) {
        setState(data.pipeline);
      } else {
        setError(data.error || 'Failed to fetch status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pipeline status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <XCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!state) return null;

  const progress = (state.current_step / state.total_steps) * 100;

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Pipeline Execution Status
              </CardTitle>
              <CardDescription>
                Pipeline ID: {state.pipeline_id}
              </CardDescription>
            </div>
            <PipelineStatusBadge status={state.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Step {state.current_step} of {state.total_steps}</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Campaign</p>
              <p className="font-semibold">{state.campaign_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Customer ID</p>
              <p className="font-semibold">{state.customer_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Started</p>
              <p className="font-semibold">
                {new Date(state.started_at).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Duration</p>
              <p className="font-semibold">
                {state.total_duration_ms 
                  ? `${(state.total_duration_ms / 1000).toFixed(1)}s`
                  : 'In progress...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Execution Flow</CardTitle>
          <CardDescription>
            Sequential execution through all 4 agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.steps.map((step, index) => (
              <div key={step.step_number}>
                <StepCard step={step} />
                {index < state.steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PipelineStatusBadge({ status }: { status: PipelineState['status'] }) {
  const config = {
    idle: { label: 'Idle', className: 'bg-gray-100 text-gray-800' },
    running: { label: 'Running', className: 'bg-blue-100 text-blue-800 animate-pulse' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelled', className: 'bg-yellow-100 text-yellow-800' },
  };

  const { label, className } = config[status];

  return (
    <Badge className={className}>
      {label}
    </Badge>
  );
}

function StepCard({ step }: { step: PipelineStep }) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'success':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'running':
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'pending':
        return <Circle className="h-6 w-6 text-gray-400" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'pending':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className="mt-1">{getStatusIcon()}</div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                Step {step.step_number}: {step.agent_name}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {step.agent_url === 'MOCK' ? '🎭 Mock Agent' : step.agent_url}
              </p>
            </div>
            <StepStatusBadge status={step.status} />
          </div>

          {/* Duration & Attempts */}
          {step.duration_ms !== undefined && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{(step.duration_ms / 1000).toFixed(2)}s</span>
              </div>
              <div>
                Attempts: {step.attempts}/{step.max_attempts}
              </div>
            </div>
          )}

          {/* Error Message */}
          {step.error && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-800">
              <strong>Error:</strong> {step.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepStatusBadge({ status }: { status: PipelineStep['status'] }) {
  const config = {
    pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700' },
    running: { label: 'Running', className: 'bg-blue-100 text-blue-700' },
    success: { label: 'Success', className: 'bg-green-100 text-green-700' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
    skipped: { label: 'Skipped', className: 'bg-yellow-100 text-yellow-700' },
  };

  const { label, className } = config[status];

  return (
    <Badge className={className}>
      {label}
    </Badge>
  );
}
