# Agent 4: API Explorer Quick Reference

## 🎯 Agent 4 Endpoints in API Explorer

| # | Endpoint | Method | Icon | Parameters | Purpose |
|---|----------|--------|------|------------|---------|
| 1 | `/health` | GET | 🏥 | None | Service health status |
| 2 | `/api/content-safety/health` | GET | 🔒 | None | Azure API status |
| 3 | `/api/content-safety/analyze` | POST | 🔍 | message (text) | Single message analysis |
| 4 | `/api/validate` | POST | ✅ | None (batch demo) | Full validation check |
| 5 | `/api/stats` | GET | 📈 | None | Transparency metrics |
| 6 | `/api/content-safety/analyze` | POST | 📊 | None (batch demo) | Batch message analysis |

---

## 🧪 Test Commands in API Explorer

### Command 1: Health Check
```
Agent: Agent 4 (Compliance Service)
Endpoint: Health Check 🏥
Parameters: None
Expected: status: "healthy"
```

### Command 2: Azure Status
```
Agent: Agent 4
Endpoint: Content Safety Status 🔒
Parameters: None
Expected: status: "ok"
```

### Command 3: Single Message Analysis
```
Agent: Agent 4
Endpoint: Analyze Single Message 🔍
Parameters:
  - message: "Your message here"
Expected: 
  ✅ approved: true/false
  📊 categories: {hate, sexual, violence, self_harm}
```

### Command 4: Batch Validation
```
Agent: Agent 4
Endpoint: Validate Messages ✅
Parameters: None (uses pre-built test data)
Expected:
  📋 all_approved: true/false
  📊 results: [...]
  📈 total_checked: number
```

### Command 5: Statistics Report
```
Agent: Agent 4
Endpoint: Get Compliance Stats 📈
Parameters: None
Expected:
  📊 total_requests: number
  🔒 mode: "AZURE"
  ⏱️  uptime: "running"
```

### Command 6: Batch Analysis
```
Agent: Agent 4
Endpoint: Analyze Batch Messages 📊
Parameters: None (uses pre-built test data)
Expected:
  ✅ success: true
  📋 total: number
  📊 results: [...]
```

---

## 📊 Expected Responses

### Approved Message ✅
```json
{
  "approved": true,
  "categories": {
    "hate": 0,
    "sexual": 0,
    "violence": 0,
    "self_harm": 0
  },
  "confidence": 1.0
}
```

### Rejected Message ❌
```json
{
  "approved": false,
  "categories": {
    "hate": 0,
    "sexual": 0,
    "violence": 2,
    "self_harm": 0
  },
  "confidence": 0.95,
  "reason": "Violence detected"
}
```

### Transparency Report 📈
```json
{
  "total_requests": 156,
  "approved": 148,
  "rejected": 8,
  "approval_rate": "94.9%"
}
```

---

## 🧪 Test Data Ready

### Safe Messages ✅
```
✓ "Check out our enterprise solution"
✓ "Limited time offer for Fortune 500"
✓ "Join thousands of happy customers"
✓ "Enterprise-grade security built-in"
✓ "Drive growth with AI-powered tools"
```

### Flagged Messages ⚠️
```
✗ "Destroy the competition"
✗ "Kill your marketing budget"
✗ "Violently effective marketing"
✗ "Crush your rivals"
✗ "Dominate the market"
```

---

## 🚀 Quick Test Sequence

### Test 1: Verify Service Running
1. Click: Health Check 🏥
2. Expected: status = "healthy" ✅

### Test 2: Check Azure Connection
1. Click: Content Safety Status 🔒
2. Expected: status = "ok" ✅

### Test 3: Test Safe Message
1. Click: Analyze Single Message 🔍
2. Enter: "Enterprise solutions for business"
3. Expected: approved = true ✅

### Test 4: Test Unsafe Message
1. Click: Analyze Single Message 🔍
2. Enter: "Destroy the competition"
3. Expected: approved = false ❌ (Violence)

### Test 5: Test Batch
1. Click: Validate Messages ✅
2. Expected: See results with mixed approvals/rejections

### Test 6: View Stats
1. Click: Get Compliance Stats 📈
2. Expected: See total requests and uptime

---

## 📋 Response Status Codes

| Code | Meaning | Endpoint |
|------|---------|----------|
| 200 | Success | All GET, POST on valid input |
| 400 | Invalid Input | Missing messages field |
| 400 | Empty Array | messages array is empty |
| 400 | Bad JSON | Malformed request body |
| 500 | Server Error | Azure API unavailable |

---

## 🎓 Category Severity Scale

```
Azure Severity 0-3:
├─ 0 = Safe ✅ (approved)
├─ 1 = Low (approved)
├─ 2 = Medium ⚠️ (rejected)
└─ 3 = High ❌ (rejected)
```

---

## 💡 Tips & Tricks

### Tip 1: Test Real Campaign Messages
Paste actual campaign messages to see if they'd be approved

### Tip 2: Find What Triggers Rejections
Try variations (destroy → outperform, kill → remove, crush → exceed)

### Tip 3: Monitor Approval Rate
Check stats endpoint to see platform-wide approval trends

### Tip 4: Use Test Data
Pre-built test data sets available for quick demonstrations

### Tip 5: Review Rejection Reasons
Use rejection feedback to improve message quality

---

## 🔍 Sample Outputs

### Single Message Analysis Response
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

### Batch Validation Response
```json
{
  "success": true,
  "results": [
    {
      "message_id": 0,
      "text": "Welcome to our platform",
      "approved": true,
      "categories": {...}
    },
    {
      "message_id": 1,
      "text": "Crush your competition",
      "approved": false,
      "categories": {"violence": 2}
    }
  ],
  "all_approved": false,
  "total_checked": 2,
  "mode": "AZURE",
  "timestamp": "2025-11-28T10:30:45Z"
}
```

---

## ✨ Features Summary

✅ **6 Endpoints** - Complete compliance coverage  
✅ **Real-time Analysis** - Instant approval decisions  
✅ **Batch Processing** - Test multiple messages  
✅ **Transparency Metrics** - See approval rates  
✅ **Category Details** - Understand why messages rejected  
✅ **Test Data** - Pre-built scenarios  
✅ **Full Documentation** - Comprehensive guides  
✅ **Error Handling** - Clear error messages  

---

## 📚 Related Documentation

- Full API Reference: AGENT4_COMPLIANCE_ENDPOINTS.md
- Responsible AI Dashboard: AGENT4_RESPONSIBLE_AI_DASHBOARD.md
- Testing Guide: AGENT4_TESTING_GUIDE.md
- Integration Summary: AGENT4_INTEGRATION_COMPLETE.md

---

## 🚀 Ready to Test!

All 6 endpoints are now live in API Explorer with:
- ✅ Pre-built test data
- ✅ One-click execution
- ✅ Real-time response visualization
- ✅ Full transparency reporting

**Start testing now! 🎯**
