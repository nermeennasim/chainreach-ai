'use client';

import { AgentStatusGrid } from '@/components/Dashboard/AgentStatusGrid';
import { LiveMetricsCounter } from '@/components/Dashboard/LiveMetricsCounter';
import { CampaignFlowVisualizer } from '@/components/Dashboard/CampaignFlowVisualizer';
import { RunCampaignButton } from '@/components/Dashboard/RunCampaignButton';
import { PerformanceCharts } from '@/components/Dashboard/PerformanceCharts';
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                🔗 ChainReach AI Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Multi-Agent Marketing Orchestration Platform</p>
            </div>
            <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Run Campaign Section */}
        <section>
          <RunCampaignButton />
        </section>

        {/* Live Metrics */}
        <section>
          <LiveMetricsCounter />
        </section>

        {/* Agent Status Grid */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Health Status</h2>
          <AgentStatusGrid />
        </section>

        {/* Campaign Flow Visualizer */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Execution Flow</h2>
          <CampaignFlowVisualizer />
        </section>

        {/* Performance Charts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Analytics</h2>
          <PerformanceCharts />
        </section>

        {/* Azure Insights Link */}
        <section>
          <a
            href="#"
            className="flex items-center justify-center gap-2 p-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <span className="text-2xl">📊</span>
            <span className="font-semibold">View in Azure Application Insights</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-600 text-sm">
          <p>ChainReach AI - Built for Hackathon 2025 🚀</p>
          <p className="mt-1">Person 5: Orchestrator & Dashboard Lead</p>
        </div>
      </footer>
    </div>
  );
}
