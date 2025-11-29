"""
Customer Segmentation API Service

This Flask-based microservice provides REST API endpoints for customer segmentation
predictions using a pre-trained K-Means clustering model with RFM features.

Endpoints:
    GET /health: Health check endpoint
    POST /segment/manual: Predict segment for manual RFM input
    POST /segment/customer: Predict segment for a customer by ID

Environment Variables:
    DATABASE_URL: PostgreSQL connection string
    MODEL_PATH: Path to trained K-Means model
    SCALER_PATH: Path to feature scaler
    PROFILES_PATH: Path to segment profiles JSON
    RFM_PATH: Path to RFM analysis table CSV (fallback)
    USE_CSV_FALLBACK: Enable CSV fallback if database unavailable
"""

from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import euclidean_distances
import json
import os
from typing import Dict, Any, Tuple, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database (with graceful fallback)
try:
    from database import get_db, CustomerRFM, db_available, init_db
    print(f"🔌 Database module loaded. Available: {db_available}")
except ImportError as e:
    print(f"⚠️ Database module not available: {e}")
    db_available = False

# ============================================================================
# ENVIRONMENT VARIABLES & CONFIGURATION
# ============================================================================
MODEL_PATH: str = os.getenv("MODEL_PATH", "models/kmeans_model.pkl")
SCALER_PATH: str = os.getenv("SCALER_PATH", "models/scaler.pkl")
PROFILES_PATH: str = os.getenv("PROFILES_PATH", "models/segment_profiles.json")
RFM_PATH: str = os.getenv("RFM_CSV_PATH", "models/rfm_table.csv")
USE_CSV_FALLBACK: bool = os.getenv("USE_CSV_FALLBACK", "true").lower() == "true"

# ============================================================================
# FLASK APP INITIALIZATION
# ============================================================================
app = Flask(__name__)

# ============================================================================
# MODEL & DATA LOADING
# ============================================================================
# Load pre-trained artifacts at startup for fast prediction
try:
    kmeans = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    with open(PROFILES_PATH) as f:
        profiles = json.load(f)
    print("✅ ML models loaded successfully")
except FileNotFoundError as e:
    print(f"ERROR: Model artifact not found. Please run train_segmentation.py first.")
    print(f"Missing file: {e}")
    raise

# Load CSV as fallback
rfm_table: Optional[pd.DataFrame] = None
if USE_CSV_FALLBACK or not db_available:
    try:
        rfm_table = pd.read_csv(RFM_PATH)
        print(f"✅ CSV fallback loaded: {len(rfm_table)} customers")
    except FileNotFoundError:
        print(f"⚠️ CSV file not found: {RFM_PATH}")
        if not db_available:
            raise RuntimeError("Neither database nor CSV file available!")

# Initialize database if available
if db_available:
    init_db()


def predict_segment(recency: float, frequency: float, monetary: float) -> Dict[str, Any]:
    """
    Predict customer segment based on RFM features.
    
    Args:
        recency: Days since last purchase
        frequency: Number of transactions
        monetary: Total spending amount
        
    Returns:
        Dictionary containing:
        - segment_id: Assigned cluster ID (0-4)
        - segment_name: Human-readable segment name
        - stats: Statistical profile of the segment
        - confidence: Confidence score (0-1) based on distance to cluster center
        - distance_to_center: Euclidean distance to assigned cluster center
    """
    # Create feature vector and scale using the fitted scaler
    X = np.array([[recency, frequency, monetary]])
    X_scaled = scaler.transform(X)
    
    # Predict cluster assignment
    cid = int(kmeans.predict(X_scaled)[0])
    
    # Calculate confidence as inverse of distance to cluster center
    # Points close to center have higher confidence
    center = kmeans.cluster_centers_[cid].reshape(1, -1)
    dist = float(euclidean_distances(X_scaled, center)[0][0])
    confidence = max(0, 1 - dist / 5)  # Normalize distance (assume max dist ~5)

    # Retrieve segment profile from pre-computed profiles
    profile = profiles[str(cid)]
    
    return {
        "segment_id": cid,
        "segment_name": profile["segment_name"],
        "stats": {k: v for k, v in profile.items() if k != "segment_name"},
        "confidence": confidence,
        "distance_to_center": dist
    }


@app.route("/health")
def health() -> Dict[str, str]:
    """
    Health check endpoint for monitoring service availability.
    
    Returns:
        JSON with status and service identifier
    """
    return {"status": "ok", "service": "segmentation-agent"}


@app.route("/segment/manual", methods=["POST"])
def manual() -> Tuple[Dict[str, Any], int]:
    """
    Predict segment from manually provided RFM values.
    
    Request JSON:
    {
        "recency": <int: days since purchase>,
        "frequency": <int: number of transactions>,
        "monetary": <float: total spending>
    }
    
    Returns:
        JSON response with segment prediction and confidence
        HTTP 400 if invalid input
    """
    try:
        data = request.get_json()
        
        # Validate input data
        if not data:
            return {"error": "No JSON data provided"}, 400
        
        required_fields = {"recency", "frequency", "monetary"}
        if not required_fields.issubset(data.keys()):
            return {
                "error": f"Missing required fields. Expected: {required_fields}"
            }, 400
        
        # Predict segment
        seg = predict_segment(
            data["recency"], 
            data["frequency"], 
            data["monetary"]
        )
        return jsonify(seg), 200
        
    except (ValueError, TypeError) as e:
        return {"error": f"Invalid input: {str(e)}"}, 400
    except Exception as e:
        return {"error": f"Server error: {str(e)}"}, 500


@app.route("/segment/customer", methods=["POST"])
def by_customer() -> Tuple[Dict[str, Any], int]:
    """
    Predict segment for a specific customer by looking up their RFM values.
    First tries database, falls back to CSV if unavailable.
    
    Request JSON:
    {
        "customer_id": <string or int: customer ID from RFM table>
    }
    
    Returns:
        JSON response with segment prediction and confidence
        HTTP 404 if customer not found
        HTTP 400 if invalid input
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return {"error": "No JSON data provided"}, 400
        
        if "customer_id" not in data:
            return {"error": "Missing 'customer_id' in request"}, 400
        
        customer_id = float(data["customer_id"])
        
        # Try database first
        if db_available:
            db = get_db()
            if db:
                customer = db.query(CustomerRFM).filter(
                    CustomerRFM.customer_id == customer_id
                ).first()
                db.close()
                
                if customer:
                    seg = predict_segment(
                        customer.recency,
                        customer.frequency,
                        customer.monetary
                    )
                    seg["data_source"] = "database"
                    return jsonify(seg), 200
        
        # Fallback to CSV
        if rfm_table is not None:
            row = rfm_table[rfm_table["CustomerID"] == customer_id]
            
            if not row.empty:
                row = row.iloc[0]
                seg = predict_segment(row["Recency"], row["Frequency"], row["Monetary"])
                seg["data_source"] = "csv"
                return jsonify(seg), 200
        
        # Customer not found in either source
        return {"error": f"Customer {customer_id} not found"}, 404
        
    except ValueError as e:
        return {"error": f"Invalid customer_id: {str(e)}"}, 400
    except Exception as e:
        return {"error": f"Server error: {str(e)}"}, 500


@app.route("/api/segment", methods=["POST"])
def segment_batch():
    """
    Batch segmentation for N customers.
    First tries database, falls back to CSV if unavailable.

    Request JSON:
    {
        "customer_count": <int>
    }

    Returns:
        List of segments with customers grouped by segment.
    """
    try:
        data = request.get_json()

        if not data or "customer_count" not in data:
            return {"error": "Missing 'customer_count' in request"}, 400

        customer_count = int(data["customer_count"])
        results = {}
        data_source = "unknown"

        # Try database first
        if db_available:
            db = get_db()
            if db:
                customers = db.query(CustomerRFM).limit(customer_count).all()
                db.close()
                
                if customers:
                    data_source = "database"
                    for customer in customers:
                        customer_id = int(customer.customer_id)
                        
                        seg = predict_segment(
                            customer.recency,
                            customer.frequency,
                            customer.monetary
                        )
                        
                        sid = seg["segment_id"]
                        sname = seg["segment_name"]
                        
                        if sid not in results:
                            results[sid] = {
                                "segment_id": sid,
                                "segment_name": sname,
                                "customers": []
                            }
                        
                        results[sid]["customers"].append(customer_id)

        # Fallback to CSV
        if not results and rfm_table is not None:
            data_source = "csv"
            rfm_df = rfm_table.head(customer_count)

            for _, row in rfm_df.iterrows():
                customer_id = int(row["CustomerID"])

                seg = predict_segment(
                    row["Recency"],
                    row["Frequency"],
                    row["Monetary"]
                )

                sid = seg["segment_id"]
                sname = seg["segment_name"]

                if sid not in results:
                    results[sid] = {
                        "segment_id": sid,
                        "segment_name": sname,
                        "customers": []
                    }

                results[sid]["customers"].append(customer_id)

        response = {
            "segments": list(results.values()),
            "data_source": data_source,
            "total_customers": sum(len(seg["customers"]) for seg in results.values())
        }
        
        return jsonify(response), 200

    except Exception as e:
        return {"error": f"Server error: {str(e)}"}, 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
