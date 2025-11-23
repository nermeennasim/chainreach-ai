"""
Customer Segmentation API Service

This Flask-based microservice provides REST API endpoints for customer segmentation
predictions using a pre-trained K-Means clustering model with RFM features.

Endpoints:
    GET /health: Health check endpoint
    POST /segment/manual: Predict segment for manual RFM input
    POST /segment/customer: Predict segment for a customer by ID

Environment Variables:
    MODEL_PATH: Path to trained K-Means model
    SCALER_PATH: Path to feature scaler
    PROFILES_PATH: Path to segment profiles JSON
    RFM_PATH: Path to RFM analysis table CSV
"""

from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import euclidean_distances
import json
from typing import Dict, Any, Tuple

# ============================================================================
# ENVIRONMENT VARIABLES & CONFIGURATION
# ============================================================================
MODEL_PATH: str = "models/kmeans_model.pkl"
SCALER_PATH: str = "models/scaler.pkl"
PROFILES_PATH: str = "models/segment_profiles.json"
RFM_PATH: str = "models/rfm_table.csv"

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
    rfm_table = pd.read_csv(RFM_PATH)
    with open(PROFILES_PATH) as f:
        profiles = json.load(f)
except FileNotFoundError as e:
    print(f"ERROR: Model artifact not found. Please run train_segmentation.py first.")
    print(f"Missing file: {e}")
    raise


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
        
        # Look up customer in RFM table
        customer_id = data["customer_id"]
        row = rfm_table[rfm_table["CustomerID"] == float(customer_id)]
        
        if row.empty:
            return {"error": f"Customer {customer_id} not found in RFM table"}, 404
        
        # Extract RFM values and predict
        row = row.iloc[0]
        seg = predict_segment(row["Recency"], row["Frequency"], row["Monetary"])
        return jsonify(seg), 200
        
    except ValueError as e:
        return {"error": f"Invalid customer_id: {str(e)}"}, 400
    except Exception as e:
        return {"error": f"Server error: {str(e)}"}, 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)
