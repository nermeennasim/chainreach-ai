# 🚀 QUICK START - ChainReach AI Dashboard

## Start Dashboard (PowerShell)

```powershell
cd person5-orchestrator
npm install
npm run dev
```

Then open: **http://localhost:5005/dashboard**

---

## What You'll See

1. **"Start Campaign"** button (blue gradient, top right)
2. Click it to execute the 4-agent pipeline
3. Watch real-time status updates (Agent 1 → 2 → 3 → 4)
4. See compliance results with approved/rejected messages
5. Click **"Reset"** to run again

---

## Test Agent 4 Health

```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/test/agent4" -Method GET
```

Or visit in browser: `http://localhost:5005/api/test/agent4`

Expected: All 5 tests pass ✅

---

## Expected Demo Results

- **Duration:** ~6 seconds total
- **Agent 1-3:** Mock (instant responses)
- **Agent 4:** Real Azure Function (~2.5s)
- **Messages Checked:** 5
- **Approved:** 4 (green cards)
- **Rejected:** 1 (red card with "Violence: 4/6")
- **Approval Rate:** 80%

---

## Environment Check

Your `.env.local` should have:

```bash
AGENT_4_URL=https://chainreach-compliance-func.azurewebsites.net/api
USE_MOCK_AGENTS=true
```

---

## Troubleshooting

**Server won't start?**
```powershell
rm -r node_modules, package-lock.json; npm install
```

**TypeScript errors?**
- Press `Ctrl+Shift+P` in VS Code
- Type: "TypeScript: Restart TS Server"

**Agent 4 fails?**
- Check Azure Function is running
- Visit: https://chainreach-compliance-func.azurewebsites.net/api/Health

---

## File Structure

```
person5-orchestrator/
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx           ← Main dashboard
│   │   └── api/
│   │       ├── pipeline/start/          ← Start pipeline
│   │       ├── pipeline/status/[id]/    ← Check status
│   │       └── campaign/[id]/           ← Get results
│   ├── components/
│   │   └── Dashboard/
│   │       ├── PipelineStatusViewer.tsx        ← Real-time status
│   │       └── ComplianceResultsDashboard.tsx  ← Results display
│   └── lib/
│       ├── orchestration/
│       │   └── pipeline-executor.ts     ← Core orchestrator
│       └── agents/
│           ├── agent-4-compliance.ts    ← Real Agent 4
│           └── mock-agents.ts           ← Mock Agents 1-3
└── .env.local                           ← Configuration
```

---

## Documentation

- **DEMO_READY.md** - Complete demo guide
- **DASHBOARD_INTEGRATION_COMPLETE.md** - Technical integration details
- **ORCHESTRATION_BACKEND_GUIDE.md** - Backend architecture
- **TESTING_WITH_AGENT4.md** - Agent 4 testing
- **READY_TO_TEST.md** - Testing checklist

---

## Demo Script (15 seconds)

1. "Welcome to ChainReach AI - multi-agent marketing orchestration"
2. *Click "Start Campaign"*
3. "4 AI agents working sequentially: segmentation, content, generation, compliance"
4. *Wait for completion*
5. "Full transparency: 4 approved, 1 rejected for violent language - Azure Content Safety caught it"
6. "This is Responsible AI in action"

---

## Success Checklist

- [x] Server running on port 5005
- [x] Dashboard loads at /dashboard
- [x] "Start Campaign" button visible
- [x] Pipeline executes in ~6 seconds
- [x] Status updates in real-time
- [x] Compliance results display
- [x] 4 green cards (approved)
- [x] 1 red card (rejected with category scores)

---

## 🎯 YOU'RE READY! 

Everything is built, tested, and documented.

**Just run `npm run dev` and demo away! 🚀**
