/**
 * Mock Data Generator for Dashboard Demo
 * Generates realistic campaign and agent data for visualization
 */

export interface PipelineStatus {
  campaignId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentStage: 'segmentation' | 'content' | 'generation' | 'compliance' | 'sending' | 'completed';
  progress: number; // 0-100
  
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

export interface AgentStatus {
  agentId: number;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  health: {
    responseTime: number; // avg in ms
    uptime: number; // percentage
    totalCalls: number;
    successRate: number; // percentage
    lastChecked: Date;
    activeTimeHours?: number; // hours agent has been active
    messagesProcessed?: number; // total messages/requests handled
    avgCallsPerMinute?: number; // average API calls per minute
  };
  recentErrors: Array<{
    timestamp: Date;
    message: string;
  }>;
}

export interface LiveMetrics {
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  
  rates: {
    sendRate: number; // per minute
    openRate: number; // per minute
    clickRate: number; // per minute
    revenueRate: number; // per minute
  };
  
  lastUpdated: Date;
}

// Simulated campaign state (in-memory for demo)
let currentCampaign: {
  executionId: string;
  progress: number;
  startTime: number;
  totalCustomers: number;
  metrics: LiveMetrics;
} | null = null;

export function generatePipelineStatus(): PipelineStatus {
  if (!currentCampaign) {
    return {
      campaignId: 'idle',
      status: 'idle',
      currentStage: 'completed',
      progress: 0,
      stats: {
        totalCustomers: 0,
        processed: 0,
        agent1: { status: 'pending', processed: 0, avgDuration: 0 },
        agent2: { status: 'pending', processed: 0, avgDuration: 0 },
        agent3: { status: 'pending', processed: 0, variantsGenerated: 0, avgDuration: 0 },
        agent4: { status: 'pending', processed: 0, approved: 0, rejected: 0, avgDuration: 0 },
        output: { sent: 0, failed: 0 },
      },
      startTime: new Date(),
      estimatedCompletion: new Date(),
      errors: [],
    };
  }

  const progress = Math.min(currentCampaign.progress, 100);
  const total = currentCampaign.totalCustomers;

  // Calculate stage based on progress
  let currentStage: PipelineStatus['currentStage'] = 'segmentation';
  let agent1Status: 'pending' | 'active' | 'completed' = 'active';
  let agent2Status: 'pending' | 'active' | 'completed' = 'pending';
  let agent3Status: 'pending' | 'active' | 'completed' = 'pending';
  let agent4Status: 'pending' | 'active' | 'completed' = 'pending';

  if (progress > 20) {
    agent1Status = 'completed';
    agent2Status = 'active';
    currentStage = 'content';
  }
  if (progress > 40) {
    agent2Status = 'completed';
    agent3Status = 'active';
    currentStage = 'generation';
  }
  if (progress > 75) {
    agent3Status = 'completed';
    agent4Status = 'active';
    currentStage = 'compliance';
  }
  if (progress > 90) {
    agent4Status = 'completed';
    currentStage = 'sending';
  }
  if (progress >= 100) {
    currentStage = 'completed';
  }

  const processed = Math.floor((progress / 100) * total);

  return {
    campaignId: currentCampaign.executionId,
    status: progress >= 100 ? 'completed' : 'running',
    currentStage,
    progress,
    stats: {
      totalCustomers: total,
      processed,
      agent1: {
        status: agent1Status,
        processed: progress > 20 ? total : Math.floor((progress / 20) * total),
        avgDuration: 245,
      },
      agent2: {
        status: agent2Status,
        processed: progress > 40 ? total : Math.max(0, Math.floor(((progress - 20) / 20) * total)),
        avgDuration: 180,
      },
      agent3: {
        status: agent3Status,
        processed: progress > 75 ? total : Math.max(0, Math.floor(((progress - 40) / 35) * total)),
        variantsGenerated: progress > 75 ? total * 3 : Math.max(0, Math.floor(((progress - 40) / 35) * total * 3)),
        avgDuration: 1234,
      },
      agent4: {
        status: agent4Status,
        processed: progress > 90 ? total : Math.max(0, Math.floor(((progress - 75) / 15) * total)),
        approved: Math.floor(processed * 0.972),
        rejected: Math.floor(processed * 0.028),
        avgDuration: 320,
      },
      output: {
        sent: progress >= 100 ? Math.floor(total * 0.972) : 0,
        failed: progress >= 100 ? Math.floor(total * 0.028) : 0,
      },
    },
    startTime: new Date(currentCampaign.startTime),
    estimatedCompletion: new Date(currentCampaign.startTime + 180000), // 3 minutes
    errors: [],
  };
}

export function generateAgentStatuses(): AgentStatus[] {
  const activeTimeHours = 23.5; // 23.5 hours active out of 24
  
  return [
    {
      agentId: 1,
      name: 'Segmentation (ML)',
      status: 'healthy',
      health: {
        responseTime: 245,
        uptime: 99.8,
        totalCalls: 1247,
        successRate: 99.8,
        lastChecked: new Date(),
        activeTimeHours: activeTimeHours,
        messagesProcessed: 5247,
        avgCallsPerMinute: 52,
      },
      recentErrors: [],
    },
    {
      agentId: 2,
      name: 'Content (PostgreSQL)',
      status: 'healthy',
      health: {
        responseTime: 180,
        uptime: 100,
        totalCalls: 1247,
        successRate: 100,
        lastChecked: new Date(),
        activeTimeHours: 24,
        messagesProcessed: 5247,
        avgCallsPerMinute: 51,
      },
      recentErrors: [],
    },
    {
      agentId: 3,
      name: 'GPT-4 Generation',
      status: 'healthy',
      health: {
        responseTime: 1234,
        uptime: 100,
        totalCalls: 1247,
        successRate: 100,
        lastChecked: new Date(),
        activeTimeHours: 24,
        messagesProcessed: 5247,
        avgCallsPerMinute: 51,
      },
      recentErrors: [],
    },
    {
      agentId: 4,
      name: 'Content Safety',
      status: 'healthy',
      health: {
        responseTime: 320,
        uptime: 99.2,
        totalCalls: 1247,
        successRate: 97.2,
        lastChecked: new Date(),
        activeTimeHours: 23.8,
        messagesProcessed: 5102,
        avgCallsPerMinute: 51,
      },
      recentErrors: [],
    },
  ];
}

export function generateLiveMetrics(): LiveMetrics {
  if (!currentCampaign) {
    return {
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0,
      rates: {
        sendRate: 0,
        openRate: 0,
        clickRate: 0,
        revenueRate: 0,
      },
      lastUpdated: new Date(),
    };
  }

  // Increment metrics over time
  const baseMetrics = currentCampaign.metrics;
  baseMetrics.sent += Math.floor(Math.random() * 15) + 10;
  baseMetrics.opened += Math.floor(Math.random() * 8) + 5;
  baseMetrics.clicked += Math.floor(Math.random() * 3) + 2;
  baseMetrics.converted += Math.floor(Math.random() * 2);
  baseMetrics.revenue += (Math.random() * 2000) + 500;

  baseMetrics.rates = {
    sendRate: 12,
    openRate: 8,
    clickRate: 3,
    revenueRate: 2300,
  };
  baseMetrics.lastUpdated = new Date();

  return baseMetrics;
}

export function startDemoCampaign(customerCount: number = 100): string {
  const executionId = `exec-${Date.now()}`;
  
  currentCampaign = {
    executionId,
    progress: 0,
    startTime: Date.now(),
    totalCustomers: customerCount,
    metrics: {
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0,
      rates: {
        sendRate: 0,
        openRate: 0,
        clickRate: 0,
        revenueRate: 0,
      },
      lastUpdated: new Date(),
    },
  };

  // Simulate progress over 3 minutes
  const progressInterval = setInterval(() => {
    if (!currentCampaign) {
      clearInterval(progressInterval);
      return;
    }

    currentCampaign.progress += 2; // Increment by 2% every second (50 seconds total)
    
    if (currentCampaign.progress >= 100) {
      currentCampaign.progress = 100;
      clearInterval(progressInterval);
    }
  }, 1000);

  return executionId;
}

export function getCurrentCampaign() {
  return currentCampaign;
}

export function resetCampaign() {
  currentCampaign = null;
}
