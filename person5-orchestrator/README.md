# 🎯 Person 5 Orchestrator

A Next.js application for orchestrating and managing marketing campaigns with advanced analytics and workflow automation.

## 📖 Overview

The Person 5 Orchestrator is the central coordination layer for the ChainReach AI platform, managing campaign workflows, API integrations, and providing a unified dashboard for monitoring and controlling marketing operations.

## 🏗️ Architecture

```
person5-orchestrator/
├── src/
│   ├── app/              # Next.js 13+ App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   └── campaigns/    # Campaign management pages
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── Dashboard/    # Dashboard-specific components
│   │   ├── CampaignBuilder/ # Campaign creation components
│   │   └── MetricsChart/ # Analytics components
│   ├── lib/              # Core business logic
│   │   ├── orchestrator.ts  # Main orchestration logic
│   │   ├── api-client.ts    # API client utilities
│   │   └── utils.ts         # Helper functions
│   └── types/            # TypeScript type definitions
└── tests/                # Unit and integration tests
```

## ✨ Features

### Current
- 📊 **Dashboard** - Real-time campaign monitoring
- 🎨 **Modern UI** - Built with Tailwind CSS
- 🔒 **Type-Safe** - Full TypeScript support
- ⚡ **Fast** - Next.js 14 with App Router

### To Be Implemented
- 🔄 **Workflow Orchestration** - Automated campaign workflows
- 📈 **Analytics** - Advanced metrics and reporting
- 🎯 **Campaign Builder** - Visual campaign creation
- 🔌 **API Integration** - Connect to multiple services
- 🧪 **Testing** - Comprehensive test coverage

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_SECRET_KEY=your-secret-key

# Database (if applicable)
DATABASE_URL=your-database-url

# External Services
THIRD_PARTY_API_KEY=your-api-key
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## 📚 Core Libraries

### Orchestrator (`src/lib/orchestrator.ts`)

Central coordination logic for managing campaigns and workflows.

```typescript
import { Orchestrator } from '@/lib/orchestrator';

const orchestrator = new Orchestrator();
await orchestrator.executeCampaign(campaignConfig);
```

### API Client (`src/lib/api-client.ts`)

Standardized API communication layer.

```typescript
import { apiClient } from '@/lib/api-client';

const campaigns = await apiClient.get('/campaigns');
```

### Types (`src/types/index.ts`)

Comprehensive TypeScript definitions for the entire application.

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🎨 Styling

This project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

### Custom Theme
- Colors, fonts, and spacing are customizable
- Dark mode support ready
- Responsive utilities included

## 📝 Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch",
  "type-check": "tsc --noEmit"
}
```

## 🔗 API Routes

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Analytics
- `GET /api/analytics/overview` - Dashboard metrics
- `GET /api/analytics/campaign/:id` - Campaign-specific metrics

### Orchestration
- `POST /api/orchestrate/execute` - Execute workflow
- `GET /api/orchestrate/status/:id` - Check workflow status

## 🤝 Contributing

1. Create a feature branch from `main-develop`
2. Make your changes
3. Write/update tests
4. Ensure linting passes
5. Submit a pull request

## 📄 License

This project is part of the ChainReach AI platform.

## 🆘 Support

For questions or issues, contact the development team or refer to the project documentation.

---

**Happy coding!** 🎉
