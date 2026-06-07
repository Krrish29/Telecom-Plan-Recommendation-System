import React, { useState } from "react";
import { loginUser, saveToken, saveRole, saveUser } from "../services/api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    const data = await loginUser({ username, password });
    if (!data) {
      setError("Invalid username or password");
      setLoading(false);
      return;
    }
    saveToken(data.token);
    saveRole(data.role);
    saveUser(data);
    onLogin(data.role);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={s.page}>
      {/* Subtle background pattern */}
      <div style={s.bgPattern} />
      {/* Soft glow accents */}
      <div style={s.glowTop} />
      <div style={s.glowBottom} />

      {/* ── LEFT PANEL ── */}
      <div style={s.left}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.logoWrap}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div style={s.brandName}>TelecomAI</div>
            <div style={s.brandTag}>Intelligence Platform</div>
          </div>
        </div>

        {/* Hero */}
        <div style={s.heroBlock}>
          <div style={s.pillBadge}>
            <span style={s.pillDot} />
            AI-Powered Analytics
          </div>
          <h1 style={s.heroTitle}>
            Mobile Plan<br />
            <span style={s.heroAccent}>Recommender</span>
          </h1>
          <p style={s.heroSub}>
            Intelligently match every user to the perfect mobile plan —
            powered by AI that analyzes behavior, predicts churn, and
            surfaces personalized recommendations in real time.
          </p>

        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={s.right}>
        <div style={s.card}>
          {/* Header */}
          <div style={s.cardHeader}>
            <div style={s.securedBadge}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secure Access
            </div>
            <h2 style={s.cardTitle}>Welcome back</h2>
            <p style={s.cardSub}>Sign in to your dashboard</p>
          </div>

          <div style={s.divider} />

          {/* Fields */}
          <div style={s.fields}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Username</label>
              <div style={{ position: "relative" }}>
                <span style={s.fieldIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={focusedField === "username" ? "#4f46e5" : "#94a3b8"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  style={{
                    ...s.input,
                    borderColor: focusedField === "username" ? "#4f46e5" : error && !username ? "#ef4444" : "#e2e8f0",
                    boxShadow: focusedField === "username" ? "0 0 0 3px rgba(79,70,229,0.10)" : "none",
                  }}
                />
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Password</label>
              <div style={{ position: "relative" }}>
                <span style={s.fieldIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={focusedField === "password" ? "#4f46e5" : "#94a3b8"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  style={{
                    ...s.input,
                    borderColor: focusedField === "password" ? "#4f46e5" : error && !password ? "#ef4444" : "#e2e8f0",
                    boxShadow: focusedField === "password" ? "0 0 0 3px rgba(79,70,229,0.10)" : "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ ...s.btn, opacity: loading ? 0.85 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(79,70,229,0.30)"; }}}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.20)"; }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <span style={s.spinner} />
                Authenticating...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.06); }
        }
        @keyframes drift {
          0% { background-position: 0 0; }
          100% { background-position: 44px 44px; }
        }
        input::placeholder { color: #b0bac9; }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f8fafc",
    position: "relative",
    overflow: "hidden",
  },

  bgPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)`,
    backgroundSize: "44px 44px",
    animation: "drift 10s linear infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowTop: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)",
    top: -200,
    left: -100,
    animation: "float-glow 8s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowBottom: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 70%)",
    bottom: -100,
    right: "38%",
    animation: "float-glow 10s ease-in-out infinite 2s",
    pointerEvents: "none",
    zIndex: 0,
  },

  /* ── LEFT ── */
  left: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "52px 64px",
    position: "relative",
    zIndex: 1,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(79,70,229,0.28)",
    flexShrink: 0,
  },
  brandName: {
    color: "#111827",
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: "-0.3px",
    lineHeight: 1.2,
  },
  brandTag: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 500,
    marginTop: 3,
  },

  heroBlock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingBottom: 16,
  },
  pillBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#ede9fe",
    border: "1px solid #c4b5fd",
    color: "#4f46e5",
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 22,
    width: "fit-content",
    letterSpacing: "0.2px",
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#4f46e5",
    display: "inline-block",
  },
  heroTitle: {
    fontSize: 54,
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1.12,
    letterSpacing: "-1.5px",
    marginBottom: 20,
  },
  heroAccent: {
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: {
    color: "#64748b",
    fontSize: 15.5,
    lineHeight: 1.75,
    maxWidth: 460,
    fontWeight: 400,
    marginBottom: 32,
  },

  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 4,
  },
  featureRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "11px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  featureIconWrap: {
    fontSize: 18,
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureLabel: {
    color: "#111827",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 2,
  },
  featureDesc: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 400,
  },

  statsRow: {
    display: "flex",
    gap: 0,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 28,
  },
  statItem: {
    flex: 1,
    paddingRight: 24,
    borderRight: "1px solid #e5e7eb",
    marginRight: 24,
  },
  statVal: {
    color: "#4f46e5",
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 500,
    marginTop: 3,
  },

  /* ── RIGHT ── */
  right: {
    width: 480,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 52px 40px 20px",
    position: "relative",
    zIndex: 1,
  },
  card: {
    width: "100%",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: "36px",
    boxShadow: "0 8px 40px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
  },

  cardHeader: {
    marginBottom: 22,
  },
  securedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    padding: "5px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 16,
    letterSpacing: "0.3px",
  },
  cardTitle: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    marginBottom: 5,
  },
  cardSub: {
    color: "#94a3b8",
    fontSize: 14,
  },
  divider: {
    height: 1,
    background: "#f1f5f9",
    marginBottom: 22,
  },

  fields: {
    marginBottom: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    color: "#374151",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  },
  fieldIcon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "13px 14px 13px 40px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "11px 14px",
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 13,
    fontWeight: 500,
  },

  btn: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "white",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(79,70,229,0.20)",
    transition: "transform 0.18s, box-shadow 0.18s",
    fontFamily: "inherit",
    letterSpacing: "0.2px",
  },
  spinner: {
    width: 15,
    height: 15,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
footerNote: {
  textAlign: "center",
  color: "#16a34a",  
  fontSize: 12,
  marginTop: 18,
  fontWeight: 500,
},
};

export default Login;