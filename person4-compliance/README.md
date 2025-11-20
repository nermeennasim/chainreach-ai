# Person 4: Compliance Checker Service

AI-powered content moderation using Azure Content Safety API.

## 🎯 Purpose

Validates marketing messages for safety and compliance before they're sent to customers. Detects hate speech, violence, sexual content, and self-harm using Azure AI.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup Environment
Create `.env` file in this directory:
```env
AZURE_CONTENT_SAFETY_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_CONTENT_SAFETY_KEY=your_key_here
PORT=5004
```

⚠️ **Get credentials from Person 4 - never commit .env to GitHub!**

### 3. Run Service
```bash
python app.py
```

Service runs on: `http://localhost:5004`

### 4. Test
```bash
# Make sure service is running first
python test_api.py
```

## 📡 API Endpoints

### POST /validate ⭐ Main Endpoint
Validates marketing messages for safety.

**Request:**
```json
{
  "messages": [
    "Get 20% off your next purchase!",
    "Limited time offer - shop now!"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "all_approved": true,
  "results": [
    {
      "message_id": 0,
      "text": "Get 20% off your next purchase!",
      "approved": true,
      "reason": "Evaluated using Azure Content Safety",
      "confidence": 1.0,
      "categories": {
        "hate": 0,
        "sexual": 0,
        "violence": 0,
        "self_harm": 0
      }
    }
  ],
  "total_checked": 2,
  "mode": "AZURE"
}
```

**Severity Scale:**
- 0-1: Safe (approved)
- 2-3: Moderate risk (rejected)
- 4-6: High risk (rejected)

### GET /health
Health check endpoint.

### GET /stats
Service statistics.

## 🔗 Integration Guide

### For Person 3 (Message Generation):
After GPT-4 generates messages, validate them:

```python
import requests

# Your generated messages
messages = ["variant 1", "variant 2", "variant 3"]

# Call Person 4's API
response = requests.post('http://localhost:5004/validate',
    json={"messages": messages})

result = response.json()

if result['all_approved']:
    print("✅ All messages safe!")
else:
    # Filter approved only
    approved = [r['text'] for r in result['results'] if r['approved']]
```

### For Person 5 (Orchestrator):
Include in campaign pipeline:

```javascript
// After Person 3 generates messages
const validation = await fetch('http://localhost:5004/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: generatedMessages })
});

const result = await validation.json();

// Store validation results
campaign.compliance_passed = result.all_approved;
campaign.approved_messages = result.results
  .filter(r => r.approved)
  .map(r => r.text);
```

## 🧪 Testing

Run comprehensive tests:
```bash
python test_api.py
```

Tests cover:
- ✅ Health check
- ✅ Valid message validation
- ✅ Single message
- ✅ Error handling (empty, missing fields, wrong types)
- ✅ Stats endpoint

## 🛠️ Tech Stack

- **Framework:** Flask 3.1.2
- **AI Service:** Azure Content Safety API
- **Language:** Python 3.x
- **Dependencies:** See requirements.txt

## 📂 Project Structure

```
person4-compliance/
├── app.py                 # Main Flask application
├── test_api.py           # Test suite
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not committed)
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🚨 Important Notes

- ⚠️ **NEVER commit `.env` file to GitHub**
- 🔑 Azure credentials required to run
- 📊 Service must run on port 5004 for team integration
- 🎯 Default approval threshold: severity < 2
- 🔄 Service is stateless (no database needed)

## 🚀 Deployment

**Local Development:** `http://localhost:5004`

**For Production:**
- Deploy to Azure App Service
- Set environment variables in Azure Portal
- Public URL will be shared with team

## 📅 Development Timeline

- ✅ **Day 2 (Nov 14):** Mock API complete
- ✅ **Day 4 (Nov 18):** Azure Content Safety integrated
- ✅ **Day 5 (Nov 19):** Tests & documentation complete
- 🔄 **Day 6 (Nov 20):** Integration with Person 3 & 5
- 🎯 **Day 8 (Nov 22):** Production ready

## 🆘 Troubleshooting

**Error: "Missing Azure credentials"**
- Make sure `.env` file exists with correct values
- Check endpoint format includes `https://` and traili