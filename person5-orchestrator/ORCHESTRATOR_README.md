# 🎯 Person 5 Orchestrator - AI Marketing Personalization Platform

**Role:** Integration Lead & Dashboard Builder  
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui  
**Port:** 3000

## 📋 Overview

The Person 5 Orchestrator is the central coordination layer that integrates all microservices in the AI Marketing Personalization Platform. It orchestrates the complete campaign pipeline and provides a real-time dashboard for monitoring results.

## 🏗️ Architecture Flow

```
Customer Data → Segmentation (5001) → Content (5002) → Generation (5003) → Compliance (5004) → Dashboard (3000)
```

### Service Integration

| Service | Port | Responsibility | Status |
|---------|------|----------------|--------|
| **Person 1** - Segmentation | 5001 | Customer segmentation & trait analysis | Mock Ready |
| **Person 2** - Content | 5002 | Content retrieval per segment | Mock Ready |
| **Person 3** - Generation | 5003 | AI message personalization | Mock Ready |
| **Person 4** - Compliance | 5004 | Regulatory validation | Mock Ready |
| **Person 5** - Orchestrator | 3000 | Integration & dashboard | ✅ Ready |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
person5-orchestrator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── campaign/
│   │   │       └── route.ts          # Campaign execution API
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Main dashboard page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── CampaignRunner.tsx        # Campaign input form
│   │   └── Dashboard.tsx             # Results visualization
│   ├── lib/
│   │   ├── orchestrator.ts           # Core orchestration logic
│   │   ├── api-client.ts             # API utilities
│   │   └── utils.ts                  # Helper functions
│   └── types/
│       └── index.ts                  # TypeScript definitions
├── public/
├── .env.local                        # Environment config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### POST `/api/campaign`

Executes a complete marketing campaign for multiple customers.

**Request:**
```json
{
  "customers": [
    {
      "id": "cust-1001",
      "name": "John Smith",
      "email": "john.smith@example.com"
    }
  ],
  "format": "email" | "sms" | "social"
}
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "total_customers": 5,
    "approved_count": 4,
    "rejected_count": 1,
    "success_rate": "80.0%"
  },
  "results": [
    {
      "customer_id": "cust-1001",
      "customer_name": "John Smith",
      "segment": "high-value",
      "confidence": 0.89,
      "variant": "premium",
      "format": "email",
      "message_preview": "Hi John...",
      "compliance_status": "approved",
      "compliance_issues": [],
      "timestamp": "2025-11-14T..."
    }
  ]
}
```

## 🎨 Dashboard Features

### Campaign Runner
- Configure number of customers (1-50)
- Select message format (Email, SMS, Social)
- One-click campaign execution
- Real-time progress tracking

### Metrics Cards
- **Total Customers**: Number of customers processed
- **Approved**: Messages passing compliance
- **Rejected**: Messages failing compliance
- **Success Rate**: Percentage of approved messages

### Results Display
- Customer-by-customer breakdown
- Segment classification with confidence scores
- Message previews
- Compliance status and issues
- Variant assignment
- Format icons

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:

```env
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000
AGENT_1_URL=http://localhost:5001
AGENT_2_URL=http://localhost:5002
AGENT_3_URL=http://localhost:5003
AGENT_4_URL=http://localhost:5004

# Optional
GPT4_API_KEY=your-key-here
```

### Mock vs Live Data

The orchestrator currently uses **mock data** for all API calls. To switch to live APIs:

```typescript
// In src/lib/orchestrator.ts
const orchestrator = new Orchestrator(false); // Set to false for live APIs
```

## 📊 Customer Segments

| Segment | Description | Confidence Target |
|---------|-------------|-------------------|
| **high-value** | Premium customers, high lifetime value | >0.85 |
| **engaged** | Regular interactions, active users | >0.75 |
| **at-risk** | Declining engagement, churn risk | >0.70 |
| **new** | Recently onboarded customers | >0.80 |
| **dormant** | Inactive, needs reactivation | >0.65 |

## 🎯 Content Variants

Each segment receives tailored content:

- **Premium**: Exclusive VIP offers (high-value)
- **Personalized**: Recommendation-based (engaged)
- **Win-back**: Special comeback offers (at-risk)
- **Welcome**: Onboarding campaigns (new)
- **Reactivation**: Re-engagement incentives (dormant)

## 📝 Message Formats

### Email
- Subject line + formatted body
- Personalization tokens
- CTA buttons
- Footer compliance

### SMS
- 160-character limit awareness
- STOP to unsubscribe included
- Concise messaging

### Social
- Emoji-friendly
- Platform-optimized
- Shareable format

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🔗 Integration Checklist

### Week 1: Setup & Mock Integration
- [x] Next.js project initialized
- [x] Tailwind CSS configured
- [x] shadcn/ui components added
- [x] Mock API responses implemented
- [x] Dashboard UI completed
- [x] Campaign runner functional

### Week 2: Live Integration & Polish
- [ ] Connect to Person 1 (Segmentation)
- [ ] Connect to Person 2 (Content)
- [ ] Connect to Person 3 (Generation)
- [ ] Connect to Person 4 (Compliance)
- [ ] Error handling for API failures
- [ ] Loading states & animations
- [ ] Demo presentation prepared

## 🎬 Demo Script

1. **Introduction** (30s)
   - Explain platform purpose
   - Show architecture diagram

2. **Campaign Setup** (1min)
   - Input customer count
   - Select message format
   - Click "Run Campaign"

3. **Real-time Processing** (1min)
   - Show loading state
   - Explain pipeline stages
   - Highlight service calls

4. **Results Dashboard** (2min)
   - Review metrics cards
   - Walk through customer results
   - Show segment classification
   - Explain compliance status
   - Display message previews

5. **Q&A** (1min)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
npm run type-check
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [API Contracts](../docs/API-CONTRACTS.md)

## 👥 Team

**Person 5 Responsibilities:**
- ✅ Integration Lead - Connect all services
- ✅ Dashboard Builder - Visualize results
- ✅ GitHub Admin - Manage repository
- ✅ Demo Leader - Run final presentation

## 📄 License

Hackathon Project - AI Marketing Personalization Platform 2025

---

**Built with ❤️ for the Hackathon 2025** 🚀
