# 🎯 Customer Segmentation Agent (Person 1)

**AI-Powered Customer Classification using RFM Analysis & K-Means Clustering**

Port: **5001**

---

## 📋 Overview

The Segmentation Agent analyzes customer transaction data to classify users into meaningful behavioral segments. It uses **RFM (Recency, Frequency, Monetary)** analysis combined with **K-Means clustering** to identify 5 distinct customer groups.

### What it does:
- ✅ Loads and cleans customer transaction data
- ✅ Builds RFM features for each customer
- ✅ Trains K-Means clustering model
- ✅ Generates segment profiles with statistics
- ✅ Provides REST API for real-time segment prediction

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     Raw Transaction Data            │
│  (Online Retail.xlsx)               │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │  train.py    │  Data Loading
        │  • Load      │  & Cleaning
        │  • Clean     │
        │  • RFM       │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  train.py    │  Model Training
        │  • Scale     │
        │  • K-Means   │  K=5 Clusters
        │  • Profiles  │
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │   ARTIFACTS  │
        ├──────────────┤
        │ kmeans_model │
        │ scaler       │
        │ profiles.json│
        │ rfm_table    │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   app.py     │  REST API
        │  • /health   │  Flask
        │  • /segment/ │
        │     manual   │  Port 5001
        │  • /segment/ │
        │     customer │
        └──────────────┘
```

---

## 🔧 Environment Variables & Configuration

All configuration is defined at the top of each Python file:

### `train_segmentation.py`
```python
DATA_PATH = "data/Online Retail.xlsx"      # Input transaction data
MODEL_PATH = "models/kmeans_model.pkl"     # Output: Trained model
SCALER_PATH = "models/scaler.pkl"          # Output: Feature scaler
PROFILES_PATH = "models/segment_profiles.json"  # Output: Segment stats
RFM_PATH = "models/rfm_table.csv"         # Output: RFM features

N_CLUSTERS = 5              # Number of customer segments
RANDOM_STATE = 42           # Reproducibility seed
N_INIT = 10                 # K-Means initializations
```

### `app.py`
```python
MODEL_PATH = "models/kmeans_model.pkl"
SCALER_PATH = "models/scaler.pkl"
PROFILES_PATH = "models/segment_profiles.json"
RFM_PATH = "models/rfm_table.csv"
```

**Note:** To use environment variables instead of hard-coded paths:
```python
import os
MODEL_PATH = os.getenv("MODEL_PATH", "models/kmeans_model.pkl")
```

---

## 📦 Dependencies

### Python Version
- **Python 3.10+**

### Required Packages
See `requirements.txt`:
```
Flask==3.0.0           # REST API framework
pandas==2.2.0          # Data manipulation
numpy==1.26.0          # Numerical computing
scikit-learn==1.4.0    # ML algorithms
joblib==1.3.2          # Model serialization
openpyxl==3.1.2        # Excel file reading
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd segmentation_agent
pip install -r requirements.txt
```

### 2. Train the Model
```bash
python train_segmentation.py
```

**Output:**
- ✅ `models/kmeans_model.pkl` - Trained K-Means model
- ✅ `models/scaler.pkl` - StandardScaler
- ✅ `models/segment_profiles.json` - Segment statistics
- ✅ `models/rfm_table.csv` - Customer RFM features

### 3. Start the API Server
```bash
python app.py
```

**Output:**
```
 * Serving Flask app 'app'
 * Running on http://127.0.0.1:5001
```

### 4. Test the Endpoints

#### Health Check
```bash
curl http://localhost:5001/health
```

Response:
```json
{"status": "ok", "service": "segmentation-agent"}
```

#### Predict Segment (Manual Input)
```bash
curl -X POST http://localhost:5001/segment/manual \
  -H "Content-Type: application/json" \
  -d '{
    "recency": 30,
    "frequency": 5,
    "monetary": 1500.00
  }'
```

Response:
```json
{
  "segment_id": 2,
  "segment_name": "Segment 2",
  "stats": {
    "Recency_mean": 45.3,
    "Recency_median": 42.0,
    "Frequency_mean": 4.8,
    "Frequency_median": 4.0,
    "Monetary_mean": 1200.50,
    "Monetary_median": 1100.00
  },
  "confidence": 0.92,
  "distance_to_center": 0.4
}
```

#### Predict Segment (Customer ID)
```bash
curl -X POST http://localhost:5001/segment/customer \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 12347}'
```

Response: Same format as manual endpoint

---

## 📊 Understanding the Output

### Segment Prediction Response

```json
{
  "segment_id": 2,                    // Cluster ID (0-4)
  "segment_name": "Segment 2",        // Human-readable name
  "stats": {                          // Segment profile statistics
    "Recency_mean": 45.3,             // Avg days since purchase
    "Recency_median": 42.0,           // Median value
    "Recency_min": 1.0,               // Minimum value
    "Recency_max": 365.0,             // Maximum value
    "Frequency_mean": 4.8,            // Avg transaction count
    "Frequency_median": 4.0,
    "Frequency_min": 1.0,
    "Frequency_max": 20.0,
    "Monetary_mean": 1200.50,         // Avg spending
    "Monetary_median": 1100.00,
    "Monetary_min": 50.0,
    "Monetary_max": 5000.0
  },
  "confidence": 0.92,                 // Prediction confidence (0-1)
  "distance_to_center": 0.4           // Distance to cluster center
}
```

### RFM Features Explained

| Feature | Meaning | Direction | Interpretation |
|---------|---------|-----------|-----------------|
| **Recency** | Days since last purchase | ↓ Lower is better | Recently active customers |
| **Frequency** | Number of transactions | ↑ Higher is better | Loyal, repeat customers |
| **Monetary** | Total spending | ↑ Higher is better | High-value customers |

---

## 🔄 Data Flow

### Training Pipeline
```
1. Load Raw Data
   └─ Read Excel: Online Retail.xlsx
   
2. Data Cleaning
   └─ Remove NULL CustomerID
   └─ Remove Quantity ≤ 0
   └─ Remove UnitPrice ≤ 0
   
3. Feature Engineering
   └─ Calculate Recency (days since last purchase)
   └─ Calculate Frequency (transaction count)
   └─ Calculate Monetary (total spending)
   └─ Save to CSV: rfm_table.csv
   
4. Feature Scaling
   └─ Normalize to zero mean, unit variance
   └─ Save Scaler: scaler.pkl
   
5. K-Means Training
   └─ 5 clusters, random_state=42, n_init=10
   └─ Save Model: kmeans_model.pkl
   
6. Profile Generation
   └─ Calculate mean, median, min, max per segment
   └─ Save Profiles: segment_profiles.json
```

### Prediction Pipeline (API)
```
1. Receive Request
   └─ Extract RFM values (manual) or customer_id (lookup)
   
2. Scale Features
   └─ Apply StandardScaler transformation
   
3. Predict Cluster
   └─ K-Means predict
   
4. Calculate Confidence
   └─ Inverse of distance to cluster center
   
5. Build Response
   └─ Segment ID, name, stats, confidence
   └─ Return JSON
```

---

## 📁 File Structure

```
segmentation_agent/
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── train_segmentation.py              # Model training script
├── app.py                             # Flask API server
├── utils.py                           # Data processing utilities
├── data/
│   └── Online Retail.xlsx            # Input data
└── models/
    ├── kmeans_model.pkl              # Trained K-Means model
    ├── scaler.pkl                    # StandardScaler
    ├── segment_profiles.json         # Segment statistics
    └── rfm_table.csv                 # RFM features table
```

---

## 🧪 Testing

### Unit Tests (Recommended)
```bash
pytest tests/ -v
```

### Manual Testing
```bash
# Terminal 1: Start API
python app.py

# Terminal 2: Test endpoints
curl http://localhost:5001/health
curl -X POST http://localhost:5001/segment/manual \
  -H "Content-Type: application/json" \
  -d '{"recency":30,"frequency":5,"monetary":1500}'
```

---

## 🔍 Code Structure

### `train_segmentation.py`
- **Imports**: pandas, sklearn, joblib
- **Main function**: Orchestrates entire training pipeline
- **Outputs**: 4 artifact files for API

### `app.py`
- **Flask app**: REST API server
- **Routes**:
  - `GET /health` - Health check
  - `POST /segment/manual` - Predict from manual input
  - `POST /segment/customer` - Predict from customer ID
- **Helper**: `predict_segment()` function

### `utils.py`
- **Functions**:
  - `load_raw_data()` - Read Excel file
  - `clean_data()` - Validate and filter data
  - `build_rfm_table()` - Build RFM features

---

## 🐛 Troubleshooting

### Issue: "Model artifact not found"
**Solution:** Run `python train_segmentation.py` first

### Issue: "Customer not found"
**Response:** 404 error - Customer ID doesn't exist in training data

### Issue: "Invalid input"
**Solution:** Check JSON format and required fields

### Issue: Import errors
**Solution:** Install dependencies: `pip install -r requirements.txt`

---

## 🚀 Integration with Other Agents

### Output for Agent 2 (Content Retrieval)
```json
{
  "segment_id": 2,
  "segment_name": "Segment 2"
}
```

### Input from Agent 5 (Orchestrator)
```json
{
  "customer_id": 12347
}
```

---

## 📈 Performance Metrics

- **Model Training Time**: ~2-5 seconds
- **API Response Time**: <100ms per request
- **Max Clusters**: 5 (configurable)
- **Data Points**: ~500 customers

---

## 🔐 Security Notes

- ✅ Input validation on all API endpoints
- ✅ Error handling for missing files/customers
- ✅ Type hints for code safety
- ⚠️ No authentication required (add if needed)

---

## 📝 Future Improvements

- [ ] Support for dynamic cluster numbers
- [ ] Model versioning and model registry
- [ ] Async API endpoints
- [ ] Database integration instead of CSV
- [ ] Model retraining scheduler
- [ ] Confidence scoring improvements
- [ ] A/B testing framework

---

## 📧 Contact & Support

**Agent Owner**: Person 1  
**Repository**: https://github.com/nermeennasim/chainreach-ai  
**Branch**: person1-feature-segmentation-api

---

## 📚 References

- [RFM Analysis](https://en.wikipedia.org/wiki/RFM_(customer_value))
- [K-Means Clustering](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Scikit-Learn Guide](https://scikit-learn.org/stable/)

---

<div align="center">

**Built with ❤️ for Customer Segmentation**

*Part of the ChainReach AI Multi-Agent System*

</div>
