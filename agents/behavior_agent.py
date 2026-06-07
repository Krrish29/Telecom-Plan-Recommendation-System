import joblib

from db import fetch_behavior_data
 
 
class BehaviorAgent:
 
    def __init__(self):
 
        self.model = joblib.load("behavior_model.pkl")

        self.scaler = joblib.load("behavior_scaler.pkl")
 
        print("Behavior Agent Loaded")
 
    # =========================================

    # FETCH DATA

    # =========================================
 
    def fetch_data(self):
 
        return fetch_behavior_data()
 
    # =========================================

    # DYNAMIC LABEL MAP

    # =========================================
 
    def generate_label_map(self):
 
        centers = self.model.cluster_centers_
 
        cluster_info = []
 
        for i, center in enumerate(centers):
 
            usage_score = (

                center[0] +   # avg_data_gb

                center[1] +   # avg_call_minutes

                center[2]     # avg_sms

            )
 
            cluster_info.append({

                "cluster": i,

                "usage_score": usage_score,

                "data_score": center[0]

            })
 
        sorted_clusters = sorted(

            cluster_info,

            key=lambda x: x["usage_score"]

        )
 
        label_map = {}
 
        label_map[sorted_clusters[0]["cluster"]] = "Inactive Users"

        label_map[sorted_clusters[-1]["cluster"]] = "Heavy Users"
 
        remaining = sorted_clusters[1:3]
 
        for c in remaining:
 
            if c["data_score"] > c["usage_score"] * 0.4:

                label_map[c["cluster"]] = "Data Users"

            else:

                label_map[c["cluster"]] = "Casual Users"
 
        return label_map
 
    # =========================================

    # PREDICT ALL

    # =========================================
 
    def predict_all(self):
 
        df = self.fetch_data()
 
        features = df[[

            "avg_data_gb",

            "avg_call_minutes",

            "avg_sms",

            "total_complaints",

            "usage_frequency",

            "inactive_days"

        ]]
 
        X_scaled = self.scaler.transform(features)
 
        clusters = self.model.predict(X_scaled)
 
        label_map = self.generate_label_map()
 
        df["cluster"] = clusters

        df["segment"] = df["cluster"].map(label_map)
 
        return df
 
    # =========================================

    # SINGLE USER

    # =========================================
 
    def predict_single(self, user_id):
 
        df = self.predict_all()
 
        user = df[df["user_id"] == user_id]
 
        if user.empty:

            return {"error": "User not found"}
 
        row = user.iloc[0]
 
        return {

            "user_id": int(row["user_id"]),

            "cluster": int(row["cluster"]),

            "segment": row["segment"]

        }
 