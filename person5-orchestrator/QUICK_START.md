# 🎯 Quick Integration Reference

## ✅ CURRENT STATUS: Agent 4 Only

**Deployed:** Agent 4 (Compliance) ✅
**Mock:** Agents 1-3 (for testing)

---

## How It Works

```
Dashboard "Start Campaign" Button
         ↓
   POST /api/pipeline/start
         ↓
   MOCK Agent 1 → MOCK Agent 2 → MOCK Agent 3 → REAL Agent 4 ✅
         ↓
   Approved/Rejected Messages
         ↓
   Display in Campaign Builder
```

---

## 📋 Setup Checklist

### Configuration (Do First!)
- [ ] Copy `.env.example` to `.env.local`
- [ ] Confirm Agent 4 URL: `https://chainreach-compliance-func.azurewebsites.net/api`
- [ ] Set `USE_MOCK_AGENTS=true` (for testing with mocks)
- [ ] Set `PIPELINE_DEBUG=true` (see detailed logs)

### Dashboard Integration
- [ ] Add onClick handler to "Start Campaign" button
- [ ] Call `POST /api/pipeline/start`
- [ ] Get `pipeline_id` from response
- [ ] Poll `GET /api/pipeline/status/:id` every 2 seconds
- [ ] Display current step (e.g., "Step 2/4 - Content Generation")
- [ ] Show success/failure when completed

### Campaign Builder Integration
- [ ] Add button to "View Results"
- [ ] Call `GET /api/campaign/:id`
- [ ] Display approved messages (green)
- [ ] Display rejected messages (red) with reasons
- [ ] Show compliance scores

---

## 🧪 Quick Testing

### Test Agent 4 (Browser)
```
http://localhost:5005/api/test/agent4
```

### Test Full Pipeline (PowerShell)
```powershell
$body = '{"campaign_name":"Test","customer_id":"CUST123"}'
Invoke-RestMethod -Uri "http://localhost:5005/api/pipeline/start" -Method POST -Body $body -ContentType "application/json"
```

---

## 🚀 Quick Code Snippets

### Dashboard: Start Pipeline

```typescript
const startCampaign = async () => {
  const res = await fetch('/api/pipeline/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaign_name: 'Summer Sale',
      customer_id: 'CUST123'
    })
  });
  
  const { pipeline_id } = await res.json();
  pollStatus(pipeline_id);
};

const pollStatus = async (id: string) => {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/pipeline/status/${id}`);
    const { pipeline } = await res.json();
    
    if (pipeline.status === 'completed') {
      clearInterval(interval);
      alert('Pipeline completed!');
      // Display results
    }
  }, 2000);
};
```

### Campaign Builder: Get Results

```typescript
const fetchResults = async (customerId: string) => {
  const res = await fetch(`/api/campaign/${customerId}`);
  const { results } = await res.json();
  
  // results.approved_messages
  // results.rejected_messages
};
```

---

## 📊 Status Values

- `idle` - Not started
- `running` - Currently executing
- `completed` - ✅ Success
- `failed` - ❌ Error
- `cancelled` - Manually stopped

---

## 🔍 Debugging

Check these if something's not working:

1. **Agent URLs** - Are they correct in `.env.local`?
2. **Agent Health** - Are all 4 agents running?
3. **Console Logs** - Check browser console and server logs
4. **Network Tab** - Check API requests/responses
5. **Pipeline Debug** - Set `PIPELINE_DEBUG=true`

---

## 📞 API Reference (Quick)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/pipeline/start` | Start campaign |
| GET | `/api/pipeline/status/:id` | Get real-time status |
| POST | `/api/pipeline/stop/:id` | Stop pipeline |
| GET | `/api/campaign/:id` | Get approved/rejected |

---

## ✨ That's It!

You now have a complete Node.js backend orchestration system running in Next.js that coordinates all 4 agents sequentially! 🎉
