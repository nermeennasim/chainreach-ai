'use client'

import { useState } from 'react'
import { CampaignRunner } from '@/components/CampaignRunner/CampaignRunner'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import type { CampaignSummary } from '@/types'

export default function Home() {
  const [campaignSummary, setCampaignSummary] = useState<CampaignSummary | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Person 5 Orchestrator</h1>
          <p className="text-lg text-muted-foreground">
            AI Marketing Campaign Orchestration Platform
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Integrating: Segmentation → Content → Generation → Compliance
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Campaign Runner */}
          <div className="lg:col-span-1">
            <CampaignRunner onCampaignComplete={setCampaignSummary} />
          </div>

          {/* Dashboard */}
          <div className="lg:col-span-2">
            <Dashboard summary={campaignSummary} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 grid gap-4 md:grid-cols-4 text-sm">
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
            <div className="font-semibold mb-1">📊 Person 1</div>
            <div className="text-muted-foreground">Segmentation</div>
            <div className="text-xs mt-1">Port 5001</div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
            <div className="font-semibold mb-1">📝 Person 2</div>
            <div className="text-muted-foreground">Content</div>
            <div className="text-xs mt-1">Port 5002</div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
            <div className="font-semibold mb-1">✨ Person 3</div>
            <div className="text-muted-foreground">Generation</div>
            <div className="text-xs mt-1">Port 5003</div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
            <div className="font-semibold mb-1">✅ Person 4</div>
            <div className="text-muted-foreground">Compliance</div>
            <div className="text-xs mt-1">Port 5004</div>
          </div>
        </div>
      </div>
    </main>
  )
}

