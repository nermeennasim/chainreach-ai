# 🚀 Quick Start: Agent 1 (Segmentation API)

## 📍 Prerequisites

1. **Python 3.8+** installed
2. **pip** package manager
3. Terminal access (PowerShell on Windows)

---

## ⚡ Quick Start (3 Steps)

### Step 1: Navigate to Agent 1 Directory
```powershell
cd "C:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation_agent"
```

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```

**Packages installed:**
- Flask==3.0.0 (Web API framework)
- pandas==2.2.0 (Data processing)
- numpy==1.26.0 (Numerical computing)
- scikit-learn==1.4.0 (Machine learning)
- joblib==1.3.2 (Model serialization)
- openpyxl==3.1.2 (Excel file reading)

### Step 3: Start the API
```powershell
python app.py
```

**You should see:**
```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://127.0.0.1:5001
Press CTRL+C to quit
```

✅ **Agent 1 is now running on http://localhost:5001**

---

## 🧪 Test the API

### Option 1: Using Browser
Open: http://localhost:5001/health

**Expected Response:**
```json
{
  "status": "ok",
  "service": "segmentation-agent"
}
```

### Option 2: Using PowerShell (curl)
```powershell
curl http://localhost:5001/health
```

### Option 3: Test Segmentation
```powershell
curl -X POST http://localhost:5001/segment/manual `
  -H "Content-Type: application/json" `
  -d '{\"recency\": 2, \"frequency\": 7, \"monetary\": 4310}'
```

**Expected Response:**
```json
{
  "segment_id": 0,
  "segment_name": "Champions",
  "stats": {
    "mean_recency": 15.2,
    "mean_frequency": 8.5,
    "mean_monetary": 5200.50
  },
  "confidence": 0.95,
  "distance_to_center": 0.23
}
```

---

## 📊 Verify Model Files Exist

Before starting, make sure these files exist in `models/` folder:

```powershell
cd models
dir
```

**Required files:**
- ✅ `kmeans_model.pkl` - Trained K-Means model
- ✅ `scaler.pkl` - Feature scaler
- ✅ `segment_profiles.json` - Segment statistics
- ✅ `rfm_table.csv` - Customer RFM data (4340 customers)

**If files are missing**, run training script first:
```powershell
python train_segmentation.py
```

---

## 🎯 API Endpoints

### 1. Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "service": "segmentation-agent"
}
```

### 2. Segment by RFM Values (Manual)
```
POST /segment/manual
Content-Type: application/json

{
  "recency": 10,    // Days since last purchase
  "frequency": 5,   // Number of transactions
  "monetary": 2500  // Total spending amount
}
```

**Response:**
```json
{
  "segment_id": 1,
  "segment_name": "Loyal Customers",
  "stats": {
    "mean_recency": 45.2,
    "mean_frequency": 4.8,
    "mean_monetary": 2100.50,
    "size": 850
  },
  "confidence": 0.92,
  "distance_to_center": 0.35
}
```

### 3. Segment by Customer ID
```
POST /segment/customer
Content-Type: application/json

{
  "customer_id": 12347
}
```

**Response:** Same as above, looks up customer in RFM table first

---

## 🔍 Understanding the Segments

The K-Means model classifies customers into 5 segments:

| Segment ID | Name | Characteristics |
|------------|------|-----------------|
| 0 | **Champions** | Recent buyers, frequent purchases, high spending |
| 1 | **Loyal Customers** | Regular buyers, moderate spending |
| 2 | **Potential Loyalists** | Recent customers with good frequency |
| 3 | **At Risk** | Haven't purchased recently, need re-engagement |
| 4 | **Lost** | Long time since last purchase, low activity |

**RFM Metrics Explained:**
- **Recency**: Days since last purchase (lower is better)
- **Frequency**: Number of transactions (higher is better)
- **Monetary**: Total spending amount (higher is better)

---

## 🐛 Troubleshooting

### Error: "Model artifact not found"
**Problem:** Model files missing in `models/` folder

**Solution:**
```powershell
python train_segmentation.py
```
This will generate all required model files.

---

### Error: "Address already in use"
**Problem:** Port 5001 is already in use

**Solution 1:** Stop the running process
```powershell
# Find process using port 5001
netstat -ano | findstr :5001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Solution 2:** Change port in `app.py`
```python
# Bottom of app.py
if __name__ == "__main__":
    app.run(port=5002, debug=True)  # Changed to 5002
```

---

### Error: "ModuleNotFoundError: No module named 'flask'"
**Problem:** Dependencies not installed

**Solution:**
```powershell
pip install -r requirements.txt
```

Or install individually:
```powershell
pip install Flask pandas numpy scikit-learn joblib openpyxl
```

---

### Error: "FileNotFoundError: data/Online Retail.xlsx"
**Problem:** Training data file missing

**Solution:** 
- Check if `data/Online Retail.xlsx` exists
- If missing, you'll need the original dataset
- Alternatively, use the pre-trained models in `models/` folder

---

## 📝 Full Terminal Commands (Copy-Paste)

### First Time Setup
```powershell
# Navigate to agent directory
cd "C:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation_agent"

# Install dependencies
pip install -r requirements.txt

# Verify model files exist
dir models

# Start the API
python app.py
```

### Every Time After
```powershell
# Navigate to agent directory
cd "C:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation_agent"

# Start the API
python app.py
```

### Stop the API
Press `Ctrl + C` in the terminal

---

## 🔗 Integration with Dashboard

Once Agent 1 is running, the dashboard will automatically connect to it:

**Dashboard URL:** http://localhost:5005/campaigns

**What happens:**
1. Dashboard sends health check to http://localhost:5001/health
2. If successful, processes 10 sample customers
3. For each customer, calls /segment/manual with their RFM values
4. Displays segmentation results with confidence scores

---

## 📊 Sample Customer Data

Here are some sample customers you can test:

```json
// Champion (Recent, High frequency, High spending)
{
  "recency": 2,
  "frequency": 7,
  "monetary": 4310
}

// At Risk (Old purchase, Low frequency)
{
  "recency": 232,
  "frequency": 1,
  "monetary": 1079
}

// Loyal (Moderate on all metrics)
{
  "recency": 52,
  "frequency": 3,
  "monetary": 2662
}
```

---

## 🎯 Testing Workflow

### 1. Start Agent 1
```powershell
cd segmentation_agent
python app.py
```

### 2. Test Health Endpoint
```powershell
curl http://localhost:5001/health
```
**Expected:** `{"status": "ok", "service": "segmentation-agent"}`

### 3. Test Segmentation
```powershell
curl -X POST http://localhost:5001/segment/manual `
  -H "Content-Type: application/json" `
  -d '{\"recency\": 2, \"frequency\": 7, \"monetary\": 4310}'
```
**Expected:** JSON response with segment_name and confidence

### 4. Start Dashboard (New Terminal)
```powershell
cd "C:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\person5-orchestrator"
npm run dev
```

### 5. Test Integration
- Open: http://localhost:5005/campaigns
- Click "Dataset Campaign" tab
- Click "Start Execution"
- Watch Agent 1 process 10 customers!

---

## 💡 Pro Tips

1. **Keep Terminal Open**: Don't close the terminal running `python app.py`
2. **Check Logs**: Agent 1 logs every request in the terminal
3. **Test First**: Always test health endpoint before running full pipeline
4. **Port Conflict**: If port 5001 is busy, change it in app.py
5. **Model Files**: Pre-trained models are already in the repo (no training needed)

---

## 🎬 Complete Demo Setup

### Terminal 1: Agent 1
```powershell
cd "C:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation_agent"
python app.py
```
**Wait for:** `Running on http://127.0.0.1:5001`

### Terminal 2: Dashboard
```powershell
cd "C:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\person5-orchestrator"
npm run dev
```
**Wait for:** `Local: http://localhost:5005`

### Browser
1. Open: http://localhost:5005/
2. Click "Start Campaign"
3. Click "Dataset Campaign" tab
4. Click "Start Execution"
5. Watch real-time segmentation!

---

## 📚 Additional Resources

### View Model Details
```powershell
# View segment profiles
type models\segment_profiles.json

# View sample RFM data
type models\rfm_table.csv | Select-Object -First 20

# Check model file sizes
dir models
```

### View Customer Count
```powershell
# Count customers in RFM table
python -c "import pandas as pd; df = pd.read_csv('models/rfm_table.csv'); print(f'Total customers: {len(df)}')"
```

### Test All 10 Sample Customers
```powershell
# Run this Python snippet
python -c "
import requests
customers = [
    {'recency': 2, 'frequency': 7, 'monetary': 4310},
    {'recency': 75, 'frequency': 4, 'monetary': 1797},
    {'recency': 23, 'frequency': 3, 'monetary': 2811}
]
for c in customers:
    r = requests.post('http://localhost:5001/segment/manual', json=c)
    print(r.json()['segment_name'])
"
```

---

## ✅ Checklist

Before demo:
- [ ] Agent 1 terminal open with `python app.py` running
- [ ] Health check returns `{"status": "ok"}`
- [ ] Test segmentation with sample customer
- [ ] Dashboard running on port 5005
- [ ] Browser ready at http://localhost:5005/campaigns

During demo:
- [ ] Show Agent 1 terminal (live logs)
- [ ] Run Dataset Campaign
- [ ] Show segmentation results (10 customers)
- [ ] Explain segment names (Champions, Loyal, At Risk)
- [ ] Highlight confidence scores

---

## 🎉 Success Indicators

✅ Terminal shows: `Running on http://127.0.0.1:5001`
✅ Health endpoint returns: `{"status": "ok"}`
✅ Segmentation returns segment names
✅ Dashboard connects successfully
✅ 10 customers processed and displayed

---

**Agent 1 is ready! Start it now and test the integration! 🚀**
