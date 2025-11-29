'use client';

import { useState } from 'react';
import { API_CONFIG } from '@/lib/api/config';
import {
  getSegments,
  getCustomers,
  calculateEngagementScores,
  refreshSegmentation,
  generateMessage,
  analyzeCustomers,
  checkSegmentationHealth,
} from '@/lib/api/segmentation';
import {
  searchContent,
  getRAGStats,
  checkRAGHealth,
} from '@/lib/api/rag';

interface ApiResult {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp: number;
}

export default function AgentDashboard() {
  const [results, setResults] = useState<ApiResult[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<'agent1' | 'agent2'>('agent1');
  const [loading, setLoading] = useState(false);

  const addResult = (endpoint: string, status: 'success' | 'error', data?: any, error?: string) => {
    setResults((prev) => [
      {
        endpoint,
        status,
        data,
        error,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  // Agent 1 - Segmentation API
  const agent1Actions = [
    {
      label: 'Health Check',
      icon: '🏥',
      action: async () => {
        try {
          setLoading(true);
          const data = await checkSegmentationHealth();
          addResult('GET /health', 'success', data);
        } catch (error: any) {
          addResult('GET /health', 'error', undefined, error.message);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      label: 'Get All Segments',
      icon: '👥',
      action: async () => {
        try {
          setLoading(true);
          const data = await getSegments();
          addResult('GET /api/segments', 'success', data);
        } catch (error: any) {
          addResult('GET /api/segments', 'error', undefined, error.message);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      label: 'Get All Customers',
      icon: '📋',
      action: async () => {
        try {
          setLoading(true);
          const data = await getCustomers(20, 0);
          addResult('GET /api/customers', 'success', data);
        } catch (error: any) {
          addResult('GET /api/customers', 'error', undefined, error.message);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      label: 'Calculate Engagement',
      icon: '⚡',
      action: async () => {
        try {
          setLoading(true);
          const data = await calculateEngagementScores();
          addResult('POST /api/segment/calculate-engagement', 'success', data);
        } catch (error: any) {
          addResult('POST /api/segment/calculate-engagement', 'error', undefined, error.message);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      label: 'Refresh Segmentation',
      icon: '🔄',
      action: async () => {
        try {
          setLoading(true);
          const data = await refreshSegmentation();
          addResult('POST /api/segment/refresh', 'success', data);
        } catch (error: any) {
          addResult('POST /api/segment/refresh', 'error', undefined, error.message);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      label: 'Analyze Customers (AI)',
      icon: '🤖',
      action: async () => {
        try {
          setLoading(true);
          const data = await analyzeCustomers();
          addResult('POST /api/segment/analyze', 'success', data);
        } catch (error: any) {
          addResult('POST /api/segment/analyze', 'error', undefined, error.message);
        } finally {
          setLoading(false);
        }
      },
    },
  ];

  // Agent 2 - RAG API
  const agent2Actions = [
    {
      label: 'Health Check',
      icon: '🏥',
      action: async () => {
        try {
          setLoading(true);
          const data = await checkRAGHealth();
          addResult('GET /health', 'success', data);
        } catch (error: any) {
          addResult('GET /health', 'error', undefined, error.message);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      label: 'Get Statistics',
      icon: '📊',
      action: async () => {
        try {
          setLoading(true);
          const data = await getRAGStats();
          addResult('GET /stats', 'success', data);
        } catch (error: any) {
          addResult('GET /stats', 'error', undefined, error.message);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      label: 'Search Content',
      icon: '🔍',
      action: async () => {
        try {
          setLoading(true);
          const data = await searchContent('enterprise solutions', 5);
          addResult('POST /search', 'success', data);
        } catch (error: any) {
          addResult('POST /search', 'error', undefined, error.message);
        } finally {
          setLoading(false);
        }
      },
    },
  ];

  const currentActions = selectedAgent === 'agent1' ? agent1Actions : agent2Actions;
  const currentAgent = selectedAgent === 'agent1' ? API_CONFIG.agent1 : API_CONFIG.agent2;

  return (
    <div className="space-y-6">
      {/* Agent Selector */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedAgent('agent1')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            selectedAgent === 'agent1'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl">{API_CONFIG.agent1.icon}</div>
          <div className="font-bold text-lg mt-2">{API_CONFIG.agent1.name}</div>
          <div className="text-sm text-gray-600">{API_CONFIG.agent1.url}</div>
        </button>

        <button
          onClick={() => setSelectedAgent('agent2')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            selectedAgent === 'agent2'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl">{API_CONFIG.agent2.icon}</div>
          <div className="font-bold text-lg mt-2">{API_CONFIG.agent2.name}</div>
          <div className="text-sm text-gray-600">{API_CONFIG.agent2.url}</div>
        </button>
      </div>

      {/* API Description */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2">{currentAgent.name}</h3>
        <p className="text-gray-700">{currentAgent.description}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {currentActions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.action}
            disabled={loading}
            className={`p-3 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-2 ${
              loading
                ? 'opacity-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Results Display */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Click an action button to see results
          </div>
        ) : (
          results.map((result, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${
                result.status === 'success'
                  ? 'border-l-green-500 bg-green-50'
                  : 'border-l-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-sm font-bold text-gray-700">
                    {result.endpoint}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    result.status === 'success'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  {result.status.toUpperCase()}
                </span>
              </div>

              {result.error && (
                <div className="mt-2 text-sm text-red-700">
                  <strong>Error:</strong> {result.error}
                </div>
              )}

              {result.data && (
                <div className="mt-2 bg-white rounded p-2 text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
                  {typeof result.data === 'string'
                    ? result.data
                    : JSON.stringify(result.data, null, 2).substring(0, 500) +
                      (JSON.stringify(result.data, null, 2).length > 500 ? '...' : '')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
