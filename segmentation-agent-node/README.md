# ChainReach AI - Segmentation Agent (Node.js/TypeScript)

🎯 **Production-ready customer segmentation API with AI-powered insights**

## Features

- ✅ **AI-Powered Segmentation** - Azure OpenAI integration for intelligent customer grouping
- ✅ **RESTful API** - Complete CRUD operations for customers and segments
- ✅ **PostgreSQL** - Scalable database with optimized indexes
- ✅ **TypeScript** - Type-safe development
- ✅ **Azure Ready** - Docker and Azure App Service deployment
- ✅ **Rate Limiting** - Built-in API protection
- ✅ **CORS Support** - Dashboard integration ready

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Azure OpenAI (optional, for AI features)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your database and Azure credentials

# Initialize database
psql -U postgres -d chainreach_db -f scripts/init-db.sql

# Start development server
npm run dev
```

Server runs at: `http://localhost:8001`

## API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /` - API documentation

### Segments
- `GET /api/segments` - List all segments
- `GET /api/segments/:id` - Get segment details with customers
- `POST /api/segments` - Create new segment
- `POST /api/segment/analyze` - AI-powered segment analysis
- `POST /api/segment/refresh` - Recalculate all segments
- `POST /api/segments/:id/generate-message` - Generate marketing copy
- `POST /api/segment/calculate-engagement` - Update engagement scores

### Customers
- `GET /api/customers` - List customers (with filters)
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

## Example Usage

### Create a Segment

```bash
curl -X POST http://localhost:8001/api/segments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High-Value Tech Companies",
    "description": "Technology companies with strong engagement",
    "criteria": {
      "industry": "Technology",
      "min_total_purchases": 10000,
      "min_engagement_score": 70
    }
  }'
```

### AI-Powered Analysis

```bash
curl -X POST http://localhost:8001/api/segment/analyze
```

### Get Segment Customers

```bash
curl "http://localhost:8001/api/segments/1?limit=50&offset=0"
```

## Deployment

### Azure App Service

```bash
# Build
npm run build

# Deploy via ZIP
az webapp deployment source config-zip \
  --resource-group chainreach-ai \
  --name chainreach-segmentation-node \
  --src dist.zip
```

### Docker

```bash
# Build image
docker build -t chainreach-segmentation .

# Run locally
docker run -p 8001:8001 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=yourpassword \
  chainreach-segmentation
```

## Environment Variables

See `.env.example` for all configuration options.

## Integration with Dashboard

Update your dashboard's API configuration:

```typescript
// person5-orchestrator-dashboard/src/lib/api/config.ts
export const API_ENDPOINTS = {
  segmentation: 'https://chainreach-segmentation-node.azurewebsites.net',
  // ... other agents
};
```

## License

MIT
