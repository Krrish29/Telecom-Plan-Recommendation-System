"""
recommendation_agent.py

KNN-based telecom recommendation system
with evaluation metrics.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler


# =========================================================
# PATHS
# =========================================================

MODEL_PATH = os.path.join(
    "models",
    "recommendation_model.pkl"
)

SCALER_PATH = os.path.join(
    "models",
    "recommendation_scaler.pkl"
)

# =========================================================
# FEATURES
# =========================================================

FEATURES = [
    "avg_data_gb",
    "avg_call_minutes",
    "avg_sms",
    "total_complaints",
    "total_late_payments",
    "avg_payment",
    "usage_records"
]

# =========================================================
# PLAN CATALOGUE
# =========================================================

PLAN_CATALOGUE = [

    {
        "plan_id": 1,
        "plan_name": "Budget",
        "plan_type": "Prepaid",
        "price": 199
    },

    {
        "plan_id": 2,
        "plan_name": "Mini",
        "plan_type": "Prepaid",
        "price": 299
    },

    {
        "plan_id": 3,
        "plan_name": "Lite",
        "plan_type": "Prepaid",
        "price": 399
    },

    {
        "plan_id": 4,
        "plan_name": "Standard",
        "plan_type": "Prepaid",
        "price": 499
    },

    {
        "plan_id": 5,
        "plan_name": "Premium",
        "plan_type": "Postpaid",
        "price": 699
    },

    {
        "plan_id": 6,
        "plan_name": "Pro",
        "plan_type": "Postpaid",
        "price": 999
    }
]


# =========================================================
# RULE-BASED FALLBACK
# =========================================================

def _pick_best_plan(features: dict):

    data = features.get("avg_data_gb", 0)

    calls = features.get("avg_call_minutes", 0)

    complaints = features.get("total_complaints", 0)

    payment = features.get("avg_payment", 0)

    # Pro
    if data > 80 or payment > 900:
        return PLAN_CATALOGUE[5]

    # Premium
    if data > 50 or calls > 3000:
        return PLAN_CATALOGUE[4]

    # Standard
    if data > 20 or calls > 1000:
        return PLAN_CATALOGUE[3]

    # Lite
    if complaints > 3:
        return PLAN_CATALOGUE[2]

    # Mini
    if payment > 300:
        return PLAN_CATALOGUE[1]

    # Budget
    return PLAN_CATALOGUE[0]

# =========================================================
# REASON GENERATION
# =========================================================

def _build_reason(user_features: dict, plan: dict):

    reasons = []

    if user_features.get("avg_data_gb", 0) > 40:

        reasons.append(
            "High data usage detected"
        )

    if user_features.get("avg_call_minutes", 0) > 1000:

        reasons.append(
            "Heavy calling pattern observed"
        )

    if user_features.get("total_complaints", 0) > 3:

        reasons.append(
            "Premium support recommended"
        )

    if not reasons:

        reasons.append(
            "Usage pattern matches recommended tier"
        )

    return "; ".join(reasons)


# =========================================================
# AGENT
# =========================================================

class RecommendationAgent:

    def __init__(self):

        self.model = None

        self.scaler = None

        self.train_df = None

        self._load()

    # =====================================================
    # LOAD MODEL
    # =====================================================

    def _load(self):

        if (
            os.path.exists(MODEL_PATH)
            and
            os.path.exists(SCALER_PATH)
        ):

            bundle = joblib.load(MODEL_PATH)

            self.model = bundle["model"]

            self.train_df = bundle["train_df"]

            self.scaler = joblib.load(SCALER_PATH)

    # =====================================================
    # TRAIN
    # =====================================================

    def train(self, df: pd.DataFrame):

        print("\n========== RECOMMENDATION MODEL TRAINING ==========")

        self.train_df = df.copy()

        X = df[FEATURES].fillna(0).values

        print(f"\nDataset Shape: {X.shape}")

        # SCALE
        self.scaler = StandardScaler()

        X_scaled = self.scaler.fit_transform(X)
        
        # MODEL
        self.model = NearestNeighbors(
            n_neighbors=min(6, len(df)),
            algorithm="ball_tree"
        )

        self.model.fit(X_scaled)

        # SAVE MODEL
        os.makedirs("models", exist_ok=True)

        joblib.dump(
            {
                "model": self.model,
                "train_df": self.train_df
            },
            MODEL_PATH
        )

        joblib.dump(
            self.scaler,
            SCALER_PATH
        )

        print("\n[RecommendationAgent] Model saved.")

        # GENERATE SAMPLE RECOMMENDATIONS
        recommendations = self.predict(df)

        avg_confidence = recommendations[
            "churn_score"
        ].mean()

        print("\n========== RECOMMENDATION EVALUATION ==========")

        print(
            f"Average Confidence: {avg_confidence:.4f}"
        )

        # SAVE METRICS
        metrics = {
            "avg_confidence": float(avg_confidence)
        }

        with open(
            "models/recommendation_metrics.json",
            "w"
        ) as f:

            json.dump(
                metrics,
                f,
                indent=4
            )

        # SAVE OUTPUTS
        recommendations.to_csv(
            "models/recommendations.csv",
            index=False
        )

        print("Recommendation metrics saved.")

        return metrics

    # =====================================================
    # PREDICT
    # =====================================================

    def predict(self, df: pd.DataFrame):

        if self.model is None:

            raise RuntimeError(
                "Recommendation model not loaded."
            )

        X = df[FEATURES].fillna(0).values

        X_scaled = self.scaler.transform(X)

        distances, indices = self.model.kneighbors(X_scaled)

        rows = []

        for i, uid in enumerate(df["user_id"]):

            neighbour_ids = (
                self.train_df
                .iloc[indices[i][1:]]
                ["user_id"]
                .tolist()
            )

            feats = df.iloc[i].to_dict()

            plan = _pick_best_plan(feats)

            similarity = max(
                0.0,
                1.0 - float(distances[i][1]) / 10.0
            )

            rows.append({

                "user_id": uid,

                "plan_id": plan["plan_id"],

                "plan_name": plan["plan_name"],

                "plan_type": plan["plan_type"],

                "price": plan["price"],

                "reason": _build_reason(
                    feats,
                    plan
                ),

                "churn_score": round(
                    min(similarity, 0.99),
                    4
                ),

                "similar_users": neighbour_ids[:3]
            })

        return pd.DataFrame(rows)

    # =====================================================
    # SINGLE USER
    # =====================================================

    def predict_single(self, features: dict):

        plan = _pick_best_plan(features)

        row = pd.DataFrame([features])

        for f in FEATURES:

            if f not in row.columns:

                row[f] = 0

        X_scaled = self.scaler.transform(

            row[FEATURES]
            .fillna(0)
            .values
        )

        distances, _ = self.model.kneighbors(X_scaled)

        similarity = max(
            0.0,
            1.0 - float(distances[0][1]) / 10.0
        )

        return {

            "plan_id": plan["plan_id"],

            "plan_name": plan["plan_name"],

            "plan_type": plan["plan_type"],

            "price": plan["price"],

            "reason": _build_reason(
                features,
                plan
            ),

            "churn_score": round(
                min(similarity, 0.99),
                4
            )
        }