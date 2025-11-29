# Deployment & Testing Guide 🚀

## Pre-Launch Checklist

Before opening your dashboard, make sure everything is ready:

### ✅ Prerequisites
- [ ] Node.js 18+ installed
- [ ] Python 3.8+ installed (for RAG API)
- [ ] All agent projects cloned locally
- [ ] Dependencies installed in each project
- [ ] Ports 3000, 5000, 5002, 5003, 8000, 8001, 5005 available (not in use)
- [ ] .env files configured if needed

---

## Step-by-Step Startup

### Phase 1: Start the Agents (Background)

Open 3 separate terminal windows and start these in order:

#### Terminal 1: Segmentation Agent (Port 8001)
```bash
cd segmentation-agent-node
npm install           # First time only
npm start
```

**You should see**:
```
Starting Segmentation Agent...
Server running on port 8001 ✓
Database connected ✓
Ready to receive requests
```

**Test it**:
```powershell
curl http://localhost:8001/health
# Should return: {"status": "healthy", ...}
```

#### Terminal 2: RAG API (Port 8000)
```bash
cd person2-rag
pip install -r requirements.txt  # First time only
python api.py
```

**You should see**:
```
Initializing RAG API...
Embeddings model loaded
Database connected
Running on http://localhost:8000 (Press CTRL+C to quit)
```

**Test it**:
```powershell
curl http://localhost:8000/health
# Should return: {"status": "healthy", ...}
```

#### Terminal 3: Dashboard (Port 3000)
```bash
cd person5-orchestrator-dashboard
npm install           # First time only
npm run dev
```

**You should see**:
```
> next dev
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

### Phase 2: Open the Dashboard

1. Open your browser
2. Navigate to: **http://localhost:3000/dashboard**

**You should see**:
```
┌────────────────────────────────────────────┐
│  🚀 Dashboard Loading...                   │
│                                            │
│  👥 Agent 1         📚 Agent 2             │
│  Segmentation       Content Retrieval      │
│                                            │
│  [Grid of buttons below]                   │
└────────────────────────────────────────────┘
```

If you see this, **Phase 2 Success! ✅**

---

## Testing Procedure

### Test 1: Check Agent 1 Health

1. Click **👥 Agent 1** button (should turn blue)
2. Click **🏥 Health Check** button
3. Wait 1-2 seconds

**Expected Result**:
```
Endpoint: GET /health
Status: ✅ SUCCESS
Timestamp: 11:23:45 AM
Data: {status: "healthy", service: "segmentation-agent", ...}
```

**Result**: 🟢 Green background = Success ✅

### Test 2: Check Agent 2 Health

1. Click **📚 Agent 2** button (should turn green)
2. Click **🏥 Health Check** button
3. Wait 1-2 seconds

**Expected Result**:
```
Endpoint: GET /health
Status: ✅ SUCCESS
Timestamp: 11:24:12 AM
Data: {status: "healthy", service: "rag-api", ...}
```

**Result**: 🟢 Green background = Success ✅

### Test 3: Agent 1 - Get Segments

1. Make sure **Agent 1** selected (blue button)
2. Click **👥 Get All Segments** button
3. Wait 1-2 seconds

**Expected Result**:
```
Endpoint: GET /api/segments
Status: ✅ SUCCESS
Timestamp: 11:24:45 AM
Data: [
  {id: 1, name: "Enterprise Customers", customer_count: 245, ...},
  {id: 2, name: "Mid-Market Growth", customer_count: 678, ...},
  {id: 3, name: "SMB Segment", customer_count: 1203, ...}
]
```

**Result**: 🟢 Green = Segments loaded ✅

### Test 4: Agent 1 - Get Customers

1. Make sure **Agent 1** selected
2. Click **📋 Get All Customers** button
3. Wait 2-3 seconds (might be slower)

**Expected Result**:
```
Endpoint: GET /api/customers
Status: ✅ SUCCESS
Timestamp: 11:25:10 AM
Data: {
  customers: [
    {customer_id: "CUST-001", name: "Acme Corp", email: "...", ...},
    {customer_id: "CUST-002", name: "TechStart Inc", ...},
    ...
  ],
  total: 2126,
  limit: 20,
  offset: 0
}
```

**Result**: 🟢 Green = Customers loaded ✅

### Test 5: Agent 1 - Calculate Engagement

1. Make sure **Agent 1** selected
2. Click **⚡ Calculate Engagement** button
3. Wait 3-5 seconds (AI calculation)

**Expected Result**:
```
Endpoint: POST /api/segment/calculate-engagement
Status: ✅ SUCCESS
Timestamp: 11:25:45 AM
Data: {
  message: "Engagement scores calculated successfully",
  updated: 2126,
  average_engagement: 0.72
}
```

**Result**: 🟢 Green = Engagement calculated ✅

### Test 6: Agent 1 - Analyze Customers

1. Make sure **Agent 1** selected
2. Click **🤖 Analyze Customers (AI)** button
3. Wait 5-10 seconds (AI analysis is slower)

**Expected Result**:
```
Endpoint: POST /api/segment/analyze
Status: ✅ SUCCESS
Timestamp: 11:26:30 AM
Data: {
  analysis: "AI analysis complete",
  suggested_segments: [
    {name: "High-Value Churned Customers", potential_customers: 156, ...},
    {name: "Growth Trajectory Leaders", potential_customers: 287, ...},
    ...
  ]
}
```

**Result**: 🟢 Green = AI analysis complete ✅

### Test 7: Agent 2 - Get Statistics

1. Click **📚 Agent 2** button (should turn green)
2. Click **📊 Get Statistics** button
3. Wait 1-2 seconds

**Expected Result**:
```
Endpoint: GET /stats
Status: ✅ SUCCESS
Timestamp: 11:27:00 AM
Data: {
  total_content: 1234,
  by_content_type: {whitepaper: 456, case_study: 234, ...},
  by_audience: {Enterprise: 600, Mid-Market: 400, ...}
}
```

**Result**: 🟢 Green = Statistics loaded ✅

### Test 8: Agent 2 - Search Content

1. Make sure **Agent 2** selected
2. Click **🔍 Search Content** button
3. Wait 2-3 seconds (vector search is slower)

**Expected Result**:
```
Endpoint: POST /search
Status: ✅ SUCCESS
Timestamp: 11:27:35 AM
Data: {
  query: "enterprise solutions",
  results_count: 5,
  results: [
    {id: "doc-001", title: "Enterprise Solutions Overview", relevance_score: 0.98, ...},
    {id: "doc-234", title: "Case Study: Fortune 500", relevance_score: 0.96, ...},
    ...
  ]
}
```

**Result**: 🟢 Green = Search results returned ✅

---

## Success Scorecard

Track your progress:

```
Agent 1 Tests:
  [ ] Health Check ........................... 🟢
  [ ] Get All Segments ...................... 🟢
  [ ] Get All Customers ..................... 🟢
  [ ] Calculate Engagement .................. 🟢
  [ ] Refresh Segmentation .................. 🟢
  [ ] Analyze Customers ..................... 🟢

Agent 2 Tests:
  [ ] Health Check ........................... 🟢
  [ ] Get Statistics ......................... 🟢
  [ ] Search Content ......................... 🟢

All 9 tests passing? 🟢🟢🟢
DASHBOARD READY FOR PRODUCTION! 🚀
```

---

## Troubleshooting Guide

### Problem: Dashboard Won't Load

**Symptoms**: Browser shows blank page or "Cannot GET /dashboard"

**Solutions**:
1. Check npm output in Terminal 3
   ```
   npm run dev
   # Look for errors
   ```
2. Try hard refresh: `Ctrl+Shift+R`
3. Check browser console: `F12` → Console tab
4. Ensure port 3000 is free: `netstat -ano | findstr 3000`

---

### Problem: Buttons Don't Work (Gray/Disabled)

**Symptoms**: Buttons appear but are grayed out

**Solutions**:
1. Check if agents are actually running
2. Try Test 1: `curl http://localhost:8001/health`
3. Try Test 2: `curl http://localhost:8000/health`
4. If either fails, restart that agent

---

### Problem: Red ERROR - "Connection refused"

**Symptoms**:
```
Status: ❌ ERROR
Error: Connection refused on port 8001
```

**Solutions**:
1. Agent not running
   ```bash
   # Terminal where agent should be running
   # You should see server startup messages
   # If not, start it!
   ```
2. Wrong port
   - Agent 1 should be **8001**
   - Agent 2 should be **8000**
   - Check `lib/api/config.ts`

---

### Problem: Red ERROR - "Request timeout"

**Symptoms**:
```
Status: ❌ ERROR
Error: Request timeout after 10 seconds
```

**Solutions**:
1. Agent too slow (stuck processing)
   - Check agent logs
   - Might need to restart
2. Network issue
   - Try `ping localhost` 
   - Try `curl http://localhost:8001/health`
3. Agent running out of memory
   - Check system resources
   - Restart agent

---

### Problem: Results Show But Empty Data

**Symptoms**:
```
Status: ✅ SUCCESS
Data: []  (empty array)
```

**Solutions**:
1. Database is empty - populate it first
   - For Agent 1: Load sample customers
   - For Agent 2: Index sample documents
2. Check agent database files exist
3. If first time setup, initialize database

---

### Problem: Wrong Response (Unexpected Data)

**Symptoms**:
```
Expected: {status: "healthy", service: "segmentation-agent", ...}
Got: {"error": "Internal Server Error", "code": 500}
```

**Solutions**:
1. Check agent logs for errors
2. Restart agent: Stop (Ctrl+C) then restart
3. Check database connection in agent
4. Verify agent `.env` file is correct

---

## Performance Notes

**Expected Response Times**:
- Health Check: < 100ms
- Get Segments: 100-300ms
- Get Customers: 200-500ms
- Calculate Engagement: 2-5 seconds (processing)
- Analyze Customers: 5-10 seconds (AI)
- Get Statistics: 100-200ms
- Search Content: 500-2000ms (vector search)

**If slower than above**:
- Agent might be indexing or processing
- Wait and try again
- Check system resources (CPU, RAM)

---

## Production Deployment Checklist

Before going live:

### Code
- [ ] All TypeScript types checked
- [ ] All API calls have error handling
- [ ] No console.log() statements left
- [ ] Environment variables configured

### Security
- [ ] HTTPS enabled (not HTTP)
- [ ] Authentication added to agents
- [ ] CORS properly configured
- [ ] Input validation in place
- [ ] Rate limiting configured

### Performance
- [ ] Response times acceptable
- [ ] Database indexes created
- [ ] Caching implemented where needed
- [ ] Load testing completed

### Operations
- [ ] Monitoring/alerting set up
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Incident response plan ready

### Documentation
- [ ] API docs updated
- [ ] Runbooks created
- [ ] Troubleshooting guide written
- [ ] Team trained

---

## Monitoring Template

Create a simple monitoring dashboard:

```
Agent 1 Segmentation (Port 8001)
  Status: 🟢 Healthy
  Last Health Check: 2025-01-15 11:23:45
  Response Time: 87ms
  Error Rate: 0%
  Uptime: 99.9%

Agent 2 RAG API (Port 8000)
  Status: 🟢 Healthy
  Last Health Check: 2025-01-15 11:24:12
  Response Time: 234ms
  Error Rate: 0%
  Uptime: 99.8%

Dashboard Status: 🟢 All Systems Go!
```

Monitor these daily:
- [ ] Health check success
- [ ] Response times normal
- [ ] Error rate low
- [ ] Database sizes growing appropriately

---

## Rollback Plan

If something goes wrong in production:

1. **Immediate**: Disable dashboard buttons
2. **Investigate**: Check logs for root cause
3. **Fix**: Restart agent or deploy patch
4. **Verify**: Run full test suite (8 tests above)
5. **Rollout**: Re-enable buttons when ready

---

## Testing in Different Scenarios

### Scenario: Light Load (Few Users)
- All tests should pass
- Response times < 500ms
- No errors

### Scenario: Heavy Load (Many Users)
- Run same tests 10x in parallel
- Measure response times
- Check for dropped requests
- Monitor CPU/RAM

### Scenario: Agent Restart
- Stop Agent 1
- Try to use buttons (should show red ERROR)
- Restart Agent 1
- Try buttons again (should work)
- Results should show 🟢 green

### Scenario: No Database
- Stop agent
- Remove database files
- Restart agent
- Should show error or empty results
- This is expected on first run

---

## Success Criteria

Dashboard is **READY FOR PRODUCTION** when:

✅ All 9 button tests pass (green)
✅ Response times acceptable (< 2 seconds)
✅ No error rate (0% errors)
✅ Both agents responsive
✅ Results displayed correctly
✅ No console errors (F12)
✅ Multiple clicks in row work
✅ Error handling works (shows red + message)
✅ Performance stable (no degradation)

---

## Next Steps

Once **all tests pass** ✅:

1. [ ] Test custom campaign CSV upload
2. [ ] Integrate Agent 3 (Message Generation)
3. [ ] Integrate Agent 4 (Compliance)
4. [ ] Integrate Agent 5 (Campaign Execution)
5. [ ] Build full 5-agent workflow
6. [ ] Deploy to production

---

## Support Resources

**If you get stuck**, check these files:
- `DASHBOARD_INTEGRATION_COMPLETE.md` - Architecture
- `IMPLEMENTATION_STATUS.md` - What's built
- `BUTTON_API_MAPPING.md` - Button details
- `QUICK_START_DASHBOARD.md` - Quick reference
- `COMPLETE_INTEGRATION_SUMMARY.md` - Full overview

---

## Quick Commands Reference

```powershell
# Check if port in use
netstat -ano | findstr 3000

# Kill process on port
taskkill /PID <PID> /F

# Check if service running
curl http://localhost:8001/health

# Full dashboard test
curl http://localhost:3000/dashboard

# View logs
Get-Content logs.txt -Tail 20

# Restart services (in 3 terminals)
# Terminal 1: npm start (Agent 1)
# Terminal 2: python api.py (Agent 2)
# Terminal 3: npm run dev (Dashboard)
```

---

## Celebrating Success! 🎉

Once all 9 tests pass green ✅, you have:

✅ **Production-ready dashboard**
✅ **9 functional API endpoints**
✅ **Real-time data display**
✅ **Error handling in place**
✅ **Type-safe code**
✅ **Professional UI**
✅ **Monitoring capability**

**You're ready to move to Phase 2 - Adding more agents! 🚀**

---

**Last Updated**: Current session
**Status**: 🟢 Ready for testing
**Next**: Run the 8-test suite and report results!

