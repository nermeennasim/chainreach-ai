'use client';

import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Comparison data: Before AI Orchestration vs After AI Orchestration
const performanceData = [
  {
    metric: 'Open Rate',
    before: 22,
    after: 48,
    unit: '%'
  },
  {
    metric: 'Click Rate',
    before: 3.2,
    after: 12.5,
    unit: '%'
  },
  {
    metric: 'Conversion',
    before: 1.8,
    after: 8.3,
    unit: '%'
  },
  {
    metric: 'ROI',
    before: 180,
    after: 520,
    unit: '%'
  }
];

const timeSeriesData = [
  { time: '0s', sent: 0, opened: 0, clicked: 0 },
  { time: '10s', sent: 20, opened: 8, clicked: 2 },
  { time: '20s', sent: 40, opened: 18, clicked: 6 },
  { time: '30s', sent: 60, opened: 29, clicked: 12 },
  { time: '40s', sent: 80, opened: 38, clicked: 18 },
  { time: '50s', sent: 100, opened: 48, clicked: 25 },
];

export function PerformanceCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Before/After Comparison Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Comparison: Before vs After AI Orchestration
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value}%`, 
                name === 'before' ? 'Manual Campaigns' : 'AI Orchestrated'
              ]}
            />
            <Legend 
              formatter={(value) => value === 'before' ? 'Manual Campaigns' : 'AI Orchestrated'}
            />
            <Bar dataKey="before" fill="#94a3b8" name="before" radius={[4, 4, 0, 0]} />
            <Bar dataKey="after" fill="#3b82f6" name="after" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-600">Average Before</div>
            <div className="text-2xl font-bold text-gray-700">51.75%</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-blue-600">Average After</div>
            <div className="text-2xl font-bold text-blue-600">147.2%</div>
            <div className="text-green-600 text-xs font-semibold">↑ 184% improvement</div>
          </div>
        </div>
      </Card>

      {/* Real-Time Campaign Flow Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Real-Time Campaign Funnel
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sent" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Messages Sent"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="opened" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Opened"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="clicked" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Clicked"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="bg-blue-50 p-2 rounded text-center">
            <div className="text-blue-600 font-semibold">100</div>
            <div className="text-xs text-gray-600">Sent</div>
          </div>
          <div className="bg-green-50 p-2 rounded text-center">
            <div className="text-green-600 font-semibold">48</div>
            <div className="text-xs text-gray-600">Opened (48%)</div>
          </div>
          <div className="bg-purple-50 p-2 rounded text-center">
            <div className="text-purple-600 font-semibold">25</div>
            <div className="text-xs text-gray-600">Clicked (25%)</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
