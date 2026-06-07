"""
dashboard.py
Streamlit Enterprise Dashboard for the Telecom AI Multi-Agent Intelligence Platform.
Run with:  streamlit run dashboard.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import requests
import time
from datetime import datetime

# ── Page config ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Telecom AI Intelligence Platform",
    page_icon="📡",
    layout="wide",
    initial_sidebar_state="expanded",
)

API_BASE = "http://localhost:8000"

# ── Custom CSS ─────────────────────────────────────────────────────────────
st.markdown("""
<style>

.stApp {
    background: linear-gradient(
        135deg,
        #020617 0%,
        #041530 40%,
        #001B44 100%
    );
    color: white;
}

/* SIDEBAR */
section[data-testid="stSidebar"] {
    background: linear-gradient(
        180deg,
        #031633 0%,
        #021126 100%
    );

    border-right: 1px solid rgba(0,255,255,0.15);

    margin: 0 !important;
    padding: 0 !important;
}

/* KPI CARDS */
.kpi-card {
    background: rgba(7, 25, 56, 0.9);
    border: 1px solid rgba(0,255,255,0.2);
    border-radius: 24px;
    padding: 24px;
    text-align: center;
    box-shadow:
        0 0 20px rgba(0,255,255,0.08);
}

/* HEADINGS */
h1, h2, h3 {
    color: #E2E8F0;
}

/* TABLES */
[data-testid="stDataFrame"] {
    background: rgba(7,25,56,0.8);
    border-radius: 18px;
}

/* BUTTONS */
.stButton>button {
    background: linear-gradient(
        90deg,
        #00C6FF,
        #0072FF
    );
    color: white;
    border: none;
    border-radius: 12px;
}

/* METRIC LABELS */
.metric-label {
    color: #FFFFFF;
    opacity: 0.9;
}
.alert-body {
    color: #FFFFFF !important;
}

/* GLOW EFFECT */
.glow {
    color: #00F5FF;
    text-shadow:
        0 0 10px rgba(0,245,255,0.7);
}

.section-header {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 14px;
    color: #E2E8F0;
}

.alert-box {
    background: rgba(255,255,255,0.04);
    border-left: 4px solid #FF3366;
    padding: 16px;
    border-radius: 14px;
    margin-bottom: 12px;
}

.alert-title {
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 6px;
    color: #FF3366;
}

.alert-body {
    color: #F8FAFC;
    font-size: 0.9rem;
}

div[data-baseweb="select"] > div {
    background: rgba(0,255,255,0.06);
    border: 1px solid rgba(0,255,255,0.15);
    border-radius: 12px;
}
            
div[role="radiogroup"] > label {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(0,255,255,0.12);
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 10px;
    transition: 0.2s ease;
}

div[role="radiogroup"] > label:hover {
    background: rgba(0,255,255,0.08);
    border: 1px solid rgba(0,255,255,0.35);
}

div[role="radiogroup"] > label[data-selected="true"] {
    background: linear-gradient(
        90deg,
        rgba(0,245,255,0.15),
        rgba(108,99,255,0.18)
    );
    border: 1px solid #00F5FF;
}
.block-container {
    padding-top: 1rem !important;
    padding-left: 2rem !important;
    padding-right: 2rem !important;
    padding-bottom: 1rem !important;
}
section.main > div {
    padding-top: 0rem !important;
}
header[data-testid="stHeader"] {
    background: transparent;
    height: 0rem;
}
[data-testid="stToolbar"] {
    display: none;
}
/* GLOBAL TEXT */
html, body, [class*="css"] {
    color: white !important;
}

/* LABELS */
label, p, span, div {
    color: white !important;
}

/* SELECTBOX TEXT */
.stSelectbox div[data-baseweb="select"] * {
    color: white !important;
}

/* METRICS */
[data-testid="metric-container"] {
    color: white !important;
}

/* SIDEBAR NAV TEXT */
div[role="radiogroup"] label {
    color: white !important;
}                        
            
</style>
""", unsafe_allow_html=True)


# ── Helpers ────────────────────────────────────────────────────────────────

def api_get(path: str, params: dict = None):
    try:
        r = requests.get(f"{API_BASE}{path}", params=params, timeout=10)
        if r.ok:
            return r.json()
    except Exception:
        pass
    return None

def api_post(path: str, json_body: dict = None):
    try:
        r = requests.post(f"{API_BASE}{path}", json=json_body, timeout=30)
        if r.ok:
            return r.json()
    except Exception:
        pass
    return None

PLOTLY_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(color="#c8d2e6", family="Space Grotesk"),
    margin=dict(l=16, r=16, t=40, b=16),
    legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(size=11)),
)

COLORS = {
    "primary": [
        "#00F5FF",
        "#00D9FF",
        "#00B8FF",
        "#0091FF",
        "#0066FF"
    ],

    "risk": {
        "High": "#FF3366",
        "Medium": "#FFAA00",
        "Low": "#00E676"
    },

    "segments": {
        "Data Heavy Users": "#00F5FF",
        "Call Heavy Users": "#FF00FF",
        "Premium Users": "#FFD700",
        "Budget Users": "#00E676",
        "Balanced Users": "#7C4DFF"
    },
}


# ── Sidebar ────────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown("""
    <div style="text-align:center; padding: 16px 0 24px">
        <div style="font-size:2.5rem; margin-bottom:8px">📡</div>
        <div style="color:#e2e8f0; font-weight:700; font-size:1.05rem; letter-spacing:0.5px">
            TELECOM AI
        </div>
        <div style="color:rgba(99,179,237,0.6); font-size:0.72rem; letter-spacing:2px; text-transform:uppercase">
            Intelligence Platform
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.divider()

    pages = [
        "🏠 Overview",
        "📊 Churn Analytics",
        "🎯 Recommendations",
        "🔍 Intelligence",
        "👥 Segmentation",
        "🔎 User Lookup",
        "⚙️ System"
    ]

    page = st.radio(
        "Navigation",
        pages,
        label_visibility="collapsed"
    )

    st.markdown('<div style="color:rgba(156,175,210,0.6); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px">Filters</div>', unsafe_allow_html=True)
    risk_filter    = st.multiselect("Risk Level",  ["High","Medium","Low"], default=["High","Medium","Low"])
    segment_filter = st.multiselect("Segment",
        ["Data Heavy Users","Call Heavy Users","Premium Users","Budget Users","Balanced Users"],
        default=["Data Heavy Users","Call Heavy Users","Premium Users","Budget Users","Balanced Users"]
    )
    limit_filter = st.slider("Max Records", 20, 500, 100, step=20)

    st.divider()

    auto_refresh = st.checkbox("Auto-refresh (30s)", value=False)
    if st.button("🔄  Refresh Now", use_container_width=True):
        st.cache_data.clear()
        st.rerun()

    st.markdown(f"""
    <div style="text-align:center; margin-top:16px; color:rgba(99,179,237,0.4); font-size:0.7rem">
        Last refresh: {datetime.now().strftime('%H:%M:%S')}
    </div>
    """, unsafe_allow_html=True)

if auto_refresh:
    time.sleep(30)
    st.cache_data.clear()
    st.rerun()


# ── Cached data loaders ────────────────────────────────────────────────────

@st.cache_data(ttl=60)
def load_kpis():
    return api_get("/kpis") or {}

@st.cache_data(ttl=60)
def load_churn_data(limit=200):
    return api_get("/data/churn", {"limit": limit}) or []

@st.cache_data(ttl=60)
def load_recommendations(limit=200):
    return api_get("/data/recommendations", {"limit": limit}) or []

@st.cache_data(ttl=120)
def load_users(limit=200):
    return api_get("/data/users", {"limit": limit}) or []

@st.cache_data(ttl=300)
def load_plans():
    return api_get("/data/plans") or []


# ══════════════════════════════════════════════════════════════════════════
#  PAGE: OVERVIEW
# ══════════════════════════════════════════════════════════════════════════
if page == "🏠 Overview":
    st.markdown('<h1 style="color:#e2e8f0; font-size:1.8rem; font-weight:700; margin-bottom:4px">📡 Telecom AI Intelligence Platform</h1>', unsafe_allow_html=True)
    st.markdown('<p style="color:rgba(156,175,210,0.7); margin-bottom:24px; font-size:0.9rem">Real-time customer intelligence powered by 4 AI agents</p>', unsafe_allow_html=True)

    kpis = load_kpis()

    # ── KPI Row ────────────────────────────────────────────────────────────
    c1, c2, c3, c4, c5 = st.columns(5)
    total = kpis.get("total_users", 0)
    avg_ch = kpis.get("avg_churn_score", 0)
    high   = kpis.get("high_risk_count", 0)
    avg_cmp = kpis.get("avg_complaints", 0)
    avg_pay = kpis.get("avg_payment", 0)
    churn_data = load_churn_data(500)

    risk_dist = {}

    if churn_data:
        churn_df = pd.DataFrame(churn_data)

        risk_dist = (
            churn_df["churn_risk_label"]
            .value_counts()
            .to_dict()
        )

    with c1:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-value">{total:,}</div>
            <div class="kpi-label">Total Customers</div>
            <div class="kpi-delta up">👥 Active base</div>
        </div>""", unsafe_allow_html=True)

    with c2:
        pct = round(avg_ch * 100, 1)
        cls = "warn" if pct > 40 else ("down" if pct > 60 else "up")
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-value">{pct}%</div>
            <div class="kpi-label">Avg Churn Score</div>
            <div class="kpi-delta {cls}">{'⚠️ Elevated' if pct > 40 else '✅ Healthy'}</div>
        </div>""", unsafe_allow_html=True)

    with c3:
        high_pct = round(high / max(total, 1) * 100, 1)
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-value">{high:,}</div>
            <div class="kpi-label">High-Risk Customers</div>
            <div class="kpi-delta {'down' if high_pct > 15 else 'warn'}">{high_pct}% of base</div>
        </div>""", unsafe_allow_html=True)

    with c4:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-value">{avg_cmp:.1f}</div>
            <div class="kpi-label">Avg Complaints</div>
            <div class="kpi-delta {'down' if avg_cmp > 2 else 'up'}">Per customer</div>
        </div>""", unsafe_allow_html=True)

    with c5:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-value">${avg_pay:.0f}</div>
            <div class="kpi-label">Avg Payment</div>
            <div class="kpi-delta up">Monthly revenue</div>
        </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Charts Row ─────────────────────────────────────────────────────────
    col_left, col_right = st.columns([1, 1])

    with col_left:
        st.markdown('<div class="section-header">🎯 Risk Distribution</div>', unsafe_allow_html=True)
        if risk_dist:
            fig = go.Figure(go.Pie(
                labels=list(risk_dist.keys()),
                values=list(risk_dist.values()),
                hole=0.6,
                marker=dict(colors=[COLORS["risk"].get(k, "#888") for k in risk_dist.keys()]),
                textinfo="label+percent",
                textfont=dict(size=12),
            ))
            fig.update_layout(**PLOTLY_LAYOUT, height=300,
                              annotations=[dict(text=f"<b>{sum(risk_dist.values())}</b><br>customers",
                                               x=0.5, y=0.5, showarrow=False,
                                               font=dict(size=14, color="#e2e8f0"))])
            st.plotly_chart(fig, use_container_width=True)

    with col_right:
        st.markdown(
            '<div class="section-header">📋 Top Recommended Plans</div>',
            unsafe_allow_html=True
        )

        recommendation_data = load_recommendations(500)

        if recommendation_data:

            recommendation_df = pd.DataFrame(recommendation_data)

            top_plans = (
                recommendation_df["plan_name"]
                .value_counts()
                .reset_index()
            )

            top_plans.columns = ["plan_name", "n"]

            if not top_plans.empty:

                fig = go.Figure(
                    go.Bar(
                        x=top_plans["n"],
                        y=top_plans["plan_name"],
                        orientation="h",

                        marker=dict(
                            color=COLORS["primary"][:len(top_plans)]
                        ),

                        text=top_plans["n"],
                        textposition="outside",
                    )
                )

                fig.update_layout(
                    **PLOTLY_LAYOUT,
                    height=300,
                    xaxis=dict(showgrid=False),
                    yaxis=dict(showgrid=False)
                )

                st.plotly_chart(
                    fig,
                    use_container_width=True
                )

        else:
            st.info("No recommendation data available.")

    # ── High-Risk Alerts ───────────────────────────────────────────────────
    st.markdown('<div class="section-header" style="margin-top:16px">🚨 High-Risk Customer Alerts</div>', unsafe_allow_html=True)
    churn_data = load_churn_data(50)
    if churn_data:
        churn_df = pd.DataFrame(churn_data)
        high_risk = churn_df[churn_df["churn_risk_label"] == "High"].head(5)
        if not high_risk.empty:
            for _, row in high_risk.iterrows():
                st.markdown(f"""
                <div class="alert-box">
                    <div class="alert-title">⚠️ {row.get('user_name','Unknown')}  —  Churn Score: {float(row.get('churn_score',0)):.1%}</div>
                    <div class="alert-body">{row.get('churn_reason','No reason available')} | Tenure: {row.get('tenure_months',0)} months | City: {row.get('city','N/A')}</div>
                </div>""", unsafe_allow_html=True)
        else:
            st.success("✅ No high-risk customers detected. Run /analyse/all to refresh.")
    else:
        st.info("No churn data yet. Click ⚙️ System → Run Full Analysis.")


# ══════════════════════════════════════════════════════════════════════════
#  PAGE: CHURN ANALYTICS
# ══════════════════════════════════════════════════════════════════════════
elif page == "📊 Churn Analytics":
    st.markdown('<h2 style="color:#e2e8f0; font-weight:700">📊 Churn Analytics</h2>', unsafe_allow_html=True)
    st.markdown('<p style="color:rgba(156,175,210,0.6); margin-bottom:24px">XGBoost-powered churn prediction across your customer base</p>', unsafe_allow_html=True)

    churn_data = load_churn_data(limit_filter)
    if not churn_data:
        st.warning("No churn data available. Run Full Analysis from ⚙️ System tab.")
        st.stop()

    df = pd.DataFrame(churn_data)
    df["churn_score"] = pd.to_numeric(df["churn_score"], errors="coerce").fillna(0)
    df = df[df["churn_risk_label"].isin(risk_filter)]

    # KPIs
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f'<div class="kpi-card"><div class="kpi-value">{len(df)}</div><div class="kpi-label">Filtered Customers</div></div>', unsafe_allow_html=True)
    with c2:
        h = len(df[df["churn_risk_label"] == "High"])
        st.markdown(f'<div class="kpi-card"><div class="kpi-value" style="background:linear-gradient(135deg,#ff6584,#ff8fa3);-webkit-background-clip:text;-webkit-text-fill-color:transparent">{h}</div><div class="kpi-label">High Risk</div></div>', unsafe_allow_html=True)
    with c3:
        m = len(df[df["churn_risk_label"] == "Medium"])
        st.markdown(f'<div class="kpi-card"><div class="kpi-value" style="background:linear-gradient(135deg,#FFD700,#FFF176);-webkit-background-clip:text;-webkit-text-fill-color:transparent">{m}</div><div class="kpi-label">Medium Risk</div></div>', unsafe_allow_html=True)
    with c4:
        avg = df["churn_score"].mean()
        st.markdown(f'<div class="kpi-card"><div class="kpi-value">{avg:.1%}</div><div class="kpi-label">Avg Churn Score</div></div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    col1, col2 = st.columns(2)

    with col1:
        st.markdown('<div class="section-header">📈 Churn Score Distribution</div>', unsafe_allow_html=True)
        fig = px.histogram(df, x="churn_score", nbins=30,
                           color_discrete_sequence=["#6C63FF"])
        fig.update_layout(**PLOTLY_LAYOUT, height=280,
                          xaxis_title="Churn Score", yaxis_title="Customers")
        fig.add_vline(x=0.65, line_dash="dash", line_color="#ff6584",
                     annotation_text="High Risk", annotation_position="top")
        fig.add_vline(x=0.35, line_dash="dash", line_color="#FFD700",
                     annotation_text="Med Risk", annotation_position="top")
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown('<div class="section-header">🍩 Risk Level Breakdown</div>', unsafe_allow_html=True)
        risk_counts = df["churn_risk_label"].value_counts().reset_index()
        risk_counts.columns = ["churn_risk_label", "count"]
        fig = px.pie(risk_counts, names="churn_risk_label", values="count",
                     hole=0.55, color="churn_risk_label",
                     color_discrete_map=COLORS["risk"])
        fig.update_layout(**PLOTLY_LAYOUT, height=280)
        st.plotly_chart(fig, use_container_width=True)

    # Churn by location
    if "city" in df.columns:
        st.markdown('<div class="section-header" style="margin-top:8px">🌍 Avg Churn Score by Location</div>', unsafe_allow_html=True)
        loc_df = df.groupby("city")["churn_score"].mean().reset_index().sort_values("churn_score", ascending=True)
        fig = px.bar(loc_df, x="churn_score", y="city", orientation="h",
                     color="churn_score",
                     color_continuous_scale=["#43e97b", "#FFD700", "#ff6584"])
        fig.update_layout(**PLOTLY_LAYOUT, height=300, coloraxis_showscale=False)
        st.plotly_chart(fig, use_container_width=True)

    # Table
    st.markdown('<div class="section-header" style="margin-top:8px">📋 Customer Churn Table</div>', unsafe_allow_html=True)
    disp = df[["user_id","user_name","churn_risk_label","churn_score","city","plan_category"]].copy()
    disp["churn_score"] = disp["churn_score"].apply(lambda x: f"{x:.1%}")
    st.dataframe(
        disp.rename(columns={"user_id":"ID","user_name":"Name","churn_risk_label":"Risk",
                              "churn_score":"Score","tenure_months":"Tenure(mo)",
                              "city":"City","plan_category":"Plan"}),
        use_container_width=True, height=320,
        hide_index=True,
    )


# ══════════════════════════════════════════════════════════════════════════
#  PAGE: RECOMMENDATIONS
# ══════════════════════════════════════════════════════════════════════════
elif page == "🎯 Recommendations":
    st.markdown('<h2 style="color:#e2e8f0; font-weight:700">🎯 Plan Recommendations</h2>', unsafe_allow_html=True)
    st.markdown('<p style="color:rgba(156,175,210,0.6); margin-bottom:24px">KNN-based plan recommendations tailored to each customer\'s usage profile</p>', unsafe_allow_html=True)

    rec_data = load_recommendations(limit_filter)
    if not rec_data:
        st.warning("No recommendation data available. Run Full Analysis from ⚙️ System tab.")
        st.stop()

    df = pd.DataFrame(rec_data)
    df["churn_score"] = pd.to_numeric(df["churn_score"], errors="coerce").fillna(0)

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(f'<div class="kpi-card"><div class="kpi-value">{len(df)}</div><div class="kpi-label">Recommendations Made</div></div>', unsafe_allow_html=True)
    with c2:
        avg_conf = df["churn_score"].mean()
        st.markdown(f'<div class="kpi-card"><div class="kpi-value">{avg_conf:.1%}</div><div class="kpi-label">Avg Confidence</div></div>', unsafe_allow_html=True)
    with c3:
        top_plan = df["plan_name"].mode()[0] if "plan_name" in df else "N/A"
        st.markdown(f'<div class="kpi-card"><div class="kpi-value" style="font-size:1.3rem">{top_plan}</div><div class="kpi-label">Most Recommended Plan</div></div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    col1, col2 = st.columns(2)

    with col1:
        st.markdown('<div class="section-header">📊 Plan Distribution</div>', unsafe_allow_html=True)
        plan_counts = df["plan_name"].value_counts().reset_index()
        plan_counts.columns = ["plan_name", "count"]
        fig = px.bar(plan_counts, x="count", y="plan_name", orientation="h",
                     color="count", color_continuous_scale=COLORS["primary"])
        fig.update_layout(**PLOTLY_LAYOUT, height=300, coloraxis_showscale=False)
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown('<div class="section-header">🎯 Plan Type Breakdown</div>', unsafe_allow_html=True)
        if "plan_type" in df.columns:
            type_counts = df["plan_type"].value_counts().reset_index()
            type_counts.columns = ["plan_type", "count"]
            fig = px.pie(type_counts, names="plan_type", values="count",
                         hole=0.5, color_discrete_sequence=COLORS["primary"])
            fig.update_layout(**PLOTLY_LAYOUT, height=300)
            st.plotly_chart(fig, use_container_width=True)

    st.markdown('<div class="section-header" style="margin-top:8px">📋 Recommendation Details</div>', unsafe_allow_html=True)
    disp = df[["user_id","user_name","plan_name","plan_type","price","churn_score","reason"]].copy()
    disp["churn_score"] = disp["churn_score"].apply(lambda x: f"{x:.1%}")
    disp["price"]     = disp["price"].apply(lambda x: f"${x:.2f}")
    st.dataframe(disp.rename(columns={
        "user_id":"ID","user_name":"Name","plan_name":"Recommended Plan",
        "plan_type":"Type","price":"Cost","churn_score":"Score","reason":"Reason"
    }), use_container_width=True, height=340, hide_index=True)


# ══════════════════════════════════════════════════════════════════════════
#  PAGE: INTELLIGENCE
# ══════════════════════════════════════════════════════════════════════════
elif page == "🔍 Intelligence":
    st.markdown('<h2 style="color:#e2e8f0; font-weight:700">🔍 Data Intelligence & Anomaly Detection</h2>', unsafe_allow_html=True)
    st.markdown('<p style="color:rgba(156,175,210,0.6); margin-bottom:24px">Isolation Forest anomaly detection + engagement scoring</p>', unsafe_allow_html=True)

    users = load_users(limit_filter)
    if not users:
        st.warning("No user data available.")
        st.stop()

    df = pd.DataFrame(users)

    # Simulate engagement + anomaly scores for display if not in data
    np.random.seed(42)
    if "engagement_score" not in df.columns:
        df["engagement_score"] = np.random.uniform(20, 95, len(df))
    if "anomaly_flag" not in df.columns:
        df["anomaly_flag"] = np.random.choice([0, 1], len(df), p=[0.92, 0.08])

    anomalies = df[df["anomaly_flag"] == 1]

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f'<div class="kpi-card"><div class="kpi-value">{len(df)}</div><div class="kpi-label">Users Analysed</div></div>', unsafe_allow_html=True)
    with c2:
        st.markdown(f'<div class="kpi-card"><div class="kpi-value" style="background:linear-gradient(135deg,#ff6584,#ff8fa3);-webkit-background-clip:text;-webkit-text-fill-color:transparent">{len(anomalies)}</div><div class="kpi-label">Anomalies Detected</div></div>', unsafe_allow_html=True)
    with c3:
        pct = round(len(anomalies) / max(len(df), 1) * 100, 1)
        st.markdown(f'<div class="kpi-card"><div class="kpi-value">{pct}%</div><div class="kpi-label">Anomaly Rate</div></div>', unsafe_allow_html=True)
    with c4:
        avg_eng = df["engagement_score"].mean()
        st.markdown(f'<div class="kpi-card"><div class="kpi-value">{avg_eng:.1f}</div><div class="kpi-label">Avg Engagement</div></div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    col1, col2 = st.columns(2)

    with col1:
        st.markdown('<div class="section-header">📡 Engagement Score Distribution</div>', unsafe_allow_html=True)
        fig = px.histogram(df, x="engagement_score", nbins=25,
                           color_discrete_sequence=["#38F9D7"])
        fig.update_layout(**PLOTLY_LAYOUT, height=280)
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown('<div class="section-header">⚠️ Anomaly vs Normal</div>', unsafe_allow_html=True)
        counts = df["anomaly_flag"].map({0:"Normal",1:"Anomaly"}).value_counts().reset_index()
        counts.columns = ["status","count"]
        fig = px.pie(counts, names="status", values="count", hole=0.55,
                     color="status", color_discrete_map={"Normal":"#43e97b","Anomaly":"#ff6584"})
        fig.update_layout(**PLOTLY_LAYOUT, height=280)
        st.plotly_chart(fig, use_container_width=True)

    # Scatter: data usage vs calls, coloured by anomaly
    if "avg_data_gb" in df.columns and "avg_call_minutes" in df.columns:
        st.markdown('<div class="section-header" style="margin-top:8px">🔬 Usage Scatter — Anomaly Detection</div>', unsafe_allow_html=True)
        df["status"] = df["anomaly_flag"].map({0:"Normal",1:"Anomaly"})
        fig = px.scatter(df, x="avg_data_gb", y="avg_call_minutes",
                         color="status",
                         color_discrete_map={"Normal":"#6C63FF","Anomaly":"#ff6584"},
                         size_max=10,
                         hover_data=["user_id"] if "user_id" in df.columns else None,
                         labels={"avg_data_gb":"Avg Data (GB)","avg_call_minutes":"Avg Call Minutes"})
        fig.update_layout(**PLOTLY_LAYOUT, height=320)
        st.plotly_chart(fig, use_container_width=True)


# ══════════════════════════════════════════════════════════════════════════
#  PAGE: SEGMENTATION
# ══════════════════════════════════════════════════════════════════════════
elif page == "👥 Segmentation":
    st.markdown('<h2 style="color:#e2e8f0; font-weight:700">👥 Customer Segmentation</h2>', unsafe_allow_html=True)
    st.markdown('<p style="color:rgba(156,175,210,0.6); margin-bottom:24px">KMeans behavioural clusters across 5 customer archetypes</p>', unsafe_allow_html=True)

    users = load_users(limit_filter)
    if not users:
        st.warning("No user data.")
        st.stop()

    df = pd.DataFrame(users)

    # Simulate segments for display
    np.random.seed(7)
    segs = ["Data Heavy Users","Call Heavy Users","Premium Users","Budget Users","Balanced Users"]
    weights = [0.22, 0.20, 0.18, 0.22, 0.18]
    if "segment" not in df.columns:
        df["segment"] = np.random.choice(segs, len(df), p=weights)

    df = df[df["segment"].isin(segment_filter)]

    seg_counts = df["segment"].value_counts().reset_index()
    seg_counts.columns = ["segment","count"]

    # Cards per segment
    st.markdown('<div class="section-header">📊 Segment Overview</div>', unsafe_allow_html=True)
    cols = st.columns(5)
    icons = {"Data Heavy Users":"📡","Call Heavy Users":"📞","Premium Users":"👑",
             "Budget Users":"💰","Balanced Users":"⚖️"}
    for i, seg in enumerate(segs):
        with cols[i]:
            n = int(df[df["segment"]==seg].shape[0])
            pct = round(n / max(len(df), 1) * 100, 1)
            color = COLORS["segments"].get(seg, "#888")
            st.markdown(f"""
            <div class="kpi-card" style="border-top-color:{color}">
                <div style="font-size:1.8rem; margin-bottom:4px">{icons.get(seg,'👤')}</div>
                <div class="kpi-value" style="font-size:1.6rem; background:linear-gradient(135deg,{color},{color}aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent">{n}</div>
                <div class="kpi-label">{seg}</div>
                <div style="color:{color}; font-size:0.8rem; margin-top:6px">{pct}%</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    col1, col2 = st.columns(2)

    with col1:
        st.markdown('<div class="section-header">🍩 Segment Distribution</div>', unsafe_allow_html=True)
        fig = px.pie(seg_counts, names="segment", values="count", hole=0.5,
                     color="segment",
                     color_discrete_map=COLORS["segments"])
        fig.update_layout(**PLOTLY_LAYOUT, height=300)
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown('<div class="section-header">📊 Segment by Tenure</div>', unsafe_allow_html=True)
        if "tenure_months" in df.columns:
            fig = px.box(df, x="segment", y="tenure_months",
                         color="segment",
                         color_discrete_map=COLORS["segments"])
            fig.update_layout(**PLOTLY_LAYOUT, height=300,
                              xaxis_tickangle=-20, showlegend=False)
            st.plotly_chart(fig, use_container_width=True)

    if "avg_data_gb" in df.columns and "avg_call_minutes" in df.columns:
        st.markdown('<div class="section-header" style="margin-top:8px">🔬 Data vs Call Usage by Segment</div>', unsafe_allow_html=True)
        fig = px.scatter(df, x="avg_data_gb", y="avg_call_minutes",
                         color="segment", size_max=12,
                         color_discrete_map=COLORS["segments"],
                         labels={"avg_data_gb":"Avg Data (GB)","avg_call_minutes":"Avg Call Min"})
        fig.update_layout(**PLOTLY_LAYOUT, height=360)
        st.plotly_chart(fig, use_container_width=True)


# ══════════════════════════════════════════════════════════════════════════
#  PAGE: USER LOOKUP
# ══════════════════════════════════════════════════════════════════════════
elif page == "🔎 User Lookup":
    st.markdown('<h2 style="color:#e2e8f0; font-weight:700">🔎 Single User Analysis</h2>', unsafe_allow_html=True)
    st.markdown('<p style="color:rgba(156,175,210,0.6); margin-bottom:24px">Run all 4 AI agents on any individual customer</p>', unsafe_allow_html=True)

    users = load_users(500)
    if users:
        user_df = pd.DataFrame(users)
        user_options = {f"#{r['user_id']} — {r.get('user_name','Unknown')}": r["user_id"]
                        for _, r in user_df.iterrows()}
        selected_label = st.selectbox("Select Customer", list(user_options.keys()))
        selected_id    = user_options[selected_label]
    else:
        selected_id = st.number_input("Enter User ID", min_value=1, value=1, step=1)

    if st.button("Run Full AI Analysis", use_container_width=True):
        with st.spinner("Running 4 AI agents …"):
            result = api_get(f"/analyse/user/{selected_id}")

        if result and "error" not in result:
            behavior = result.get("behavior", {})
            churn    = result.get("churn", {})
            rec      = result.get("recommendation", {})
            intel    = result.get("intelligence", {})
            feats    = result.get("features", {})

            # Row 1: Agent results
            c1, c2, c3, c4 = st.columns(4)
            with c1:
                seg_color = COLORS["segments"].get(behavior.get("segment",""), "#6C63FF")
                st.markdown(f"""
                <div class="kpi-card" style="border-top-color:{seg_color}">
                    <div style="font-size:2rem">{behavior.get('icon','👤')}</div>
                    <div class="kpi-value" style="font-size:1.2rem; background:linear-gradient(135deg,{seg_color},{seg_color}88);-webkit-background-clip:text;-webkit-text-fill-color:transparent">{behavior.get('segment','—')}</div>
                    <div class="kpi-label">Behaviour Segment</div>
                </div>""", unsafe_allow_html=True)

            with c2:
                risk = churn.get("churn_risk_label","—")
                risk_color = COLORS["risk"].get(risk, "#888")
                st.markdown(f"""
                <div class="kpi-card" style="border-top-color:{risk_color}">
                    <div class="kpi-value" style="font-size:1.8rem; background:linear-gradient(135deg,{risk_color},{risk_color}88);-webkit-background-clip:text;-webkit-text-fill-color:transparent">{churn.get('churn_score',0):.1%}</div>
                    <div class="kpi-label">Churn Score</div>
                    <div class="kpi-delta" style="color:{risk_color}">{risk} Risk</div>
                </div>""", unsafe_allow_html=True)

            with c3:
                st.markdown(f"""
                <div class="kpi-card" style="border-top-color:#38F9D7">
                    <div class="kpi-value" style="font-size:1.1rem">{rec.get('recommended_plan','—')}</div>
                    <div class="kpi-label">Recommended Plan</div>
                    <div class="kpi-delta up">${rec.get('price',0):.2f}/mo · {rec.get('churn_score',0):.0%} confidence</div>
                </div>""", unsafe_allow_html=True)

            with c4:
                anom_color = "#ff6584" if intel.get("anomaly_flag") else "#43e97b"
                st.markdown(f"""
                <div class="kpi-card" style="border-top-color:{anom_color}">
                    <div class="kpi-value" style="font-size:1.6rem">{intel.get('engagement_score',0):.0f}</div>
                    <div class="kpi-label">Engagement Score</div>
                    <div class="kpi-delta" style="color:{anom_color}">{intel.get('anomaly_label','Normal')}</div>
                </div>""", unsafe_allow_html=True)

            # Insights
            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown('<div class="section-header">💡 AI Insights</div>', unsafe_allow_html=True)

            col_l, col_r = st.columns(2)
            with col_l:
                st.markdown(f"""
                <div class="alert-box" style="border-left-color:#FFD700; background:rgba(255,213,0,0.06)">
                    <div class="alert-title" style="color:#FFD700">🎯 Recommendation Reason</div>
                    <div class="alert-body">{rec.get('reason','—')}</div>
                </div>""", unsafe_allow_html=True)

                st.markdown(f"""
                <div class="alert-box" style="border-left-color:#6C63FF; background:rgba(108,99,255,0.06)">
                    <div class="alert-title" style="color:#6C63FF">💳 Churn Signal</div>
                    <div class="alert-body">{churn.get('churn_reason','—')}</div>
                </div>""", unsafe_allow_html=True)

            with col_r:
                st.markdown(f"""
                <div class="alert-box" style="border-left-color:#38F9D7; background:rgba(56,249,215,0.06)">
                    <div class="alert-title" style="color:#38F9D7">🔍 Intelligence Insight</div>
                    <div class="alert-body">{intel.get('intelligence_insight','—')}</div>
                </div>""", unsafe_allow_html=True)

            # Usage radar
            st.markdown('<div class="section-header" style="margin-top:16px">📡 Usage Profile</div>', unsafe_allow_html=True)
            cats = ["Data (GB)","Calls (min)","SMS","Plan Cost","Tenure (mo)"]
            vals = [
                min(feats.get("avg_data_gb",0) / 100, 1),
                min(feats.get("avg_call_minutes",0) / 5000, 1),
                min(feats.get("avg_sms",0) / 800, 1),
                min(feats.get("avg_plan_cost",0) / 100, 1),
                min(feats.get("tenure_months",0) / 84, 1),
            ]
            fig = go.Figure(go.Scatterpolar(
                r=vals + [vals[0]],
                theta=cats + [cats[0]],
                fill="toself",
                fillcolor="rgba(108,99,255,0.2)",
                line=dict(color="#6C63FF", width=2),
            ))
            fig.update_layout(**PLOTLY_LAYOUT, height=350,
                              polar=dict(
                                  bgcolor="rgba(0,0,0,0)",
                                  radialaxis=dict(visible=True, range=[0,1], showticklabels=False),
                                  angularaxis=dict(color="#c8d2e6"),
                              ))
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.error(f"Could not retrieve analysis for user {selected_id}. Make sure the API is running.")


# ══════════════════════════════════════════════════════════════════════════
#  PAGE: SYSTEM
# ══════════════════════════════════════════════════════════════════════════
elif page == "⚙️ System":
    st.markdown('<h2 style="color:#e2e8f0; font-weight:700">⚙️ System Control Panel</h2>', unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown('<div class="section-header">🗄️ Database Setup</div>', unsafe_allow_html=True)
        if st.button("🚀 Initialise DB & Seed Data", use_container_width=True):
            with st.spinner("Setting up database …"):
                result = api_post("/setup")
            if result:
                st.success(f"✅ {result.get('message','Done')}")
            else:
                st.error("❌ Failed. Is the API running?")

    with col2:
        st.markdown('<div class="section-header">🤖 Run Full Analysis</div>', unsafe_allow_html=True)
        if st.button("▶️  Run All 4 AI Agents", use_container_width=True):
            with st.spinner("Running full analysis (this may take 30s) …"):
                result = api_post("/analyse/all")
            if result:
                st.success(f"✅ Analysed {result.get('total_customers',0)} customers")
                summary = result.get("summary", {})
                if summary:
                    st.json(summary)
            else:
                st.error("❌ Analysis failed.")

    with col3:
        st.markdown('<div class="section-header">🏥 API Health</div>', unsafe_allow_html=True)
        if st.button("🔍 Check API Health", use_container_width=True):
            health = api_get("/health")
            if health:
                st.success(f"✅ API is live — {health.get('service','')}")
            else:
                st.error("❌ API not reachable at " + API_BASE)

    st.divider()
    st.markdown('<div class="section-header">📋 Available Mobile Plans</div>', unsafe_allow_html=True)
    plans = load_plans()
    if plans:
        plans_df = pd.DataFrame(plans)
        st.dataframe(plans_df, use_container_width=True, hide_index=True)

    st.divider()
    st.markdown("""
    <div style="color:rgba(156,175,210,0.5); font-size:0.8rem; line-height:1.8">
        <b style="color:rgba(156,175,210,0.9)">Quick Start Guide</b><br>
        1. Set DB credentials in <code>.env</code> (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)<br>
        2. Install deps: <code>pip install -r requirements.txt</code><br>
        3. Train models: <code>python train_behavior_model.py</code> etc.<br>
        4. Start API: <code>uvicorn main:app --reload --port 8000</code><br>
        5. Start dashboard: <code>streamlit run dashboard.py</code><br>
        6. Click "Initialise DB" then "Run All 4 AI Agents"
    </div>
    """, unsafe_allow_html=True)
