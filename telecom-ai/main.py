"""
main.py

FastAPI backend for Telecom AI Intelligence Platform.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

import os
import pandas as pd

from orchestrator import TelecomOrchestrator
from db import init_db, seed_data, get_connection


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="Telecom AI Intelligence Platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = TelecomOrchestrator()


# =========================================================
# STARTUP
# =========================================================

@app.on_event("startup")
async def startup_event():

    print("[FastAPI] Starting up …")


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


# =========================================================
# DATABASE SETUP
# =========================================================

@app.get("/setup")
def setup_database():

    try:

        init_db()

        seed_data()

        return {
            "status": "success",
            "message": "Database initialised successfully"
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# FULL ANALYSIS
# =========================================================

@app.get("/analyse/all")
def analyse_all():

    try:

        results = orchestrator.run_full_analysis()

        return {

            "status": "success",

            "total_customers":
                results["total_customers"],

            "avg_churn_score":
                round(
                    float(
                        results["churn_df"][
                            "churn_score"
                        ].mean()
                    ),
                    4
                ),

            "avg_engagement":
                round(
                    float(
                        results["intelligence_df"][
                            "engagement_score"
                        ].mean()
                    ),
                    2
                ),

            "anomalies":
                int(
                    results["intelligence_df"][
                        "anomaly_flag"
                    ].sum()
                )
        }

    except Exception as e:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {str(e)}"
        )


# =========================================================
# SINGLE USER
# =========================================================

@app.get("/analyse/user/{user_id}")
def analyse_user(user_id: int):

    try:

        result = orchestrator.analyse_single_user(
            user_id
        )

        if "error" in result:

            raise HTTPException(
                status_code=404,
                detail=result["error"]
            )

        return result

    except Exception as e:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {str(e)}"
        )


# =========================================================
# KPIs
# =========================================================

@app.get("/kpis")
def get_kpis():

    try:

        conn = get_connection()

        churn_df = pd.read_sql(
            """
            SELECT *
            FROM churn_analysis
            """,
            conn
        )

        intelligence_df = pd.read_csv(
            "models/intelligence_results.csv"
        )

        total_customers = len(churn_df)

        avg_churn_score = round(
            float(
                churn_df["churn_score"].mean()
            ),
            4
        )

        high_risk = int(

            (
                churn_df[
                    "churn_risk_label"
                ] == "High"

            ).sum()
        )

        anomalies = int(
            intelligence_df[
                "anomaly_flag"
            ].sum()
        )

        conn.close()

        return {

            "total_customers":
                total_customers,

            "avg_churn_score":
                avg_churn_score,

            "high_risk_customers":
                high_risk,

            "total_anomalies":
                anomalies
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# INPUT MODEL
# =========================================================

class FeatureInput(BaseModel):

    avg_data_gb: Optional[float] = 10.0

    avg_call_minutes: Optional[float] = 300.0

    avg_sms: Optional[float] = 100.0

    total_complaints: Optional[int] = 0

    total_late_payments: Optional[int] = 0

    avg_payment: Optional[float] = 20.0

    usage_records: Optional[int] = 5


# =========================================================
# AGENT ENDPOINTS
# =========================================================

@app.post("/agents/behavior")
def behavior_predict(features: FeatureInput):

    try:

        return orchestrator.behavior_agent.predict_single(
            features.dict()
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/agents/churn")
def churn_predict(features: FeatureInput):

    try:

        return orchestrator.churn_agent.predict_single(
            features.dict()
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/agents/recommend")
def recommend_plan(features: FeatureInput):

    try:

        return orchestrator.recommendation_agent.predict_single(
            features.dict()
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/agents/intelligence")
def intelligence_predict(features: FeatureInput):

    try:

        return orchestrator.intelligence_agent.predict_single(
            features.dict()
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# CHURN DATA
# =========================================================

@app.get("/data/churn")
def get_churn_data(limit: int = 100):

    conn = get_connection()

    query = """
        SELECT
            u.user_id,
            u.user_name,
            u.mobile_number,
            u.city,
            u.plan_category,

            ca.churn_score,
            ca.churn_risk_label

        FROM users u

        JOIN churn_analysis ca
            ON u.user_id = ca.user_id

        LIMIT %s
    """

    df = pd.read_sql(
        query,
        conn,
        params=[limit]
    )

    conn.close()

    return df.to_dict(
        orient="records"
    )

# =========================================================
# RECOMMENDATIONS
# =========================================================

@app.get("/data/recommendations")
def get_recommendations(limit: int = 100):

    conn = get_connection()

    query = """
        SELECT
            u.user_id,
            u.user_name,

            mp.plan_name,
            mp.plan_type,

            r.reason,

            r.usage_level,
            r.engagement_level,

            r.internet_profile,
            r.calling_profile,
            r.sms_profile

        FROM recommendations r

        JOIN users u
            ON r.user_id = u.user_id

        JOIN mobile_plans mp
            ON r.recommended_plan_id = mp.plan_id

        LIMIT %s
    """

    df = pd.read_sql(
        query,
        conn,
        params=[limit]
    )

    conn.close()

    return df.to_dict(
        orient="records"
    )

# =========================================================
# INTELLIGENCE
# =========================================================

@app.get("/data/intelligence")
def get_intelligence(
    limit: int = 100
):

    df = pd.read_csv(
        "models/intelligence_results.csv"
    )

    return df.head(limit).to_dict(
        orient="records"
    )


# =========================================================
# SEGMENTS
# =========================================================

@app.get("/data/segments")
def get_segments(
    limit: int = 100
):

    df = pd.read_csv(
        "models/behavior_segments.csv"
    )

    return df.head(limit).to_dict(
        orient="records"
    )


# =========================================================
# USERS
# =========================================================

@app.get("/data/users")
def get_users(limit: int = 50):

    conn = get_connection()

    query = """
        SELECT
            user_id,
            user_name,
            mobile_number,
            city,
            plan_category

        FROM users

        LIMIT %s
    """

    df = pd.read_sql(
        query,
        conn,
        params=[limit]
    )

    conn.close()

    return df.to_dict(
        orient="records"
    )


# =========================================================
# PLANS
# =========================================================

@app.get("/data/plans")
def get_plans():

    conn = get_connection()

    df = pd.read_sql(
        "SELECT * FROM mobile_plans",
        conn
    )

    conn.close()

    return df.to_dict(
        orient="records"
    )


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )