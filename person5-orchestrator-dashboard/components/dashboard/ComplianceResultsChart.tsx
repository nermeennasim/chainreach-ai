'use client';

import React from 'react';

interface ComplianceResult {
  id: number;
  text: string;
  approved: boolean;
  reason: string;
  confidence: number;
  categories: {
    hate: number;
    sexual: number;
    violence: number;
    self_harm: number;
  };
}

interface ComplianceResultsChartProps {
  data: ComplianceResult[] | null;
  isLoading?: boolean;
}

export default function ComplianceResultsChart({ data, isLoading }: ComplianceResultsChartProps) {
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Analyzing messages...</p>
      </div>
    );
  }

  if (!data || !Array.isArray(data)) {
    return null;
  }

  const stats = {
    total: data.length,
    approved: data.filter((r) => r.approved).length,
    rejected: data.filter((r) => !r.approved).length,
    avgConfidence: data.length > 0 ? (data.reduce((sum, r) => sum + r.confidence, 0) / data.length * 100).toFixed(1) : '0',
  };

  // Calculate category violations
  const categoryStats = {
    hate: data.filter((r) => r.categories.hate > 0).length,
    sexual: data.filter((r) => r.categories.sexual > 0).length,
    violence: data.filter((r) => r.categories.violence > 0).length,
    self_harm: data.filter((r) => r.categories.self_harm > 0).length,
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-semibold mb-1">Total Messages</div>
          <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-semibold mb-1">Approved</div>
          <div className="text-3xl font-bold text-green-900">{stats.approved}</div>
          <div className="text-xs text-green-700 mt-1">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-semibold mb-1">Rejected</div>
          <div className="text-3xl font-bold text-red-900">{stats.rejected}</div>
          <div className="text-xs text-red-700 mt-1">{stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-semibold mb-1">Avg Confidence</div>
          <div className="text-3xl font-bold text-purple-900">{stats.avgConfidence}%</div>
        </div>
      </div>

      {/* Category Violations Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          📊 Content Category Violations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">😠</span>
                <span className="font-semibold text-gray-800">Hate Speech</span>
              </div>
              <span className="text-lg font-bold text-red-600">{categoryStats.hate}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-red-500 h-full transition-all duration-300"
                style={{
                  width: `${data.length > 0 ? (categoryStats.hate / data.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {data.length > 0 ? Math.round((categoryStats.hate / data.length) * 100) : 0}% of messages
            </div>
          </div>

          {/* Sexual */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔞</span>
                <span className="font-semibold text-gray-800">Sexual Content</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{categoryStats.sexual}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-orange-500 h-full transition-all duration-300"
                style={{
                  width: `${data.length > 0 ? (categoryStats.sexual / data.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {data.length > 0 ? Math.round((categoryStats.sexual / data.length) * 100) : 0}% of messages
            </div>
          </div>

          {/* Violence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">💥</span>
                <span className="font-semibold text-gray-800">Violence</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{categoryStats.violence}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-yellow-500 h-full transition-all duration-300"
                style={{
                  width: `${data.length > 0 ? (categoryStats.violence / data.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {data.length > 0 ? Math.round((categoryStats.violence / data.length) * 100) : 0}% of messages
            </div>
          </div>

          {/* Self Harm */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span className="font-semibold text-gray-800">Self-Harm</span>
              </div>
              <span className="text-lg font-bold text-pink-600">{categoryStats.self_harm}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-pink-500 h-full transition-all duration-300"
                style={{
                  width: `${data.length > 0 ? (categoryStats.self_harm / data.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {data.length > 0 ? Math.round((categoryStats.self_harm / data.length) * 100) : 0}% of messages
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 overflow-x-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          📋 Detailed Message Analysis
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-3 font-bold text-gray-700">#</th>
              <th className="text-left py-3 px-3 font-bold text-gray-700">Message</th>
              <th className="text-center py-3 px-3 font-bold text-gray-700">Status</th>
              <th className="text-center py-3 px-3 font-bold text-gray-700">Confidence</th>
              <th className="text-left py-3 px-3 font-bold text-gray-700">Categories</th>
              <th className="text-left py-3 px-3 font-bold text-gray-700">Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.map((result, idx) => (
              <tr key={idx} className={`border-b border-gray-200 ${result.approved ? 'bg-green-50' : 'bg-red-50'}`}>
                <td className="py-3 px-3 font-semibold text-gray-700">{result.id + 1}</td>
                <td className="py-3 px-3 text-gray-800 max-w-xs truncate" title={result.text}>
                  {result.text}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    result.approved
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {result.approved ? '✓ APPROVED' : '✗ REJECTED'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-bold text-gray-800">{(result.confidence * 100).toFixed(0)}%</span>
                    <div className="w-16 bg-gray-200 rounded h-2">
                      <div
                        className={`h-full rounded ${result.confidence > 0.8 ? 'bg-green-500' : result.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-1 flex-wrap">
                    {result.categories.hate > 0 && (
                      <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded">Hate: {result.categories.hate}</span>
                    )}
                    {result.categories.sexual > 0 && (
                      <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded">Sexual: {result.categories.sexual}</span>
                    )}
                    {result.categories.violence > 0 && (
                      <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">Violence: {result.categories.violence}</span>
                    )}
                    {result.categories.self_harm > 0 && (
                      <span className="bg-pink-200 text-pink-800 text-xs px-2 py-1 rounded">SelfHarm: {result.categories.self_harm}</span>
                    )}
                    {Object.values(result.categories).every((v) => v === 0) && (
                      <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">No violations</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 text-gray-700 text-xs">{result.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
