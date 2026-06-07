import React, { useState } from "react";

function Dashboard({ mobile, setMobile }) {

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // 🔥 FETCH RECOMMENDATIONS
  // =====================================================

  const fetchPlans = async () => {

    if (!mobile) {

      setError(
        "Please enter mobile number"
      );

      return;
    }

    setLoading(true);

    setError("");

    try {

      const res = await fetch(
        `http://localhost:8084/recommend/mobile/${mobile}`
      );

      if (!res.ok) {

        throw new Error(
          "No recommendations found"
        );
      }

      const data = await res.json();

      setPlans(data);

    } catch (err) {

      setError(
        "No recommendations found"
      );

      setPlans([]);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>
        📊 Smart Plan Recommendations
      </h2>

      {/* INPUT */}
      <div style={styles.inputBox}>

        <input
          placeholder="Enter Mobile Number"

          value={mobile}

          onChange={(e) =>
            setMobile(e.target.value)
          }

          style={styles.input}
        />

        <button
          onClick={fetchPlans}
          style={styles.button}
        >

          {loading
            ? "Loading..."
            : "Get Plans"}

        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}

      {/* BEST PLAN */}
      {plans.length > 0 && (

        <div style={styles.bestCard}>

          <span style={styles.badge}>
            🔥 BEST MATCH
          </span>

          <h2 style={styles.planName}>
            {plans[0].planName}
          </h2>

          <h2 style={styles.price}>
            ₹{plans[0].price}
          </h2>

          <p style={styles.sub}>

            {plans[0].dataLimit}
            {" • "}
            {plans[0].validityDays}
            {" days"}

          </p>

          <div style={styles.progressBar}>

            <div
              style={{
                ...styles.progressFill,

                width:
                  `${plans[0].matchScore * 100}%`
              }}
            />

          </div>

          <p style={styles.score}>

            {(plans[0].matchScore * 100)
              .toFixed(1)}% Match

          </p>

          <p style={styles.reason}>
            {plans[0].reason}
          </p>

        </div>
      )}

      {/* OTHER PLANS */}
      <div style={styles.grid}>

        {plans.slice(1).map((p, i) => (

          <div
            key={i}
            style={styles.card}
          >

            <h3 style={styles.cardPlanName}>
              {p.planName}
            </h3>

            <h3 style={styles.cardPrice}>
              ₹{p.price}
            </h3>

            <p style={styles.cardSub}>

              {p.dataLimit}
              {" • "}
              {p.validityDays}
              {" days"}

            </p>

            <div style={styles.progressBarLight}>

              <div
                style={{
                  ...styles.progressFillLight,

                  width:
                    `${p.matchScore * 100}%`
                }}
              />

            </div>

            <p style={styles.cardScore}>

              {(p.matchScore * 100)
                .toFixed(1)}% Match

            </p>

            <p style={styles.cardReason}>
              {p.reason}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",

    background: "#f0f9ff",

    padding: "20px",

    fontFamily:
      "'Segoe UI', sans-serif"
  },

  title: {
    textAlign: "center",

    marginBottom: "20px",

    color: "#0c4a6e",

    fontSize: "28px",

    fontWeight: "800"
  },

  inputBox: {
    display: "flex",

    justifyContent: "center",

    gap: "12px",

    marginBottom: "30px",

    flexWrap: "wrap"
  },

  input: {
    padding: "14px 18px",

    borderRadius: "12px",

    border: "2px solid #bfdbfe",

    width: "280px",

    fontSize: "15px",

    outline: "none"
  },

  button: {
    padding: "14px 28px",

    borderRadius: "12px",

    border: "none",

    background:
      "linear-gradient(135deg, #0369a1, #0891b2)",

    color: "white",

    cursor: "pointer",

    fontWeight: "700",

    fontSize: "14px"
  },

  error: {
    textAlign: "center",

    color: "#991b1b",

    background: "#fecaca",

    padding: "10px",

    borderRadius: "10px",

    maxWidth: "400px",

    margin: "0 auto 20px auto"
  },

  bestCard: {
    background:
      "linear-gradient(135deg, #0369a1, #0891b2)",

    padding: "40px",

    borderRadius: "18px",

    maxWidth: "600px",

    margin: "30px auto",

    color: "white",

    textAlign: "center",

    position: "relative",

    boxShadow:
      "0 10px 30px rgba(3, 105, 161, 0.2)"
  },

  badge: {
    position: "absolute",

    top: "-14px",

    left: "50%",

    transform: "translateX(-50%)",

    background: "#fbbf24",

    color: "#78350f",

    padding: "6px 14px",

    borderRadius: "10px",

    fontSize: "12px",

    fontWeight: "700"
  },

  planName: {
    fontSize: "30px",

    fontWeight: "800",

    marginBottom: "10px"
  },

  price: {
    fontSize: "26px",

    fontWeight: "700",

    color: "white"
  },

  sub: {
    color:
      "rgba(255,255,255,0.9)",

    marginTop: "8px"
  },

  progressBar: {
    width: "100%",

    height: "10px",

    background:
      "rgba(255,255,255,0.3)",

    borderRadius: "6px",

    marginTop: "20px",

    overflow: "hidden"
  },

  progressFill: {
    height: "100%",

    background:
      "linear-gradient(90deg, #fcd34d 0%, #fbbf24 100%)"
  },

  score: {
    marginTop: "12px",

    fontWeight: "600"
  },

  reason: {
    marginTop: "12px",

    lineHeight: "1.5",

    color:
      "rgba(255,255,255,0.95)"
  },

  grid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",

    gap: "20px",

    marginTop: "30px"
  },

  card: {
    background: "white",

    padding: "25px",

    borderRadius: "16px",

    boxShadow:
      "0 4px 12px rgba(3, 105, 161, 0.1)",

    transition: "0.3s"
  },

  cardPlanName: {
    fontSize: "20px",

    fontWeight: "700",

    color: "#0c4a6e",

    marginBottom: "8px"
  },

  cardPrice: {
    fontSize: "22px",

    fontWeight: "700",

    color: "#111827"
  },

  cardSub: {
    color: "#475569",

    margin: "12px 0"
  },

  progressBarLight: {
    width: "100%",

    height: "8px",

    background: "#e5e7eb",

    borderRadius: "6px",

    overflow: "hidden"
  },

  progressFillLight: {
    height: "100%",

    background: "#2563eb"
  },

  cardScore: {
    marginTop: "10px",

    color: "#334155",

    fontSize: "13px",

    fontWeight: "600"
  },

  cardReason: {
    marginTop: "12px",

    color: "#1e293b",

    fontSize: "13px",

    lineHeight: "1.5"
  }
};

export default Dashboard;