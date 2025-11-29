# 🎯 Custom Campaign Feature - Quick Guide

## What It Does

The **Custom Campaign** page lets you test Agent 4 (Compliance) directly with your own messages, bypassing Agents 1-3.

**Access:** http://localhost:5005/custom-campaign

---

## Features

### 1. **JSON Input Box**
Enter messages in one of two formats:

**Format 1: Simple Array**
```json
[
  "Your first marketing message here",
  "Second message here",
  "Third message here"
]
```

**Format 2: Object with Messages Array**
```json
{
  "messages": [
    "Your first marketing message here",
    "Second message here"
  ]
}
```

### 2. **Fallback Logic**
The system follows this flow:
1. **Try Agent 3 API first** (`/api/agent3/generate`)
   - If Agent 3 is deployed and returns messages → use those
2. **Fallback to your custom JSON** if Agent 3 is unavailable
3. **Send to Agent 4** (`/content-safety/analyze` endpoint)

### 3. **Real-Time Results**
See immediate compliance results:
- ✅ **Approved Messages** (green cards)
- ❌ **Rejected Messages** (red cards with reasons)
- **Category Scores:** Hate, Violence, Sexual, Self-Harm (0-6 scale)
- **Approval Rate:** Percentage calculation with progress bar

---

## How to Use

### Step 1: Start Server
```powershell
cd person5-orchestrator
npm run dev
```

### Step 2: Navigate to Custom Campaign
Click **"🎯 Custom Campaign"** button in the dashboard header

Or go directly to: **http://localhost:5005/custom-campaign**

### Step 3: Enter Messages
Use the default sample (5 messages) or paste your own JSON

### Step 4: Click "Send to Agent 4"
Watch as the system:
1. Validates your JSON format
2. Tries Agent 3 API (optional)
3. Sends to Agent 4 for compliance checking
4. Displays detailed results

### Step 5: Review Results
- **Summary Cards:** Total, Approved, Rejected, Rate%
- **Approved Section:** Green cards showing safe messages
- **Rejected Section:** Red cards with category scores and reasons

---

## Default Sample Messages

The system includes 5 sample messages:
1. ✅ "Exclusive 20% discount just for you..." (SAFE)
2. ✅ "We value your loyalty! As a premium member..." (SAFE)
3. ✅ "Don't miss this limited-time offer..." (SAFE)
4. ✅ "Your personalized recommendation is ready..." (SAFE)
5. ❌ "This deal will absolutely kill the competition!" (UNSAFE - Violence: 4/6)

**Expected Result:** 80% approval rate (4 approved, 1 rejected)

---

## Testing Scenarios

### Test 1: All Safe Messages
```json
[
  "Thank you for being a valued customer!",
  "Enjoy 15% off your next purchase.",
  "We appreciate your loyalty and trust."
]
```
**Expected:** 100% approval rate ✅

### Test 2: Mix of Safe and Unsafe
```json
[
  "Great deals this weekend!",
  "This offer will destroy the competition!",
  "Limited time exclusive access."
]
```
**Expected:** ~66% approval rate (1 rejected for violent language)

### Test 3: Multiple Safety Issues
```json
[
  "You're an idiot if you don't buy this!",
  "Sexy models wearing our new collection",
  "Kill two birds with one stone - buy now!"
]
```
**Expected:** High rejection rate with multiple category flags

---

## API Endpoints Used

### Agent 3 (Optional - Try First)
```http
POST /api/agent3/generate
{
  "customer_id": "custom-campaign-001"
}
```
Falls back silently if not available.

### Agent 4 (Always Used)
```http
POST https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze
{
  "messages": ["message 1", "message 2", "..."]
}
```

Returns:
```json
{
  "results": [
    {
      "message": "...",
      "is_safe": true/false,
      "severity": "low/medium/high",
      "categories": [
        { "category": "Hate", "severity": 0 },
        { "category": "Violence", "severity": 4 },
        { "category": "Sexual", "severity": 0 },
        { "category": "SelfHarm", "severity": 0 }
      ],
      "reason": "Contains violent language..."
    }
  ]
}
```

---

## Category Score Guide

**Scale: 0-6**
- **0:** Safe, no issues detected
- **1-2:** Low severity (usually approved)
- **3-4:** Medium severity (may be rejected)
- **5-6:** High severity (definitely rejected)

**Categories:**
- **Hate:** Hate speech, discrimination
- **Violence:** Violent content, threats
- **Sexual:** Sexual content, adult themes
- **Self-Harm:** Self-harm encouragement

---

## UI Color Coding

### Summary Cards
- 🔵 **Blue:** Total messages checked
- 🟢 **Green:** Approved messages
- 🔴 **Red:** Rejected messages
- 🟣 **Purple:** Approval rate percentage

### Category Badges
- ⚫ **Gray (0):** No issues
- 🟢 **Green (1-2):** Low severity
- 🟡 **Yellow (3-4):** Medium severity
- 🔴 **Red (5-6):** High severity

---

## Error Handling

### Invalid JSON
**Error:** "Invalid JSON format. Please check your input."
**Solution:** Validate your JSON syntax (use a JSON validator)

### No Messages Found
**Error:** "No valid messages found in JSON"
**Solution:** Ensure array contains string messages

### Agent 4 Unavailable
**Error:** "Agent 4 returned 500: Internal Server Error"
**Solution:** 
1. Check Azure Function is running
2. Test: `curl https://chainreach-compliance-func.azurewebsites.net/api/Health`
3. Check `.env.local` has correct `NEXT_PUBLIC_AGENT_4_URL`

---

## Advantages Over Full Pipeline

| Feature | Full Pipeline | Custom Campaign |
|---------|--------------|-----------------|
| **Speed** | ~6 seconds (4 agents) | ~2.5 seconds (Agent 4 only) |
| **Control** | Automatic message generation | Full control over messages |
| **Testing** | Tests all agents | Tests compliance only |
| **Flexibility** | Fixed flow | Custom JSON input |
| **Use Case** | End-to-end demo | Quick compliance testing |

---

## Navigation

### From Dashboard
Click **"🎯 Custom Campaign"** (purple button, top right header)

### From Custom Campaign
Click **"← Back to Dashboard"** (gray button, top left header)

---

## Port Configuration

✅ **Correct:** http://localhost:5005/custom-campaign  
❌ **Wrong:** http://localhost:3000/custom-campaign

**Why?** Your `package.json` specifies port 5005:
```json
"dev": "next dev -p 5005"
```

---

## Environment Variables

Ensure `.env.local` has:
```bash
NEXT_PUBLIC_AGENT_4_URL=https://chainreach-compliance-func.azurewebsites.net/api
```

The `NEXT_PUBLIC_` prefix makes it available to the browser.

---

## Demo Tips

1. **Show Speed:** Custom Campaign is faster than full pipeline
2. **Show Control:** Demonstrate changing messages on-the-fly
3. **Show Transparency:** Point out detailed category scores
4. **Test Edge Cases:** Try obviously unsafe messages to show Agent 4 catches them
5. **Compare:** Run same messages through full pipeline vs. custom campaign

---

## Next Steps

### If Agent 3 Gets Deployed:
1. Update `.env.local` with Agent 3 URL
2. Custom Campaign will automatically use real Agent 3 messages
3. Your custom JSON becomes fallback only

### Enhancements You Could Add:
- Save favorite message templates
- Export results to CSV/PDF
- Historical comparison view
- Batch upload from file
- Real-time editing with preview

---

## Troubleshooting

**Page not found?**
- Ensure server is running on port 5005
- Check file exists: `src/app/custom-campaign/page.tsx`

**Agent 4 calls fail?**
- Check browser console (F12) → Network tab
- Verify `NEXT_PUBLIC_AGENT_4_URL` in `.env.local`
- Test Azure Function health endpoint

**Results not showing?**
- Check browser console for errors
- Verify response format from Agent 4
- Check JSON parsing in component

---

## File Location

**Page:** `src/app/custom-campaign/page.tsx`  
**Components Used:** Badge, Progress, Card (from `src/components/ui/`)  
**Environment:** `.env.local`

---

## Quick Test Commands

### Test Agent 4 Direct
```powershell
# PowerShell
$body = @{
    messages = @(
        "This is a safe message",
        "This message contains violent language about killing"
    )
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

---

## Success Checklist

- [x] Page loads at `/custom-campaign`
- [x] Default JSON is populated
- [x] "Send to Agent 4" button works
- [x] Results display with summary cards
- [x] Approved messages show green
- [x] Rejected messages show red with categories
- [x] Approval rate calculates correctly
- [x] Reset button clears state
- [x] Navigation back to dashboard works

---

**You're ready to test custom messages with Agent 4! 🚀**
