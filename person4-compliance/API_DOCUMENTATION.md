# Compliance Checker API Documentation

Complete API reference for Person 4's content moderation service.

## 🌐 Base URL

**Local Development:**
```
http://localhost:5004
```

**Production (after deployment):**
```
https://person4-compliance.azurewebsites.net
```
*(URL will be updated after Azure deployment)*

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
3. [Error Handling](#error-handling)
4. [Integration Examples](#integration-examples)
5. [Rate Limits](#rate-limits)

---

## 🔐 Authentication

Currently **no authentication required** for MVP.

For production, add API key in headers:
```
Authorization: Bearer YOUR_API_KEY
```

---

## 📡 Endpoints

### 1. Health Check

**GET** `/health`

Check if service is running and get basic info.

**Response 200 OK:**
```json
{
  "status": "healthy",
  "service": "compliance-checker",
  "person": "Person 4",
  "version": "1.0.0-azure",
  "mode": "AZURE",
  "requests_processed": 42,
  "timestamp": "2025-11-15T10:30:00.000000"
}
```

**Example:**
```bash
curl http://localhost:5004/health
```

---

### 2. Validate Messages ⭐

**POST** `/validate`

Validates one or more marketing messages using Azure Content Safety.

**Request Body:**
```json
{
  "messages": [
    "Get 20% off your next purchase!",
    "Limited time offer - shop now!",
    "Free shipping on orders over $50"
  ]
}
```

**Field Requirements:**
- `messages`: Array of strings (required)
- Minimum: 1 message
- Maximum