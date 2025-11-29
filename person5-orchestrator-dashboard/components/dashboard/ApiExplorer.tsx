'use client';

import { useState } from 'react';
import { API_CONFIG } from '@/lib/api/config';
import { getSegments, getCustomers, getSegmentDetails, checkSegmentationHealth } from '@/lib/api/segmentation';
import { searchContent, getRAGStats, checkRAGHealth } from '@/lib/api/rag';
import ComplianceResultsChart from './ComplianceResultsChart';

interface ApiResult {
  endpoint: string;
  method: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp: number;
  statusCode?: number;
}

interface ApiEndpoint {
  id: string;
  label: string;
  method: string;
  endpoint: string;
  description: string;
  icon: string;
  params?: { name: string; type: string; required: boolean; default?: any }[];
  action: (params?: any) => Promise<any>;
}

export default function ApiExplorer() {
  const [results, setResults] = useState<ApiResult[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<'agent1' | 'agent2' | 'agent3' | 'agent4' | 'agent5'>('agent1');
  const [loading, setLoading] = useState(false);
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [inputParams, setInputParams] = useState<Record<string, any>>({});
  const [complianceChartData, setComplianceChartData] = useState<any[] | null>(null);

  const addResult = (
    endpoint: string,
    method: string,
    status: 'success' | 'error',
    data?: any,
    error?: string,
    statusCode?: number
  ) => {
    setResults((prev) => [
      {
        endpoint,
        method,
        status,
        data,
        error,
        timestamp: Date.now(),
        statusCode,
      },
      ...prev,
    ]);
  };

  // Agent 1 - Segmentation API Endpoints
  const agent1Endpoints: ApiEndpoint[] = [
    {
      id: 'health',
      label: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      description: 'Check if Segmentation Agent is running',
      icon: '🏥',
      action: async () => {
        const data = await checkSegmentationHealth();
        return data;
      },
    },
    {
      id: 'get-segments',
      label: 'Get All Segments',
      method: 'GET',
      endpoint: '/api/segments',
      description: 'Retrieve all customer segments',
      icon: '👥',
      action: async () => {
        const data = await getSegments();
        return data;
      },
    },
    {
      id: 'get-segment-by-id',
      label: 'Get Segment by ID',
      method: 'GET',
      endpoint: '/api/segments/:id',
      description: 'Retrieve specific segment details',
      icon: '🔍',
      params: [
        {
          name: 'id',
          type: 'string',
          required: true,
          default: 'seg_001',
        },
      ],
      action: async (params?: any) => {
        const id = params?.id || 'seg_001';
        const data = await getSegmentDetails(id);
        return data;
      },
    },
    {
      id: 'get-customers',
      label: 'Get All Customers',
      method: 'GET',
      endpoint: '/api/customers',
      description: 'Retrieve customer list with pagination',
      icon: '📋',
      params: [
        {
          name: 'limit',
          type: 'number',
          required: false,
          default: 20,
        },
        {
          name: 'offset',
          type: 'number',
          required: false,
          default: 0,
        },
      ],
      action: async (params?: any) => {
        const limit = params?.limit || 20;
        const offset = params?.offset || 0;
        const data = await getCustomers(limit, offset);
        return data;
      },
    },
    {
      id: 'get-customer-by-id',
      label: 'Get Customer by ID',
      method: 'GET',
      endpoint: '/api/customers/:id',
      description: 'Retrieve specific customer details',
      icon: '👤',
      params: [
        {
          name: 'id',
          type: 'string',
          required: true,
          default: 'cust_001',
        },
      ],
      action: async (params?: any) => {
        const id = params?.id || 'cust_001';
        return await fetch(`${API_CONFIG.agent1.url}/api/customers/${id}`).then((r) => r.json());
      },
    },
    {
      id: 'generate-bulk-customers',
      label: 'Generate N Customers (Bulk)',
      method: 'POST',
      endpoint: '/api/customers/bulk/generate',
      description: 'Generate N number of sample customers (e.g., 100)',
      icon: '🚀',
      params: [
        {
          name: 'count',
          type: 'number',
          required: true,
          default: 25,
        },
      ],
      action: async (params?: any) => {
        const count = params?.count || 25;
        return await fetch(`${API_CONFIG.agent1.url}/api/customers/bulk/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count }),
        }).then((r) => r.json());
      },
    },
    {
      id: 'calculate-engagement',
      label: 'Calculate Engagement Scores',
      method: 'POST',
      endpoint: '/api/segment/calculate-engagement',
      description: 'Calculate engagement metrics for all segments',
      icon: '⚡',
      action: async () => {
        return await fetch(`${API_CONFIG.agent1.url}/api/segment/calculate-engagement`, {
          method: 'POST',
        }).then((r) => r.json());
      },
    },
    {
      id: 'refresh-segmentation',
      label: 'Refresh Segmentation',
      method: 'POST',
      endpoint: '/api/segment/refresh',
      description: 'Recalculate all customer segments',
      icon: '🔄',
      action: async () => {
        return await fetch(`${API_CONFIG.agent1.url}/api/segment/refresh`, {
          method: 'POST',
        }).then((r) => r.json());
      },
    },
    {
      id: 'analyze-customers',
      label: 'Analyze Customers (AI)',
      method: 'POST',
      endpoint: '/api/segment/analyze',
      description: 'AI-powered customer behavior analysis',
      icon: '🤖',
      action: async () => {
        return await fetch(`${API_CONFIG.agent1.url}/api/segment/analyze`, {
          method: 'POST',
        }).then((r) => r.json());
      },
    },
  ];

  // Agent 2 - RAG API Endpoints
  const agent2Endpoints: ApiEndpoint[] = [
    {
      id: 'rag-health',
      label: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      description: 'Check if RAG API is running',
      icon: '🏥',
      action: async () => {
        return await checkRAGHealth();
      },
    },
    {
      id: 'search-content',
      label: 'Search Content',
      method: 'POST',
      endpoint: '/search',
      description: 'Search relevant marketing content',
      icon: '🔍',
      params: [
        {
          name: 'query',
          type: 'string',
          required: true,
          default: 'enterprise solutions',
        },
        {
          name: 'top_k',
          type: 'number',
          required: false,
          default: 5,
        },
      ],
      action: async (params?: any) => {
        const query = params?.query || 'enterprise solutions';
        const topK = params?.top_k || 5;
        return await searchContent(query, topK);
      },
    },
    {
      id: 'get-all-content',
      label: 'Get All Content',
      method: 'GET',
      endpoint: '/content',
      description: 'Retrieve all indexed content',
      icon: '📚',
      action: async () => {
        return await fetch(`${API_CONFIG.agent2.url}/content`).then((r) => r.json());
      },
    },
    {
      id: 'rag-stats',
      label: 'Get Statistics',
      method: 'GET',
      endpoint: '/stats',
      description: 'RAG system statistics and metrics',
      icon: '📊',
      action: async () => {
        return await getRAGStats();
      },
    },
  ];

  // Agent 3 - Message Generation Endpoints
  const agent3Endpoints: ApiEndpoint[] = [
    {
      id: 'gen-health',
      label: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      description: 'Check if Message Generation Agent is running',
      icon: '🏥',
      action: async () => {
        return await fetch(`${API_CONFIG.agent3.url}/health`).then((r) => r.json());
      },
    },
    {
      id: 'generate-variants',
      label: 'Generate Message Variants',
      method: 'POST',
      endpoint: '/api/generate-variants',
      description: 'Generate 3 personalized message variants per customer',
      icon: '✍️',
      params: [
        {
          name: 'segment_id',
          type: 'string',
          required: true,
          default: 'seg_001',
        },
        {
          name: 'content_id',
          type: 'string',
          required: true,
          default: 'content_001',
        },
      ],
      action: async (params?: any) => {
        const segmentId = params?.segment_id || 'seg_001';
        const contentId = params?.content_id || 'content_001';
        return await fetch(`${API_CONFIG.agent3.url}/api/generate-variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ segment_id: segmentId, content_id: contentId }),
        }).then((r) => r.json());
      },
    },
  ];

  // Agent 4 - Compliance API Endpoints
  const agent4Endpoints: ApiEndpoint[] = [
    {
      id: 'compliance-health',
      label: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      description: 'Check if Compliance Service is running and healthy',
      icon: '🏥',
      action: async () => {
        return await fetch(`${API_CONFIG.agent4.url}/health`).then((r) => r.json());
      },
    },
    {
      id: 'compliance-content-safety-health',
      label: 'Content Safety Status',
      method: 'GET',
      endpoint: '/api/content-safety/health',
      description: 'Get Azure Content Safety API status',
      icon: '🔒',
      action: async () => {
        return await fetch(`${API_CONFIG.agent4.url}/api/content-safety/health`).then((r) => r.json());
      },
    },
    {
      id: 'compliance-analyze-single',
      label: 'Analyze Single Message',
      method: 'POST',
      endpoint: '/api/content-safety/analyze',
      description: 'Analyze a message for compliance (Hate, Sexual, Violence, Self-harm)',
      icon: '🔍',
      params: [
        {
          name: 'messages',
          type: 'text',
          required: true,
          default: 'This is a great product for enterprise customers',
        },
      ],
      action: async (params?: any) => {
        const messageText = params?.messages || 'This is a great product for enterprise customers';
        return await fetch(`${API_CONFIG.agent4.url}/api/content-safety/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [messageText] }),
        }).then((r) => r.json());
      },
    },
    {
      id: 'compliance-analyze-batch',
      label: 'Analyze Batch Messages',
      method: 'POST',
      endpoint: '/api/content-safety/analyze',
      description: 'Analyze multiple messages for responsible AI compliance',
      icon: '📊',
      action: async () => {
        const testMessages = [
          'Check out our enterprise solution - perfect for large organizations',
          'Limited time offer for Fortune 500 companies',
          'Join thousands of happy customers using our platform',
          'Enterprise-grade security and compliance built-in',
          'Drive growth with our AI-powered marketing tools',
        ];
        return await fetch(`${API_CONFIG.agent4.url}/api/content-safety/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: testMessages }),
        }).then((r) => r.json());
      },
    },
    {
      id: 'compliance-validate',
      label: 'Validate Messages (Full Check)',
      method: 'POST',
      endpoint: '/api/validate',
      description: 'Comprehensive message validation with transparency report',
      icon: '✅',
      action: async () => {
        const testMessages = [
          'Premium service for your business needs',
          'Increase revenue with our solutions',
          'Enterprise customers trust us for compliance',
          'Safe and secure platform for all sizes',
          'Proven results for major corporations',
        ];
        return await fetch(`${API_CONFIG.agent4.url}/api/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: testMessages }),
        }).then((r) => r.json());
      },
    },
    {
      id: 'compliance-stats',
      label: 'Get Compliance Stats',
      method: 'GET',
      endpoint: '/api/stats',
      description: 'Responsible AI Transparency - Messages Approved vs Rejected + Reasons',
      icon: '📈',
      action: async () => {
        return await fetch(`${API_CONFIG.agent4.url}/api/stats`).then((r) => r.json());
      },
    },
  ];

  // Agent 5 - Campaign Executor Endpoints
  const agent5Endpoints: ApiEndpoint[] = [
    {
      id: 'exec-health',
      label: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      description: 'Check if Campaign Executor Agent is running',
      icon: '🏥',
      action: async () => {
        return await fetch(`${API_CONFIG.agent5.url}/health`).then((r) => r.json());
      },
    },
    {
      id: 'send-campaign',
      label: 'Send Campaign Messages',
      method: 'POST',
      endpoint: '/api/send',
      description: 'Send approved messages to customers',
      icon: '📧',
      params: [
        {
          name: 'campaign_id',
          type: 'string',
          required: true,
          default: 'camp_001',
        },
        {
          name: 'batch_size',
          type: 'number',
          required: false,
          default: 100,
        },
      ],
      action: async (params?: any) => {
        const campaignId = params?.campaign_id || 'camp_001';
        const batchSize = params?.batch_size || 100;
        return await fetch(`${API_CONFIG.agent5.url}/api/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaign_id: campaignId, batch_size: batchSize }),
        }).then((r) => r.json());
      },
    },
    {
      id: 'campaign-status',
      label: 'Get Campaign Status',
      method: 'GET',
      endpoint: '/api/campaign-status',
      description: 'Check status of active campaigns',
      icon: '📊',
      params: [
        {
          name: 'campaign_id',
          type: 'string',
          required: true,
          default: 'camp_001',
        },
      ],
      action: async (params?: any) => {
        const campaignId = params?.campaign_id || 'camp_001';
        return await fetch(`${API_CONFIG.agent5.url}/api/campaign-status?campaign_id=${campaignId}`).then((r) =>
          r.json()
        );
      },
    },
  ];

  const agentMap: Record<string, { endpoints: ApiEndpoint[]; config: any }> = {
    agent1: { endpoints: agent1Endpoints, config: API_CONFIG.agent1 },
    agent2: { endpoints: agent2Endpoints, config: API_CONFIG.agent2 },
    agent3: { endpoints: agent3Endpoints, config: API_CONFIG.agent3 },
    agent4: { endpoints: agent4Endpoints, config: API_CONFIG.agent4 },
    agent5: { endpoints: agent5Endpoints, config: API_CONFIG.agent5 },
  };

  const currentAgent = agentMap[selectedAgent];

  const handleExecuteEndpoint = async (endpoint: ApiEndpoint) => {
    try {
      setLoading(true);
      const params = endpoint.params
        ? Object.fromEntries(
            endpoint.params.map((p) => [
              p.name,
              inputParams[`${selectedAgent}-${p.name}`] ?? p.default ?? '',
            ])
          )
        : undefined;

      const result = await endpoint.action(params);
      addResult(endpoint.endpoint, endpoint.method, 'success', result, undefined, 200);
      
      // If this is an Agent 4 analyze endpoint, capture the chart data
      if (selectedAgent === 'agent4' && (endpoint.id === 'compliance-analyze-single' || endpoint.id === 'compliance-analyze-batch') && result?.results) {
        setComplianceChartData(result.results);
      }
    } catch (error: any) {
      addResult(endpoint.endpoint, endpoint.method, 'error', undefined, error.message, 500);
    } finally {
      setLoading(false);
    }
  };

  const agents = [
    { key: 'agent1', name: API_CONFIG.agent1.name, icon: API_CONFIG.agent1.icon, color: 'blue' },
    { key: 'agent2', name: API_CONFIG.agent2.name, icon: API_CONFIG.agent2.icon, color: 'green' },
    { key: 'agent3', name: API_CONFIG.agent3.name, icon: API_CONFIG.agent3.icon, color: 'purple' },
    { key: 'agent4', name: API_CONFIG.agent4.name, icon: API_CONFIG.agent4.icon, color: 'red' },
    { key: 'agent5', name: API_CONFIG.agent5.name, icon: API_CONFIG.agent5.icon, color: 'orange' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50 hover:border-blue-600',
    green: 'border-green-500 bg-green-50 hover:border-green-600',
    purple: 'border-purple-500 bg-purple-50 hover:border-purple-600',
    red: 'border-red-500 bg-red-50 hover:border-red-600',
    orange: 'border-orange-500 bg-orange-50 hover:border-orange-600',
  };

  const getColorClass = (color: string) => {
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 API Explorer</h1>
        <p className="text-gray-600">Interactive Swagger-like interface for all agents</p>
      </div>

      {/* Agent Selector - Horizontal Scroll */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 pb-2 min-w-max">
          {agents.map((agent) => (
            <button
              key={agent.key}
              onClick={() => {
                setSelectedAgent(agent.key as any);
                setInputParams({});
              }}
              className={`shrink-0 p-4 rounded-lg border-2 transition-all w-56 ${
                selectedAgent === agent.key
                  ? `border-current ${getColorClass(agent.color)} shadow-lg`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">{agent.icon}</div>
              <div className="font-bold text-lg text-left">{agent.name}</div>
              <div className="text-xs text-gray-600 text-left mt-1">
                {agentMap[agent.key as any].endpoints.length} endpoints
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Info */}
      <div className="bg-linear-to-r from-slate-50 to-slate-100 p-6 rounded-lg border border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-4xl">{currentAgent.config.icon}</span>
              {currentAgent.config.name}
            </h2>
            <p className="text-gray-700 mb-3">{currentAgent.config.description}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>
                <strong>URL:</strong> {currentAgent.config.url}
              </span>
              <span>
                <strong>Endpoints:</strong> {currentAgent.endpoints.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Endpoints</h3>
        {currentAgent.endpoints.map((endpoint, idx) => (
          <div key={endpoint.id} className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
            {/* Endpoint Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{endpoint.icon}</span>
                  <span className={`px-3 py-1 rounded text-white text-sm font-bold ${
                    endpoint.method === 'GET' ? 'bg-blue-500' :
                    endpoint.method === 'POST' ? 'bg-green-500' :
                    endpoint.method === 'PUT' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                    {endpoint.endpoint}
                  </code>
                </div>
                <p className="text-gray-600 text-sm">{endpoint.description}</p>
              </div>
            </div>

            {/* Parameters */}
            {endpoint.params && endpoint.params.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="font-semibold text-sm text-gray-900 mb-3">Parameters</div>
                <div className="space-y-3">
                  {endpoint.params.map((param) => (
                    <div key={param.name}>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                        {param.name}
                        {param.required && <span className="text-red-500">*</span>}
                        <span className="text-xs bg-gray-300 px-2 py-0.5 rounded text-gray-700">{param.type}</span>
                      </label>
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        placeholder={String(param.default)}
                        value={inputParams[`${selectedAgent}-${param.name}`] ?? ''}
                        onChange={(e) =>
                          setInputParams((prev) => ({
                            ...prev,
                            [`${selectedAgent}-${param.name}`]: e.target.value,
                          }))
                        }
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={() => handleExecuteEndpoint(endpoint)}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded transition-colors"
            >
              {loading ? '⏳ Loading...' : '▶️ Execute'}
            </button>
          </div>
        ))}
      </div>

      {/* Agent 4 Compliance Results Chart */}
      {selectedAgent === 'agent4' && complianceChartData && (
        <ComplianceResultsChart data={complianceChartData} isLoading={loading} />
      )}

      {/* Results Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          📊 Response History ({results.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <span className="text-3xl block mb-2">📭</span>
              Execute an endpoint to see results
            </div>
          ) : (
            results.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 transition-all ${
                  result.status === 'success'
                    ? 'border-l-green-500 bg-green-50 border border-green-200'
                    : 'border-l-red-500 bg-red-50 border border-red-200'
                }`}
              >
                <div
                  onClick={() => setExpandedResult(expandedResult === idx ? null : idx)}
                  className="cursor-pointer flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        result.method === 'GET' ? 'bg-blue-200 text-blue-800' :
                        result.method === 'POST' ? 'bg-green-200 text-green-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {result.method}
                      </span>
                      <code className="text-xs font-mono text-gray-700">{result.endpoint}</code>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        result.status === 'success'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {result.status === 'success' ? '✓ SUCCESS' : '✗ ERROR'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()} {result.statusCode && `(${result.statusCode})`}
                    </div>
                  </div>
                  <span className="text-gray-400 ml-2">{expandedResult === idx ? '▼' : '▶'}</span>
                </div>

                {expandedResult === idx && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    {result.error && (
                      <div className="text-sm text-red-700 mb-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    {result.data && (
                      <div className="bg-white rounded p-3 text-xs font-mono text-gray-700 max-h-48 overflow-y-auto border border-gray-200">
                        {typeof result.data === 'string'
                          ? result.data
                          : JSON.stringify(result.data, null, 2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
