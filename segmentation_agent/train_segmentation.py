"""
Customer Segmentation Model Training Module

This module trains a K-Means clustering model using RFM (Recency, Frequency, Monetary)
analysis. It preprocesses customer transaction data, scales features, and generates
segment profiles for use in the segmentation API.

Environment Variables:
    DATA_PATH: Path to raw transaction data (Excel file)
    MODEL_PATH: Output path for trained K-Means model
    SCALER_PATH: Output path for StandardScaler
    PROFILES_PATH: Output path for segment profiles (JSON)
    RFM_PATH: Output path for RFM analysis table (CSV)
"""

import json
import joblib
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from typing import Dict, Any

from utils import load_raw_data, clean_data, build_rfm_table

# ============================================================================
# ENVIRONMENT VARIABLES & CONFIGURATION
# ============================================================================
# File paths for data input and model/artifact output
DATA_PATH: str = "data/Online Retail.xlsx"  # Input: Raw customer transaction data
MODEL_PATH: str = "models/kmeans_model.pkl"  # Output: Trained K-Means model
SCALER_PATH: str = "models/scaler.pkl"  # Output: Feature scaler (StandardScaler)
PROFILES_PATH: str = "models/segment_profiles.json"  # Output: Segment profiles
RFM_PATH: str = "models/rfm_table.csv"  # Output: RFM analysis table

# K-Means configuration
N_CLUSTERS: int = 5  # Number of customer segments
RANDOM_STATE: int = 42  # Seed for reproducibility
N_INIT: int = 10  # Number of initializations for K-Means


def main() -> None:
    """
    Execute the complete segmentation model training pipeline.
    
    Process flow:
    1. Load raw transaction data from Excel file
    2. Clean and validate data (remove nulls, invalid quantities/prices)
    3. Build RFM features for each customer
    4. Scale features using StandardScaler
    5. Train K-Means clustering model with 5 segments
    6. Generate segment profiles with statistical summaries
    7. Persist all artifacts (model, scaler, profiles) to disk
    
    Returns:
        None
        
    Raises:
        FileNotFoundError: If data file not found
        Exception: If training fails
    """
    print("Loading dataset...")
    df = load_raw_data(DATA_PATH)

    print("Cleaning...")
    df_clean = clean_data(df)

    print("Creating RFM table...")
    # Build RFM (Recency, Frequency, Monetary) features for customer segmentation
    rfm = build_rfm_table(df_clean)
    rfm.to_csv(RFM_PATH, index=False)

    print("Training model...")
    # ====================================================================
    # STEP 1: FEATURE EXTRACTION & SCALING
    # ====================================================================
    # Extract RFM features and scale them to have zero mean and unit variance
    # Scaling ensures each feature has equal influence during clustering
    features = rfm[["Recency", "Frequency", "Monetary"]].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    # ====================================================================
    # STEP 2: K-MEANS CLUSTERING
    # ====================================================================
    # Train K-Means model with 5 clusters (customer segments)
    # - n_clusters: Number of customer segments to create
    # - random_state: Reproducible results across runs
    # - n_init: Multiple initializations for optimal clustering
    kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=RANDOM_STATE, n_init=N_INIT)
    clusters = kmeans.fit_predict(X_scaled)
    rfm["cluster_id"] = clusters

    # ====================================================================
    # STEP 3: SEGMENT PROFILE GENERATION
    # ====================================================================
    # Calculate aggregate statistics for each cluster
    # This helps understand and describe each customer segment
    profiles = (
        rfm.groupby("cluster_id")[["Recency", "Frequency", "Monetary"]]
           .agg(["mean", "median", "min", "max"])
    )

    # Convert profile statistics to JSON-serializable dictionary format
    profiles_dict: Dict[int, Dict[str, Any]] = {}
    for cid, row in profiles.iterrows():
        stats: Dict[str, float] = {}
        for (feat, stat), val in row.items():
            # Convert numpy types to native Python types for JSON serialization
            stats[f"{feat}_{stat}"] = float(val)
        stats["segment_name"] = f"Segment {cid}"
        profiles_dict[int(cid)] = stats

    # ====================================================================
    # STEP 4: MODEL PERSISTENCE
    # ====================================================================
    # Save all trained artifacts for use in the Flask API
    joblib.dump(kmeans, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    
    # Save segment profiles for API to reference
    with open(PROFILES_PATH, "w") as f:
        json.dump(profiles_dict, f, indent=2)

    print("Training complete!")

if __name__ == "__main__":
    main()