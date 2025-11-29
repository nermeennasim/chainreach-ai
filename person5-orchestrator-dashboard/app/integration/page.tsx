'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RagSegmentationIntegration from '@/components/integration/RagSegmentationDashboard';

export default function IntegrationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-gradient text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white hover:text-cyan-primary mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">RAG + Segmentation Integration</h1>
          <p className="text-xl text-gray-200">
            Seamless workflow connecting content retrieval and customer segmentation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Integration Info */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-semibold text-navy-primary mb-2">Agent 1</h3>
            <p className="text-sm text-gray-600">
              Segmentation Agent fetches customer segments
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">➡️</div>
            <h3 className="font-semibold text-navy-primary mb-2">Integration</h3>
            <p className="text-sm text-gray-600">
              Orchestrator routes data between services
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">✨</div>
            <h3 className="font-semibold text-navy-primary mb-2">Agent 2</h3>
            <p className="text-sm text-gray-600">
              RAG API generates segment-specific content
            </p>
          </div>
        </div>

        {/* Main Integration Component */}
        <RagSegmentationIntegration />

        {/* API Endpoints Documentation */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-navy-primary mb-4">API Endpoints</h3>
          
          <div className="space-y-6">
            {/* POST Endpoint */}
            <div>
              <div className="font-mono text-sm font-semibold text-green-600 mb-2">
                POST /api/integration/rag-segmentation
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Execute the complete workflow: fetch segments and generate content
              </p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-xs font-mono">
                <div>{'{'}</div>
                <div className="ml-4">
                  "segmentationApiUrl": "http://localhost:3001",
                </div>
                <div className="ml-4">
                  "ragApiUrl": "http://localhost:8000",
                </div>
                <div className="ml-4">
                  "generateContent": true
                </div>
                <div>{'}'}</div>
              </div>
            </div>

            {/* GET Endpoint */}
            <div>
              <div className="font-mono text-sm font-semibold text-blue-600 mb-2">
                GET /api/integration/rag-segmentation
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Check health status of both services
              </p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-xs font-mono">
                Query Parameters (optional):
                <div className="ml-4 mt-2">
                  <div>segmentationUrl=http://localhost:3001</div>
                  <div>ragUrl=http://localhost:8000</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Configuration */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Configuration</h3>
          <p className="text-sm text-blue-800 mb-4">
            Set these environment variables in your .env.local file:
          </p>
          <div className="bg-white p-4 rounded border border-blue-200 font-mono text-xs space-y-1">
            <div>SEGMENTATION_API_URL=http://localhost:3001</div>
            <div>RAG_API_URL=http://localhost:8000</div>
          </div>
        </div>
      </div>
    </div>
  );
}
