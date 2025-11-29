# Quick Start: RAG + Segmentation Integration

## ⚡ 30-Second Setup

### Step 1: Start All Services (3 Terminals)

**Terminal 1:**
```bash
cd segmentation-agent-node
npm run dev
```

**Terminal 2:**
```bash
cd person2-rag-nodejs
npm run dev
```

**Terminal 3:**
```bash
cd person5-orchestrator-dashboard
npm run dev
```

### Step 2: Test Integration

**PowerShell:**
```powershell
.\test-rag-segmentation-integration.ps1
```

### Step 3: Access Dashboard

Open: `http://localhost:3000/integration`

---

## 🎯 What You Can Do

### 1. Execute Workflow
- Click "Start Workflow" button
- Fetches all segments from Agent 1
- Generates content via Agent 2 RAG API
- Displays results in real-time

### 2. View Segments
- See all customer segments
- View customer counts
- See generated content count

### 3. Browse Generated Content
- Click on segment to view details
- See generated marketing messages
- Review content type and audience
- Check campaign assignments

### 4. Search Content
- Search across all segments
- Filter by keywords
- Find relevant content quickly

---

## 📊 Real-Time Dashboard

### Metrics
- **Total Segments:** Number of customer segments
- **Content Generated:** Count of generated items
- **Success Rate:** % of successful generations
- **Total Items:** Total content pieces created

### Segment Cards
- Segment name and description
- Customer count
- Generated content count
- Click to expand and view content

### Content View
- Content title
- Content type (promotion, guide, whitepaper, etc.)
- Target audience
- Campaign name
- Full content preview

---

## 🔌 API Usage (TypeScript)

```typescript
// Import the service layer
import {
  executeRagSegmentationWorkflow,
  checkRagSegmentationHealth,
  getSegmentsOnly,
  getContentForSegment,
  searchSegmentContent,
  getRagSegmentationStats
} from '@/lib/api/rag-segmentation';

// Execute full workflow
async function demo() {
  try {
    // 1. Check health
    const health = await checkRagSegmentationHealth();
    console.log('Services status:', health.status);

    // 2. Get only segments (fast)
    const segments = await getSegmentsOnly();
    console.log('Segments:', segments.length);

    // 3. Execute full workflow (includes content)
    const results = await executeRagSegmentationWorkflow();
    console.log('Generated:', results.metrics.totalContentItems, 'content items');

    // 4. Get stats
    const stats = await getRagSegmentationStats();
    console.log('Stats:', stats);

    // 5. Search content
    const searchResults = await searchSegmentContent('enterprise');
    console.log('Search results:', searchResults.length);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🔍 API Endpoints

### Health Check
```bash
GET /api/integration/rag-segmentation
```

### Execute Workflow
```bash
POST /api/integration/rag-segmentation
Content-Type: application/json

{
  "generateContent": true
}
```

### Response Example
```json
{
  "success": true,
  "segmentation": {
    "segmentsCount": 4,
    "segments": [
      {
        "name": "VIP Enterprise",
        "customerCount": 250
      }
    ]
  },
  "contentGeneration": {
    "generatedFor": 4,
    "totalContentItems": 12
  },
  "metrics": {
    "contentGenerationSuccessRate": 100
  }
}
```

---

## 🚨 Troubleshooting

### "Could not connect to services"
```bash
# Check Segmentation Agent
curl http://localhost:3001/health

# Check RAG API
curl http://localhost:8000/health

# Check Dashboard
curl http://localhost:3000/
```

### "No segments found"
```bash
# Verify data in Segmentation Agent
curl http://localhost:3001/api/segments
```

### "Content generation timeout"
- RAG API may take 5-10 seconds first time
- Check Azure OpenAI configuration
- Verify RAG API logs

---

## 📈 Performance Tips

1. **Fetch Segments Only First** (faster)
   ```typescript
   const segments = await getSegmentsOnly();
   ```

2. **Cache Results** (optional)
   ```typescript
   const cache = new Map();
   const results = cache.get('rag-segments') || 
                   await executeRagSegmentationWorkflow();
   ```

3. **Batch Large Operations**
   ```typescript
   const batchSize = 5;
   const batches = Array.from(
     { length: Math.ceil(segments.length / batchSize) },
     (_, i) => segments.slice(i * batchSize, (i+1) * batchSize)
   );
   ```

---

## 🎨 UI Components

### Dashboard Component
```tsx
<RagSegmentationIntegration />
```

### Features
- Real-time workflow execution
- Segment selection and display
- Content preview
- Error handling
- Loading states
- Success indicators
- Metrics cards

---

## 📝 Configuration

### .env.local
```env
SEGMENTATION_API_URL=http://localhost:3001
RAG_API_URL=http://localhost:8000
```

### Optional Custom URLs
```typescript
await executeRagSegmentationWorkflow(
  'http://custom-segmentation:3001',
  'http://custom-rag:8000'
);
```

---

## 🔗 Related Files

- **Guide:** `RAG_SEGMENTATION_INTEGRATION_GUIDE.md`
- **Summary:** `RAG_SEGMENTATION_INTEGRATION_SUMMARY.md`
- **Route:** `app/api/integration/rag-segmentation/route.ts`
- **Service:** `lib/api/rag-segmentation.ts`
- **Component:** `components/integration/RagSegmentationDashboard.tsx`
- **Page:** `app/integration/page.tsx`

---

## ✅ Verification Checklist

- [ ] Segmentation Agent running on port 3001
- [ ] RAG API running on port 8000
- [ ] Dashboard running on port 3000
- [ ] Integration test passing: `.\test-rag-segmentation-integration.ps1`
- [ ] Can access: `http://localhost:3000/integration`
- [ ] "Start Workflow" button works
- [ ] Segments displayed
- [ ] Content generated and visible
- [ ] Metrics showing correct numbers
- [ ] No errors in browser console
- [ ] No errors in terminal logs

---

## 🎯 Next Steps

1. **Test With Real Data**
   - Verify with your actual customer segments
   - Check content relevance
   - Review compliance of generated content

2. **Optimize Performance**
   - Profile API response times
   - Implement caching if needed
   - Add background job processing for large batches

3. **Integrate With Campaigns**
   - Use generated content in campaign creation
   - Map content to segments automatically
   - Build campaign orchestration

4. **Monitor & Maintain**
   - Track integration metrics
   - Monitor API response times
   - Alert on failures
   - Log all operations

---

## 📞 Support

**Issue:** Services not connecting  
**Solution:** Run health check test script

**Issue:** Empty results  
**Solution:** Verify database data in Segmentation Agent

**Issue:** Timeout errors  
**Solution:** Increase timeout or check Azure OpenAI config

**Issue:** CORS errors  
**Solution:** Check CORS configuration in service .env files

---

## 🚀 Status

✅ **Integration Complete**  
✅ **APIs Functional**  
✅ **Dashboard Ready**  
✅ **Testing Provided**  
✅ **Documentation Complete**  

**Ready for production deployment!**
