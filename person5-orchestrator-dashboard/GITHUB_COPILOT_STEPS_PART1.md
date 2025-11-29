# ChainReach AI - GitHub Copilot Implementation Steps

## 🎯 Your Mission
Build a production-ready Next.js dashboard that orchestrates 5 AI agents for compliance-first marketing automation.

---

## 📋 STEP 1: Initialize Project (5 minutes)

### 1.1 Create Next.js App
```bash
# Open VS Code terminal
npx create-next-app@latest chainreach-dashboard

# When prompted, select:
# ✓ TypeScript? Yes
# ✓ ESLint? Yes  
# ✓ Tailwind CSS? Yes
# ✓ `src/` directory? No
# ✓ App Router? Yes
# ✓ Customize default import alias? No

cd chainreach-dashboard
code .
```

### 1.2 Install Required Packages
```bash
npm install axios clsx tailwind-merge lucide-react react-hot-toast zustand
```

### 1.3 Copy Your Logo
```bash
# Copy gemini_logo_chainreach-03-white.png to public/ folder
# Rename it to: logo-white.png
```

---

## 📋 STEP 2: Setup Color Theme (5 minutes)

### 2.1 Update `tailwind.config.ts`

**Copilot Prompt:**
```
Update this Tailwind config to include ChainReach custom colors:
- navy-primary: #1a2332
- navy-secondary: #2d3e50
- cyan-primary: #00d4ff
- cyan-secondary: #00b8d9
- success: #10b981
- error: #ef4444
- warning: #f59e0b

Also add fontFamily for 'Inter' and extend spacing for better layouts.
```

**Replace the entire `tailwind.config.ts` content with:**

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
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

### 2.2 Update `app/globals.css`

**Copilot Prompt:**
```
Create global CSS styles with:
1. Import Inter font from Google Fonts
2. Set body background to gray-50
3. Add smooth scrolling
4. Reset default margins/paddings
```

**Replace `globals.css` with:**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-gray-50 font-sans text-gray-900;
  }

  html {
    scroll-behavior: smooth;
  }
}

@layer components {
  .btn-primary {
    @apply bg-navy-primary text-white px-6 py-3 rounded-lg font-medium 
           hover:bg-cyan-primary hover:text-navy-primary transition-all 
           duration-300 shadow-md hover:shadow-lg;
  }

  .btn-secondary {
    @apply bg-cyan-primary text-navy-primary px-6 py-3 rounded-lg font-medium 
           hover:bg-cyan-secondary transition-all duration-300;
  }

  .card {
    @apply bg-white rounded-xl shadow-md p-6 border border-gray-200;
  }

  .status-badge {
    @apply px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide;
  }

  .status-approved {
    @apply status-badge bg-green-100 text-green-800;
  }

  .status-rejected {
    @apply status-badge bg-red-100 text-red-800;
  }

  .status-processing {
    @apply status-badge bg-yellow-100 text-yellow-800 animate-pulse;
  }

  .status-waiting {
    @apply status-badge bg-gray-100 text-gray-600;
  }
}
```

---

## 📋 STEP 3: Create Project Structure (5 minutes)

### 3.1 Create All Folders

```bash
mkdir -p components/layout
mkdir -p components/campaign
mkdir -p components/dashboard
mkdir -p components/ui
mkdir -p lib/api
mkdir -p lib/types
mkdir -p lib/utils
mkdir -p hooks
mkdir -p app/dashboard
mkdir -p app/campaign/demo
mkdir -p app/campaign/custom
mkdir -p app/campaign/validate
```

### 3.2 Create Essential Files

```bash
# Layout components
touch components/layout/Navbar.tsx
touch components/layout/Footer.tsx

# UI components
touch components/ui/Button.tsx
touch components/ui/Card.tsx
touch components/ui/Badge.tsx
touch components/ui/LoadingSpinner.tsx

# API files
touch lib/api/config.ts
touch lib/api/agents.ts
touch lib/api/compliance.ts
touch lib/api/orchestrator.ts

# Type definitions
touch lib/types/campaign.ts

# Utils
touch lib/utils/cn.ts
touch lib/utils/formatters.ts

# Hooks
touch hooks/useCampaign.ts
touch hooks/usePolling.ts

# Pages
touch app/not-found.tsx
touch app/dashboard/page.tsx
touch app/campaign/page.tsx
touch app/campaign/demo/page.tsx
touch app/campaign/validate/page.tsx
```

---

## 📋 STEP 4: Build Core Utilities (10 minutes)

### 4.1 Create `lib/utils/cn.ts`

**Copilot Prompt:** "Create a utility function using clsx and tailwind-merge to merge Tailwind classes safely"

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4.2 Create `lib/types/campaign.ts`

**Copilot Prompt:** "Create TypeScript interfaces for campaign data with customer, segment, template, variant, and compliance result types"

```typescript
export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  segment_score?: number;
  attributes?: Record<string, any>;
}

export interface Segment {
  segment_id: string;
  segment_name: string;
  customer_count: number;
  customers: Customer[];
}

export interface Template {
  template_id: string;
  segment_id: string;
  template_name: string;
  subject: string;
  body: string;
  approved_date: string;
  approval_status: string;
  tags: string[];
}

export interface MessageVariant {
  variant_id: string;
  customer_id: string;
  subject: string;
  body: string;
  personalization_score: number;
  tone: string;
}

export interface ComplianceResult {
  variant_id: string;
  customer_id: string;
  status: 'APPROVED' | 'REJECTED';
  safety_scores: {
    hate: number;
    self_harm: number;
    sexual: number;
    violence: number;
  };
  selected_for_sending: boolean;
  reason: string;
  timestamp: string;
}

export interface AgentStatus {
  agent_id: number;
  agent_name: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
  progress: number;
  data?: any;
  error?: string;
}

export interface CampaignState {
  campaign_id: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  agents: AgentStatus[];
  results?: ComplianceResult[];
  summary?: {
    total_customers: number;
    total_variants: number;
    approved: number;
    rejected: number;
    approval_rate: string;
  };
}
```

### 4.3 Create `lib/api/config.ts`

**Copilot Prompt:** "Create API configuration object for 5 agents with localhost URLs for agents 1-3,5 and Azure Function URL for agent 4"

```typescript
export const API_CONFIG = {
  agent1: {
    url: 'http://localhost:5001',
    name: 'Customer Segmentation Agent',
    icon: '👥',
    description: 'Analyzes customer database and creates segments',
    endpoints: {
      analyze: '/api/segment',
      status: '/api/status'
    }
  },
  agent2: {
    url: 'http://localhost:5002',
    name: 'Content Retrieval Agent',
    icon: '📚',
    description: 'Retrieves pre-approved marketing templates',
    endpoints: {
      retrieve: '/api/content',
      templates: '/api/templates'
    }
  },
  agent3: {
    url: 'http://localhost:5003',
    name: 'Content Generation Agent',
    icon: '✍️',
    description: 'Generates 3 personalized variants per customer',
    endpoints: {
      generate: '/api/generate-variants',
      status: '/api/status'
    }
  },
  agent4: {
    url: 'https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze',
    name: 'Compliance & Safety Agent',
    icon: '🛡️',
    description: 'Validates content with Azure AI Content Safety',
    endpoints: {
      analyze: '',
      validate: ''
    }
  },
  agent5: {
    url: 'http://localhost:5005',
    name: 'Campaign Orchestrator',
    icon: '🎯',
    description: 'Sends approved messages to customers',
    endpoints: {
      send: '/api/send',
      status: '/api/campaign-status'
    }
  }
};

export const POLLING_INTERVAL = 2000; // 2 seconds
export const MAX_RETRIES = 3;
```

---

## 📋 STEP 5: Build API Client (15 minutes)

### 5.1 Create `lib/api/compliance.ts`

**Copilot Prompt:** "Create an axios-based API client for Agent 4 compliance endpoint that accepts messages array and returns safety analysis"

```typescript
import axios from 'axios';
import { API_CONFIG } from './config';

export interface ComplianceRequest {
  messages: string[];
}

export interface ComplianceResponse {
  results: Array<{
    message: string;
    status: 'APPROVED' | 'REJECTED';
    safety_scores: {
      hate: number;
      self_harm: number;
      sexual: number;
      violence: number;
    };
    reason: string;
  }>;
}

export async function validateMessages(messages: string[]): Promise<ComplianceResponse> {
  try {
    const response = await axios.post(
      API_CONFIG.agent4.url,
      { messages },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Compliance API Error: ${error.message}`);
    }
    throw error;
  }
}

export async function validateSingleMessage(message: string): Promise<ComplianceResponse> {
  return validateMessages([message]);
}
```

### 5.2 Create `lib/api/agents.ts`

**Copilot Prompt:** "Create API client functions for agents 1, 2, 3, and 5 with error handling and retry logic"

```typescript
import axios, { AxiosError } from 'axios';
import { API_CONFIG, MAX_RETRIES } from './config';
import { Segment, Template, MessageVariant } from '../types/campaign';

// Helper function for retrying failed requests
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
}

// Agent 1: Customer Segmentation
export async function segmentCustomers(customerData: any[]): Promise<Segment[]> {
  return retryRequest(async () => {
    const response = await axios.post(
      `${API_CONFIG.agent1.url}${API_CONFIG.agent1.endpoints.analyze}`,
      { customers: customerData },
      { timeout: 60000 }
    );
    return response.data.segments;
  });
}

// Agent 2: Content Retrieval
export async function retrieveTemplates(segments: Segment[]): Promise<Template[]> {
  return retryRequest(async () => {
    const response = await axios.post(
      `${API_CONFIG.agent2.url}${API_CONFIG.agent2.endpoints.retrieve}`,
      { segments },
      { timeout: 30000 }
    );
    return response.data.templates;
  });
}

// Agent 3: Content Generation
export async function generateVariants(
  templates: Template[],
  customers: any[]
): Promise<MessageVariant[]> {
  return retryRequest(async () => {
    const response = await axios.post(
      `${API_CONFIG.agent3.url}${API_CONFIG.agent3.endpoints.generate}`,
      { templates, customers },
      { timeout: 120000 } // 2 minutes for generation
    );
    return response.data.variants;
  });
}

// Agent 5: Send Campaign
export async function sendCampaign(approvedMessages: any[]): Promise<any> {
  return retryRequest(async () => {
    const response = await axios.post(
      `${API_CONFIG.agent5.url}${API_CONFIG.agent5.endpoints.send}`,
      { messages: approvedMessages },
      { timeout: 60000 }
    );
    return response.data;
  });
}

// Get agent status
export async function getAgentStatus(agentNumber: 1 | 2 | 3 | 5): Promise<any> {
  const config = API_CONFIG[`agent${agentNumber}` as keyof typeof API_CONFIG];
  try {
    const response = await axios.get(`${config.url}/api/status`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    return { status: 'unavailable' };
  }
}
```

---

## 📋 STEP 6: Build Navbar Component (10 minutes)

### 6.1 Create `components/layout/Navbar.tsx`

**Copilot Prompt:** "Create a Next.js navbar component with logo, navigation links (Home, Dashboard, Campaign), active state styling with cyan underline, and mobile responsive menu"

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Campaign', href: '/campaign' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-navy-primary sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo-white.png"
              alt="ChainReach AI Logo"
              width={180}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative px-3 py-2 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'text-cyan-primary' 
                      : 'text-white hover:text-cyan-primary'
                    }
                  `}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-secondary">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium
                    ${isActive
                      ? 'bg-cyan-primary text-navy-primary'
                      : 'text-white hover:bg-navy-primary'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
```

---

## 📋 STEP 7: Update Root Layout (5 minutes)

### 7.1 Update `app/layout.tsx`

**Copilot Prompt:** "Update root layout to include Navbar and Toaster for notifications"

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChainReach AI | Compliance-First Marketing Automation',
  description: 'Enterprise-grade AI marketing automation with mandatory safety validation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

---

## 📋 STEP 8: Create Home Page (15 minutes)

### 8.1 Update `app/page.tsx`

**Copilot Prompt:** "Create a landing page with hero section, problem statement, solution overview with 5 agent cards, team section, and tech stack. Use ChainReach navy and cyan colors."

```typescript
import Link from 'next/link';
import { ArrowRight, Shield, Users, FileText, Sparkles, Send, CheckCircle } from 'lucide-react';

const agents = [
  {
    id: 1,
    name: 'Customer Segmentation',
    icon: <Users className="w-8 h-8" />,
    description: 'Analyzes 5000 customers and creates intelligent segments'
  },
  {
    id: 2,
    name: 'Content Retrieval',
    icon: <FileText className="w-8 h-8" />,
    description: 'Retrieves pre-approved marketing templates'
  },
  {
    id: 3,
    name: 'Content Generation',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Generates 3 personalized variants per customer'
  },
  {
    id: 4,
    name: 'Compliance & Safety',
    icon: <Shield className="w-8 h-8" />,
    description: 'Validates with Azure AI Content Safety'
  },
  {
    id: 5,
    name: 'Campaign Delivery',
    icon: <Send className="w-8 h-8" />,
    description: 'Sends only approved messages to customers'
  },
];

const team = [
  { name: 'Person 1', role: 'Customer Segmentation Agent' },
  { name: 'Person 2', role: 'Content Retrieval Agent' },
  { name: 'Person 3', role: 'Content Generation Agent' },
  { name: 'Person 4', role: 'Compliance & Safety Agent' },
  { name: 'Nermeen (You)', role: 'Campaign Orchestrator & Team Lead' },
];

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-primary via-navy-secondary to-navy-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            ChainReach<span className="text-cyan-primary">AI</span>
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-cyan-primary mb-4">
            Compliance-First Marketing Automation
          </p>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Enterprise-grade AI that automates trust through mandatory safety validation. 
            Never worry about harmful content reaching your customers.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/campaign/demo" className="btn-primary inline-flex items-center">
              Start Demo Campaign
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="btn-secondary inline-flex items-center">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-primary mb-4">
              The Enterprise AI Problem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Companies want AI marketing automation but fear compliance risks and potential 
              PR disasters from unsafe AI-generated content.
            </p>
          </div>
        </div>
      </section>

      {/* Solution - 5 Agents */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-primary mb-4">
              Our Solution: Automated Trust
            </h2>
            <p className="text-xl text-gray-600">
              5 specialized AI agents working in sequence with mandatory safety validation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {agents.map((agent, index) => (
              <div key={agent.id} className="relative">
                <div className="card text-center hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-4 text-cyan-primary">
                    {agent.icon}
                  </div>
                  <h3 className="font-semibold text-navy-primary mb-2">
                    Agent {agent.id}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {agent.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {agent.description}
                  </p>
                </div>
                {index < agents.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-cyan-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy-primary text-center mb-12">
            Why ChainReach AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-primary rounded-full mb-4">
                <Shield className="w-8 h-8 text-navy-primary" />
              </div>
              <h3 className="text-xl font-semibold text-navy-primary mb-2">
                Mandatory Compliance
              </h3>
              <p className="text-gray-600">
                Every message must pass Azure AI Content Safety validation before sending
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-primary rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-navy-primary" />
              </div>
              <h3 className="text-xl font-semibold text-navy-primary mb-2">
                Pre-Approved Templates
              </h3>
              <p className="text-gray-600">
                Start with verified content, reducing risk while maintaining personalization
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-primary rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-navy-primary" />
              </div>
              <h3 className="text-xl font-semibold text-navy-primary mb-2">
                Real-Time Monitoring
              </h3>
              <p className="text-gray-600">
                Track every step of the campaign with live status updates and audit trails
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-navy-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-cyan-primary text-lg">
              Microsoft AI Innovation Challenge 2025 | Blue Sprout Agency
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="bg-navy-secondary rounded-lg p-4 mb-2">
                  <Users className="w-12 h-12 mx-auto text-cyan-primary" />
                </div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-primary to-cyan-secondary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-navy-primary mb-4">
            Ready to See It in Action?
          </h2>
          <p className="text-xl text-navy-secondary mb-8">
            Experience compliance-first marketing automation with our demo campaign
          </p>
          <Link href="/campaign/demo" className="inline-flex items-center px-8 py-4 bg-navy-primary text-white font-semibold rounded-lg hover:bg-navy-secondary transition-colors text-lg">
            Launch Demo Campaign
            <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
```

---

## 📋 STEP 9: Create 404 Page (5 minutes)

### 9.1 Create `app/not-found.tsx`

**Copilot Prompt:** "Create a custom 404 page with ChainReach branding and navigation back to home"

```typescript
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-primary to-navy-secondary flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-cyan-primary mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-cyan-primary text-navy-primary font-semibold rounded-lg hover:bg-cyan-secondary transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-navy-secondary text-white font-semibold rounded-lg hover:bg-navy-primary transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 STEP 10: Test Your Progress (5 minutes)

```bash
npm run dev
```

Visit:
- `http://localhost:3000` - Should see beautiful home page
- `http://localhost:3000/dashboard` - Should see navbar (page blank for now)
- `http://localhost:3000/random` - Should see custom 404

---

## 🎯 NEXT STEPS

You now have:
✅ Project structure
✅ Color theme
✅ Navbar with routing
✅ Beautiful home page
✅ Custom 404 page
✅ API clients ready
✅ TypeScript types defined

**Continue with the next guide:**
- STEP 11-15: Build Campaign pages
- STEP 16-20: Build orchestration logic
- STEP 21-25: Add real-time polling
- STEP 26-30: Final testing & deployment

Save this file and use it with GitHub Copilot! Each section has specific Copilot prompts to speed up development.

---

## 💡 Tips for Using GitHub Copilot

1. **Copy-paste the Copilot Prompts** from each step into Copilot Chat
2. **Review generated code** before accepting
3. **Ask Copilot to explain** if something is unclear
4. **Use inline suggestions** - Copilot will suggest code as you type
5. **Test frequently** - Run `npm run dev` after major changes

Good luck! 🚀
