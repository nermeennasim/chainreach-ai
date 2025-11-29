# Agent 4: Analyze Message - Exact Format Guide

## 🎯 Answer: JSON Format Required

**All `/api/content-safety/analyze` requests must be in JSON format**

---

## 📋 The Format

### Request Format

```json
{
  "messages": [
    "Your message text here",
    "Another message",
    "A third message"
  ]
}
```

**Key Points:**
- ✅ **Must be JSON** (not plain text)
- ✅ **messages** key is required
- ✅ **messages** must be an **array** (list)
- ✅ Array contains **strings** (text messages)
- ✅ Array must **not be empty**

---

## 📌 Single Message Example

### Request (JSON)
```json
{
  "messages": [
    "Check out our enterprise solution"
  ]
}
```

### Command (curl)
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/content-safety/analyze" \
  -H "Content-Type: application/json" \
  -d '{"messages": ["Check out our enterprise solution"]}'
```

### PowerShell
```powershell
$body = @{
  messages = @("Check out our enterprise solution")
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://your-function-app.azurewebsites.net/api/content-safety/analyze" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### JavaScript
```javascript
const response = await fetch('https://your-function-app.azurewebsites.net/api/content-safety/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: ["Check out our enterprise solution"]
  })
});
const result = await response.json();
```

### Python
```python
import requests

url = "https://your-function-app.azurewebsites.net/api/content-safety/analyze"
payload = {"messages": ["Check out our enterprise solution"]}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
result = response.json()
```

---

## 📌 Batch Messages Example

### Request (JSON)
```json
{
  "messages": [
    "Check out our enterprise solution",
    "Limited time offer for Fortune 500",
    "Join thousands of happy customers",
    "Enterprise-grade security built-in",
    "Drive growth with AI-powered tools"
  ]
}
```

### Command (curl)
```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/content-safety/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      "Check out our enterprise solution",
      "Limited time offer for Fortune 500",
      "Join thousands of happy customers",
      "Enterprise-grade security built-in",
      "Drive growth with AI-powered tools"
    ]
  }'
```

---

## ✅ Response Format (Always JSON)

### Success Response
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

### Error Response (Invalid Format)
```json
{
  "error": "messages must be a non-empty array",
  "example": {"messages": ["text1", "text2"]}
}
```

---

## ❌ Common Mistakes to Avoid

### ❌ WRONG: Plain text instead of JSON
```bash
curl -X POST "https://..." \
  -d "Check out our solution"
```
**Error:** Invalid JSON

### ❌ WRONG: Missing "messages" key
```json
{
  "text": "Check out our solution"
}
```
**Error:** Missing required field: messages

### ❌ WRONG: String instead of array
```json
{
  "messages": "Check out our solution"
}
```
**Error:** messages must be a non-empty array

### ❌ WRONG: Empty array
```json
{
  "messages": []
}
```
**Error:** messages must be a non-empty array

### ❌ WRONG: Content-Type header missing
```bash
curl -X POST "https://..." \
  -d '{"messages": ["Check out our solution"]}'
```
**Error:** Missing Content-Type: application/json

---

## ✅ Correct Formats by Use Case

### Case 1: Single Safe Message
```json
{
  "messages": ["Our enterprise solution for businesses"]
}
```
**Result:** approved = true ✅

### Case 2: Single Unsafe Message
```json
{
  "messages": ["Destroy the competition"]
}
```
**Result:** approved = false ❌ (Violence detected)

### Case 3: Multiple Messages (Mixed)
```json
{
  "messages": [
    "Check out our solution",
    "Destroy the market",
    "Join our platform"
  ]
}
```
**Result:** 2 approved, 1 rejected

### Case 4: Marketing Campaign Messages
```json
{
  "messages": [
    "Premium service for businesses",
    "Increase revenue with our tools",
    "Enterprise-grade security",
    "Proven results for corporations",
    "Join thousands of customers"
  ]
}
```
**Result:** All approved (5/5) ✅

---

## 📝 Quick Reference Table

| Aspect | Value | Example |
|--------|-------|---------|
| **Format** | JSON | `{"messages": [...]}` |
| **Content-Type** | application/json | Header: `Content-Type: application/json` |
| **messages field** | Required | Must always be present |
| **messages type** | Array | `[...]` not `"..."` |
| **Array contents** | Strings | `["text1", "text2"]` |
| **Array size** | Non-empty | At least 1 message |
| **Message type** | String | Text to analyze |
| **Response** | JSON | Always JSON response |

---

## 🔄 In API Explorer

### Step 1: Input Field Shows
```
Parameter: messages
Type: text
Default: "This is a great product for enterprise customers"
```

### Step 2: You Enter Text
```
User types: "Check out our solution"
```

### Step 3: Behind the Scenes
```json
{
  "messages": ["Check out our solution"]
}
```
*(Automatically wrapped in JSON array)*

### Step 4: Response Shows
```json
{
  "success": true,
  "total": 1,
  "all_approved": true,
  "results": [{
    "id": 0,
    "text": "Check out our solution",
    "approved": true,
    "categories": {...}
  }]
}
```

---

## 🎯 Summary

### Quick Answer:
**Always JSON format with this structure:**

```json
{
  "messages": ["text1", "text2", "text3"]
}
```

### Remember:
- ✅ JSON wrapper required
- ✅ "messages" key required
- ✅ Array format required
- ✅ String values inside array
- ✅ At least 1 message required
- ✅ Content-Type: application/json header required

### Testing:
- Use API Explorer (handles JSON automatically)
- Or use curl/Postman with proper JSON
- Or use code samples provided above

---

## 📚 Related Endpoints

### Same Format Required:
- `/api/content-safety/analyze` ← **You are here**
- `/api/validate` (same format)

### Different Format:
- `/health` (GET, no body needed)
- `/api/content-safety/health` (GET, no body needed)
- `/api/stats` (GET, no body needed)

---

## 🚀 Quick Test

Copy and paste this curl command:

```bash
curl -X POST "https://your-function-app.azurewebsites.net/api/content-safety/analyze" \
  -H "Content-Type: application/json" \
  -d '{"messages": ["Our enterprise solution"]}'
```

Replace `your-function-app` with your actual app name.

Expected response:
```json
{
  "success": true,
  "total": 1,
  "all_approved": true,
  "results": [{
    "id": 0,
    "text": "Our enterprise solution",
    "approved": true,
    "reason": "Azure Content Safety",
    "confidence": 1.0,
    "categories": {
      "hate": 0,
      "sexual": 0,
      "violence": 0,
      "self_harm": 0
    }
  }]
}
```

---

**Format Rule: Always JSON with `{"messages": [...]}`** ✅
