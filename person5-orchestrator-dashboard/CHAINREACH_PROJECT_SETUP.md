# ChainReach AI - Dashboard & Orchestrator Setup Guide

## 🎨 Design System - Color Palette from Logo

```css
/* Primary Colors from ChainReach Logo */
--navy-primary: #1a2332;        /* Dark navy from logo */
--navy-secondary: #2d3e50;      /* Lighter navy */
--cyan-primary: #00d4ff;        /* Bright cyan from logo dots */
--cyan-secondary: #00b8d9;      /* Deeper cyan */
--white: #ffffff;
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-700: #374151;
--gray-900: #111827;

/* Status Colors */
--success-green: #10b981;
--warning-yellow: #f59e0b;
--error-red: #ef4444;
--info-blue: #3b82f6;
```

## 📁 Project Structure

```
chainreach-dashboard/
├── public/
│   ├── logo-white.png              # ChainReach logo
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with navbar
│   │   ├── page.tsx                # Home/Landing page
│   │   ├── globals.css             # Global styles with color theme
│   │   ├── not-found.tsx           # 404 page
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Main dashboard
│   │   └── campaign/
│   │       ├── page.tsx            # Campaign hub (Demo/Custom choice)
│   │       ├── demo/
│   │       │   └── page.tsx        # Demo campaign orchestration
│   │       ├── custom/
│   │       │   └── page.tsx        # Custom campaign setup
│   │       └── validate/
│   │           └── page.tsx        # Compliance message validator
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Persistent navigation
│   │   │   └── Footer.tsx
│   │   ├── campaign/
│   │   │   ├── CampaignFlow.tsx    # Visual flow diagram
│   │   │   ├── AgentCard.tsx       # Individual agent status card
│   │   │   ├── CustomerSegments.tsx
│   │   │   ├── ContentPreview.tsx
│   │   │   ├── ComplianceResults.tsx
│   │   │   └── MessageVariants.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RecentCampaigns.tsx
│   │   │   └── SystemHealth.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── StatusIndicator.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── agents.ts           # API client for all agents
│   │   │   ├── compliance.ts       # Compliance API wrapper
│   │   │   └── orchestrator.ts     # Campaign orchestration logic
│   │   ├── types/
│   │   │   └── campaign.ts         # TypeScript interfaces
│   │   └── utils/
│   │       ├── cn.ts               # Class name utility
│   │       └── formatters.ts
│   └── hooks/
│       ├── useCampaign.ts          # Campaign state management
│       ├── useOrchestrator.ts      # Orchestration logic hook
│       └── usePolling.ts           # Real-time status polling
└── package.json
```

## 🔧 API Endpoints Configuration

```typescript
// src/lib/api/config.ts
export const API_CONFIG = {
  agent1: {
    url: 'http://localhost:5001',
    name: 'Segmentation Agent',
    endpoints: {
      analyze: '/api/segment',
      status: '/api/status'
    }
  },
  agent2: {
    url: 'http://localhost:5002',
    name: 'Content Retrieval Agent',
    endpoints: {
      retrieve: '/api/content',
      templates: '/api/templates'
    }
  },
  agent3: {
    url: 'http://localhost:5003',
    name: 'Content Generation Agent',
    endpoints: {
      generate: '/api/generate-variants',
      status: '/api/status'
    }
  },
  agent4: {
    url: 'https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze',
    name: 'Compliance & Safety Agent',
    endpoints: {
      analyze: '',  // Already in base URL
      validate: ''
    }
  },
  agent5: {
    url: 'http://localhost:5005',
    name: 'Orchestrator Agent',
    endpoints: {
      start: '/api/orchestrate',
      status: '/api/campaign-status'
    }
  }
};
```

## 📊 Campaign Flow Stages

### Stage 1: Customer Segmentation (Agent 1)
```typescript
// Input: Customer database/CSV
// Output: Customer segments with metadata
{
  "segments": [
    {
      "segment_id": "high_value_tech",
      "segment_name": "High-Value Tech Enthusiasts",
      "customer_count": 150,
      "customers": [
        {
          "customer_id": "CUST001",
          "name": "John Doe",
          "email": "john@example.com",
          "segment_score": 0.89,
          "attributes": {
            "lifetime_value": 5000,
            "engagement_score": 85,
            "preferred_channel": "email"
          }
        }
      ]
    }
  ]
}
```

### Stage 2: Content Retrieval (Agent 2)
```typescript
// Input: Segment data from Agent 1
// Output: Pre-approved templates matched to segments
{
  "templates": [
    {
      "template_id": "TEMP001",
      "segment_id": "high_value_tech",
      "template_name": "Premium Product Launch",
      "subject": "Exclusive First Look: {product_name}",
      "body": "Hi {first_name}, as one of our valued customers...",
      "approved_date": "2024-11-20",
      "approval_status": "PRE_APPROVED",
      "tags": ["product_launch", "premium", "tech"]
    }
  ]
}
```

### Stage 3: Content Generation (Agent 3)
```typescript
// Input: Templates from Agent 2 + Customer data
// Output: 3 personalized variants per customer
{
  "generated_messages": [
    {
      "customer_id": "CUST001",
      "customer_name": "John Doe",
      "variants": [
        {
          "variant_id": "VAR001_A",
          "subject": "John, Exclusive Tech Launch Just for You",
          "body": "Hi John, based on your interest in AI tools...",
          "personalization_score": 0.92,
          "tone": "professional_friendly"
        },
        {
          "variant_id": "VAR001_B",
          "subject": "Hey John! You'll Love This New Release",
          "body": "John! We know you're always first to try new tech...",
          "personalization_score": 0.88,
          "tone": "casual_enthusiastic"
        },
        {
          "variant_id": "VAR001_C",
          "subject": "John Doe: Premium Access Available",
          "body": "Dear John, your account qualifies for early access...",
          "personalization_score": 0.85,
          "tone": "formal_exclusive"
        }
      ]
    }
  ]
}
```

### Stage 4: Compliance Validation (Agent 4)
```typescript
// Input: All variants from Agent 3
// Output: Safety analysis with approval/rejection
{
  "compliance_results": [
    {
      "variant_id": "VAR001_A",
      "customer_id": "CUST001",
      "status": "APPROVED",
      "safety_scores": {
        "hate": 0,
        "self_harm": 0,
        "sexual": 0,
        "violence": 0
      },
      "selected_for_sending": true,
      "reason": "All safety checks passed. Content is appropriate and compliant.",
      "timestamp": "2024-11-25T10:30:00Z"
    },
    {
      "variant_id": "VAR001_B",
      "customer_id": "CUST001",
      "status": "REJECTED",
      "safety_scores": {
        "hate": 0,
        "self_harm": 0,
        "sexual": 0,
        "violence": 2
      },
      "selected_for_sending": false,
      "reason": "Detected potentially aggressive language. Rejected for safety.",
      "timestamp": "2024-11-25T10:30:01Z"
    }
  ],
  "summary": {
    "total_variants": 450,
    "approved": 380,
    "rejected": 70,
    "approval_rate": "84.4%"
  }
}
```

## 🎭 UI Components Specifications

### 1. Navbar (Persistent Across All Pages)
```tsx
// src/components/layout/Navbar.tsx
/**
 * Features:
 * - Logo on left (ChainReach AI)
 * - Navigation links: Home, Dashboard, Campaign
 * - Active state highlighting with cyan underline
 * - Responsive mobile menu
 * - Navy background (#1a2332)
 * - White text with cyan accent on hover
 */
```

### 2. Home Page (Landing)
```tsx
// src/app/page.tsx
/**
 * Sections:
 * 1. Hero Section
 *    - Project title: "ChainReach AI"
 *    - Tagline: "Compliance-First Marketing Automation"
 *    - CTA button: "Start Demo Campaign" (cyan button)
 * 
 * 2. Problem Statement
 *    - "Enterprises fear AI-generated content"
 *    - Visual: Red X over generic AI tools
 * 
 * 3. Solution Overview
 *    - "Automated Trust Through Mandatory Safety Validation"
 *    - 5 Agent Cards in horizontal flow
 * 
 * 4. Team Section
 *    - 5 team members with roles
 *    - Microsoft Innovation Challenge 2025 badge
 * 
 * 5. Tech Stack
 *    - Azure services logos
 *    - Open-source frameworks
 */
```

### 3. Campaign Hub Page
```tsx
// src/app/campaign/page.tsx
/**
 * Two main options:
 * 
 * ┌─────────────────────────────────────────────┐
 * │  Choose Campaign Type                       │
 * ├─────────────────────────────────────────────┤
 * │  ┌──────────────────┐  ┌─────────────────┐ │
 * │  │  Demo Campaign   │  │ Custom Campaign │ │
 * │  │  • 5000 sample   │  │ • Upload CSV    │ │
 * │  │    customers     │  │ • Select IDs    │ │
 * │  │  • Pre-configured│  │ • Configure     │ │
 * │  │  [Start Demo]    │  │ [Setup Custom]  │ │
 * │  └──────────────────┘  └─────────────────┘ │
 * │                                             │
 * │  Or test individual messages:               │
 * │  [Go to Message Validator] →                │
 * └─────────────────────────────────────────────┘
 */
```

### 4. Demo Campaign Page (Main Orchestration View)
```tsx
// src/app/campaign/demo/page.tsx
/**
 * Layout:
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │  Campaign: Demo Run #3                      [Stop] [⚙]  │
 * ├─────────────────────────────────────────────────────────┤
 * │  Overall Progress: ████████░░░░ 80%                     │
 * │  Status: Processing Agent 4 (Compliance Check)          │
 * ├─────────────────────────────────────────────────────────┤
 * │                                                          │
 * │  ┌─────────┐      ┌─────────┐      ┌─────────┐        │
 * │  │Agent 1  │ ───> │Agent 2  │ ───> │Agent 3  │ ───>   │
 * │  │Segment  │      │Content  │      │Generate │         │
 * │  │✓ Done   │      │✓ Done   │      │✓ Done   │         │
 * │  │150 segs │      │45 temps │      │450 msgs │         │
 * │  └─────────┘      └─────────┘      └─────────┘         │
 * │                                                          │
 * │     ┌─────────┐      ┌─────────┐                       │
 * │  ─> │Agent 4  │ ───> │Agent 5  │                       │
 * │     │Comply   │      │Send     │                        │
 * │     │⏳ Active│      │⏸ Wait   │                        │
 * │     │360/450  │      │0 sent   │                        │
 * │     └─────────┘      └─────────┘                        │
 * │                                                          │
 * ├─────────────────────────────────────────────────────────┤
 * │  Live Results:                              [Export]    │
 * │  ┌───────────────────────────────────────────────────┐ │
 * │  │ Customer │ Segment    │ Status    │ Reason        │ │
 * │  ├───────────────────────────────────────────────────┤ │
 * │  │ CUST001  │ High Value │ ✓ APPROVED│ Passed safety │ │
 * │  │ CUST002  │ Tech Early │ ✓ APPROVED│ Passed safety │ │
 * │  │ CUST003  │ Premium    │ ✗ REJECTED│ Hate score: 2 │ │
 * │  │ CUST004  │ High Value │ ✓ APPROVED│ Passed safety │ │
 * │  └───────────────────────────────────────────────────┘ │
 * │                                                          │
 * │  Summary:                                               │
 * │  • Total Customers: 5000                                │
 * │  • Messages Generated: 15000 (3 variants each)          │
 * │  • Approved: 12,750 (85%)                               │
 * │  • Rejected: 2,250 (15%)                                │
 * │  • Ready to Send: 5000                                  │
 * └─────────────────────────────────────────────────────────┘
 */
```

### 5. Compliance Message Validator
```tsx
// src/app/campaign/validate/page.tsx
/**
 * Standalone tool for testing messages:
 * 
 * ┌─────────────────────────────────────────────┐
 * │  Message Compliance Validator               │
 * ├─────────────────────────────────────────────┤
 * │  Test your message content before sending   │
 * │                                             │
 * │  Message Input (JSON Array):                │
 * │  ┌─────────────────────────────────────┐   │
 * │  │ {                                   │   │
 * │  │   "messages": [                     │   │
 * │  │     "Hello valued customer!",       │   │
 * │  │     "Check out our new product"     │   │
 * │  │   ]                                 │   │
 * │  │ }                                   │   │
 * │  └─────────────────────────────────────┘   │
 * │                                             │
 * │  [Validate Messages]                        │
 * │                                             │
 * │  Results:                                   │
 * │  ┌─────────────────────────────────────┐   │
 * │  │ Message 1: ✓ APPROVED               │   │
 * │  │ • Hate: 0                           │   │
 * │  │ • Violence: 0                       │   │
 * │  │ • Sexual: 0                         │   │
 * │  │ • Self-harm: 0                      │   │
 * │  │                                     │   │
 * │  │ Message 2: ✓ APPROVED               │   │
 * │  │ • All scores: 0                     │   │
 * │  └─────────────────────────────────────┘   │
 * └─────────────────────────────────────────────┘
 */
```

## 🔄 Orchestration Flow Logic

```typescript
// src/lib/api/orchestrator.ts
/**
 * Main orchestration sequence:
 * 
 * 1. User clicks "Start Demo Campaign"
 * 2. Read customer database (customers_5000_segmentation.json)
 * 3. POST to Agent 1 (localhost:5001) → Get segments
 * 4. POST segments to Agent 2 (localhost:5002) → Get templates
 * 5. POST templates + customers to Agent 3 (localhost:5003) → Get variants
 * 6. POST all variants to Agent 4 (Azure Function) → Get compliance results
 * 7. Filter approved messages and display results
 * 8. Update UI with real-time status using polling (every 2 seconds)
 * 
 * Each agent returns:
 * {
 *   "status": "success" | "processing" | "error",
 *   "progress": 0-100,
 *   "data": {...},
 *   "error": "error message if failed"
 * }
 */
```

## 🎨 Styling Guidelines

### Color Usage
- **Navy (#1a2332)**: Navbar, headers, primary buttons
- **Cyan (#00d4ff)**: Accents, hover states, progress bars, links
- **White**: Text on dark backgrounds, card backgrounds
- **Gray-100**: Page backgrounds
- **Green (#10b981)**: Success states (approved)
- **Red (#ef4444)**: Error states (rejected)
- **Yellow (#f59e0b)**: Warning/processing states

### Typography
```css
/* Headings */
h1: 2.5rem, font-weight: 700, navy
h2: 2rem, font-weight: 600, navy
h3: 1.5rem, font-weight: 600, gray-900

/* Body */
body: 1rem, font-weight: 400, gray-700
small: 0.875rem, gray-600

/* Buttons */
button: 1rem, font-weight: 500, uppercase tracking
```

### Component Patterns
- **Cards**: White background, subtle shadow, rounded corners (8px)
- **Buttons**: Navy primary, cyan on hover, white text
- **Status badges**: Colored backgrounds with matching text
- **Agent cards**: Mini progress indicators, status icons
- **Flow connectors**: Cyan animated lines between agents

## 📦 Package Dependencies

```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "axios": "^1.6.5",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.303.0",
    "react-hot-toast": "^2.4.1",
    "zustand": "^4.4.7"
  }
}
```

## 🚀 Step-by-Step Implementation with GitHub Copilot

### Step 1: Initialize Next.js Project
```bash
npx create-next-app@latest chainreach-dashboard --typescript --tailwind --app --no-src
cd chainreach-dashboard
```

### Step 2: Install Dependencies
```bash
npm install axios clsx tailwind-merge lucide-react react-hot-toast zustand
```

### Step 3: Setup Folder Structure
Create all folders from the structure above.

### Step 4: Configure Tailwind with Custom Colors
Update `tailwind.config.ts` with the color palette.

### Step 5: Create Base Components
Start with:
1. Navbar component (copy specifications above)
2. Layout wrapper
3. Home page
4. 404 page

### Step 6: Build API Client Functions
Create all agent API wrappers in `src/lib/api/`.

### Step 7: Implement Campaign Flow
Build the orchestrator page with:
- Agent status cards
- Progress tracking
- Real-time polling
- Results table

### Step 8: Add Compliance Validator
Standalone page for JSON message validation.

### Step 9: Test Integration
Connect all agents and test end-to-end flow.

### Step 10: Polish & Deploy
- Add loading states
- Error handling
- Responsive design checks
- Deploy to Vercel

## 💡 GitHub Copilot Chat Prompts

Use these prompts sequentially with Copilot:

1. "Create a Next.js 14 app router layout component with a persistent navbar using the ChainReach color scheme: navy #1a2332 and cyan #00d4ff"

2. "Generate a TypeScript interface for campaign data with 5 agent stages: segmentation, content retrieval, generation, compliance, and sending"

3. "Create an axios client function to call Agent 4 compliance API at https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze with message array input"

4. "Build a React component that displays a horizontal flow of 5 agent cards with status indicators (done, processing, waiting) and progress numbers"

5. "Create a polling hook that fetches campaign status every 2 seconds and updates state with agent progress"

6. "Generate a results table component showing customer ID, segment, approval status (approved/rejected), and reason with color-coded badges"

7. "Build a JSON validator component with textarea input for message arrays and display compliance results from Agent 4 API"

8. "Create a campaign orchestrator function that sequentially calls agents 1-4 and aggregates results"

## 🎯 Key Features Checklist

- [ ] Home page with project description and team
- [ ] Persistent navbar across all pages
- [ ] Dashboard with campaign overview
- [ ] Demo campaign with full orchestration
- [ ] Custom campaign setup page
- [ ] Message compliance validator tool
- [ ] Real-time status polling (2s interval)
- [ ] Agent status cards with progress
- [ ] Results table with approval/rejection
- [ ] Responsible AI visibility (rejection reasons)
- [ ] Consistent color theme (navy + cyan)
- [ ] Custom 404 page
- [ ] Responsive design
- [ ] Error handling and loading states
- [ ] Export results functionality

## 🔐 Responsible AI Features

Ensure these are prominently displayed:
1. **Rejection Reasons**: Always show why a message was rejected
2. **Safety Scores**: Display hate, violence, sexual, self-harm scores
3. **Approval Rate**: Show percentage prominently
4. **Audit Trail**: Timestamp all compliance checks
5. **Manual Override**: UI for reviewing rejected messages
6. **Transparency**: Clear labeling of AI-generated content

---

## 📝 Notes for Team Presentation

Highlight these during demo:
- **Sequential validation** (not parallel) ensures control
- **Mandatory compliance** (Agent 4 cannot be bypassed)
- **Pre-approved templates** reduce risk
- **Multi-variant testing** (3 per customer) for optimization
- **Real-time monitoring** for enterprise observability
- **Azure integration** showcasing platform capabilities

Good luck with the Microsoft Innovation Challenge 2025! 🚀
