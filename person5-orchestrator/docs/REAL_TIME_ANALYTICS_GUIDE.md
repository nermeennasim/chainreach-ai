# 🔄 Real-Time Data Analysis Setup Guide

## Overview

This guide will help you analyze incoming campaign data in real-time using Azure Functions and a database. We'll set up a complete pipeline for monitoring, analyzing, and alerting on your marketing campaigns.

## Architecture Options

### Option 1: Azure Functions + Cosmos DB (Recommended for Hackathon)
**Best for:** Real-time analytics, fast setup, serverless
```
Campaign Data → Next.js API → Cosmos DB → Azure Function (Change Feed) → Analytics Dashboard
```

### Option 2: Azure Functions + Azure SQL Database
**Best for:** Complex queries, relational data
```
Campaign Data → Next.js API → Azure SQL → Azure Function (Polling) → Analytics Dashboard
```

### Option 3: Azure Event Hub + Stream Analytics
**Best for:** High-volume streaming data
```
Campaign Data → Event Hub → Stream Analytics → Power BI / Dashboard
```

---

## 🚀 STEP-BY-STEP: Azure Functions + Cosmos DB

### Step 1: Set Up Azure Cosmos DB

#### 1.1 Create Cosmos DB Account (Azure Portal)
```bash
# Login to Azure
az login

# Create resource group
az group create --name chainreach-rg --location eastus

# Create Cosmos DB account
az cosmosdb create \
  --name chainreach-cosmosdb \
  --resource-group chainreach-rg \
  --kind GlobalDocumentDB \
  --locations regionName=eastus \
  --default-consistency-level Session
```

#### 1.2 Create Database and Container
```bash
# Create database
az cosmosdb sql database create \
  --account-name chainreach-cosmosdb \
  --resource-group chainreach-rg \
  --name CampaignData

# Create container with partition key
az cosmosdb sql container create \
  --account-name chainreach-cosmosdb \
  --resource-group chainreach-rg \
  --database-name CampaignData \
  --name campaigns \
  --partition-key-path "/customerId" \
  --throughput 400
```

#### 1.3 Get Connection String
```bash
az cosmosdb keys list \
  --name chainreach-cosmosdb \
  --resource-group chainreach-rg \
  --type connection-strings
```

### Step 2: Install Azure Cosmos DB SDK

```bash
cd person5-orchestrator
npm install @azure/cosmos
```

### Step 3: Create Database Client

Create `src/lib/cosmos-client.ts`:
```typescript
import { CosmosClient, Database, Container } from '@azure/cosmos';

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;

const client = new CosmosClient({ endpoint, key });

const database: Database = client.database('CampaignData');
const campaignsContainer: Container = database.container('campaigns');
const analyticsContainer: Container = database.container('analytics');

export { client, database, campaignsContainer, analyticsContainer };
```

### Step 4: Update API to Store Data in Cosmos DB

Update `src/app/api/campaign/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { campaignsContainer } from '@/lib/cosmos-client';
import { Orchestrator } from '@/lib/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customers, format } = body;

    const orchestrator = new Orchestrator(false);
    const results = await orchestrator.runCampaign(customers, format);

    // Store each result in Cosmos DB
    for (const result of results.results) {
      const document = {
        id: `${result.customer_id}-${Date.now()}`,
        customerId: result.customer_id,
        customerName: result.customer_name,
        segment: result.segment,
        confidence: result.confidence,
        variant: result.variant,
        format: result.format,
        messagePreview: result.message_preview,
        complianceStatus: result.compliance_status,
        complianceIssues: result.compliance_issues,
        timestamp: new Date().toISOString(),
        campaignId: body.campaignId || `campaign-${Date.now()}`,
        // Analytics fields
        approved: result.compliance_status === 'approved',
        processingTimeMs: result.processingTime || 0,
      };

      await campaignsContainer.items.create(document);
    }

    // Store aggregate metrics
    await campaignsContainer.items.create({
      id: `metrics-${Date.now()}`,
      type: 'metrics',
      timestamp: new Date().toISOString(),
      totalCustomers: results.metrics.total_customers,
      approvedCount: results.metrics.approved_count,
      rejectedCount: results.metrics.rejected_count,
      successRate: results.metrics.success_rate,
      format: format,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Campaign error:', error);
    return NextResponse.json(
      { error: 'Campaign execution failed' },
      { status: 500 }
    );
  }
}
```

### Step 5: Create Azure Function for Real-Time Analysis

#### 5.1 Install Azure Functions Core Tools
```bash
# Windows (PowerShell as Admin)
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Verify installation
func --version
```

#### 5.2 Create Function App
```bash
# Navigate to project root
cd "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai"

# Create new Function App
mkdir azure-functions
cd azure-functions

# Initialize Function App (TypeScript)
func init CampaignAnalytics --typescript

cd CampaignAnalytics
```

#### 5.3 Create Cosmos DB Trigger Function
```bash
func new --name AnalyzeCampaignData --template "CosmosDBTrigger"
```

#### 5.4 Configure Function

Edit `AnalyzeCampaignData/function.json`:
```json
{
  "bindings": [
    {
      "type": "cosmosDBTrigger",
      "name": "documents",
      "direction": "in",
      "connectionStringSetting": "CosmosDBConnection",
      "databaseName": "CampaignData",
      "collectionName": "campaigns",
      "createLeaseCollectionIfNotExists": true,
      "leasesCollectionName": "leases"
    },
    {
      "type": "cosmosDB",
      "name": "outputDocument",
      "direction": "out",
      "connectionStringSetting": "CosmosDBConnection",
      "databaseName": "CampaignData",
      "collectionName": "analytics",
      "createIfNotExists": true,
      "partitionKey": "/analysisType"
    }
  ]
}
```

#### 5.5 Implement Real-Time Analysis Logic

Edit `AnalyzeCampaignData/index.ts`:
```typescript
import { AzureFunction, Context } from "@azure/functions";

interface CampaignDocument {
  id: string;
  customerId: string;
  segment: string;
  confidence: number;
  complianceStatus: string;
  format: string;
  timestamp: string;
  approved: boolean;
}

const cosmosDBTrigger: AzureFunction = async function (
  context: Context,
  documents: CampaignDocument[]
): Promise<void> {
  context.log(`Processing ${documents.length} documents`);

  const analytics = {
    id: `analysis-${Date.now()}`,
    analysisType: 'real-time',
    timestamp: new Date().toISOString(),
    metrics: {
      totalProcessed: documents.length,
      approvedCount: 0,
      rejectedCount: 0,
      segmentBreakdown: {} as Record<string, number>,
      formatBreakdown: {} as Record<string, number>,
      averageConfidence: 0,
      complianceIssues: [] as string[],
    },
    alerts: [] as string[],
  };

  let totalConfidence = 0;

  // Analyze each document
  for (const doc of documents) {
    // Count approvals
    if (doc.approved) {
      analytics.metrics.approvedCount++;
    } else {
      analytics.metrics.rejectedCount++;
    }

    // Track segments
    analytics.metrics.segmentBreakdown[doc.segment] = 
      (analytics.metrics.segmentBreakdown[doc.segment] || 0) + 1;

    // Track formats
    analytics.metrics.formatBreakdown[doc.format] = 
      (analytics.metrics.formatBreakdown[doc.format] || 0) + 1;

    // Calculate average confidence
    totalConfidence += doc.confidence;

    // Check for low confidence (potential alert)
    if (doc.confidence < 0.7) {
      analytics.alerts.push(
        `Low confidence (${doc.confidence.toFixed(2)}) for customer ${doc.customerId}`
      );
    }

    // Check for compliance failures
    if (doc.complianceStatus !== 'approved') {
      analytics.metrics.complianceIssues.push(
        `Customer ${doc.customerId} failed compliance`
      );
    }
  }

  analytics.metrics.averageConfidence = documents.length > 0 ? totalConfidence / documents.length : 0;

  // Generate alerts
  const successRate = 
    (analytics.metrics.approvedCount / documents.length) * 100;

  if (successRate < 75) {
    analytics.alerts.push(
      `⚠️ Low success rate: ${successRate.toFixed(1)}%`
    );
  }

  if (analytics.metrics.averageConfidence < 0.75) {
    analytics.alerts.push(
      `⚠️ Low average confidence: ${analytics.metrics.averageConfidence.toFixed(2)}`
    );
  }

  // Log analytics
  context.log('Real-time Analytics:', JSON.stringify(analytics, null, 2));

  // Store analytics (output binding)
  context.bindings.outputDocument = analytics;

  // Optional: Send alerts to monitoring service
  if (analytics.alerts.length > 0) {
    context.log('🚨 ALERTS:', analytics.alerts);
    // TODO: Send to Azure Monitor, email, Slack, etc.
  }
};

export default cosmosDBTrigger;
```

#### 5.6 Configure Local Settings

Edit `local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "CosmosDBConnection": "AccountEndpoint=https://chainreach-cosmosdb.documents.azure.com:443/;AccountKey=YOUR_KEY_HERE;"
  }
}
```

#### 5.7 Install Dependencies
```bash
npm install
npm install @azure/cosmos
```

#### 5.8 Run Function Locally
```bash
func start
```

### Step 6: Create Real-Time Analytics Dashboard

Create `src/app/analytics/page.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Analytics {
  timestamp: string;
  metrics: {
    totalProcessed: number;
    approvedCount: number;
    rejectedCount: number;
    averageConfidence: number;
    segmentBreakdown: Record<string, number>;
    formatBreakdown: Record<string, number>;
  };
  alerts: string[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/latest');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchAnalytics();

    // Poll every 5 seconds
    const interval = setInterval(fetchAnalytics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>No analytics available</div>;

  const successRate = 
    (analytics.metrics.approvedCount / analytics.metrics.totalProcessed) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">📊 Real-Time Analytics</h1>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">🚨 Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analytics.alerts.map((alert, i) => (
                <li key={i} className="text-sm">{alert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.metrics.totalProcessed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {analytics.metrics.approvedCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{successRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(analytics.metrics.averageConfidence * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analytics.metrics.segmentBreakdown).map(([segment, count]) => (
              <div key={segment} className="flex justify-between items-center">
                <span className="font-medium">{segment}</span>
                <span className="text-2xl">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Format Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Message Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analytics.metrics.formatBreakdown).map(([format, count]) => (
              <div key={format} className="flex justify-between items-center">
                <span className="font-medium">{format}</span>
                <span className="text-2xl">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">
        Last updated: {new Date(analytics.timestamp).toLocaleString()}
      </p>
    </div>
  );
}
```

### Step 7: Create Analytics API Endpoint

Create `src/app/api/analytics/latest/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { analyticsContainer } from '@/lib/cosmos-client';

export async function GET() {
  try {
    const { resources } = await analyticsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.analysisType = @type ORDER BY c.timestamp DESC OFFSET 0 LIMIT 1',
        parameters: [{ name: '@type', value: 'real-time' }],
      })
      .fetchAll();

    if (resources.length === 0) {
      return NextResponse.json({ error: 'No analytics found' }, { status: 404 });
    }

    return NextResponse.json(resources[0]);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
```

### Step 8: Update Environment Variables

Add to `.env.local`:
```env
# Existing variables...
COSMOS_ENDPOINT=https://chainreach-cosmosdb.documents.azure.com:443/
COSMOS_KEY=your-primary-key-here
```

### Step 9: Deploy Azure Function

```bash
# Login to Azure
az login

# Create Function App
az functionapp create \
  --resource-group chainreach-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name chainreach-analytics \
  --storage-account chainreachstorage

# Configure connection string
az functionapp config appsettings set \
  --name chainreach-analytics \
  --resource-group chainreach-rg \
  --settings "CosmosDBConnection=YOUR_CONNECTION_STRING"

# Deploy
cd azure-functions/CampaignAnalytics
func azure functionapp publish chainreach-analytics
```

---

## 🎯 Quick Start Checklist

### Day 1: Database Setup
- [ ] Create Azure Cosmos DB account
- [ ] Create database and containers
- [ ] Install @azure/cosmos npm package
- [ ] Update .env.local with connection details
- [ ] Test connection from Next.js

### Day 2: Data Storage
- [ ] Update campaign API to store in Cosmos DB
- [ ] Test data insertion
- [ ] Verify data in Azure Portal

### Day 3: Azure Function
- [ ] Install Azure Functions Core Tools
- [ ] Create Function App project
- [ ] Implement Cosmos DB trigger
- [ ] Test locally with sample data

### Day 4: Real-Time Dashboard
- [ ] Create analytics API endpoint
- [ ] Build analytics dashboard UI
- [ ] Add polling/real-time updates
- [ ] Test end-to-end flow

### Day 5: Deploy & Polish
- [ ] Deploy Azure Function to cloud
- [ ] Configure monitoring/alerts
- [ ] Add error handling
- [ ] Prepare demo

---

## 📊 Alternative: Using SignalR for Real-Time Updates

For instant browser updates without polling:

```bash
npm install @microsoft/signalr
```

Create `src/lib/signalr-client.ts`:
```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('/api/analytics-hub')
  .withAutomaticReconnect()
  .build();

connection.on('analyticsUpdate', (data) => {
  console.log('New analytics:', data);
  // Update React state
});

connection.start();

export { connection };
```

---

## 🔍 Monitoring & Alerts

### Application Insights
```bash
az monitor app-insights component create \
  --app chainreach-insights \
  --location eastus \
  --resource-group chainreach-rg
```

### Email Alerts (Azure Function)
```typescript
import { EmailClient } from '@azure/communication-email';

const sendAlert = async (message: string) => {
  const client = new EmailClient(process.env.COMMUNICATION_CONNECTION_STRING);
  
  await client.send({
    senderAddress: 'alerts@chainreach.com',
    content: {
      subject: '🚨 Campaign Alert',
      plainText: message,
    },
    recipients: {
      to: [{ address: 'team@chainreach.com' }],
    },
  });
};
```

---

## 💡 Tips for Hackathon

1. **Start Simple**: Use Cosmos DB locally first (emulator)
2. **Mock First**: Test with mock data before Azure
3. **Free Tier**: Use Azure free tier (400 RU/s Cosmos DB)
4. **Local Dev**: Run Azure Functions locally for debugging
5. **Dashboard First**: Build UI before complex analytics

## 📚 Resources

- [Azure Cosmos DB Docs](https://learn.microsoft.com/azure/cosmos-db/)
- [Azure Functions TypeScript](https://learn.microsoft.com/azure/azure-functions/functions-reference-node)
- [Cosmos DB Change Feed](https://learn.microsoft.com/azure/cosmos-db/change-feed)

---

**Ready to analyze in real-time!** 🚀
