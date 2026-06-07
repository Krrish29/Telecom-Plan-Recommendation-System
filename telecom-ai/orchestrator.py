"""
orchestrator.py

Multi-Agent Orchestrator
Runs all AI agents and persists results.
"""

import pandas as pd

from db import (
    fetch_feature_matrix,
    get_connection
)

from behavior_agent import BehaviorAgent
from churn_agent import ChurnAgent
from recommendation_agent import RecommendationAgent
from data_intelligence_agent import DataIntelligenceAgent


class TelecomOrchestrator:

    def __init__(self):

        self.behavior_agent = BehaviorAgent()

        self.churn_agent = ChurnAgent()

        self.recommendation_agent = RecommendationAgent()

        self.intelligence_agent = DataIntelligenceAgent()

    # =====================================================
    # FULL ANALYSIS
    # =====================================================

    def run_full_analysis(self) -> dict:

        print("[Orchestrator] Fetching feature matrix …")

        df = fetch_feature_matrix()

        print(f"[Orchestrator] Analysing {len(df)} customers …")

        # -------------------------------------------------
        # Agent execution
        # -------------------------------------------------

        behavior_df = self.behavior_agent.predict_all(df)

        churn_df = self.churn_agent.predict(df)

        recommendation_df = self.recommendation_agent.predict(df)

        intelligence_df = self.intelligence_agent.predict(df)

        # =================================================
        # COMPATIBILITY MAPPING FOR FRONTEND
        # =================================================

        intelligence_df["usage_score"] = (
            intelligence_df["anomaly_score"] * 100
        ).round(2)

        intelligence_df["usage_level"] = (
            intelligence_df["anomaly_label"]
        )

        intelligence_df["engagement_level"] = (
            intelligence_df["engagement_score"]
            .apply(
                lambda x:
                    "Highly Engaged"
                    if x >= 70
                    else (
                        "Moderately Engaged"
                        if x >= 40
                        else "Low Engagement"
                    )
            )
        )

        intelligence_df["internet_profile"] = (
            intelligence_df["usage_level"]
        )

        intelligence_df["calling_profile"] = (
            "Moderate Caller"
        )

        intelligence_df["sms_profile"] = (
            "Moderate SMS User"
        )

        intelligence_df["complaint_profile"] = (
            intelligence_df["intelligence_insight"]
        )

        # =================================================
        # MERGE INTELLIGENCE INTO RECOMMENDATION DF
        # =================================================

        recommendation_df = recommendation_df.merge(

            intelligence_df[[
                "user_id",
                "usage_score",
                "usage_level",
                "engagement_score",
                "engagement_level",
                "internet_profile",
                "calling_profile",
                "sms_profile",
                "complaint_profile"
            ]],

            on="user_id",
            how="left"
        )
        # -------------------------------------------------
        # Debug columns
        # -------------------------------------------------

        print("\n[DEBUG] churn_df columns:")
        print(churn_df.columns.tolist())

        print("\n[DEBUG] recommendation_df columns:")
        print(recommendation_df.columns.tolist())

        print("\n[DEBUG] intelligence_df columns:")
        print(intelligence_df.columns.tolist())

        print("\n[DEBUG] behavior_df columns:")
        print(behavior_df.columns.tolist())

        # -------------------------------------------------
        # Merge
        # -------------------------------------------------

        combined = df.merge(
            behavior_df,
            on="user_id",
            how="left"
        )

        combined = combined.merge(
            churn_df,
            on="user_id",
            how="left"
        )

        combined = combined.merge(
            recommendation_df,
            on="user_id",
            how="left"
        )

        combined = combined.merge(
            intelligence_df,
            on="user_id",
            how="left"
        )

        # -------------------------------------------------
        # Save outputs
        # -------------------------------------------------

        self._save_churn(churn_df)

        self._save_recommendations(recommendation_df)

        print("[Orchestrator] Analysis complete.")

        return {

            "total_customers":
                len(df),

            "combined_df":
                combined,

            "behavior_df":
                behavior_df,

            "churn_df":
                churn_df,

            "recommendation_df":
                recommendation_df,

            "intelligence_df":
                intelligence_df,
        }

    # =====================================================
    # SINGLE USER
    # =====================================================

    def analyse_single_user(
        self,
        user_id: int
    ) -> dict:

        df = fetch_feature_matrix()

        row = df[
            df["user_id"] == user_id
        ]

        if row.empty:

            return {

                "error":
                    f"User {user_id} not found"
            }

        features = row.iloc[0].to_dict()

        behavior = self.behavior_agent.predict_single(
            features
        )

        churn = self.churn_agent.predict_single(
            features
        )

        recommendation = (
            self.recommendation_agent.predict_single(
                features
            )
        )

        intelligence = (
            self.intelligence_agent.predict_single(
                features
            )
        )

        return {

            "user_id":
                user_id,

            "features":
                features,

            "behavior":
                behavior,

            "churn":
                churn,

            "recommendation":
                recommendation,

            "intelligence":
                intelligence,
        }

    # =====================================================
    # SAVE CHURN
    # =====================================================

    def _save_churn(
        self,
        churn_df: pd.DataFrame
    ):

        from db import get_connection

        conn = get_connection()

        cursor = conn.cursor()

        for _, row in churn_df.iterrows():

            cursor.execute(
                """
                INSERT INTO churn_analysis
                (
                    user_id,
                    churn_score,
                    churn_risk_label,
                    churn
                )

                VALUES (%s, %s, %s, %s)

                ON DUPLICATE KEY UPDATE

                    churn_score =
                        VALUES(churn_score),

                    churn_risk_label =
                        VALUES(churn_risk_label),

                    churn =
                        VALUES(churn)
                """,

                (
                    int(row["user_id"]),

                    float(row["churn_score"]),

                    str(
                        row["churn_risk_label"]
                    ),

                    int(row["churn"])
                )
            )

        conn.commit()

        cursor.close()

        conn.close()
    # =====================================================
    # SAVE RECOMMENDATIONS
    # =====================================================

    def _save_recommendations(
        self,
        rec_df: pd.DataFrame
    ):

        from db import get_connection

        conn = get_connection()

        cursor = conn.cursor()

        try:

            # -----------------------------------------
            # Clear old recommendations
            # -----------------------------------------

            cursor.execute(
                "DELETE FROM recommendations"
            )

            # -----------------------------------------
            # Insert recommendations
            # -----------------------------------------

            for _, row in rec_df.iterrows():

                cursor.execute(
                    """
                    INSERT INTO recommendations
                    (
                        user_id,
                        recommended_plan_id,
                        reason,
                        usage_score,
                        usage_level,
                        engagement_score,
                        engagement_level,
                        internet_profile,
                        calling_profile,
                        sms_profile,
                        complaint_profile
                    )

                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,

                    (
                        int(row["user_id"]),
                        int(row["plan_id"]),
                        str(row["reason"]),
                        float(row["usage_score"]),
                        str(row["usage_level"]),
                        float(row["engagement_score"]),
                        str(row["engagement_level"]),
                        str(row["internet_profile"]),
                        str(row["calling_profile"]),
                        str(row["sms_profile"]),
                        str(row["complaint_profile"])
                    )
                )

            conn.commit()

            print(
                "[Orchestrator] Recommendations saved."
            )

        except Exception as e:

            print(
                f"[ERROR] Saving recommendations failed: {e}"
            )

            raise e

        finally:

            cursor.close()

            conn.close()

    # =====================================================
    # KPI HELPERS
    # =====================================================

    def get_kpis(self) -> dict:

        conn = get_connection()

        cursor = conn.cursor(
            dictionary=True
        )

        # ---------------------------------------------
        # Total users
        # ---------------------------------------------

        cursor.execute(
            """
            SELECT COUNT(*) AS total
            FROM users
            """
        )

        total_users = cursor.fetchone()["total"]

        # ---------------------------------------------
        # Churn
        # ---------------------------------------------

        cursor.execute(
            """
            SELECT
                COUNT(*) AS n,
                AVG(churn_score) AS avg_score

            FROM churn_analysis
            """
        )

        churn_row = cursor.fetchone()

        avg_churn = round(

            float(
                churn_row["avg_score"] or 0
            ),

            4
        )

        # ---------------------------------------------
        # Risk distribution
        # ---------------------------------------------

        cursor.execute(
            """
            SELECT
                churn_risk_label,
                COUNT(*) AS n

            FROM churn_analysis

            GROUP BY churn_risk_label
            """
        )

        risk_dist = {

            r["churn_risk_label"]:
                r["n"]

            for r in cursor.fetchall()
        }

        # ---------------------------------------------
        # High risk
        # ---------------------------------------------

        cursor.execute(
            """
            SELECT COUNT(*) AS n

            FROM churn_analysis

            WHERE churn_risk_label='High'
            """
        )

        high_risk = cursor.fetchone()["n"]

        # ---------------------------------------------
        # Payment metrics
        # ---------------------------------------------

        cursor.execute(
            """
            SELECT
                AVG(late_payment) AS avg_late,
                AVG(amount) AS avg_amount

            FROM payments
            """
        )

        pay = cursor.fetchone()

        # ---------------------------------------------
        # Top recommendations
        # ---------------------------------------------

        cursor.execute(
            """
            SELECT
                mp.plan_name,
                COUNT(*) AS n

            FROM recommendations r

            JOIN mobile_plans mp
            ON r.recommended_plan_id = mp.plan_id

            GROUP BY mp.plan_name

            ORDER BY n DESC

            LIMIT 5
            """
        )

        top_plans = cursor.fetchall()

        cursor.close()

        conn.close()

        return {

            "total_users":
                total_users,

            "avg_churn_score":
                avg_churn,

            "high_risk_count":
                high_risk,

            "risk_distribution":
                risk_dist,

            "avg_late_payments":
                round(
                    float(
                        pay["avg_late"] or 0
                    ),
                    2
                ),

            "avg_payment":
                round(
                    float(
                        pay["avg_amount"] or 0
                    ),
                    2
                ),

            "top_recommended_plans":
                top_plans,
        }