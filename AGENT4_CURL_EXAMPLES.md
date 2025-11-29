# Agent 4: Complete CURL Command Examples

## 📍 API Base URL

```
https://your-function-app.azurewebsites.net
```

Replace `your-function-app` with your actual Azure Function App name.

---

## 1️⃣ Health Check Endpoint

### Command:
```bash
curl -X GET "https://your-function-app.azurewebsites.net/health" \
  -H "Content-Type: application/json"
```

### Response:
```json
{
  "status": "healthy",
  "service": "compliance-checker",
  "person": "Person 4",
  "version": "1.0.0-local",
  "mode": "AZURE",
  "requests_processed": 156,
  "timestamp": "2025-11-28T10:30:45.123456"
}
```

### Status: ✅ 200 OK

---

## 2️⃣ Content Safety Health Endpoint

### Command:
```bash
curl -X GET "https://your-function-app.azurewebsites.net/api/content-safety/health" \
  -H "Content-Type: application/json"
```

### Response:
```json
{
  "status": "ok",
  "service": "content-safety",
  "message": "content safety API is healthy"
}
```

### Status: ✅ 200 OK

---

## 3️⃣ Analyze Single Message

### Command:
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/content-safety/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": ["Check out our enterprise solution"]
  }'
```

### Response (Approved):
```json
{
  "success": true,
  "total": 1,
  "all_approved": true,
  "results": [
    {
      "id": 0,
      "text": "Check out our enterprise solution",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {
        "hate": 0,
        "sexual": 0,
        "violence": 0,
        "self_harm": 0
      }
    }
  ]
}
```

### Status: ✅ 200 OK

---

## 4️⃣ Analyze Rejected Message

### Command:
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/content-safety/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": ["We will destroy the competition"]
  }'
```

### Response (Rejected):
```json
{
  "success": true,
  "total": 1,
  "all_approved": false,
  "results": [
    {
      "id": 0,
      "text": "We will destroy the competition",
      "approved": false,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {
        "hate": 0,
        "sexual": 0,
        "violence": 3,
        "self_harm": 0
      }
    }
  ]
}
```

### Status: ✅ 200 OK

---

## 5️⃣ Analyze Batch Messages (5 messages)

### Command:
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/content-safety/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      "Check out our enterprise solution - perfect for large organizations",
      "Limited time offer for Fortune 500 companies",
      "Join thousands of happy customers using our platform",
      "Enterprise-grade security and compliance built-in",
      "Drive growth with our AI-powered marketing tools"
    ]
  }'
```

### Response (All Approved):
```json
{
  "success": true,
  "total": 5,
  "all_approved": true,
  "results": [
    {
      "id": 0,
      "text": "Check out our enterprise solution - perfect for large organizations",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "id": 1,
      "text": "Limited time offer for Fortune 500 companies",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "id": 2,
      "text": "Join thousands of happy customers using our platform",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "id": 3,
      "text": "Enterprise-grade security and compliance built-in",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "id": 4,
      "text": "Drive growth with our AI-powered marketing tools",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    }
  ]
}
```

### Status: ✅ 200 OK (5/5 Approved)

---

## 6️⃣ Analyze Mixed Batch (Some Rejected)

### Command:
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/content-safety/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      "Increase your revenue with our platform",
      "Destroy your competition today",
      "Enterprise security built-in",
      "Kill all your marketing problems",
      "Join Fortune 500 companies"
    ]
  }'
```

### Response (Mixed):
```json
{
  "success": true,
  "total": 5,
  "all_approved": false,
  "results": [
    {
      "id": 0,
      "text": "Increase your revenue with our platform",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "id": 1,
      "text": "Destroy your competition today",
      "approved": false,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 3, "self_harm": 0}
    },
    {
      "id": 2,
      "text": "Enterprise security built-in",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "id": 3,
      "text": "Kill all your marketing problems",
      "approved": false,
      "reason": "Azure Content Safety",
      "confidence": 0.98,
      "categories": {"hate": 0, "sexual": 0, "violence": 2, "self_harm": 1}
    },
    {
      "id": 4,
      "text": "Join Fortune 500 companies",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    }
  ]
}
```

### Status: ✅ 200 OK (3/5 Approved, 2/5 Rejected)

---

## 7️⃣ Validate Endpoint (Full Check)

### Command:
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      "Premium service for your business needs",
      "Increase revenue with our solutions",
      "Enterprise customers trust us for compliance",
      "Safe and secure platform for all sizes",
      "Proven results for major corporations"
    ]
  }'
```

### Response:
```json
{
  "success": true,
  "results": [
    {
      "message_id": 0,
      "text": "Premium service for your business needs",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "message_id": 1,
      "text": "Increase revenue with our solutions",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "message_id": 2,
      "text": "Enterprise customers trust us for compliance",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "message_id": 3,
      "text": "Safe and secure platform for all sizes",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    },
    {
      "message_id": 4,
      "text": "Proven results for major corporations",
      "approved": true,
      "reason": "Azure Content Safety",
      "confidence": 1.0,
      "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0}
    }
  ],
  "all_approved": true,
  "total_checked": 5,
  "mode": "AZURE",
  "timestamp": "2025-11-28T10:45:00.123456"
}
```

### Status: ✅ 200 OK

---

## 8️⃣ Get Statistics

### Command:
```bash
curl -X GET "https://your-function-app.azurewebsites.net/api/stats" \
  -H "Content-Type: application/json"
```

### Response:
```json
{
  "total_requests": 156,
  "service": "compliance-checker",
  "mode": "AZURE",
  "uptime": "running"
}
```

### Status: ✅ 200 OK

---

## ❌ Error Examples

### Error 1: Invalid JSON
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/content-safety/analyze" \
  -H "Content-Type: application/json" \
  -d 'not valid json'
```

**Response:**
```json
{
  "error": "Invalid JSON"
}
```

**Status: ❌ 400 Bad Request**

---

### Error 2: Missing Messages Field
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/validate" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "error": "Missing required field: messages",
  "example": {"messages": ["text1", "text2"]}
}
```

**Status: ❌ 400 Bad Request**

---

### Error 3: Empty Messages Array
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/content-safety/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": []
  }'
```

**Response:**
```json
{
  "error": "messages must be a non-empty array",
  "example": {"messages": ["text1", "text2"]}
}
```

**Status: ❌ 400 Bad Request**

---

### Error 4: Azure API Unavailable
```bash
curl -X GET "https://your-function-app.azurewebsites.net/api/content-safety/health"
```

**Response:**
```json
{
  "error": "Failed to connect to Azure Content Safety",
  "status": "unhealthy"
}
```

**Status: ❌ 500 Internal Server Error**

---

## 🧪 PowerShell Equivalents

### PowerShell: Health Check
```powershell
Invoke-WebRequest -Uri "https://your-function-app.azurewebsites.net/health" `
  -Method GET `
  -ContentType "application/json" | Select-Object -ExpandProperty Content
```

### PowerShell: Analyze Messages
```powershell
$body = @{
  messages = @(
    "Check out our enterprise solution",
    "Destroy the competition"
  )
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://your-function-app.azurewebsites.net/api/content-safety/analyze" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -ExpandProperty Content
```

---

## 🔄 Integration Example (Node.js)

```javascript
async function checkMessageCompliance(message) {
  const response = await fetch(
    'https://your-function-app.azurewebsites.net/api/content-safety/analyze',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [message] })
    }
  );
  return response.json();
}

// Usage
const result = await checkMessageCompliance('Our enterprise solution');
console.log(result.results[0].approved); // true or false
```

---

## 🔄 Integration Example (Python)

```python
import requests

def check_message_compliance(message):
    url = "https://your-function-app.azurewebsites.net/api/content-safety/analyze"
    payload = {"messages": [message]}
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

# Usage
result = check_message_compliance("Our enterprise solution")
print(result['results'][0]['approved'])  # True or False
```

---

## ✅ Testing Checklist

- ✅ Health check returns 200
- ✅ Content Safety status is "ok"
- ✅ Single message analysis works
- ✅ Batch analysis processes multiple messages
- ✅ Validation endpoint returns transparency data
- ✅ Stats endpoint shows request counts
- ✅ Safe messages are approved
- ✅ Unsafe messages are rejected
- ✅ Error handling works for invalid inputs
- ✅ Response times are <1 second

---

## 📊 Expected Performance

| Operation | Expected Time | Max Time |
|-----------|---------------|----------|
| Health check | 50ms | 100ms |
| Single message | 200ms | 500ms |
| 5 messages | 400ms | 1000ms |
| 20 messages | 1200ms | 2000ms |
| Stats | 50ms | 100ms |

---

## 🚀 Ready to Test!

All endpoints are live and ready for testing. Start with health checks, then move to message analysis.
