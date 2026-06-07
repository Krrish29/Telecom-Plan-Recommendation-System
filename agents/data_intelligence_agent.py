"""
data_intelligence_agent.py

Isolation Forest based telecom intelligence agent
for anomaly detection + engagement scoring.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import MinMaxScaler


# =========================================================
# PATHS
# =========================================================

MODEL_PATH = os.path.join(
    "models",
    "intelligence_model.pkl"
)

SCALER_PATH = os.path.join(
    "models",
    "intelligence_scaler.pkl"
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
# ENGAGEMENT SCORE
# =========================================================

def _engagement_score(row: pd.Series) -> float:
    """
    Composite engagement score (0–100)
    """

    raw = (

        min(row.get("avg_data_gb", 0) / 100, 1) * 35

        +

        min(row.get("avg_call_minutes", 0) / 5000, 1) * 25

        +

        min(row.get("avg_sms", 0) / 800, 1) * 15

        +

        min(row.get("avg_payment", 0) / 100, 1) * 15

        -

        min(row.get("total_complaints", 0) / 10, 1) * 10

    )

    return round(
        max(0.0, min(raw, 100)),
        2
    )


# =========================================================
# INSIGHT GENERATION
# =========================================================

def _build_insight(
    row: pd.Series,
    is_anomaly: bool
) -> str:

    insights = []

    if is_anomaly:

        insights.append(
            "⚠️ Anomalous usage pattern detected"
        )

    if row.get("avg_data_gb", 0) > 80:

        insights.append(
            "📡 Extremely high data usage"
        )

    if row.get("avg_call_minutes", 0) > 4000:

        insights.append(
            "📞 Extremely high calling activity"
        )

    if row.get("total_complaints", 0) > 5:

        insights.append(
            "🚨 High complaint volume"
        )

    if row.get("total_late_payments", 0) > 3:

        insights.append(
            "💳 Frequent late payments"
        )

    if row.get("avg_payment", 0) > 70:

        insights.append(
            "💰 Premium-value customer"
        )

    if not insights:

        insights.append(
            "✅ Normal user behavior"
        )

    return " | ".join(insights)


# =========================================================
# AGENT
# =========================================================

class DataIntelligenceAgent:

    def __init__(self):

        self.model = None

        self.scaler = None

        self._load()

    # =====================================================
    # LOAD
    # =====================================================

    def _load(self):

        if (
            os.path.exists(MODEL_PATH)
            and
            os.path.exists(SCALER_PATH)
        ):

            self.model = joblib.load(MODEL_PATH)

            self.scaler = joblib.load(SCALER_PATH)

    # =====================================================
    # TRAIN
    # =====================================================

    def train(self, df: pd.DataFrame):

        print("\n========== INTELLIGENCE MODEL TRAINING ==========")

        X = df[FEATURES].fillna(0).values

        print(f"\nDataset Shape: {X.shape}")

        # SCALE
        self.scaler = MinMaxScaler()

        X_scaled = self.scaler.fit_transform(X)

        # MODEL
        self.model = IsolationForest(
            n_estimators=200,
            contamination=0.08,
            random_state=42,
            n_jobs=-1
        )

        preds = self.model.fit_predict(X_scaled)

        # =================================================
        # EVALUATION
        # =================================================

        anomaly_rate = (preds == -1).mean()

        print("\n========== INTELLIGENCE EVALUATION ==========")

        print(f"Anomaly Rate: {anomaly_rate:.4f}")

        # =================================================
        # SAVE MODEL
        # =================================================

        os.makedirs("models", exist_ok=True)

        joblib.dump(
            self.model,
            MODEL_PATH
        )

        joblib.dump(
            self.scaler,
            SCALER_PATH
        )

        print("\n[DataIntelligenceAgent] Model saved.")

        # =================================================
        # SAVE METRICS
        # =================================================

        metrics = {
            "anomaly_rate": float(anomaly_rate)
        }

        with open(
            "models/intelligence_metrics.json",
            "w"
        ) as f:

            json.dump(
                metrics,
                f,
                indent=4
            )

        print("Intelligence metrics saved.")

        # SAVE RESULTS
        results = self.predict(df)

        results.to_csv(
            "models/intelligence_results.csv",
            index=False
        )

        print("Intelligence results saved.")

        return metrics

    # =====================================================
    # PREDICT
    # =====================================================

    def predict(
        self,
        df: pd.DataFrame
    ) -> pd.DataFrame:

        if self.model is None:

            raise RuntimeError(
                "DataIntelligenceAgent model not loaded."
            )

        X = df[FEATURES].fillna(0).values

        X_scaled = self.scaler.transform(X)

        raw_scores = self.model.decision_function(X_scaled)

        predictions = self.model.predict(X_scaled)

        result = df[["user_id"]].copy()

        result["anomaly_flag"] = (
            predictions == -1
        ).astype(int)

        result["anomaly_score"] = np.round(

            1 - (
                (raw_scores - raw_scores.min())
                /
                (np.ptp(raw_scores) + 1e-9)
            ),

            4
        )

        result["engagement_score"] = df.apply(
            _engagement_score,
            axis=1
        )

        result["intelligence_insight"] = df.apply(

            lambda r: _build_insight(
                r,
                predictions[r.name] == -1
            ),

            axis=1
        )

        result["anomaly_label"] = result[
            "anomaly_flag"
        ].map({

            0: "Normal",
            1: "Anomaly"
        })

        return result

    # =====================================================
    # SINGLE USER
    # =====================================================

    def predict_single(
        self,
        features: dict
    ) -> dict:

        row = pd.DataFrame([features])

        for f in FEATURES:

            if f not in row.columns:

                row[f] = 0

        X_scaled = self.scaler.transform(

            row[FEATURES]
            .fillna(0)
            .values
        )

        raw = float(
            self.model.decision_function(X_scaled)[0]
        )

        pred = int(
            self.model.predict(X_scaled)[0]
        )

        is_anomaly = pred == -1

        engagement = _engagement_score(
            pd.Series(features)
        )

        return {

            "anomaly_flag":
                1 if is_anomaly else 0,

            "anomaly_label":
                "Anomaly" if is_anomaly else "Normal",

            "anomaly_score":
                round(1 - raw, 4),

            "engagement_score":
                engagement,

            "intelligence_insight":
                _build_insight(
                    pd.Series(features),
                    is_anomaly
                )
        }