'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AgentStatusGrid } from '@/components/Dashboard/AgentStatusGrid';
import { LiveMetricsCounter } from '@/components/Dashboard/LiveMetricsCounter';
import { CampaignFlowVisualizer } from '@/components/Dashboard/CampaignFlowVisualizer';
import { RunCampaignButton } from '@/components/Dashboard/RunCampaignButton';
import { PerformanceCharts } from '@/components/Dashboard/PerformanceCharts';
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo_wo_bg.png" 
                alt="ChainReach AI Logo" 
                width={50} 
                height={50}
                className="object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ChainReach AI Dashboard
                </h1>
                <p className="text-gray-700 mt-1 font-medium">Multi-Agent Marketing Orchestration Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300">
                  ← Back to Home
                </button>
              </Link>
              <Link href="/campaign">
                <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors">
                  Campaign Runner →
                </button>
              </Link>
            </div>
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-gray-700 font-medium">ChainReach AI - Built for Hackathon 2025</p>
          <p className="mt-1 text-gray-600 text-sm">Multi-Agent Marketing Orchestration Platform</p>
        </div>
      </footer>
    </div>
  );
}
