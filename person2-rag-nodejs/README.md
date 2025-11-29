# Person2 RAG Agent - Node.js
Content Retrieval Agent for ChainReach AI

## Purpose
- Takes customer segments from Agent 1 (Segmentation)
- Generates marketing content for each segment using Azure OpenAI GPT-4o
- Provides content retrieval and search capabilities
- Sends structured content to Agent 3 (Message Generation)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env` file:
```
PORT=8000
AZURE_OPENAI_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
SEGMENTATION_API=http://localhost:3000
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Test Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Get all content
curl http://localhost:8000/api/content

# Search content
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"high value customers","top_k":5}'

# Generate content for segment
curl -X POST http://localhost:8000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{"segment":"High Value Customers","description":"Customers with high purchase value"}'

# Get segments from Agent 1
curl http://localhost:8000/api/segments
```

## Endpoints

### GET /health
Returns service health status

### GET /api/content
Returns all available marketing content

### POST /api/search
Search content by query
- Body: `{query: string, top_k: number}`

### POST /api/generate-content
Generate new content for a segment using GPT-4o
- Body: `{segment: string, description: string, criteria?: object}`

### GET /api/segments
Fetch segments from Agent 1 Segmentation API

## Architecture
- Express.js server
- TypeScript
- Azure OpenAI GPT-4o integration
- Minimal dependencies
- Horizontal scaling ready
