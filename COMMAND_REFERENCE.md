# 🎯 Quick Command Reference

## 🚀 Start Everything (3 Commands)

### Terminal 1: Segmentation Agent (Port 8001)
```bash
cd C:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation-agent-node
npm start
```
**Wait for**: `Server running on port 8001` ✓

### Terminal 2: RAG API (Port 8000)
```bash
cd C:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\person2-rag
python api.py
```
**Wait for**: `Running on http://localhost:8000` ✓

### Terminal 3: Dashboard (Port 3000)
```bash
cd C:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\person5-orchestrator-dashboard
npm run dev
```
**Wait for**: `ready - started server on 0.0.0.0:3000` ✓

---

## 🌐 Open These URLs

**In Order**:
1. `http://localhost:3000/dashboard` → Test individual endpoints
2. `http://localhost:3000/campaign/demo` → Run full orchestration
3. `http://localhost:3000/campaign/custom` → Try custom campaign

**API Endpoints**:
- `http://localhost:8001` → Segmentation Agent
- `http://localhost:8000` → RAG API

---

## 🎮 Quick Test (2 Minutes)

```bash
# 1. Open Dashboard
http://localhost:3000/dashboard

# 2. Click "Agent 1" button

# 3. Click "🏥 Health Check" button

# 4. See: GREEN SUCCESS ✅

# 5. Click "👥 Get All Segments"

# 6. See: Real segment list

# 7. Click "Agent 2" button

# 8. Click "🔍 Search Content"

# 9. See: 5 content results

# DONE! 🎉
```

---

## 📚 Documentation Quick Links

```
START_HERE.md
  ↓ (5 min read)
  └─→ Quick 3-step setup

QUICK_START_DASHBOARD.md
  ↓ (5 min read)
  └─→ Detailed setup guide

BUTTON_API_MAPPING.md
  ↓ (15 min read)
  └─→ What each button does

EVERYTHING_READY.md
  ↓ (2 min read)
  └─→ Final status overview
```

---

## 🔍 Testing Commands

### Test Segmentation Agent Health
```bash
curl http://localhost:8001/health
```

### Test RAG API Health
```bash
curl http://localhost:8000/health
```

### Test Get Segments
```bash
curl http://localhost:8001/api/segments
```

### Test Search Content
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"enterprise solutions","top_k":5}'
```

---

## 🛠️ Useful Shortcut Keys

**In Browser**:
- `F12` → Open Developer Tools
- `Ctrl+Shift+J` → Open Console
- `Ctrl+Shift+K` → Open Console (Firefox)
- `Cmd+Option+J` → Open Console (Mac)

**In Terminal**:
- `Ctrl+C` → Stop service
- `Up Arrow` → Previous command
- `Clear` or `cls` → Clear screen

---

## 📊 Verify Setup

### Check All Services Running
```bash
# Terminal 1: Agent 1
curl http://localhost:8001/health
# Expected: {"status":"healthy",...}

# Terminal 2: Agent 2  
curl http://localhost:8000/health
# Expected: {"status":"healthy",...}

# Browser: Dashboard
http://localhost:3000/dashboard
# Expected: Agent selector buttons visible
```

### Check Data Loading
```bash
# Get segments
curl http://localhost:8001/api/segments
# Expected: Array of segments

# Get customers
curl http://localhost:8001/api/customers?limit=10
# Expected: Array of customers

# Search content
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","top_k":5}'
# Expected: Array of 5 content results
```

---

## 🆘 Troubleshooting

### Agent 1 Won't Start
```bash
# Check Node version
node --version
# Should be: v16+

# Clear npm cache
npm cache clean --force

# Try reinstall
cd segmentation-agent-node
rm -r node_modules
npm install
npm start
```

### Agent 2 Won't Start
```bash
# Check Python version
python --version
# Should be: 3.8+

# Check if port 8000 is free
netstat -an | find "8000"
# If in use: kill process or use different port

# Try run
python api.py
```

### Dashboard Won't Load
```bash
# Check npm version
npm --version

# Clear Next.js cache
cd person5-orchestrator-dashboard
rm -r .next

# Reinstall
npm install

# Try run
npm run dev
```

---

## 🎯 What To Do Next

### Option A: I Just Want to Test (5 min)
```
1. Copy 3 commands above (Terminal 1, 2, 3)
2. Start services
3. Go to http://localhost:3000/dashboard
4. Click buttons and see results
```

### Option B: I Want to Understand (30 min)
```
1. Read START_HERE.md
2. Read BUTTON_API_MAPPING.md
3. Start services
4. Test dashboard
5. Read DEMO_CAMPAIGN_AGENT_1_2_INTEGRATION.md
6. Run demo campaign
```

### Option C: I Need Full Details (1 hour)
```
1. Read all documentation in DOCUMENTATION_INDEX_COMPLETE.md
2. Review source code
3. Start services
4. Test all features
5. Verify everything works
```

---

## 📋 Feature Checklist

### Dashboard Features
- [ ] Agent selector buttons work
- [ ] Agent 1 buttons appear when selected (6 buttons)
- [ ] Agent 2 buttons appear when selected (3 buttons)
- [ ] Clicking buttons shows loading state
- [ ] Results appear with green SUCCESS or red ERROR
- [ ] Clicking multiple buttons shows result history
- [ ] Each result shows: endpoint, status, timestamp, data

### Demo Campaign Features
- [ ] Campaign page loads
- [ ] "Start Campaign" button works
- [ ] Agent 1 shows real segments and customers
- [ ] Agent 2 shows real content search results
- [ ] Progress bars animate for each agent
- [ ] Final results show approval statistics
- [ ] Can reset and run again

### Custom Campaign Features
- [ ] CSV upload works
- [ ] Can select customers
- [ ] Can switch to "Agent Mode"
- [ ] Can load segments from Agent 1
- [ ] See segment list loaded

---

## 🎮 Interactive Demo (5 min)

```
START HERE:
  ↓
1. http://localhost:3000/dashboard
  ↓
2. Click "Agent 1" button (blue)
  ↓
3. Click "👥 Get All Segments" button
  ↓
4. See green SUCCESS with segment list
  ↓
5. Click "📋 Get All Customers"
  ↓
6. See green SUCCESS with customer data
  ↓
7. Click "Agent 2" button (green)
  ↓
8. Click "🔍 Search Content"
  ↓
9. See green SUCCESS with 5 content items
  ↓
10. Go to http://localhost:3000/campaign/demo
  ↓
11. Click "Start Campaign"
  ↓
12. Watch all 5 agents execute
  ↓
13. See final results with approval rate
  ↓
DONE! 🎉
```

---

## 🚀 Production Deployment

### Before Going Live

```bash
# 1. Run security checks
npm audit
# Fix any vulnerabilities

# 2. Build for production
npm run build

# 3. Test production build locally
npm start

# 4. Run tests
npm test

# 5. Check environment variables
# Ensure .env.local is not committed
# All sensitive data in env vars

# 6. Deploy
# Use your preferred platform
```

---

## 📞 Emergency Commands

### If Dashboard Freezes
```bash
# Stop dashboard
Ctrl+C (in Terminal 3)

# Restart
npm run dev
```

### If Need to Reset Everything
```bash
# Stop all services
Ctrl+C (in each terminal)

# Clear caches
cd person5-orchestrator-dashboard
rm -rf .next node_modules
npm install

# Restart
npm run dev
```

### If Port Already in Use
```bash
# Find process on port
# Windows:
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Try again
npm run dev
```

---

## 📊 Performance Tips

### Make Things Faster
```bash
# Use npm ci instead of npm install
npm ci

# Use yarn if faster
yarn install

# Close other applications
# Free up RAM

# Update Node/npm
node --version
npm --version
```

### Monitor Performance
```bash
# Dashboard in browser:
# Press F12 → Network tab
# Watch API calls and response times

# Terminal:
# Watch for error messages
# Check memory usage
```

---

## 🎓 Learning Resources

### Quick Links
- `START_HERE.md` - Begin here
- `BUTTON_API_MAPPING.md` - What each button does
- `DEMO_CAMPAIGN_AGENT_1_2_INTEGRATION.md` - How demo works
- `COMPLETE_INTEGRATION_SUMMARY.md` - Full overview
- `DOCUMENTATION_INDEX_COMPLETE.md` - All guides

---

## ✅ Final Checklist Before Starting

- [ ] Node.js installed (v16+)
- [ ] Python installed (3.8+)
- [ ] npm installed
- [ ] 3 terminals ready
- [ ] Ports 8000, 8001, 3000 free
- [ ] All 3 service folders accessible
- [ ] Ready to begin!

---

## 🎉 You're All Set!

**Copy these 3 commands to 3 different terminals:**

```bash
# Terminal 1
cd segmentation-agent-node && npm start

# Terminal 2
cd person2-rag && python api.py

# Terminal 3
cd person5-orchestrator-dashboard && npm run dev
```

**Then visit:**
```
http://localhost:3000/dashboard
```

**And start clicking buttons! 🚀**

---

**Everything is ready. Enjoy! 🎉**

