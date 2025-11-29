# Agent 4 API Testing Guide

## ✅ CORS Configuration Complete!

Your Agent 4 API is now properly configured and accessible from `localhost:5005`.

## 🔗 Agent 4 Endpoints

**Base URL:** `https://chainreach-compliance-func.azurewebsites.net/api`

### Available Endpoints:

1. **Health Check**
   - URL: `https://chainreach-compliance-func.azurewebsites.net/api/Health`
   - Method: GET
   - Response: `{"timestamp": "2025-11-25T..."}`

2. **Content Safety Analysis**
   - URL: `https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze`
   - Method: POST
   - Body: `{"messages": ["text1", "text2"]}`
   - Response:
     ```json
     {
       "success": true,
       "total": 2,
       "all_approved": true,
       "results": [
         {
           "id": 0,
           "text": "Hello!",
           "approved": true,
           "reason": "Azure Content Safety",
           "confidence": 1.0,
           "categories": {
             "hate": 0.0,
             "sexual": 0.0,
             "violence": 0.0,
             "self_harm": 0.0
           }
         }
       ]
     }
     ```

## 🧪 PowerShell Test Commands

### Test 1: Health Check
```powershell
Invoke-RestMethod -Uri "https://chainreach-compliance-func.azurewebsites.net/api/Health" -Method GET
```

### Test 2: Analyze Safe Messages
```powershell
$body = @{messages=@(
  "Hello! Thank you for being a valued customer.",
  "Get 20% off your next purchase!",
  "We appreciate your loyalty."
)} | ConvertTo-Json

Invoke-RestMethod -Uri "https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

### Test 3: Analyze Message with Potential Issues
```powershell
$body = @{messages=@(
  "You're an idiot if you don't buy now!",
  "This deal will kill the competition!"
)} | ConvertTo-Json

Invoke-RestMethod -Uri "https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

## 🎯 Testing in the Dashboard

### Custom Campaign Tab

1. Navigate to: `http://localhost:5005/campaigns`
2. Click on **Custom Campaign** tab
3. In the **Messages (JSON)** field, paste:
   ```json
   ["Hello! Thank you for being a valued customer.", "Get 20% off your next purchase!"]
   ```
4. Click **Validate & Send**
5. Wait for real Agent 4 API response (1-2 seconds)
6. View detailed results with:
   - ✅ Approved/❌ Rejected status
   - Confidence scores
   - Category scores (hate, sexual, violence, self_harm)
   - Reason from Azure Content Safety

### Expected Results

**For Safe Messages:**
- `approved: true`
- `confidence: 1.0`
- `reason: "Azure Content Safety"`
- All category scores: `0.0`

**For Problematic Messages:**
- `approved: false`
- `confidence: < 1.0`
- Higher scores in relevant categories (0-7 scale)

## 🔧 Updated Code

The Custom Campaign now uses **real Agent 4 API** instead of mock data:

```typescript
// Real API call
const response = await fetch('https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ messages: parsedMessages }),
});

const data = await response.json();

// Transform API response
const results = data.results.map((result: any) => ({
  id: `msg-${result.id + 1}`,
  text: result.text,
  approved: result.approved,
  reason: result.reason,
  confidence: result.confidence,
  categories: result.categories
}));
```

## 📊 Sample Test Cases

### Test Case 1: Clean Marketing Messages
```json
[
  "Thank you for choosing our service!",
  "Exclusive offer: 30% off this weekend",
  "We value your business and loyalty"
]
```
**Expected:** All approved ✅

### Test Case 2: Aggressive Language
```json
[
  "You're stupid if you miss this deal!",
  "Don't be an idiot, buy now!"
]
```
**Expected:** May be rejected due to hate speech ❌

### Test Case 3: Violent Language
```json
[
  "This sale will kill the competition!",
  "Prices so good they're deadly!"
]
```
**Expected:** May be flagged for violence ❌

## ✅ Integration Complete!

- ✅ Agent 4 API deployed to Azure
- ✅ CORS configured for localhost:5005
- ✅ Health endpoint working
- ✅ Content Safety analysis endpoint working
- ✅ Custom Campaign page updated to use real API
- ✅ Real Azure Content Safety integration
- ✅ Detailed category scores and confidence levels

## 🚀 Next Steps

1. **Start your Next.js server** (if not running):
   ```powershell
   cd person5-orchestrator
   npm run dev
   ```

2. **Test Custom Campaign**:
   - Go to http://localhost:5005/campaigns
   - Click "Custom Campaign" tab
   - Try different message combinations
   - View real compliance results from Azure

3. **Monitor Results**:
   - Check approved/rejected counts
   - View category scores
   - See confidence levels
   - Read Azure Content Safety reasons

Your Agent 4 is now fully integrated with real Azure Content Safety API! 🎉
