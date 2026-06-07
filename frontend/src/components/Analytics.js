import React, {
  useEffect,
  useState
} from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function Analytics({ mobile }) {

  const [history, setHistory] =
    useState([]);

  const [avgUsage, setAvgUsage] =
    useState(0);

  const [trend, setTrend] =
    useState("");

  const [currentPlan, setCurrentPlan] =
    useState(null);

  const [recommendation, setRecommendation] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================

  useEffect(() => {

    if (!mobile) return;

    const fetchAnalytics = async () => {

      try {

        setLoading(true);

        // 🔥 GET USER
        const userRes = await fetch(
          `http://localhost:8081/users/mobile/${mobile}`
        );

        const user =
          await userRes.json();

        const userId =
          user.userId;

        // 🔥 HISTORY
        const historyRes =
          await fetch(
            `http://localhost:8083/analytics/history/${userId}`
          );

        const historyData =
          await historyRes.json();

        // 🔥 FORMAT CHART DATA
        const formatted =
          historyData.map((h) => ({

            month:
              new Date(
                h.usageMonth
              ).toLocaleString(
                "default",
                { month: "short" }
              ),

            usage:
              h.dataUsedGb
          }));

        setHistory(formatted);

        // 🔥 AVG
        const avgRes =
          await fetch(
            `http://localhost:8083/analytics/average/${userId}`
          );

        const avg =
          await avgRes.text();

        setAvgUsage(avg);

        // 🔥 TREND
        const trendRes =
          await fetch(
            `http://localhost:8083/analytics/trend/${userId}`
          );

        const trendData =
          await trendRes.text();

        setTrend(trendData);

        // 🔥 CURRENT PLAN
        const planRes =
          await fetch(
            `http://localhost:8081/users/current-plan/${mobile}`
          );

        const plan =
          await planRes.json();

        setCurrentPlan(plan);

        // 🔥 RECOMMENDATION
        const recRes =
          await fetch(
            `http://localhost:8084/recommend/mobile/${mobile}`
          );

        const recData =
          await recRes.json();

        setRecommendation(
          recData[0]
        );

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

    fetchAnalytics();

  }, [mobile]);

  // =====================================================
  // AI INSIGHT
  // =====================================================

  const getInsight = () => {

    if (
      trend === "Increasing"
    ) {

      return `
      Your usage is steadily increasing.
      A higher data plan may provide
      better long-term value.
      `;
    }

    if (
      trend === "Decreasing"
    ) {

      return `
      Your usage is decreasing.
      You may save money by switching
      to a smaller plan.
      `;
    }

    return `
    Your current usage pattern
    appears stable and optimized.
    `;
  };

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>
        📈 User Analytics
      </h2>

      {!mobile && (

        <div style={styles.emptyBox}>

          Search recommendations first
          to load analytics.

        </div>
      )}

      {loading && (
        <div style={styles.loading}>
          Loading analytics...
        </div>
      )}

      {mobile && !loading && (

        <>
          {/* ANALYTICS CARDS */}
          <div style={styles.grid}>

            <div style={styles.card}>
              <h3>
                Avg Usage
              </h3>

              <p style={styles.number}>
                {parseFloat(
                  avgUsage || 0
                ).toFixed(1)} GB
              </p>
            </div>

            <div style={styles.card}>
              <h3>
                Usage Trend
              </h3>

              <p style={styles.number}>
                {trend}
              </p>
            </div>

            <div style={styles.card}>
              <h3>
                Current Plan
              </h3>

              <p style={styles.number}>
                {
                  currentPlan?.planName
                }
              </p>
            </div>

            <div style={styles.card}>
              <h3>
                AI Match
              </h3>

              <p style={styles.number}>
                {recommendation
                  ? (
                    recommendation.matchScore
                    * 100
                  ).toFixed(1)
                  : 0}
                %
              </p>
            </div>

          </div>

          {/* CHART */}
          <div style={styles.chartCard}>

            <h3 style={styles.chartTitle}>
              📊 Monthly Usage Trend
            </h3>

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <LineChart
                data={history}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#0369a1"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* AI INSIGHTS */}
          <div style={styles.bigCard}>

            <h3 style={styles.bigTitle}>
              🤖 AI Insights
            </h3>

            <p style={styles.text}>
              {getInsight()}
            </p>

            {recommendation && (

              <p style={styles.text}>

                Recommended upgrade:
                {" "}

                <strong>
                  {
                    recommendation.planName
                  }
                </strong>

              </p>
            )}

          </div>
        </>
      )}
    </div>
  );
}

const styles = {

  container: {
    padding: "10px"
  },

  title: {
    fontSize: "30px",

    fontWeight: "800",

    color: "#0f172a",

    marginBottom: "30px"
  },

  emptyBox: {
    background: "white",

    padding: "30px",

    borderRadius: "16px",

    textAlign: "center",

    color: "#64748b",

    fontWeight: "600",

    boxShadow:
      "0 4px 12px rgba(15,23,42,0.05)"
  },

  loading: {
    textAlign: "center",

    fontSize: "18px",

    fontWeight: "700",

    color: "#0369a1"
  },

  grid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",

    gap: "24px",

    marginBottom: "30px"
  },

  card: {
    background: "white",

    padding: "28px",

    borderRadius: "18px",

    boxShadow:
      "0 4px 12px rgba(15,23,42,0.05)"
  },

  number: {
    fontSize: "24px",

    fontWeight: "800",

    color: "#0369a1",

    marginTop: "14px"
  },

  chartCard: {
    background: "white",

    padding: "30px",

    borderRadius: "18px",

    marginBottom: "30px",

    boxShadow:
      "0 4px 12px rgba(15,23,42,0.05)"
  },

  chartTitle: {
    marginBottom: "20px",

    fontSize: "22px",

    fontWeight: "800",

    color: "#0f172a"
  },

  bigCard: {
    background: "white",

    padding: "36px",

    borderRadius: "18px",

    boxShadow:
      "0 4px 12px rgba(15,23,42,0.05)"
  },

  bigTitle: {
    fontSize: "24px",

    fontWeight: "800",

    color: "#0f172a",

    marginBottom: "20px"
  },

  text: {
    color: "#475569",

    lineHeight: "1.8",

    marginBottom: "14px",

    fontSize: "16px"
  }
};

export default Analytics;