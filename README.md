# 🔗 ChainReach AI

**AI-Powered Marketing Personalization Platform**

[![Status](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com/YOUR-USERNAME/chainreach-ai)
[![Deadline](https://img.shields.io/badge/deadline-Nov%2028%2C%202025-red)](https://github.com/YOUR-USERNAME/chainreach-ai)
[![Team](https://img.shields.io/badge/team-5%20agents-blue)](https://github.com/YOUR-USERNAME/chainreach-ai)

> *Reaching every customer with the right message, at the right time*

---

## 🎯 What is ChainReach AI?

ChainReach AI is an intelligent multi-agent system that **automatically personalizes marketing campaigns at scale**. By combining customer segmentation, AI-powered message generation, and safety validation, it delivers the right message to the right customer at the right time.

### The Problem
- 📧 Generic marketing messages have low engagement rates
- ⏰ Manual personalization doesn't scale
- 🚫 Risk of sending inappropriate or non-compliant content
- 📊 Difficult to track what messaging works best

### Our Solution
A coordinated system of 5 specialized AI agents that work together to:
- 🎯 Intelligently segment customers based on behavior
- 📚 Retrieve relevant marketing content from libraries
- ✍️ Generate personalized message variants using GPT-4
- ✅ Validate content for safety and compliance
- 📊 Track performance and optimize campaigns

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        ChainReach AI System                       │
└──────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌───────────┐  ┌───────────┐  ┌───────────┐
            │  Agent 1  │  │  Agent 2  │  │  Agent 3  │
            │ Segment   │→ │  Content  │→ │ Generate  │
            │ Customers │  │ Retrieval │  │ Messages  │
            └───────────┘  └───────────┘  └───────────┘
                                                  │
                                                  ▼
                                          ┌───────────┐
                                          │  Agent 4  │
                                          │ Validate  │
                                          │Compliance │
                                          └───────────┘
                                                  │
                                                  ▼
                                          ┌───────────┐
                                          │  Agent 5  │
                                          │Orchestrate│
                                          │ Dashboard │
                                          └───────────┘
```

---

## 🤖 The 5 AI Agents

### Agent 1: Customer Segmentation 🎯
**Technology:** Python • Flask • Rule-based Logic  
**Port:** 5001

Analyzes customer data to classify users into meaningful segments (e.g., "morning commuter," "budget shopper," "premium buyer").

**Input:** Customer ID + behavioral data  
**Output:** Segment label + confidence score

---

### Agent 2: Content Retrieval 📚
**Technology:** Python • Flask • JSON Storage  
**Port:** 5002

Searches marketing content library to find relevant, pre-approved materials for each customer segment.

**Input:** Customer segment  
**Output:** Top 3 relevant content pieces with metadata

---

### Agent 3: Message Generation ✍️
**Technology:** Node.js • Express • Azure OpenAI (GPT-4)  
**Port:** 5003

Uses GPT-4 to generate multiple personalized message variants tailored to each segment and format (email, SMS, social).

**Input:** Segment + content snippets + format  
**Output:** 3 unique message variants with different tones

---

### Agent 4: Safety & Compliance ✅
**Technology:** Python • Flask • Azure Content Safety  
**Port:** 5004

Validates all generated messages for toxicity, bias, and compliance with brand guidelines and regulations.

**Input:** Generated messages  
**Output:** Approval status + confidence scores + flagged issues

---

### Agent 5: Orchestration & Analytics 📊
**Technology:** Next.js • TypeScript • React • Recharts  
**Port:** 3000

Coordinates all agents, runs A/B/n experiments, and displays real-time campaign performance in an interactive dashboard.

**Features:**
- Campaign execution engine
- Real-time metrics dashboard
- A/B testing framework
- Performance analytics
- Conversion tracking

---

## ✨ Key Features

- 🚀 **Automated Personalization** - Scale 1-to-1 marketing to thousands of customers
- 🤖 **AI-Powered Generation** - GPT-4 creates human-like, on-brand messages
- 🛡️ **Safety-First** - Automated compliance and content validation
- 📊 **Data-Driven** - Track performance and optimize in real-time
- 🔄 **A/B Testing** - Compare variants to find what resonates
- ⚡ **Fast Integration** - RESTful APIs connect easily to existing systems

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for Agents 3 & 5)
- **Python** 3.10+ (for Agents 1, 2, 4)
- **Git**
- **Azure OpenAI API** key (for Agent 3)
- **Azure Content Safety** key (for Agent 4)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/chainreach-ai.git
cd chainreach-ai

# Each agent has its own setup - navigate to agent folders
cd person1-segmentation/
# Follow README.md instructions in each folder
```

### Running Locally

```bash
# Terminal 1 - Agent 1 (Segmentation)
cd person1-segmentation
python app.py
# Runs on http://localhost:5001

# Terminal 2 - Agent 2 (Content)
cd person2-content
python app.py
# Runs on http://localhost:5002

# Terminal 3 - Agent 3 (Generation)
cd person3-generation
npm install
npm start
# Runs on http://localhost:5003

# Terminal 4 - Agent 4 (Compliance)
cd person4-compliance
python app.py
# Runs on http://localhost:5004

# Terminal 5 - Agent 5 (Dashboard)
cd person5-orchestrator
npm install
npm run dev
# Dashboard at http://localhost:3000
```

### Test the System

1. Open dashboard: `http://localhost:3000`
2. Enter customer IDs
3. Click "Run Campaign"
4. View personalized messages and analytics

---

## 📊 Project Status

**Deadline:** November 28, 2025  
**Current Phase:** Development Sprint

| Component | Status | Progress |
|-----------|--------|----------|
| 🎯 Agent 1: Segmentation | 🔴 Not Started | 0% |
| 📚 Agent 2: Content | 🔴 Not Started | 0% |
| ✍️ Agent 3: Generation | 🔴 Not Started | 0% |
| ✅ Agent 4: Compliance | 🔴 Not Started | 0% |
| 📊 Agent 5: Orchestrator | 🔴 Not Started | 0% |
| 🔄 Integration | 🔴 Not Started | 0% |
| 📖 Documentation | 🟡 In Progress | 30% |
| 🧪 Testing | 🔴 Not Started | 0% |

**Status Legend:**
- 🔴 Not Started
- 🟡 In Progress  
- 🟢 Complete
- 🔵 Testing
- ⚫ Blocked

---

## 🛠️ Tech Stack

### Backend
- **Python 3.10+** - Agents 1, 2, 4
- **Flask** - REST API framework
- **Node.js 18+** - Agent 3
- **Express** - API routing

### AI & Cloud
- **Azure OpenAI Service** - GPT-4 for message generation
- **Azure Content Safety** - Compliance validation
- **Azure Functions** - Serverless orchestration (optional)

### Frontend
- **Next.js 14** - React framework for Agent 5
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

### DevOps
- **Git & GitHub** - Version control
- **pytest / Jest** - Testing frameworks
- **GitHub Actions** - CI/CD (optional)

---

## 📚 Documentation

- [API Contracts](docs/API-CONTRACTS.md) - Detailed API specifications for all agents
- [Setup Guide](docs/SETUP.md) - Installation and configuration
- [Testing Guide](docs/TESTING.md) - How to run tests
- [Architecture](docs/ARCHITECTURE.md) - System design details
- [Contributing](docs/CONTRIBUTING.md) - How to contribute

---

## 🌿 Branching Strategy

We use **Git Flow** for organized collaboration:

```
main (production)
  ↓
develop (integration)
  ↓
feature/agent1-segmentation-logic
feature/agent2-content-library
feature/agent3-gpt4-integration
feature/agent4-safety-checks
feature/agent5-dashboard-ui
```

**Rules:**
- ✅ Always create feature branches from `develop`
- ✅ Create Pull Requests for code review
- ✅ Get approval before merging
- ❌ Never push directly to `main`

---

## 🧪 Testing

### Unit Tests

```bash
# Python agents (1, 2, 4)
pytest tests/

# Node.js agents (3, 5)
npm test
```

### Integration Tests

```bash
# Run full pipeline test (Agent 5)
cd person5-orchestrator
npm run test:integration
```

### Manual Testing

Use the dashboard at `http://localhost:3000` to test end-to-end workflows.

---

## 👥 Team

| Role | Agent | Responsibility | Tech Stack |
|------|-------|----------------|------------|
| **Person 1** | Segmentation | Customer classification | Python/Flask |
| **Person 2** | Content | Marketing library search | Python/Flask |
| **Person 3** | Generation | AI message creation | Node.js/GPT-4 |
| **Person 4** | Compliance | Safety validation | Python/Azure |
| **Person 5** | Orchestrator | Integration & dashboard | Next.js/React |

---

## 📅 Timeline

### Week 1: Foundation (Nov 13-19)
- [x] Repository setup
- [ ] Mock API development
- [ ] First integration test
- [ ] Core feature implementation

### Week 2: Integration & Polish (Nov 20-27)
- [ ] Connect all agents
- [ ] End-to-end testing
- [ ] Dashboard completion
- [ ] Demo preparation

### Demo Day: November 28, 2025 🎯

---

## 🎯 Success Metrics

### Technical Goals
- ✅ All 5 agents operational
- ✅ < 2 second response time per agent
- ✅ 99%+ compliance check accuracy
- ✅ End-to-end pipeline processes 100 customers/minute

### Business Impact
- 📈 **25%+ increase** in click-through rates
- 📈 **30%+ increase** in conversion rates
- 📈 **50%+ reduction** in manual personalization time
- 📈 **100%** automated compliance checking

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- ✅ Code follows style guidelines
- ✅ Tests pass
- ✅ Documentation updated
- ✅ PR description is clear

---

## 📝 License

This project is part of a hackathon submission. All rights reserved.

---

## 🔗 Links

- **Repository:** https://github.com/YOUR-USERNAME/chainreach-ai
- **Documentation:** [Link to docs]
- **Demo Video:** [Link when available]
- **Live Demo:** [Link when deployed]

---

## 🙏 Acknowledgments

- **Azure OpenAI** for GPT-4 API access
- **Azure Content Safety** for compliance tools
- **Our amazing team** for making this possible
- **Hackathon organizers** for the opportunity

---

## 📧 Contact

**Project Lead:** [Your Name]  
**Email:** your.email@example.com  
**WhatsApp Group:** [Team group link]

---

## 🌟 Star This Repo!

If you find ChainReach AI interesting or useful, please give it a ⭐!

---

<div align="center">

**Built with ❤️ by the ChainReach AI Team**

*"Reaching every customer with the right message, at the right time"*

[Report Bug](https://github.com/YOUR-USERNAME/chainreach-ai/issues) · [Request Feature](https://github.com/YOUR-USERNAME/chainreach-ai/issues) · [Documentation](docs/)

</div>