# 🧪 Testing Guide - Agent 4 Only (Others Mock)

Since **only Agent 4 is deployed**, here's how to test the orchestration with mock data for Agents 1-3.

---

## ✅ Agent 4 Configuration (DEPLOYED)

Your Agent 4 is live at:
```
https://chainreach-compliance-func.azurewebsites.net/api
```

### Available Endpoints:
- ✅ `GET /Health` - Service health
- ✅ `GET /content-safety/health` - Content safety health
- ✅ `POST /content-safety/analyze` - Analyze messages
- ✅ `POST /validate` - Validate from Person 3
- ✅ `GET /Stats` - Usage statistics

---

## 🧪 Test Agent 4 Directly

### Option 1: Browser Test
Visit in your browser:
```
http://localhost:5005/api/test/agent4
```

This will run all Agent 4 tests and show results in JSON.

---

### Option 2: PowerShell Test
```powershell
# Test health
Invoke-RestMethod -Uri "https://chainreach-compliance-func.azurewebsites.net/api/Health" -Method GET

# Test content safety
$body = '{"messages":["Welcome to ChainReach!","I hate you"]}'
Invoke-RestMethod -Uri "https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze" -Method POST -Body $body -ContentType "application/json"
```

---

### Option 3: curl
```bash
# Health check
curl https://chainreach-compliance-func.azurewebsites.net/api/Health

# Analyze messages
curl -X POST https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze \
  -H "Content-Type: application/json" \
  -d '{"messages":["Hello world","I hate you"]}'
```

---

## 🎭 Mock Agents 1-3 (For Testing)

Since Agents 1-3 are not deployed yet, create mock implementations:

### Create Mock Agents File

```typescript
// src/lib/agents/mock-agents.ts

import type { Agent1Output, Agent2Output, Agent3Output } from '@/types';

export class MockSegmentationAgent {
  async segment(request: any): Promise<Agent1Output> {
    console.log('[MOCK Agent 1] Segmentation called with:', request);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      customer_id: request.customer_id || 'CUST123',
      segments: ['high-value', 'engaged'],
      profile: {
        purchase_frequency: 'high',
        engagement_level: 'active',
        lifetime_value: 5000,
        preferred_channel: 'email',
      },
      confidence: 0.92,
    };
  }
}

export class MockContentAgent {
  async generateContent(agent1Output: Agent1Output): Promise<Agent2Output> {
    console.log('[MOCK Agent 2] Content generation called with:', agent1Output);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      customer_id: agent1Output.customer_id,
      content_templates: [
        {
          template_id: 'tmpl-1',
          subject: 'Exclusive Offer Just For You!',
          body: 'Thank you for being a valued customer. Enjoy 20% off!',
          channel: 'email',
          tone: 'friendly',
        },
        {
          template_id: 'tmpl-2',
          subject: 'Summer Sale Alert',
          body: 'Your favorite items are on sale now!',
          channel: 'email',
          tone: 'professional',
        },
      ],
      recommendations: ['personalized', 'time-sensitive'],
    };
  }
}

export class MockGenerationAgent {
  async generateVariants(agent2Output: Agent2Output): Promise<Agent3Output> {
    console.log('[MOCK Agent 3] Generation called with:', agent2Output);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const variants: any[] = [];
    
    // Generate 3 variants per template
    agent2Output.content_templates.forEach((template, idx) => {
      variants.push({
        variant_id: `var-${idx}-1`,
        template_id: template.template_id,
        content: `Hi! ${template.body} Click here to shop now!`,
        tone: 'friendly',
        channel: template.channel,
        personalization_score: 0.85,
      });
      
      variants.push({
        variant_id: `var-${idx}-2`,
        template_id: template.template_id,
        content: template.body,
        tone: 'professional',
        channel: template.channel,
        personalization_score: 0.78,
      });
      
      // Add one unsafe variant for testing
      if (idx === 0) {
        variants.push({
          variant_id: `var-${idx}-3`,
          template_id: template.template_id,
          content: 'I hate your products and service!', // Should be rejected
          tone: 'aggressive',
          channel: template.channel,
          personalization_score: 0.2,
        });
      }
    });
    
    return {
      customer_id: agent2Output.customer_id,
      message_variants: variants,
      generated_at: new Date().toISOString(),
    };
  }
}
```

---

## 🔧 Update Pipeline Executor to Use Mocks

Update `src/lib/orchestration/pipeline-executor.ts`:

```typescript
import { SegmentationAgentClient, ContentAgentClient, GenerationAgentClient, ComplianceAgentClient } from '../agents';

// Add mock imports
import { MockSegmentationAgent, MockContentAgent, MockGenerationAgent } from '../agents/mock-agents';

export class PipelineExecutor {
  private agent1: any; // Can be real or mock
  private agent2: any;
  private agent3: any;
  private agent4: ComplianceAgentClient; // Always real

  constructor(useMocks = true) { // Default to mocks for testing
    if (useMocks) {
      console.log('⚠️  Using MOCK agents for 1-3, REAL agent for 4');
      this.agent1 = new MockSegmentationAgent();
      this.agent2 = new MockContentAgent();
      this.agent3 = new MockGenerationAgent();
    } else {
      this.agent1 = new SegmentationAgentClient();
      this.agent2 = new ContentAgentClient();
      this.agent3 = new GenerationAgentClient();
    }
    
    // Agent 4 is always real (deployed)
    this.agent4 = new ComplianceAgentClient();
  }
  
  // ... rest of the code stays the same
}
```

---

## 🚀 Test Complete Pipeline with Mocks

### Step 1: Update .env.local
```bash
# Agent 4 (REAL - Deployed)
AGENT_4_URL=https://chainreach-compliance-func.azurewebsites.net/api

# Agents 1-3 (Not needed if using mocks)
# AGENT_1_URL=http://localhost:5001
# AGENT_2_URL=http://localhost:5002
# AGENT_3_URL=http://localhost:5003

PIPELINE_DEBUG=true
```

### Step 2: Test Pipeline
```powershell
# Start dev server
npm run dev

# Test in PowerShell
$body = '{"campaign_name":"Test Campaign","customer_id":"CUST123"}'
Invoke-RestMethod -Uri "http://localhost:5005/api/pipeline/start" -Method POST -Body $body -ContentType "application/json"
```

### Step 3: Check Status
```powershell
# Get pipeline status (use pipeline_id from previous response)
Invoke-RestMethod -Uri "http://localhost:5005/api/pipeline/status/YOUR_PIPELINE_ID" -Method GET
```

---

## 📊 Expected Flow

```
1. Start Pipeline
   ↓
2. MOCK Agent 1 (Segmentation)
   Output: { customer_id, segments, profile }
   ↓
3. MOCK Agent 2 (Content)
   Output: { customer_id, content_templates }
   ↓
4. MOCK Agent 3 (Generation)
   Output: { customer_id, message_variants }
   ↓
5. REAL Agent 4 (Compliance) ✅
   - Validates all variants
   - Returns approved/rejected
   - Uses deployed Azure Function
   ↓
6. Final Results
   - Approved messages
   - Rejected messages with reasons
```

---

## 🎯 When Other Agents Are Ready

Once Agents 1-3 are deployed:

1. Update `.env.local` with their URLs
2. Change pipeline executor to use real agents:
   ```typescript
   const executor = new PipelineExecutor(false); // false = use real agents
   ```
3. Test end-to-end with all real agents

---

## 🐛 Troubleshooting

### Agent 4 Returns 404
- Check URL is correct in `.env.local`
- Verify Azure Function is running
- Test health endpoint first

### "Cannot find module 'mock-agents'"
- Create the mock-agents.ts file in `src/lib/agents/`
- Restart dev server

### Pipeline Times Out
- Increase `PIPELINE_TIMEOUT_MS` in `.env.local`
- Check Agent 4 logs in Azure

---

You're ready to test! 🎉

Start with:
```
http://localhost:5005/api/test/agent4
```
