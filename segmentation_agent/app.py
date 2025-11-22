from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import euclidean_distances
import json

MODEL_PATH = "models/kmeans_model.pkl"
SCALER_PATH = "models/scaler.pkl"
PROFILES_PATH = "models/segment_profiles.json"
RFM_PATH = "models/rfm_table.csv"

app = Flask(__name__)

kmeans = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
rfm_table = pd.read_csv(RFM_PATH)

with open(PROFILES_PATH) as f:
    profiles = json.load(f)

def predict_segment(recency, frequency, monetary):
    X = np.array([[recency, frequency, monetary]])
    X_scaled = scaler.transform(X)
    cid = int(kmeans.predict(X_scaled)[0])
    center = kmeans.cluster_centers_[cid].reshape(1, -1)

    dist = float(euclidean_distances(X_scaled, center)[0][0])
    confidence = max(0, 1 - dist / 5)

    profile = profiles[str(cid)]
    return {
        "segment_id": cid,
        "segment_name": profile["segment_name"],
        "stats": {k: v for k, v in profile.items() if k != "segment_name"},
        "confidence": confidence,
        "distance_to_center": dist
    }

@app.route("/health")
def health():
    return {"status": "ok", "service": "segmentation-agent"}

@app.route("/segment/manual", methods=["POST"])
def manual():
    data = request.get_json()
    seg = predict_segment(data["recency"], data["frequency"], data["monetary"])
    return jsonify(seg)

@app.route("/segment/customer", methods=["POST"])
def by_customer():
    cid = data = request.get_json()["customer_id"]
    row = rfm_table[rfm_table["CustomerID"] == float(cid)]
    if row.empty:
        return {"error": "Customer not found"}, 404
    row = row.iloc[0]
    seg = predict_segment(row["Recency"], row["Frequency"], row["Monetary"])
    return jsonify(seg)

if __name__ == "__main__":
    app.run(port=5001, debug=True)
