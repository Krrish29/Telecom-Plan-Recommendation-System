"""
churn_agent.py

XGBoost-based churn prediction agent
with evaluation metrics and single-user inference.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np

from xgboost import XGBClassifier

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

# =====================================================
# PATHS
# =====================================================

MODELS_DIR = "models"

os.makedirs(
    MODELS_DIR,
    exist_ok=True
)

MODEL_PATH = os.path.join(
    MODELS_DIR,
    "churn_model.pkl"
)

METRICS_PATH = os.path.join(
    MODELS_DIR,
    "churn_metrics.json"
)

# =====================================================
# FEATURES
# =====================================================

FEATURES = [

    "city",

    "plan_category",

    "avg_data_gb",

    "avg_call_minutes",

    "avg_sms",

    "total_complaints",

    "usage_records",

    "avg_payment",

    "total_late_payments"
]

# =====================================================
# AGENT
# =====================================================

class ChurnAgent:

    def __init__(self):

        self.model = XGBClassifier(

            n_estimators=100,

            max_depth=5,

            learning_rate=0.1,

            random_state=42,

            eval_metric='logloss'
        )

        self.encoders = {}

        self._load()

    # =================================================
    # LOAD MODEL
    # =================================================

    def _load(self):

        if os.path.exists(MODEL_PATH):

            self.model = joblib.load(
                MODEL_PATH
            )

    # =================================================
    # PREPROCESS
    # =================================================

    def preprocess(
        self,
        df,
        training=False
    ):

        df = df.copy()

        categorical_cols = [

            "city",

            "plan_category"
        ]

        for col in categorical_cols:

            if col not in df.columns:

                df[col] = "Unknown"

            if training:

                le = LabelEncoder()

                df[col] = le.fit_transform(
                    df[col].astype(str)
                )

                self.encoders[col] = le

            else:

                if col in self.encoders:

                    le = self.encoders[col]

                    vals = []

                    for val in df[col].astype(str):

                        if val in le.classes_:

                            vals.append(

                                le.transform([val])[0]
                            )

                        else:

                            vals.append(0)

                    df[col] = vals

                else:

                    df[col] = 0

        return df

    # =================================================
    # TRAIN
    # =================================================

    def train(self, df):

        print("\n========== CHURN MODEL TRAINING ==========")

        df = self.preprocess(
            df,
            training=True
        )

        target_col = "churn"

        if target_col not in df.columns:

            raise ValueError(
                f"Target column '{target_col}' not found."
            )

        # ---------------------------------------------
        # Ensure features exist
        # ---------------------------------------------

        for f in FEATURES:

            if f not in df.columns:

                df[f] = 0

        X = df[FEATURES].fillna(0)

        y = df[target_col]

        print(f"\nFeatures Used ({len(FEATURES)}):")

        print(FEATURES)

        print(f"\nDataset Shape: {X.shape}")

        # ---------------------------------------------
        # Split
        # ---------------------------------------------

        X_train, X_test, y_train, y_test = train_test_split(

            X,

            y,

            test_size=0.2,

            random_state=42,

            stratify=y
        )

        print("\nTraining model...")

        self.model.fit(
            X_train,
            y_train
        )

        print("Model training complete.")

        # ---------------------------------------------
        # Predictions
        # ---------------------------------------------

        y_pred = self.model.predict(X_test)

        y_prob = self.model.predict_proba(
            X_test
        )[:, 1]

        # ---------------------------------------------
        # Metrics
        # ---------------------------------------------

        accuracy = accuracy_score(
            y_test,
            y_pred
        )

        precision = precision_score(
            y_test,
            y_pred,
            zero_division=0
        )

        recall = recall_score(
            y_test,
            y_pred,
            zero_division=0
        )

        f1 = f1_score(
            y_test,
            y_pred,
            zero_division=0
        )

        roc_auc = roc_auc_score(
            y_test,
            y_prob
        )

        print("\n========== MODEL EVALUATION ==========")

        print(f"Accuracy  : {accuracy:.4f}")

        print(f"Precision : {precision:.4f}")

        print(f"Recall    : {recall:.4f}")

        print(f"F1 Score  : {f1:.4f}")

        print(f"ROC AUC   : {roc_auc:.4f}")

        print("\n========== CLASSIFICATION REPORT ==========")

        print(
            classification_report(
                y_test,
                y_pred,
                zero_division=0
            )
        )

        print("\n========== CONFUSION MATRIX ==========")

        print(
            confusion_matrix(
                y_test,
                y_pred
            )
        )

        # ---------------------------------------------
        # Save model
        # ---------------------------------------------

        joblib.dump(
            self.model,
            MODEL_PATH
        )

        print(f"\nModel saved to: {MODEL_PATH}")

        # ---------------------------------------------
        # Save metrics
        # ---------------------------------------------

        metrics = {

            "accuracy":
                float(accuracy),

            "precision":
                float(precision),

            "recall":
                float(recall),

            "f1_score":
                float(f1),

            "roc_auc":
                float(roc_auc)
        }

        with open(
            METRICS_PATH,
            "w"
        ) as f:

            json.dump(
                metrics,
                f,
                indent=4
            )

        print(f"Metrics saved to: {METRICS_PATH}")

        return metrics

    # =================================================
    # BATCH PREDICT
    # =================================================

    def predict(self, df):

        df = self.preprocess(df)

        for f in FEATURES:

            if f not in df.columns:

                df[f] = 0

        X = df[FEATURES].fillna(0)

        probs = self.model.predict_proba(X)[:, 1]

        preds = self.model.predict(X)

        result = pd.DataFrame()

        result["user_id"] = df["user_id"]

        result["churn"] = preds

        result["churn_score"] = np.round(
            probs,
            4
        )

        # ---------------------------------------------
        # Risk labels
        # ---------------------------------------------

        result["churn_risk_label"] = np.where(

            result["churn_score"] >= 0.75,

            "High",

            np.where(

                result["churn_score"] >= 0.40,

                "Medium",

                "Low"
            )
        )

        # ---------------------------------------------
        # Reasons
        # ---------------------------------------------

        reasons = []

        for _, row in df.iterrows():

            r = []

            if row.get(
                "total_complaints",
                0
            ) > 3:

                r.append(
                    "High complaint history"
                )

            if row.get(
                "total_late_payments",
                0
            ) > 2:

                r.append(
                    "Frequent late payments"
                )

            if row.get(
                "avg_data_gb",
                0
            ) < 2:

                r.append(
                    "Very low engagement"
                )

            if not r:

                r.append(
                    "Normal churn indicators"
                )

            reasons.append(
                " | ".join(r)
            )

        result["churn_reason"] = reasons

        return result

    # =================================================
    # SINGLE USER PREDICT
    # =================================================

    def predict_single(self, features: dict):

        row = pd.DataFrame([features])

        row = self.preprocess(row)

        for f in FEATURES:

            if f not in row.columns:

                row[f] = 0

        X = row[FEATURES].fillna(0)

        pred = int(
            self.model.predict(X)[0]
        )

        prob = float(
            self.model.predict_proba(X)[0][1]
        )

        # ---------------------------------------------
        # Risk label
        # ---------------------------------------------

        if prob >= 0.75:

            risk = "High"

        elif prob >= 0.40:

            risk = "Medium"

        else:

            risk = "Low"

        # ---------------------------------------------
        # Reasons
        # ---------------------------------------------

        reasons = []

        if features.get(
            "total_complaints",
            0
        ) > 3:

            reasons.append(
                "High complaint history"
            )

        if features.get(
            "total_late_payments",
            0
        ) > 2:

            reasons.append(
                "Frequent late payments"
            )

        if features.get(
            "avg_data_gb",
            0
        ) < 2:

            reasons.append(
                "Very low engagement"
            )

        if not reasons:

            reasons.append(
                "Normal churn indicators"
            )

        return {

            "churn":
                pred,

            "churn_score":
                round(prob, 4),

            "churn_risk_label":
                risk,

            "churn_reason":
                " | ".join(reasons)
        }