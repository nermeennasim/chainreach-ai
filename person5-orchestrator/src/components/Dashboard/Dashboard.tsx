'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CampaignSummary } from '@/types'
import { CheckCircle2, XCircle, TrendingUp, Users, Clock } from 'lucide-react'

interface DashboardProps {
  summary: CampaignSummary | null
}

export function Dashboard({ summary }: DashboardProps) {
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Dashboard</CardTitle>
          <CardDescription>
            Run a campaign to see results here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No campaign data available. Run a campaign to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.processedCustomers}</div>
            <p className="text-xs text-muted-foreground">
              of {summary.totalCustomers} requested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Messages
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              {summary.rejectedCount} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Success Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              compliance approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Processing Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.averageProcessingTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Results</CardTitle>
          <CardDescription>
            Detailed breakdown of customer processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Processing Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.results.map((result) => (
                <TableRow key={result.customerId}>
                  <TableCell className="font-medium">
                    {result.customerId}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {result.segment}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {result.assignedVariant}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {result.messagePreview}
                  </TableCell>
                  <TableCell>
                    {result.approved ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <XCircle className="h-4 w-4" />
                        Rejected
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {result.processingTime}ms
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
