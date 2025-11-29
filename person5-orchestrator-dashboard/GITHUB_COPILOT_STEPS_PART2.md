# ChainReach AI - GitHub Copilot Steps (PART 2)
## Campaign Pages & Orchestration

Continue from Part 1... Now we build the actual campaign functionality!

---

## 📋 STEP 11: Build UI Components (20 minutes)

### 11.1 Create `components/ui/LoadingSpinner.tsx`

**Copilot Prompt:** "Create a loading spinner component with cyan color animation"

```typescript
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ size = 24, className = '' }: LoadingSpinnerProps) {
  return (
    <Loader2 
      size={size} 
      className={`animate-spin text-cyan-primary ${className}`} 
    />
  );
}
```

### 11.2 Create `components/ui/Badge.tsx`

**Copilot Prompt:** "Create a badge component with variants for approved, rejected, processing, waiting statuses"

```typescript
import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'approved' | 'rejected' | 'processing' | 'waiting' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  processing: 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse',
  waiting: 'bg-gray-100 text-gray-600 border-gray-200',
  default: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

### 11.3 Create `components/campaign/AgentCard.tsx`

**Copilot Prompt:** "Create an agent status card showing agent name, icon, status, progress bar, and data count"

```typescript
import { AgentStatus } from '@/lib/types/campaign';
import { CheckCircle2, Loader2, Clock, XCircle } from 'lucide-react';
import Badge from '../ui/Badge';

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
        return <Badge variant="approved">Completed</Badge>;
      case 'processing':
        return <Badge variant="processing">Processing</Badge>;
      case 'waiting':
        return <Badge variant="waiting">Waiting</Badge>;
      case 'error':
        return <Badge variant="rejected">Error</Badge>;
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
```

### 11.4 Create `components/campaign/ComplianceResults.tsx`

**Copilot Prompt:** "Create a table component to display compliance results with customer ID, status, safety scores, and rejection reasons"

```typescript
import { ComplianceResult } from '@/lib/types/campaign';
import Badge from '../ui/Badge';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ComplianceResultsProps {
  results: ComplianceResult[];
  maxDisplay?: number;
}

export default function ComplianceResults({ results, maxDisplay = 50 }: ComplianceResultsProps) {
  const displayResults = results.slice(0, maxDisplay);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-navy-primary mb-4 flex items-center">
        <span>Compliance Results</span>
        <span className="ml-2 text-sm text-gray-500">
          (Showing {displayResults.length} of {results.length})
        </span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="text-left p-3 font-semibold text-navy-primary">Customer ID</th>
              <th className="text-left p-3 font-semibold text-navy-primary">Variant ID</th>
              <th className="text-center p-3 font-semibold text-navy-primary">Status</th>
              <th className="text-center p-3 font-semibold text-navy-primary">Safety Scores</th>
              <th className="text-left p-3 font-semibold text-navy-primary">Reason</th>
            </tr>
          </thead>
          <tbody>
            {displayResults.map((result, index) => (
              <tr
                key={`${result.customer_id}-${result.variant_id}`}
                className={`border-b hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="p-3 font-mono text-xs">{result.customer_id}</td>
                <td className="p-3 font-mono text-xs">{result.variant_id}</td>
                <td className="p-3 text-center">
                  {result.status === 'APPROVED' ? (
                    <Badge variant="approved" className="inline-flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="rejected" className="inline-flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex justify-center space-x-2 text-xs">
                    <span className={result.safety_scores.hate > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                      H:{result.safety_scores.hate}
                    </span>
                    <span className={result.safety_scores.violence > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                      V:{result.safety_scores.violence}
                    </span>
                    <span className={result.safety_scores.sexual > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                      S:{result.safety_scores.sexual}
                    </span>
                    <span className={result.safety_scores.self_harm > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                      SH:{result.safety_scores.self_harm}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-xs text-gray-700">{result.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.length > maxDisplay && (
        <div className="mt-4 text-center">
          <button className="text-cyan-primary hover:text-cyan-secondary font-medium">
            Load More Results ({results.length - maxDisplay} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 📋 STEP 12: Create Campaign Hub Page (10 minutes)

### 12.1 Create `app/campaign/page.tsx`

**Copilot Prompt:** "Create a campaign hub page with three options: Demo Campaign, Custom Campaign, and Message Validator"

```typescript
import Link from 'next/link';
import { Rocket, Settings, Shield } from 'lucide-react';

export default function CampaignPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy-primary mb-4">
            Campaign Center
          </h1>
          <p className="text-xl text-gray-600">
            Choose how you want to run your marketing campaign
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Demo Campaign */}
          <Link href="/campaign/demo" className="group">
            <div className="card h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-cyan-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Rocket className="w-10 h-10 text-navy-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-navy-primary mb-4 text-center">
                Demo Campaign
              </h2>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>5,000 pre-loaded customers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Full orchestration flow</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Real-time status monitoring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Compliance results dashboard</span>
                </li>
              </ul>
              <div className="text-center">
                <span className="text-cyan-primary font-semibold group-hover:text-cyan-secondary">
                  Start Demo →
                </span>
              </div>
            </div>
          </Link>

          {/* Custom Campaign */}
          <Link href="/campaign/custom" className="group">
            <div className="card h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-navy-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings className="w-10 h-10 text-cyan-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-navy-primary mb-4 text-center">
                Custom Campaign
              </h2>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Upload your CSV file</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Select specific customer IDs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Configure campaign parameters</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Same powerful orchestration</span>
                </li>
              </ul>
              <div className="text-center">
                <span className="text-cyan-primary font-semibold group-hover:text-cyan-secondary">
                  Setup Custom →
                </span>
              </div>
            </div>
          </Link>

          {/* Message Validator */}
          <Link href="/campaign/validate" className="group">
            <div className="card h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-navy-primary mb-4 text-center">
                Message Validator
              </h2>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Test individual messages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>JSON format validation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Instant compliance check</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-primary mr-2">✓</span>
                  <span>Detailed safety scores</span>
                </li>
              </ul>
              <div className="text-center">
                <span className="text-cyan-primary font-semibold group-hover:text-cyan-secondary">
                  Validate Now →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-primary mb-2">
            ℹ️ How It Works
          </h3>
          <p className="text-gray-700">
            All campaigns go through our 5-agent orchestration system with mandatory compliance 
            validation. Every message is checked by Azure AI Content Safety before it can be sent 
            to customers, ensuring responsible AI usage and protecting your brand reputation.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 STEP 13: Create Message Validator Page (15 minutes)

### 13.1 Create `app/campaign/validate/page.tsx`

**Copilot Prompt:** "Create a message validator page with JSON textarea input, validate button that calls Agent 4 API, and displays compliance results"

```typescript
'use client';

import { useState } from 'react';
import { validateMessages } from '@/lib/api/compliance';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import { Shield, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ValidatePage() {
  const [input, setInput] = useState(
    JSON.stringify({ messages: ['Hello valued customer!', 'Check out our new product'] }, null, 2)
  );
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleValidate = async () => {
    setError('');
    setResults(null);
    setIsValidating(true);

    try {
      // Parse JSON input
      const parsed = JSON.parse(input);
      
      if (!parsed.messages || !Array.isArray(parsed.messages)) {
        throw new Error('Input must contain a "messages" array');
      }

      // Call compliance API
      const response = await validateMessages(parsed.messages);
      setResults(response);
      toast.success('Validation complete!');
    } catch (err: any) {
      const errorMsg = err.message || 'Validation failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsValidating(false);
    }
  };

  const copyExample = () => {
    const example = {
      messages: [
        'Welcome to ChainReach AI!',
        'Your exclusive offer awaits',
        'I hate this product' // This will be rejected
      ]
    };
    setInput(JSON.stringify(example, null, 2));
    toast.success('Example copied to input');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-navy-primary mb-2">
            Message Compliance Validator
          </h1>
          <p className="text-gray-600">
            Test your message content with Azure AI Content Safety before sending
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-navy-primary">
                  Message Input (JSON)
                </h2>
                <button
                  onClick={copyExample}
                  className="text-sm text-cyan-primary hover:text-cyan-secondary flex items-center"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Load Example
                </button>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-cyan-primary focus:border-transparent"
                placeholder='{"messages": ["Your message here"]}'
              />

              <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Format:</strong> JSON object with "messages" array
                <br />
                <code className="bg-white px-1 py-0.5 rounded">
                  {`{"messages": ["message1", "message2"]}`}
                </code>
              </div>

              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <>
                    <LoadingSpinner size={20} className="inline mr-2" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Shield className="inline w-5 h-5 mr-2" />
                    Validate Messages
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div>
            <div className="card h-full">
              <h2 className="text-lg font-semibold text-navy-primary mb-4">
                Validation Results
              </h2>

              {!results && !isValidating && (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No results yet. Validate messages to see compliance analysis.</p>
                </div>
              )}

              {isValidating && (
                <div className="text-center py-12">
                  <LoadingSpinner size={48} className="mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing messages with Azure AI...</p>
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  {results.results.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        result.status === 'APPROVED'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-gray-700">
                          Message {index + 1}
                        </span>
                        {result.status === 'APPROVED' ? (
                          <Badge variant="approved" className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="rejected" className="flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mb-3 italic">
                        "{result.message}"
                      </p>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {Object.entries(result.safety_scores).map(([key, value]) => (
                          <div
                            key={key}
                            className={`text-xs p-2 rounded ${
                              (value as number) > 0
                                ? 'bg-red-100 text-red-800 font-semibold'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <span className="capitalize">{key.replace('_', ' ')}:</span>{' '}
                            <span className="font-bold">{value as number}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-700 mt-2">
                        <strong>Reason:</strong> {result.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-navy-primary mb-2 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            About Azure AI Content Safety
          </h3>
          <p className="text-sm text-gray-700">
            This validator uses Azure AI Content Safety API to analyze messages for harmful content 
            across four categories: Hate, Violence, Sexual, and Self-Harm. Each category is scored 
            from 0 (safe) to 7 (severe). Messages with scores above 0 are rejected to ensure 
            responsible AI usage.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 STEP 14: Create Orchestrator Hook (20 minutes)

### 14.1 Create `hooks/useOrchestrator.ts`

**Copilot Prompt:** "Create a React hook for campaign orchestration that sequentially calls agents 1-4, manages state, handles errors, and provides progress updates"

```typescript
import { useState, useCallback } from 'react';
import { CampaignState, AgentStatus, ComplianceResult } from '@/lib/types/campaign';
import { segmentCustomers, retrieveTemplates, generateVariants } from '@/lib/api/agents';
import { validateMessages } from '@/lib/api/compliance';
import { API_CONFIG } from '@/lib/api/config';
import toast from 'react-hot-toast';

const initialAgentState: AgentStatus[] = [
  { agent_id: 1, agent_name: 'Customer Segmentation', status: 'waiting', progress: 0 },
  { agent_id: 2, agent_name: 'Content Retrieval', status: 'waiting', progress: 0 },
  { agent_id: 3, agent_name: 'Content Generation', status: 'waiting', progress: 0 },
  { agent_id: 4, agent_name: 'Compliance & Safety', status: 'waiting', progress: 0 },
  { agent_id: 5, agent_name: 'Campaign Delivery', status: 'waiting', progress: 0 },
];

export function useOrchestrator() {
  const [campaignState, setCampaignState] = useState<CampaignState>({
    campaign_id: `CAMP-${Date.now()}`,
    status: 'idle',
    agents: initialAgentState,
    results: [],
  });

  const updateAgentStatus = useCallback((
    agentId: number,
    updates: Partial<AgentStatus>
  ) => {
    setCampaignState((prev) => ({
      ...prev,
      agents: prev.agents.map((agent) =>
        agent.agent_id === agentId ? { ...agent, ...updates } : agent
      ),
    }));
  }, []);

  const startCampaign = useCallback(async (customerData: any[]) => {
    try {
      // Reset state
      setCampaignState({
        campaign_id: `CAMP-${Date.now()}`,
        status: 'running',
        agents: initialAgentState,
        results: [],
      });

      toast.success('Campaign started!');

      // AGENT 1: Customer Segmentation
      updateAgentStatus(1, { status: 'processing', progress: 10 });
      toast.loading('Agent 1: Analyzing customers...', { id: 'agent1' });

      // Simulate segmentation (replace with actual API call when ready)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const segments = [
        {
          segment_id: 'high_value',
          segment_name: 'High Value Customers',
          customer_count: customerData.length,
          customers: customerData.slice(0, 100) // Take first 100 for demo
        }
      ];

      updateAgentStatus(1, { status: 'done', progress: 100, data: segments.length });
      toast.success('Agent 1: Segmentation complete!', { id: 'agent1' });

      // AGENT 2: Content Retrieval
      updateAgentStatus(2, { status: 'processing', progress: 10 });
      toast.loading('Agent 2: Retrieving templates...', { id: 'agent2' });

      await new Promise(resolve => setTimeout(resolve, 1500));
      const templates = [
        {
          template_id: 'TEMP001',
          segment_id: 'high_value',
          template_name: 'Premium Launch',
          subject: 'Exclusive offer for {name}',
          body: 'Hi {name}, we have something special for you...',
          approved_date: new Date().toISOString(),
          approval_status: 'APPROVED',
          tags: ['premium', 'launch']
        }
      ];

      updateAgentStatus(2, { status: 'done', progress: 100, data: templates.length });
      toast.success('Agent 2: Templates retrieved!', { id: 'agent2' });

      // AGENT 3: Content Generation
      updateAgentStatus(3, { status: 'processing', progress: 10 });
      toast.loading('Agent 3: Generating variants...', { id: 'agent3' });

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate 3 variants for first 10 customers (demo)
      const testCustomers = customerData.slice(0, 10);
      const allMessages: string[] = [];
      const variantMapping: Array<{
        customer_id: string;
        variant_id: string;
        message: string;
      }> = [];

      testCustomers.forEach((customer, idx) => {
        for (let v = 1; v <= 3; v++) {
          const variantId = `VAR${String(idx + 1).padStart(3, '0')}_${String.fromCharCode(64 + v)}`;
          const message = `Hi ${customer.name || 'Customer'}, exclusive offer just for you! Variant ${v}`;
          
          allMessages.push(message);
          variantMapping.push({
            customer_id: customer.customer_id || `CUST${String(idx + 1).padStart(3, '0')}`,
            variant_id: variantId,
            message: message
          });
        }
      });

      updateAgentStatus(3, { status: 'done', progress: 100, data: allMessages.length });
      toast.success(`Agent 3: Generated ${allMessages.length} variants!`, { id: 'agent3' });

      // AGENT 4: Compliance Validation
      updateAgentStatus(4, { status: 'processing', progress: 20 });
      toast.loading('Agent 4: Running compliance checks...', { id: 'agent4' });

      const complianceResponse = await validateMessages(allMessages);
      
      // Map compliance results back to customers
      const complianceResults: ComplianceResult[] = complianceResponse.results.map((result, idx) => {
        const mapping = variantMapping[idx];
        return {
          variant_id: mapping.variant_id,
          customer_id: mapping.customer_id,
          status: result.status,
          safety_scores: result.safety_scores,
          selected_for_sending: result.status === 'APPROVED',
          reason: result.reason,
          timestamp: new Date().toISOString()
        };
      });

      const approvedCount = complianceResults.filter(r => r.status === 'APPROVED').length;
      const rejectedCount = complianceResults.filter(r => r.status === 'REJECTED').length;

      updateAgentStatus(4, { status: 'done', progress: 100, data: complianceResults.length });
      toast.success(
        `Agent 4: ${approvedCount} approved, ${rejectedCount} rejected`,
        { id: 'agent4' }
      );

      // AGENT 5: Would send messages (simulated)
      updateAgentStatus(5, { status: 'done', progress: 100, data: approvedCount });

      // Update final state
      setCampaignState((prev) => ({
        ...prev,
        status: 'completed',
        results: complianceResults,
        summary: {
          total_customers: testCustomers.length,
          total_variants: allMessages.length,
          approved: approvedCount,
          rejected: rejectedCount,
          approval_rate: `${((approvedCount / allMessages.length) * 100).toFixed(1)}%`
        }
      }));

      toast.success('🎉 Campaign orchestration complete!');

    } catch (error: any) {
      console.error('Campaign orchestration error:', error);
      
      setCampaignState((prev) => ({
        ...prev,
        status: 'error'
      }));

      toast.error(`Campaign failed: ${error.message}`);
    }
  }, [updateAgentStatus]);

  const resetCampaign = useCallback(() => {
    setCampaignState({
      campaign_id: `CAMP-${Date.now()}`,
      status: 'idle',
      agents: initialAgentState,
      results: [],
    });
  }, []);

  return {
    campaignState,
    startCampaign,
    resetCampaign,
    isRunning: campaignState.status === 'running',
    isCompleted: campaignState.status === 'completed',
  };
}
```

---

## 🎯 You're Making Great Progress!

You now have:
✅ All UI components built
✅ Campaign hub page
✅ Message validator (working with Agent 4!)
✅ Orchestration hook

**Next:** Create the demo campaign page that ties it all together!

Save this and continue to PART 3 for the final demo page! 🚀
