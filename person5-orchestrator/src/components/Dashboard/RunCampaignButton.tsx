'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, Loader2, CheckCircle2, XCircle, X } from 'lucide-react';

interface RunCampaignButtonProps {
  onCampaignStart?: () => void;
  onCampaignComplete?: () => void;
}

export function RunCampaignButton({ onCampaignStart, onCampaignComplete }: RunCampaignButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/campaigns/execute-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerCount: 100,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start campaign');
      }

      setExecutionId(data.executionId);
      setIsOpen(true);
      
      if (onCampaignStart) {
        onCampaignStart();
      }

      // Auto-close modal after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);

      // Simulate completion after 50 seconds
      setTimeout(() => {
        if (onCampaignComplete) {
          onCampaignComplete();
        }
      }, 50000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Campaign execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setExecutionId(null);
    setError(null);
  };

  return (
    <>
      {/* Run Campaign Button */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-xl text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Rocket className="h-6 w-6" />
              Run Sample Campaign
            </h2>
            <p className="text-white mb-4">
              Click to see the full pipeline in action with demo data
            </p>
            <Button
              onClick={handleRunCampaign}
              disabled={loading}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Starting Campaign...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 mr-2" />
                  Start Demo Campaign →
                </>
              )}
            </Button>

            {error && (
              <div className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Campaign Stats Preview */}
          <div className="hidden md:grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white/70 text-xs">Customers</div>
              <div className="text-2xl font-bold">100</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white/70 text-xs">Variants</div>
              <div className="text-2xl font-bold">3</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white/70 text-xs">Duration</div>
              <div className="text-2xl font-bold">~50s</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white/70 text-xs">Success</div>
              <div className="text-2xl font-bold">97%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Success Modal - NO RADIX UI DEPENDENCIES */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
                Campaign Started!
              </h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-semibold">✓ Campaign execution started successfully</p>
                <p className="text-green-700 text-sm mt-1">Campaign ID: {executionId?.slice(-12)}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-2">Scroll down to watch:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Campaign Flow Visualizer will light up in real-time</li>
                  <li>• Live Metrics will start incrementing</li>
                  <li>• Progress completes in ~50 seconds</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-gray-600">
                  Processing 100 customers through 4 agents...
                </div>
                <Button onClick={handleClose} variant="outline">
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
