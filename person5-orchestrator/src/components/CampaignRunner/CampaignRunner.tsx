'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CampaignRequest, CampaignSummary } from '@/types'

interface CampaignRunnerProps {
  onCampaignComplete: (summary: CampaignSummary) => void
}

export function CampaignRunner({ onCampaignComplete }: CampaignRunnerProps) {
  const [loading, setLoading] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [customerIds, setCustomerIds] = useState('CUST001, CUST002, CUST003, CUST004, CUST005')

  const handleRunCampaign = async () => {
    setLoading(true)
    
    try {
      const request: CampaignRequest = {
        campaignName: campaignName || 'Test Campaign',
        description: 'Orchestrated marketing campaign',
        customerIds: customerIds.split(',').map(id => id.trim()).filter(Boolean),
      }

      const response = await fetch('/api/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error('Campaign execution failed')
      }

      const result = await response.json()
      onCampaignComplete(result.data)
    } catch (error) {
      console.error('Error running campaign:', error)
      alert('Failed to run campaign. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Runner</CardTitle>
        <CardDescription>
          Execute a marketing campaign across all services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="campaign-name" className="text-sm font-medium">
            Campaign Name
          </label>
          <input
            id="campaign-name"
            type="text"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Spring Sale 2025"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="customer-ids" className="text-sm font-medium">
            Customer IDs (comma-separated)
          </label>
          <textarea
            id="customer-ids"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
            placeholder="CUST001, CUST002, CUST003"
            value={customerIds}
            onChange={(e) => setCustomerIds(e.target.value)}
          />
        </div>

        <Button
          onClick={handleRunCampaign}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Running Campaign...' : 'Run Campaign'}
        </Button>
      </CardContent>
    </Card>
  )
}
