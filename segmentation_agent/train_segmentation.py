import json
import joblib
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

from utils import load_raw_data, clean_data, build_rfm_table

DATA_PATH = "data/Online Retail.xlsx"
MODEL_PATH = "models/kmeans_model.pkl"
SCALER_PATH = "models/scaler.pkl"
PROFILES_PATH = "models/segment_profiles.json"
RFM_PATH = "models/rfm_table.csv"

def main():
    print("Loading dataset...")
    df = load_raw_data(DATA_PATH)

    print("Cleaning...")
    df_clean = clean_data(df)

    print("Creating RFM table...")
    rfm = build_rfm_table(df_clean)
    rfm.to_csv(RFM_PATH, index=False)

    print("Training model...")
    features = rfm[["Recency", "Frequency", "Monetary"]].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    rfm["cluster_id"] = clusters

    profiles = (
        rfm.groupby("cluster_id")[["Recency", "Frequency", "Monetary"]]
           .agg(["mean", "median", "min", "max"])
    )

    profiles_dict = {}
    for cid, row in profiles.iterrows():
        stats = {}
        for (feat, stat), val in row.items():
            stats[f"{feat}_{stat}"] = float(val)
        stats["segment_name"] = f"Segment {cid}"
        profiles_dict[int(cid)] = stats

    joblib.dump(kmeans, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    with open(PROFILES_PATH, "w") as f:
        json.dump(profiles_dict, f, indent=2)

    print("Training complete!")

if __name__ == "__main__":
    main()
