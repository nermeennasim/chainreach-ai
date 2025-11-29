'use client';

import React, { useState, useCallback } from 'react';
import { ArrowRight, Zap, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Segment {
  id: string;
  name: string;
  description: string;
  customerCount: number;
}

interface GeneratedContent {
  title: string;
  content: string;
  content_type: string;
  audience: string;
  campaign: string;
}

interface SegmentWithContent {
  segment: string;
  content: GeneratedContent[];
  generatedAt: string;
}

interface RagSegmentationState {
  loading: boolean;
  error: string | null;
  segments: Segment[];
  content: SegmentWithContent[];
  metrics: {
    totalSegments: number;
    contentGenerated: number;
    contentGenerationRate: number;
    totalContentItems: number;
  };
  status: 'idle' | 'running' | 'success' | 'error';
}

export default function RagSegmentationIntegration() {
  const [state, setState] = useState<RagSegmentationState>({
    loading: false,
    error: null,
    segments: [],
    content: [],
    metrics: {
      totalSegments: 0,
      contentGenerated: 0,
      contentGenerationRate: 0,
      totalContentItems: 0,
    },
    status: 'idle',
  });

  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  // Execute the full workflow
  const executeWorkflow = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      status: 'running',
    }));

    try {
      const response = await fetch('/api/integration/rag-segmentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generateContent: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        loading: false,
        segments: data.segmentation.segments,
        content: data.contentGeneration.content,
        metrics: data.metrics,
        status: 'success',
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
        status: 'error',
      }));
    }
  }, []);

  // Get selected segment content
  const selectedSegmentContent = selectedSegment
    ? state.content.find((c) => c.segment === selectedSegment)?.content || []
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-navy-primary mb-2">RAG + Segmentation Integration</h2>
        <p className="text-gray-600">
          Generate targeted marketing content based on customer segments
        </p>
      </div>

      {/* Error Alert */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Workflow Error</h3>
            <p className="text-sm text-red-800 mt-1">{state.error}</p>
          </div>
        </div>
      )}

      {/* Workflow Execution Card */}
      <Card className="border-cyan-primary bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-navy-primary mb-2">Execute Workflow</h3>
              <p className="text-gray-600 text-sm">
                Fetch segments from Agent 1 and generate content using RAG API
              </p>
            </div>
            <Button
              onClick={executeWorkflow}
              disabled={state.loading}
              className="bg-cyan-primary text-white hover:bg-cyan-600 whitespace-nowrap"
              size="lg"
            >
              {state.loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Start Workflow
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Metrics Cards */}
      {state.status !== 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Segments</div>
            <div className="text-3xl font-bold text-navy-primary">
              {state.metrics.totalSegments}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Content Generated</div>
            <div className="text-3xl font-bold text-cyan-primary">
              {state.metrics.contentGenerated}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Success Rate</div>
            <div className="text-3xl font-bold text-green-600">
              {state.metrics.contentGenerationRate}%
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Content Items</div>
            <div className="text-3xl font-bold text-purple-600">
              {state.metrics.totalContentItems}
            </div>
          </Card>
        </div>
      )}

      {/* Workflow Success Message */}
      {state.status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Workflow Completed Successfully</h3>
            <p className="text-sm text-green-800 mt-1">
              {state.metrics.totalSegments} segments processed with{' '}
              {state.metrics.totalContentItems} content items generated
            </p>
          </div>
        </div>
      )}

      {/* Segments List */}
      {state.segments.length > 0 && (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-navy-primary">Segments ({state.segments.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {state.segments.map((segment) => {
              const segmentContent = state.content.find(
                (c) => c.segment === segment.name
              );
              const isSelected = selectedSegment === segment.name;

              return (
                <button
                  key={segment.id}
                  onClick={() =>
                    setSelectedSegment(isSelected ? null : segment.name)
                  }
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-cyan-primary bg-cyan-50'
                      : 'border-gray-200 hover:border-cyan-primary'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-navy-primary">
                      {segment.name}
                    </h4>
                    {segmentContent && (
                      <Badge className="bg-green-100 text-green-800">
                        {segmentContent.content.length} items
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {segment.customerCount} customers
                    </span>
                    {segmentContent && (
                      <ArrowRight className="h-4 w-4 text-cyan-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Selected Segment Content */}
      {selectedSegmentContent.length > 0 && (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-navy-primary">
              Generated Content - {selectedSegment}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedSegmentContent.length} content items generated for this segment
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {selectedSegmentContent.map((content, idx) => (
              <div key={idx} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-navy-primary mb-1">
                      {content.title}
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-800 capitalize">
                        {content.content_type}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800">
                        {content.audience}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800">
                        {content.campaign}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {content.content}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {state.status === 'idle' && (
        <Card className="text-center p-12">
          <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Ready to Generate Content
          </h3>
          <p className="text-gray-600 mb-6">
            Click "Start Workflow" to fetch segments and generate content
          </p>
        </Card>
      )}

      {/* Loading State */}
      {state.loading && (
        <Card className="text-center p-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-primary mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Processing Workflow
          </h3>
          <p className="text-gray-600">
            Fetching segments and generating content...
          </p>
        </Card>
      )}
    </div>
  );
}
