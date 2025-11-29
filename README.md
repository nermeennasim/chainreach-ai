# ChainReach AI - Multi-Agent Campaign Orchestration Platform

> **AI-Powered Marketing Campaign Platform with 5-Agent Orchestration**  
> Intelligent customer segmentation, content generation, and compliance validation for personalized marketing at scale.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Azure](https://img.shields.io/badge/Azure-Deployed-blue.svg)](https://azure.microsoft.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)

---

## 🚀 Overview

**ChainReach AI** is an intelligent multi-agent system that revolutionizes marketing campaign creation through AI-powered automation. The platform orchestrates 5 specialized AI agents to analyze customers, generate personalized content, and ensure compliance—all through an intuitive dashboard.

### ✨ Key Features

- 🎯 **AI-Powered Customer Segmentation** - Automatically segment customers using Azure OpenAI
- 📝 **Dynamic Content Generation** - Create personalized messages for each segment
- ✅ **Real-Time Compliance Validation** - Azure AI Content Safety with 0-6 severity scoring
- 📊 **Interactive Dashboard** - Monitor campaigns, view analytics, and manage workflows
- 🔄 **5-Agent Orchestration** - Seamless coordination of specialized AI agents
- 🌐 **Cloud-Native Architecture** - Azure Functions, PostgreSQL, and serverless deployment

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    ChainReach AI Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Agent 1    │  │   Agent 2    │  │   Agent 3    │        │
│  │ Segmentation │→ │     RAG      │→ │   Content    │        │
│  │   (Node.js)  │  │  (Mocked)    │  │ (Mocked)     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         ↓                                      ↓               │
│  ┌──────────────┐                     ┌──────────────┐        │
│  │   Agent 4    │                     │   Agent 5    │        │
│  │ Compliance   │←────────────────────│ Orchestrator │        │
│  │(Azure Func)  │                     │  (Dashboard) │        │
│  └──────────────┘                     └──────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🤖 Agent Roles

| Agent | Component | Technology | Status | Purpose |
|-------|-----------|------------|--------|---------|
| **Agent 1** | Segmentation Agent | Node.js + Azure OpenAI | ✅ Working | Analyze customers and create intelligent segments |
| **Agent 2** | RAG Content Retrieval | Node.js | 🟡 Mocked | Retrieve relevant content from knowledge base |
| **Agent 3** | Message Generation | GPT-4 | 🟡 Mocked | Generate personalized messages per segment |
| **Agent 4** | Compliance Validator | Azure Functions + AI Content Safety | ✅ Working | Validate messages for compliance (0-6 scale) |
| **Agent 5** | Campaign Orchestrator | Next.js Dashboard | ✅ Working | Coordinate all agents and manage workflows |

---

## 📂 Project Structure

```
chainreach-ai/
├── segmentation-agent-node/        # Agent 1: Customer Segmentation
│   ├── src/
│   │   ├── services/aiService.ts   # Azure OpenAI integration
│   │   ├── controllers/            # API endpoints
│   │   └── config/                 # Database & AI config
│   └── README.md
│
├── person4-compliance-azfn/        # Agent 4: Compliance Validation
│   ├── ValidateMessages/           # Azure Function
│   │   └── index.js                # Content Safety API
│   └── README.md
│
├── person5-orchestrator-dashboard/ # Agent 5: Dashboard & Orchestration
│   ├── app/                        # Next.js 14 App Router
│   │   ├── campaign/               # Campaign management pages
│   │   ├── api-explorer/           # API testing interface
│   │   └── analytics/              # Real-time analytics
│   ├── hooks/
│   │   └── useOrchestrator.ts      # 5-agent orchestration logic
│   └── README.md
│
├── person2-rag-nodejs/             # Agent 2: RAG (Mocked)
├── MessageGeneration/              # Agent 3: Content Gen (Mocked)
│
├── .env.template                   # Environment variables template
├── chainreach-ai.sln               # Visual Studio solution
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Azure Account** with:
  - Azure OpenAI Service (GPT-4o deployment)
  - Azure AI Content Safety
  - Azure PostgreSQL Flexible Server
- **PowerShell** 7+ (for deployment scripts)
- **Git**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/nermeennasim/chainreach-ai.git
cd chainreach-ai
```

### 2️⃣ Environment Setup

```bash
# Copy environment template
cp .env.template .env

# Configure your Azure credentials:
# - AZURE_OPENAI_ENDPOINT=<your-endpoint>
# - AZURE_OPENAI_KEY=<your-key>
# - DB_HOST=<your-postgres-host>
# - DB_PASSWORD=<your-password>
```

### 3️⃣ Start Agent 1 - Segmentation Agent

```bash
cd segmentation-agent-node
npm install
npm run dev
# Server runs on http://localhost:3000
```

### 4️⃣ Deploy Agent 4 - Compliance Validator

```bash
cd person4-compliance-azfn
func start
# Azure Function runs on http://localhost:7071
```

### 5️⃣ Launch Agent 5 - Dashboard

```bash
cd person5-orchestrator-dashboard
npm install
npm run dev
# Dashboard runs on http://localhost:3001
```

### 6️⃣ Create Your First Campaign

1. Open dashboard: **http://localhost:3001**
2. Navigate to **Campaign → Create Campaign**
3. Click **"Run Demo Campaign"**
4. Watch as all 5 agents orchestrate to:
   - Segment customers (Agent 1)
   - Retrieve content (Agent 2 - mocked)
   - Generate messages (Agent 3 - mocked)
   - Validate compliance (Agent 4)
   - Display results (Agent 5)

---

## 📊 Key Features

### 🎯 Customer Segmentation (Agent 1)

```typescript
// Automatic AI-powered segmentation
POST /api/segment/analyze
{
  "customers": [...],  // Your customer data
  "criteria": "behavioral, demographic, value-based"
}

// Returns intelligent segments like:
// - High-Value Engaged Customers
// - At-Risk Churners
// - New User Onboarding
```

### ✅ Compliance Validation (Agent 4)

```typescript
// Azure AI Content Safety with 0-6 severity scale
POST /api/ValidateMessages
{
  "messages": ["Your message content..."]
}

// Returns:
{
  "overallCompliance": "Pass",
  "approvalRate": 85.5,
  "results": [
    {
      "message": "...",
      "compliant": true,
      "hateScore": 0,
      "violenceScore": 0,
      "selfHarmScore": 0,
      "sexualScore": 0
    }
  ]
}
```

### 📈 Real-Time Analytics

- Campaign performance metrics
- Compliance approval rates
- Segment distribution charts
- Message validation history

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - App Router, Server Components
- **React 18** - UI components
- **Tailwind CSS** - Styling
- **Recharts** - Analytics visualization
- **Lucide React** - Icons

### Backend
- **Node.js + Express** - Segmentation API
- **Azure Functions** - Compliance validation
- **TypeScript** - Type safety

### AI & ML
- **Azure OpenAI** - GPT-4o for segmentation
- **Azure AI Content Safety** - Compliance validation
- **RAG Architecture** - Content retrieval (planned)

### Database & Storage
- **PostgreSQL** - Customer & segment data
- **Azure Blob Storage** - File storage (planned)

### DevOps
- **Azure App Service** - Node.js hosting
- **Azure Functions** - Serverless compute
- **GitHub Actions** - CI/CD (planned)

---

## 🔐 Security

- ✅ All secrets removed from documentation
- ✅ Environment variables for credentials
- ✅ Azure Content Safety for message validation
- ✅ Severity scoring (0-6 scale) for compliance
- ✅ Secure database connections with SSL

**Note**: Never commit `.env` files or expose API keys in code.

---

## 📖 Documentation

### Quick Start Guides
- [Dashboard Quick Start](./QUICK_START_DASHBOARD.md)
- [API Explorer Guide](./QUICK_START_API_EXPLORER.md)
- [RAG Segmentation](./QUICK_START_RAG_SEGMENTATION.md)

### Component Documentation
- [Segmentation Agent](./segmentation-agent-node/README.md)
- [Compliance Validator](./person4-compliance-azfn/README.md)
- [Dashboard](./person5-orchestrator-dashboard/README.md)
- [RAG Service](./person2-rag-nodejs/README.md)

### API Documentation
- [Segmentation API Endpoints](./SEGMENTATION_API_ENDPOINTS.md)
- [Compliance API Guide](./AGENT4_COMPLIANCE_ENDPOINTS.md)
- [API Testing Guide](./AGENT4_TESTING_GUIDE.md)

### Deployment
- [Azure Deployment Guide](./segmentation-agent-node/AZURE_DEPLOY.md)
- [Deployment Testing](./DEPLOYMENT_TESTING_GUIDE.md)

---

## 🎯 Use Cases

### 1. **E-Commerce Personalization**
- Segment customers by purchase behavior
- Generate personalized product recommendations
- Validate promotional messages for compliance

### 2. **Financial Services**
- Risk-based customer segmentation
- Compliance-validated financial advice
- Regulatory adherence (GDPR, CCPA)

### 3. **Healthcare Communications**
- Patient engagement segmentation
- HIPAA-compliant messaging
- Personalized health tips

### 4. **SaaS Product Marketing**
- User engagement analysis
- Feature adoption campaigns
- Churn prevention messaging

---

## 🚧 Current Status

### ✅ Completed Features
- [x] Agent 1: AI-powered customer segmentation
- [x] Agent 4: Azure Content Safety compliance validation
- [x] Agent 5: Dashboard with campaign orchestration
- [x] Mock implementations for Agent 2 & 3
- [x] Real-time analytics and charts
- [x] API Explorer for testing
- [x] Security: All secrets removed from repo

### 🔄 In Progress
- [ ] Agent 2: RAG content retrieval (currently mocked)
- [ ] Agent 3: GPT-4 message generation (currently mocked)
- [ ] End-to-end integration testing
- [ ] Production deployment automation

### 🎯 Planned Features
- [ ] Multi-channel campaign support (Email, SMS, Push)
- [ ] A/B testing framework
- [ ] Advanced analytics dashboard
- [ ] Campaign scheduling and automation
- [ ] Webhook integrations
- [ ] Multi-tenant support

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built for the **Microsoft AI Hackathon 2025** by Team ChainReach

- **Segmentation Agent** - AI-powered customer analysis
- **RAG Service** - Knowledge base integration
- **Content Generation** - Personalized messaging
- **Compliance Validator** - Azure Content Safety integration
- **Orchestrator Dashboard** - Campaign management interface

---

## 📞 Support

- 📧 Email: support@chainreach.ai
- 🐛 Issues: [GitHub Issues](https://github.com/nermeennasim/chainreach-ai/issues)
- 📖 Docs: [Documentation Index](./DOCUMENTATION_INDEX.md)

---

## 🙏 Acknowledgments

- **Microsoft Azure** - Cloud infrastructure and AI services
- **OpenAI** - GPT-4 language models
- **Azure AI Content Safety** - Compliance validation
- **Next.js Team** - Excellent React framework
- **Vercel** - Development tools and hosting

---

## 🎓 Learn More

### Azure OpenAI
- [Azure OpenAI Documentation](https://learn.microsoft.com/azure/cognitive-services/openai/)
- [GPT-4 Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)

### Azure AI Content Safety
- [Content Safety Overview](https://learn.microsoft.com/azure/cognitive-services/content-safety/)
- [Severity Levels Guide](https://learn.microsoft.com/azure/cognitive-services/content-safety/concepts/harm-categories)

### Next.js & React
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

Made with ❤️ for the Microsoft AI Hackathon 2025

[Website](https://chainreach.ai) • [Documentation](./DOCUMENTATION_INDEX.md) • [API Reference](./SEGMENTATION_API_ENDPOINTS.md)

</div>
