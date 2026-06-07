// ================================
// Compare.js
// ================================

import React, {
  useEffect,
  useState
} from "react";

function Compare({ mobile }) {

  const [currentPlan, setCurrentPlan] =
    useState(null);

  const [recommendedPlan, setRecommendedPlan] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // FETCH AI COMPARISON
  // =====================================================

  useEffect(() => {

    if (!mobile) return;

    const fetchAIComparison = async () => {

      try {

        setLoading(true);

        // CURRENT PLAN
        const currentRes = await fetch(
          `http://localhost:8081/users/current-plan/${mobile}`
        );

        const currentData =
          await currentRes.json();

        setCurrentPlan(currentData);

        // RECOMMENDATION
        const recRes = await fetch(
          `http://localhost:8084/recommend/mobile/${mobile}`
        );

        const recData =
          await recRes.json();

        if (recData.length > 0) {

          setRecommendedPlan(
            recData[0]
          );
        }

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

    fetchAIComparison();

  }, [mobile]);

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>
        ⚖️ AI Plan Comparison
      </h2>

      {!mobile && (

        <div style={styles.emptyBox}>

          Search recommendations first
          to load AI comparison.

        </div>
      )}

      {loading && (

        <div style={styles.loading}>
          Loading comparison...
        </div>
      )}

      {mobile &&
        currentPlan &&
        recommendedPlan && (

        <>
          {/* PLAN CARDS */}
          <div style={styles.aiCompareSection}>

            {/* CURRENT PLAN */}
            <div style={styles.aiCard}>

              <span style={styles.currentBadge}>
                Current Plan
              </span>

              <h2 style={styles.planName}>
                {currentPlan.planName}
              </h2>

              <h2 style={styles.price}>
                ₹{currentPlan.price}
              </h2>

              <p style={styles.sub}>
                {currentPlan.dataLimit}
              </p>

              <p style={styles.sub}>
                {currentPlan.validityDays} Days
              </p>

              <p style={styles.type}>
                {currentPlan.networkType}
              </p>

            </div>

            {/* RECOMMENDED */}
            <div style={styles.bestCard}>

              <span style={styles.bestBadge}>
                🔥 Recommended
              </span>

              <h2 style={styles.planName}>
                {recommendedPlan.planName}
              </h2>

              <h2 style={styles.price}>
                ₹{recommendedPlan.price}
              </h2>

              <p style={styles.sub}>
                {recommendedPlan.dataLimit}
              </p>

              <p style={styles.sub}>
                {recommendedPlan.validityDays} Days
              </p>

              <p style={styles.type}>

                Match:
                {" "}

                {
                  (
                    recommendedPlan.matchScore
                    * 100
                  ).toFixed(1)
                }%

              </p>

            </div>

          </div>

          {/* COMPARISON TABLE */}
          <div style={styles.compareBox}>

            <h3 style={styles.compareTitle}>
              📊 AI Comparison
            </h3>

            <div style={styles.table}>

              {/* HEADER */}
              <div style={styles.rowHeader}>

                <div style={styles.headerCell}>
                  Feature
                </div>

                <div style={styles.planHeader}>
                  Current
                </div>

                <div style={styles.planHeader}>
                  Recommended
                </div>

              </div>

              {/* PRICE */}
              <div style={styles.row}>

                <div style={styles.featureCell}>
                  Price
                </div>

                <div style={styles.cell}>
                  ₹{currentPlan.price}
                </div>

                <div style={styles.cell}>
                  ₹{recommendedPlan.price}
                </div>

              </div>

              {/* DATA */}
              <div style={styles.row}>

                <div style={styles.featureCell}>
                  Data
                </div>

                <div style={styles.cell}>
                  {currentPlan.dataLimit}
                </div>

                <div style={styles.cell}>
                  {recommendedPlan.dataLimit}
                </div>

              </div>

              {/* VALIDITY */}
              <div style={styles.row}>

                <div style={styles.featureCell}>
                  Validity
                </div>

                <div style={styles.cell}>
                  {
                    currentPlan.validityDays
                  } days
                </div>

                <div style={styles.cell}>
                  {
                    recommendedPlan.validityDays
                  } days
                </div>

              </div>

              {/* NETWORK */}
              <div style={styles.row}>

                <div style={styles.featureCell}>
                  Network
                </div>

                <div style={styles.cell}>
                  {currentPlan.networkType}
                </div>

                <div style={styles.cell}>
                  {
                    recommendedPlan.networkType
                  }
                </div>

              </div>

            </div>

            {/* AI INSIGHT */}
            <div style={styles.insightBox}>

              💡 AI Insight:
              {" "}
              {recommendedPlan.reason}

            </div>

          </div>
        </>
      )}

    </div>
  );
}

const styles = {

  container: {
    padding: "20px",
    background: "#f0f9ff",
    minHeight: "100vh",
    fontFamily:
      "'Segoe UI', sans-serif"
  },

  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#0c4a6e",
    fontSize: "30px",
    fontWeight: "800"
  },

  emptyBox: {
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: "600",
    boxShadow:
      "0 4px 12px rgba(3, 105, 161, 0.1)"
  },

  loading: {
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "700",
    color: "#0369a1"
  },

  aiCompareSection: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    marginBottom: "30px"
  },

  aiCard: {
    background: "white",
    padding: "30px",
    borderRadius: "18px",
    textAlign: "center",
    position: "relative",
    boxShadow:
      "0 4px 12px rgba(3, 105, 161, 0.1)"
  },

  bestCard: {
    background:
      "linear-gradient(135deg, #0369a1, #0891b2)",
    color: "white",
    padding: "30px",
    borderRadius: "18px",
    textAlign: "center",
    position: "relative",
    boxShadow:
      "0 10px 30px rgba(3, 105, 161, 0.2)"
  },

  currentBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700"
  },

  bestBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "#fbbf24",
    color: "#78350f",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700"
  },

  planName: {
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "10px"
  },

  price: {
    fontSize: "30px",
    fontWeight: "800"
  },

  sub: {
    margin: "12px 0",
    fontSize: "15px"
  },

  type: {
    fontSize: "14px"
  },

  compareBox: {
    marginTop: "40px",
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow:
      "0 4px 12px rgba(3, 105, 161, 0.1)"
  },

  compareTitle: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#0c4a6e",
    fontSize: "22px",
    fontWeight: "800"
  },

  table: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    overflow: "hidden"
  },

  rowHeader: {
    display: "grid",
    gridTemplateColumns:
      "180px repeat(2, 1fr)",
    background: "#0369a1",
    color: "white"
  },

  headerCell: {
    padding: "16px",
    fontWeight: "700",
    textAlign: "center"
  },

  planHeader: {
    padding: "16px",
    fontWeight: "700",
    textAlign: "center"
  },

  row: {
    display: "grid",
    gridTemplateColumns:
      "180px repeat(2, 1fr)",
    borderBottom:
      "1px solid #bfdbfe"
  },

  featureCell: {
    padding: "16px",
    background: "#e0f2fe",
    fontWeight: "700",
    color: "#0c4a6e",
    textAlign: "center"
  },

  cell: {
    padding: "16px",
    textAlign: "center",
    background: "white"
  },

  insightBox: {
    marginTop: "20px",
    padding: "18px",
    borderRadius: "12px",
    background: "#e0f2fe",
    color: "#0c4a6e",
    fontWeight: "600",
    lineHeight: "1.6"
  }
};

export default Compare;