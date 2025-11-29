'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ApiExplorer from '@/components/dashboard/ApiExplorer';

/**
 * ChainReach AI - Dashboard Page
 * 
 * Based on master documentation wireframes:
 * - Stats cards (Total Campaigns, Customers, Approval Rate, Messages Processed)
 * - Quick Actions (Launch Demo, Validate Messages)
 * - Recent Campaigns
 * - System Health (Agent Status)
 * - API Explorer (Interactive Swagger-like interface)
 */

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'api-explorer'>('overview');
  // Sample data
  const stats = [
    { title: 'Total Campaigns', value: '12', icon: '📊', color: 'text-blue-600' },
    { title: 'Total Customers', value: '5,000', icon: '👥', color: 'text-purple-600' },
    { title: 'Approval Rate', value: '87.3%', icon: '🛡️', color: 'text-green-600' },
    { title: 'Messages Processed', value: '45,000', icon: '📨', color: 'text-cyan-600' },
  ];

  const recentCampaigns = [
    { id: 'CAMP-001', name: 'Q4 Product Launch', customers: 5000, approval: 87.3, date: 'Nov 20' },
    { id: 'CAMP-002', name: 'Holiday Special', customers: 3500, approval: 92.1, date: 'Nov 18' },
  ];

  const agents = [
    { name: 'Agent 1', role: 'Segment', status: 'online', emoji: '👥' },
    { name: 'Agent 2', role: 'Content', status: 'online', emoji: '📚' },
    { name: 'Agent 3', role: 'Generate', status: 'online', emoji: '✍️' },
    { name: 'Agent 4', role: 'Comply', status: 'online', emoji: '🛡️' },
    { name: 'Agent 5', role: 'Send', status: 'online', emoji: '🎯' },
  ];

  return (
    <>
     
      <main className="min-h-screen bg-gray-50">
        {/* Header with Tabs */}
        <section className="bg-white border-b border-gray-200 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-navy-primary mb-2">Campaign Dashboard</h1>
                <p className="text-gray-600 text-lg">Monitor your campaigns and compliance metrics</p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-gray-300">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-navy-primary text-navy-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                 Overview
              </button>
              <button
                onClick={() => setActiveTab('api-explorer')}
                className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'api-explorer'
                    ? 'border-navy-primary text-navy-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Chain Reach AI API's Explorer GUI (just like your own swagger)
              </button>
            </div>
          </div>
        </section>

        {/* API Explorer Tab */}
        {activeTab === 'api-explorer' && (
          <section className="py-8 px-6 max-w-7xl mx-auto">
            <ApiExplorer />
          </section>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
        {/* Header */}
        <section className="bg-white border-b border-gray-200 py-0 px-6">
          <div className="max-w-7xl mx-auto">
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.title} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl">{stat.icon}</span>
                      <CardTitle className={`text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-primary mb-6">QUICK ACTIONS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-cyan-primary hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="text-5xl mb-4">🚀</div>
                  <CardTitle className="text-xl">Launch Demo Campaign</CardTitle>
                  <CardDescription>
                    Full orchestration with 5,000 sample customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/campaign/demo">
                    <Button className="w-full bg-cyan-primary text-navy-primary hover:bg-cyan-secondary" size="lg">
                      Start Demo Campaign →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-navy-primary hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="text-5xl mb-4">🛡️</div>
                  <CardTitle className="text-xl">Validate Messages</CardTitle>
                  <CardDescription>
                    Test compliance for individual messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/campaign/validate">
                    <Button className="w-full bg-navy-primary text-white hover:bg-navy-secondary" size="lg">
                      Validate Messages →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-primary hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="text-5xl mb-4">✨</div>
                  <CardTitle className="text-xl">RAG Integration</CardTitle>
                  <CardDescription>
                    Generate content for customer segments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/integration">
                    <Button className="w-full bg-purple-600 text-white hover:bg-purple-700" size="lg">
                      Explore Integration →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent Campaigns */}
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-primary mb-6">RECENT CAMPAIGNS</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">📊</div>
                          <div>
                            <h3 className="font-bold text-navy-primary text-lg">{campaign.name}</h3>
                            <p className="text-sm text-gray-600">
                              {campaign.id} • {campaign.customers.toLocaleString()} customers
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-600">Approval:</span>
                            <Badge className="bg-success text-white">{campaign.approval}%</Badge>
                          </div>
                          <p className="text-sm text-gray-500">{campaign.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* System Health */}
        <section className="py-8 px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-primary mb-6">SYSTEM HEALTH</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {agents.map((agent) => (
                <Card key={agent.name} className="border-2">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">{agent.emoji}</div>
                    <h4 className="font-bold text-navy-primary text-sm mb-1">{agent.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{agent.role}</p>
                    <Badge className="bg-success text-white text-xs">
                      ● {agent.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
          </>
        )}
      </main>
    </>
  );
}
