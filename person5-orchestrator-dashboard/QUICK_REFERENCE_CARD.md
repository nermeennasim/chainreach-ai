# ChainReach AI - Quick Reference Card
## Everything You Need in One Place

---

## 🚀 Quick Start Commands

```bash
# Initialize Project
npx create-next-app@latest chainreach-dashboard --typescript --tailwind --app
cd chainreach-dashboard

# Install Dependencies
npm install axios clsx tailwind-merge lucide-react react-hot-toast zustand

# Run Development Server
npm run dev

# Build for Production
npm run build
npm start

# Open in Browser
http://localhost:3000
```

---

## 📁 Project Structure (Copy This Exactly)

```
chainreach-dashboard/
├── app/
│   ├── layout.tsx                 # Root layout with Navbar
│   ├── page.tsx                   # Home/Landing page
│   ├── globals.css                # Tailwind + custom styles
│   ├── not-found.tsx              # Custom 404
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard with stats
│   └── campaign/
│       ├── page.tsx               # Campaign hub (3 options)
│       ├── demo/
│       │   └── page.tsx           # MAIN: Demo orchestration
│       ├── custom/
│       │   └── page.tsx           # Custom campaign (future)
│       └── validate/
│           └── page.tsx           # Message validator tool
├── components/
│   ├── layout/
│   │   └── Navbar.tsx             # Persistent navigation
│   ├── campaign/
│   │   ├── AgentCard.tsx          # Agent status card
│   │   └── ComplianceResults.tsx  # Results table
│   └── ui/
│       ├── Badge.tsx              # Status badges
│       └── LoadingSpinner.tsx     # Loading animation
├── lib/
│   ├── api/
│   │   ├── config.ts              # Agent URLs + icons
│   │   ├── compliance.ts          # Agent 4 API client
│   │   ├── agents.ts              # Agents 1,2,3,5 client
│   │   └── orchestrator.ts        # (Optional future)
│   ├── types/
│   │   └── campaign.ts            # TypeScript interfaces
│   └── utils/
│       └── cn.ts                  # Class name utility
├── hooks/
│   └── useOrchestrator.ts         # Campaign state management
└── public/
    └── logo-white.png             # Your logo here
```

---

## 🎨 Color Palette

```css
/* Navy */
--navy-primary: #1a2332;
--navy-secondary: #2d3e50;

/* Cyan */
--cyan-primary: #00d4ff;
--cyan-secondary: #00b8d9;

/* Status */
--success: #10b981;
--error: #ef4444;
--warning: #f59e0b;
```

**CSS Classes:**
- `.btn-primary` - Navy button with cyan hover
- `.btn-secondary` - Cyan button
- `.card` - White rounded card
- `.status-approved` - Green badge
- `.status-rejected` - Red badge
- `.status-processing` - Yellow pulsing badge

---

## 🔗 API Endpoints

```typescript
// Agent 1 - Segmentation
http://localhost:5001/api/segment

// Agent 2 - Content Retrieval
http://localhost:5002/api/content

// Agent 3 - Generation
http://localhost:5003/api/generate-variants

// Agent 4 - Compliance (LIVE)
https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze

// Agent 5 - Orchestrator
http://localhost:5005/api/send
```

---

## 💬 GitHub Copilot Prompts (Copy & Paste)

### For Components:

```
Create a React component called AgentCard that displays agent name, status icon, progress bar, and data count. Use Tailwind CSS with navy and cyan colors.
```

```
Create a compliance results table component with columns: customer ID, variant ID, status badge, safety scores (H/V/S/SH), and rejection reason. Make it responsive.
```

```
Create a loading spinner component using lucide-react Loader2 icon with cyan color and spinning animation.
```

### For API Clients:

```
Create an axios function to call Agent 4 compliance API. It should accept a messages array and return safety analysis with approve/reject status.
```

```
Create a React hook for campaign orchestration that calls agents sequentially (1->2->3->4), manages state, handles errors, and provides progress updates.
```

### For Pages:

```
Create a Next.js landing page with hero section, 5 agent cards in horizontal flow, problem/solution sections, team showcase, and CTA button. Use navy and cyan colors.
```

```
Create a campaign demo page with 5 agent status cards, start button, real-time progress tracking, overall progress bar, and live results table.
```

```
Create a message validator page with JSON textarea input, validate button that calls compliance API, and displays results with safety scores.
```

---

## 🧪 Test API with PowerShell

```powershell
# Test Agent 4 Compliance API
$body = '{"messages":["Hello world", "I hate you"]}'
Invoke-RestMethod -Uri "https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "results": [
    {
      "message": "Hello world",
      "status": "APPROVED",
      "safety_scores": { "hate": 0, "violence": 0, "sexual": 0, "self_harm": 0 },
      "reason": "All safety checks passed"
    },
    {
      "message": "I hate you",
      "status": "REJECTED",
      "safety_scores": { "hate": 2, "violence": 0, "sexual": 0, "self_harm": 0 },
      "reason": "Detected hate speech"
    }
  ]
}
```

---

## 📦 Key Files Content

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          primary: '#1a2332',
          secondary: '#2d3e50',
        },
        'cyan': {
          primary: '#00d4ff',
          secondary: '#00b8d9',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

### `lib/utils/cn.ts`
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### `lib/api/config.ts`
```typescript
export const API_CONFIG = {
  agent1: { url: 'http://localhost:5001', name: 'Customer Segmentation', icon: '👥' },
  agent2: { url: 'http://localhost:5002', name: 'Content Retrieval', icon: '📚' },
  agent3: { url: 'http://localhost:5003', name: 'Content Generation', icon: '✍️' },
  agent4: { 
    url: 'https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze', 
    name: 'Compliance & Safety', 
    icon: '🛡️' 
  },
  agent5: { url: 'http://localhost:5005', name: 'Campaign Orchestrator', icon: '🎯' },
};
```

---

## 🎯 Implementation Order

### Day 1: Foundation (2-3 hours)
1. ✅ Initialize Next.js project
2. ✅ Setup Tailwind with custom colors
3. ✅ Create folder structure
4. ✅ Build Navbar component
5. ✅ Update root layout
6. ✅ Create home page
7. ✅ Create 404 page
8. ✅ Test: `npm run dev`

### Day 2: API & Components (3-4 hours)
9. ✅ Create TypeScript types
10. ✅ Build utility functions (cn.ts)
11. ✅ Create API config
12. ✅ Build compliance API client
13. ✅ Create UI components (Badge, Spinner)
14. ✅ Build AgentCard component
15. ✅ Build ComplianceResults table
16. ✅ Test: Validate components render

### Day 3: Pages (3-4 hours)
17. ✅ Create dashboard page
18. ✅ Create campaign hub page
19. ✅ Create message validator page
20. ✅ TEST: Validator with Agent 4 API (CRITICAL)
21. ✅ Create custom campaign page (placeholder)

### Day 4: Orchestration (4-5 hours)
22. ✅ Build useOrchestrator hook
23. ✅ Create demo campaign page
24. ✅ Connect orchestrator to demo page
25. ✅ Add real-time progress updates
26. ✅ Add results display
27. ✅ Add export functionality
28. ✅ TEST: Full demo campaign flow

### Day 5: Polish & Deploy (2-3 hours)
29. ✅ Fix any TypeScript errors
30. ✅ Test responsive design
31. ✅ Add loading states
32. ✅ Test all navigation
33. ✅ Build for production
34. ✅ Deploy to Vercel
35. ✅ Final testing

---

## 🐛 Common Errors & Fixes

### Error: "Module not found"
```bash
npm install missing-package-name
```

### Error: "Image optimization error"
```javascript
// next.config.js
module.exports = {
  images: {
    domains: [],
    unoptimized: true,
  },
}
```

### Error: "Failed to compile"
```bash
# Delete .next folder and rebuild
rm -rf .next
npm run dev
```

### Error: "CORS error" on Agent 4
- Agent 4 is already configured for CORS
- If issue persists, contact your backend team

### Error: Tailwind classes not working
```bash
# Restart dev server
Ctrl+C
npm run dev
```

---

## 📊 Demo Flow (3 minutes)

### Minute 1: Introduction (30 sec)
- "We built ChainReach AI to solve enterprise AI fears"
- "Compliance-FIRST, not afterthought"
- Show home page

### Minute 2: Validator Demo (30 sec)
- Navigate to Validator
- Show example with rejection
- "Every message is validated by Azure AI"

### Minute 3: Campaign Demo (2 min)
- Navigate to Demo Campaign
- Click Start
- Show agent cards updating
- Show progress bars
- Show compliance results
- "85% approval rate - 15% rejected for safety"

### Wrap Up (30 sec)
- "Sequential validation - cannot skip"
- "Pre-approved templates"
- "Real-time monitoring"
- "Automated trust at scale"

---

## 🎤 Talking Points for Judges

### Technical Excellence:
- ✅ Microservices architecture (5 agents)
- ✅ Azure integration (Functions, AI Content Safety)
- ✅ Next.js 14 with App Router
- ✅ TypeScript for type safety
- ✅ Real-time status polling

### Business Value:
- ✅ Addresses real enterprise fear
- ✅ Differentiates from workflow tools (Zapier, n8n)
- ✅ Shows responsible AI leadership
- ✅ Scalable to 100k+ customers
- ✅ Audit trail for compliance teams

### Innovation:
- ✅ Compliance-FIRST design
- ✅ Mandatory validation (cannot bypass)
- ✅ Multi-variant testing (3 per customer)
- ✅ Pre-approved template system
- ✅ Transparent rejection reasons

---

## 🏆 Success Metrics

For the demo, emphasize:
- **High approval rate** (85%+) shows quality content
- **Some rejections** (15%) proves safety works
- **Real-time visibility** shows enterprise-grade
- **Sequential flow** shows architectural thinking
- **Azure integration** shows platform expertise

---

## 📞 Emergency Contacts

If something breaks during demo:
1. Have backup screenshots ready
2. Have this PowerShell command ready for quick API test
3. Have GitHub repo link ready
4. Be ready to explain architecture without live demo

---

## ⚡ Speed Commands

```bash
# Quick restart
Ctrl+C
npm run dev

# Quick build test
npm run build

# Quick dependency fix
rm -rf node_modules package-lock.json
npm install

# Quick deploy
git add .
git commit -m "Update"
git push
```

---

## 🎯 Your Mission

**Build this in 5 days. Win the Microsoft AI Innovation Challenge 2025.**

You've got this, Nermeen! 🚀

---

## 📚 Documentation Files

All detailed steps are in:
1. **CHAINREACH_PROJECT_SETUP.md** - Complete overview
2. **GITHUB_COPILOT_STEPS_PART1.md** - Steps 1-10 (Foundation)
3. **GITHUB_COPILOT_STEPS_PART2.md** - Steps 11-14 (Components & APIs)
4. **GITHUB_COPILOT_STEPS_PART3_FINAL.md** - Steps 15-20 (Demo & Deploy)
5. **THIS FILE** - Quick reference for everything

---

**Pro Tip:** Keep this file open in a second monitor or print it out for quick reference during implementation!

Good luck! 💙🚀
