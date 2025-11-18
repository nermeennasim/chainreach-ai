'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Send, Mail, MousePointerClick, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface LiveMetrics {
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  rates: {
    sendRate: number;
    openRate: number;
    clickRate: number;
    revenueRate: number;
  };
  lastUpdated: Date;
}

const metrics = [
  { key: 'sent', label: 'Sent', icon: Send, color: 'text-blue-600', format: (n: number) => n.toLocaleString() },
  { key: 'opened', label: 'Opened', icon: Mail, color: 'text-green-600', format: (n: number) => n.toLocaleString() },
  { key: 'clicked', label: 'Clicked', icon: MousePointerClick, color: 'text-purple-600', format: (n: number) => n.toLocaleString() },
  { key: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-emerald-600', format: (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
];

export function LiveMetricsCounter() {
  const [data, setData] = useState<LiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics/live');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch live metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMetrics();

    // Refresh every 2 seconds
    const interval = setInterval(fetchMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">No live data available</div>
      </Card>
    );
  }

  const getRateDisplay = (rate: number, key: string) => {
    const isRevenue = key === 'revenue';
    const formatted = isRevenue ? `$${(rate / 1000).toFixed(1)}k` : rate.toFixed(0);
    const isPositive = rate > 0;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <>
            <TrendingUp className="h-3 w-3" />
            <span>+{formatted}/min</span>
          </>
        ) : (
          <>
            <TrendingDown className="h-3 w-3" />
            <span>{formatted}/min</span>
          </>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-white to-white">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <h2 className="text-lg font-semibold text-gray-900">LIVE CAMPAIGN METRICS</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const value = data[metric.key as keyof LiveMetrics] as number;
          const rateKey = `${metric.key}Rate` as keyof LiveMetrics['rates'];
          const rate = data.rates[rateKey];

          return (
            <div key={metric.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${metric.color}`} />
                <span className="text-sm font-medium text-gray-600">{metric.label}</span>
              </div>
              
              <div className="text-4xl font-bold text-gray-900">
                {metric.format(value)}
              </div>
              
              {rate !== undefined && getRateDisplay(rate, metric.key)}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-right">
        Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
      </div>
    </Card>
  );
}
