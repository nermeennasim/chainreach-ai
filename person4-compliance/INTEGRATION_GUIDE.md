# Integration Guide - Compliance Checker

How to integrate Person 4's Compliance Checker into your service.

---

## 🎯 Who Needs This?

- **Person 3 (Message Generation):** After GPT-4 generates messages
- **Person 5 (Orchestrator):** In the campaign pipeline
- **Anyone:** Who needs to validate content

---

## 🚀 Quick Start

### 1. Make Sure Service is Running

```bash
# Check if Person 4's service is up
curl http://localhost:5004/health

# Should return:
# {"status": "healthy", ...}
```

### 2. Install Required Library

**Python:**
```bash
pip install requests
```

**Node.js:**
```bash
npm install node-fetch
# or use built-in fetch (Node 18+)
```

---

## 📝 Integration Scenarios

### Scenario 1: Person 3 - After Message Generation

**When to use:** After GPT-4 generates message variants

**Python Example:**

```python
import requests

def generate_and_validate_messages(segment, content):
    """
    Generate messages with GPT-4, then validate with Person 4
    """
    
    # Step 1: Generate with GPT-4
    gpt_response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"Create 3 marketing messages for {segment} about {content}"
        }]
    )
    
    # Parse GPT-4 response to get 3 variants
    variants = parse_gpt_response(gpt_response)  # ["variant1", "variant2", "variant3"]
    
    # Step 2: Validate with Person 4
    validation_response = requests.post(
        'http://localhost:5004/validate',
        json={'messages': variants},
        timeout=10
    )
    
    if validation_response.status_code != 200:
        print(f"Validation failed: {validation_response.status_code}")
        return None
    
    validation = validation_response.json()
    
    # Step 3: Filter approved messages
    if validation['all_approved']:
        # All good!
        return {
            'all_approved': True,
            'variants': variants
        }
    else:
        # Some rejected, only return approved
        approved = [
            result['text'] 
            for result in validation['results'] 
            if result['approved']
        ]
        
        print(f"⚠️ {len(variants) - len(approved)} messages rejected")
        
        return {
            'all_approved': False,
            'variants': approved,
            'rejected_count': len(variants) - len(approved)
        }

# Usage
result = generate_and_validate_messages("morning_commuter", "breakfast deals")

if result and len(result['variants']) > 0:
    print(f"✅ {len(result['variants'])} approved messages")
else:
    print("❌ No approved messages - try generating again")
```

---

### Scenario 2: Person 5 - Campaign Orchestration

**When to use:** In the main campaign pipeline

**JavaScript Example:**

```javascript
async function runCompleteCampaign(customerId) {
  try {
    console.log(`📊 Starting campaign for customer ${customerId}`);
    
    // Step 1: Segmentation (Person 1)
    const segmentResponse = await fetch('http://localhost:5001/segment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId })
    });
    const segmentData = await segmentResponse.json();
    const segment = segmentData.segment;
    
    console.log(`✅ Segment: ${segment}`);
    
    // Step 2: Content Retrieval (Person 2)
    const contentResponse = await fetch('http://localhost:5002/retrieve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segment })
    });
    const contentData = await contentResponse.json();
    const content = contentData.content;
    
    console.log(`✅ Content retrieved`);
    
    // Step 3: Message Generation (Person 3)
    const genResponse = await fetch('http://localhost:5003/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segment, content })
    });
    const genData = await genResponse.json();
    const generatedMessages = genData.messages;
    
    console.log(`✅ Generated ${generatedMessages.length} messages`);
    
    // Step 4: COMPLIANCE VALIDATION (Person 4)
    const validationResponse = await fetch('http://localhost:5004/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: generatedMessages })
    });
    
    if (!validationResponse.ok) {
      throw new Error(`Validation service error: ${validationResponse.status}`);
    }
    
    const validation = await validationResponse.json();
    
    // Filter approved messages
    const approvedMessages = validation.results
      .filter(r => r.approved)
      .map(r => r.text);
    
    console.log(`✅ ${approvedMessages.length}/${generatedMessages.length} messages approved`);
    
    // Step 5: Store results
    const campaign = {
      customer_id: customerId,
      segment: segment,
      content_used: content,
      messages_generated: generatedMessages.length,
      messages_approved: approvedMessages.length,
      all_passed_compliance: validation.all_approved,
      approved_messages: approvedMessages,
      validation_details: validation.results,
      timestamp: new Date().toISOString()
    };
    
    // Return or save to database
    return campaign;
    
  } catch (error) {
    console.error('Campaign failed:', error);
    throw error;
  }
}

// Usage
const result = await runCompleteCampaign(12345);
console.log('Campaign result:', result);
```

---

## ⚠️ Error Handling Best Practices

### Always Handle These Cases:

```javascript
async function validateWithRetry(messages, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:5004/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        timeout: 10000  // 10 second timeout
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // Handle specific error codes
      if (response.status === 400) {
        // Bad request - don't retry
        const error = await response.json();
        throw new Error(`Invalid request: ${error.error}`);
      }
      
      if (response.status === 500) {
        // Server error - retry
        console.warn(`Attempt ${i + 1} failed, retrying...`);
        await sleep(1000 * (i + 1));  // Exponential backoff
        continue;
      }
      
    } catch (error) {
      if (i === maxRetries - 1) {
        // Last attempt failed
        console.error('Validation service unavailable');
        throw error;
      }
      
      console.warn(`Attempt ${i + 1} failed:`, error.message);
      await sleep(1000 * (i + 1));
    }
  }
  
  throw new Error('Validation failed after max retries');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 📊 What to Do With Results

### Display in Dashboard (Person 5)

```javascript
function displayComplianceResults(validation) {
  return {
    summary: {
      total: validation.total_checked,
      approved: validation.results.filter(r => r.approved).length,
      rejected: validation.results.filter(r => !r.approved).length,
      pass_rate: (validation.results.filter(r => r.approved).length / validation.total_checked * 100).toFixed(1) + '%'
    },
    details: validation.results.map(r => ({
      message: r.text,
      status: r.approved ? '✅ Approved' : '❌ Rejected',
      reason: r.reason,
      risk_categories: Object.entries(r.categories)
        .filter(([_, severity]) => severity > 0)
        .map(([cat, sev]) => `${cat}: ${sev}`)
    }))
  };
}

// Usage
const display = displayComplianceResults(validationResult);
console.table(display.summary);
console.table(display.details);
```

---

## 🔄 Batch Processing

For multiple customers, batch efficiently:

```python
def validate_campaign_batch(campaigns):
    """
    Validate messages for multiple campaigns efficiently
    """
    # Collect all messages
    all_messages = []
    message_to_campaign = {}
    
    for campaign_id, messages in campaigns.items():
        for msg in messages:
            all_messages.append(msg)
            message_to_campaign[msg] = campaign_id
    
    # Single API call for all messages
    response = requests.post(
        'http://localhost:5004/validate',
        json={'messages': all_messages}
    )
    
    validation = response.json()
    
    # Map results back to campaigns
    results_by_campaign = {}
    
    for result in validation['results']:
        msg_text = result['text']
        campaign_id = message_to_campaign[msg_text]
        
        if campaign_id not in results_by_campaign:
            results_by_campaign[campaign_id] = []
        
        results_by_campaign[campaign_id].append(result)
    
    return results_by_campaign
```

---

## 🧪 Testing Your Integration

### Test Script Template

```python
def test_integration():
    """Test your integration with Person 4's API"""
    
    print("Testing compliance integration...")
    
    # Test 1: Service is running
    try:
        health = requests.get('http://localhost:5004/health')
        assert health.status_code == 200
        print("✅ Test 1: Service is running")
    except:
        print("❌ Test 1: Service is NOT running - start it first!")
        return
    
    # Test 2: Validate safe messages
    safe_messages = [
        "Get 20% off your purchase!",
        "Limited time offer - shop now!",
        "Free shipping available"
    ]
    
    response = requests.post(
        'http://localhost:5004/validate',
        json={'messages': safe_messages}
    )
    
    result = response.json()
    assert result['all_approved'] == True
    print(f"✅ Test 2: Safe messages approved ({len(safe_messages)} messages)")
    
    # Test 3: Handle errors gracefully
    try:
        bad_response = requests.post(
            'http://localhost:5004/validate',
            json={'wrong_field': []}
        )
        assert bad_response.status_code == 400
        print("✅ Test 3: Error handling works")
    except:
        print("⚠️ Test 3: Error handling needs work")
    
    print("\n✅ All integration tests passed!")

# Run test
test_integration()
```

---

## 📞 Getting Help

**Service not responding?**
1. Check Person 4's service: `curl http://localhost:5004/health`
2. Check your request format matches examples above
3. Ask in WhatsApp group

**Messages being rejected unexpectedly?**
1. Check the `categories` field in response to see why
2. Review message content - might actually be risky
3. Discuss with Person 4 if threshold needs adjustment

**Performance issues?**
1. Batch messages when possible (up to 100 per request)
2. Cache results for identical messages
3. Run validation asynchronously

---

## ✅ Integration Checklist

Before marking integration complete:

- [ ] Can successfully call `/health` endpoint
- [ ] Can validate a single message
- [ ] Can validate multiple messages
- [ ] Handle approved messages correctly
- [ ] Handle rejected messages correctly
- [ ] Error handling implemented (timeouts, 500s, etc.)
- [ ] Retry logic for transient failures
- [ ] Results displayed in UI/logs
- [ ] Tested with real data
- [ ] Documented in your code

---

## 📚 Additional Resources

- Main README: [README.md](./README.md)
- Full API Reference: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- WhatsApp Group: Ask @Person4
- Azure Portal: https://portal.azure.com

---

**Last Updated:** Nov 15, 2025  
**Maintained by:** Person 4