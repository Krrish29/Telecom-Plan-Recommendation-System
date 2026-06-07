
import React, { useEffect, useState } from "react";
import {
  FiSearch, FiArrowLeft, FiAlertCircle, FiX,
  FiUserPlus, FiCheck, FiSend, FiWifi,
  FiCalendar, FiZap, FiFilter, FiChevronLeft,
  FiChevronRight, FiUsers, FiShield, FiTrendingUp,
  FiAlertTriangle, FiPhone, FiMail, FiMapPin,
  FiSliders
} from "react-icons/fi";
import { getUsers, createUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const USER_SERVICE_URL = "http://localhost:8081";
const PAGE_SIZE = 50;

/* ── Design tokens ── */
const T = {
  brand:      "#0052CC",
  brandLight: "#E8F0FE",
  brandMid:   "#1a6fd4",
  success:    "#0D7F4A",
  successBg:  "#E6F6EE",
  warning:    "#B25E09",
  warningBg:  "#FEF3E2",
  danger:     "#C0392B",
  dangerBg:   "#FDEDEC",
  neutral900: "#0F1923",
  neutral700: "#2D3748",
  neutral500: "#5A6478",
  neutral300: "#C4CAD4",
  neutral100: "#F0F2F5",
  neutral50:  "#F7F8FA",
  white:      "#FFFFFF",
  border:     "#DDE1E9",
  shadow:     "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd:   "0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)",
};

/* ── Shared input style ── */
const inputBase = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: `1.5px solid ${T.border}`,
  background: T.white, fontSize: 14, fontFamily: "inherit",
  color: T.neutral900, outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
};

const labelBase = {
  display: "block", fontSize: 12, fontWeight: 700,
  color: T.neutral500, textTransform: "uppercase",
  letterSpacing: "0.6px", marginBottom: 6,
};

/* ── Risk badge ── */
const RiskBadge = ({ risk = "Low" }) => {
  const map = {
    High:   { bg: T.dangerBg,  color: T.danger,  border: "#F5C6C2", dot: T.danger  },
    Medium: { bg: T.warningBg, color: T.warning, border: "#FAD7A0", dot: T.warning },
    Low:    { bg: T.successBg, color: T.success, border: "#A9DFBF", dot: T.success },
  };
  const s = map[risk] || map.Low;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {risk}
    </span>
  );
};

/* ── Plan badge ── */
const PlanBadge = ({ name = "" }) => {
  const n = name.toLowerCase();
  const isPremium  = n.includes("premium") || n.includes("pro") || n.includes("postpaid");
  const isStandard = n.includes("standard") || n.includes("lite");
  const s = isPremium
    ? { bg: "#F0EBF8", color: "#6B21A8", border: "#D8B4FE" }
    : isStandard
    ? { bg: T.successBg, color: T.success, border: "#A9DFBF" }
    : { bg: "#E0F4FF", color: "#0369A1", border: "#93C5FD" };
  return (
    <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: "0.2px" }}>
      {name}
    </span>
  );
};

/* ── Stat card ── */
const StatCard = ({ icon, label, value, color, bg, delta }) => (
  <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 22px", boxShadow: T.shadow, display: "flex", gap: 16, alignItems: "flex-start", transition: "box-shadow 0.2s", cursor: "default" }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = T.shadowMd}
    onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadow}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {React.cloneElement(icon, { size: 20, color })}
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: T.neutral900, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.neutral500, fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   ADD USER MODAL
══════════════════════════════════════════ */
function AddUserModal({ onClose, onUserAdded }) {
  const [form, setForm] = useState({ userName: "", mobileNumber: "", city: "", email: "", currentPlanId: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(null);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.userName || !form.mobileNumber || !form.city) {
      setError("Name, Mobile Number and City are required."); return;
    }
    setError(""); setLoading(true);
    try {
      const res = await createUser({
        userName: form.userName, mobileNumber: form.mobileNumber, city: form.city,
        email: form.email || null,
        currentPlanId: form.currentPlanId ? parseInt(form.currentPlanId) : null,
      });
      if (res) { setSuccess(true); setTimeout(() => { onUserAdded(); onClose(); }, 1200); }
      else setError("Failed to create user. Verify that User Service is running.");
    } catch (err) { setError("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const fields = [
    { name: "userName",     label: "Full Name",      placeholder: "e.g. Ravi Kumar",     type: "text",   span: 2, required: true },
    { name: "mobileNumber", label: "Mobile Number",  placeholder: "e.g. 9876543210",     type: "text",   span: 1, required: true },
    { name: "city",         label: "City",           placeholder: "e.g. Hyderabad",      type: "text",   span: 1, required: true },
    { name: "email",        label: "Email Address",  placeholder: "e.g. ravi@email.com", type: "email",  span: 2, required: false },
    { name: "currentPlanId", label: "Plan ID",       placeholder: "Optional",            type: "number", span: 2, required: false },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,25,35,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div style={{ background: T.white, borderRadius: 16, width: "92%", maxWidth: 540, boxShadow: T.shadowMd, overflow: "hidden", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 26px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.brandLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiUserPlus size={18} color={T.brand} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.neutral900 }}>Add New User</div>
              <div style={{ fontSize: 12, color: T.neutral500, marginTop: 1 }}>Onboard a new telecom customer</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: T.neutral100, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.neutral500, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = T.border}
            onMouseLeave={e => e.currentTarget.style.background = T.neutral100}>
            <FiX size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 26px 26px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.successBg, border: `2px solid #A9DFBF`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <FiCheck size={26} color={T.success} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.neutral900, marginBottom: 4 }}>User Created Successfully</div>
              <div style={{ fontSize: 13, color: T.neutral500 }}>Refreshing the user list…</div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {fields.map(f => (
                  <div key={f.name} style={{ gridColumn: f.span === 2 ? "1 / -1" : "auto" }}>
                    <label style={labelBase}>
                      {f.label} {f.required && <span style={{ color: T.danger }}>*</span>}
                    </label>
                    <input type={f.type} name={f.name} placeholder={f.placeholder}
                      value={form[f.name]} onChange={handle}
                      onFocus={() => setFocused(f.name)} onBlur={() => setFocused(null)}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      style={{ ...inputBase, borderColor: focused === f.name ? T.brand : T.border, boxShadow: focused === f.name ? `0 0 0 3px ${T.brandLight}` : "none" }}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: T.dangerBg, border: `1px solid #F5C6C2`, color: T.danger, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                  <FiAlertCircle size={13} /> {error}
                </div>
              )}


              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, color: T.neutral700, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.neutral50}
                  onMouseLeave={e => e.currentTarget.style.background = T.white}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ flex: 2, padding: "11px 0", borderRadius: 8, border: "none", background: loading ? T.neutral100 : T.brand, color: loading ? T.neutral500 : T.white, fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.brandMid; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.brand; }}>
                  {loading
                    ? <><span style={{ width: 13, height: 13, border: `2px solid ${T.border}`, borderTop: `2px solid ${T.brand}`, borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Creating…</>
                    : <><FiUserPlus size={14} /> Create User</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   RECOMMEND PANEL
══════════════════════════════════════════ */
function RecommendPanel({ user, onClose }) {
  const [plan,         setPlan]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [notifSent,    setNotifSent]    = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError,   setNotifError]   = useState("");

  useEffect(() => {
    const fetchRec = async () => {
      setLoading(true); setError("");
      try {
        const res = await fetch(`http://localhost:8084/recommend/mobile/${user.mobileNumber}`);
        if (!res.ok) throw new Error(`Recommendation service error (${res.status})`);
        const data = await res.json();
        const top = data?.[0];
        if (!top) throw new Error("No recommendation available.");
        setPlan(top);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    if (user?.mobileNumber) fetchRec();
  }, [user]);

  const sendNotification = async () => {
    if (!plan) return;
    setNotifLoading(true); setNotifError("");
    try {
      const res = await fetch(`${USER_SERVICE_URL}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId, type: "PLAN_RECOMMENDATION",
          title: `Recommended Plan: ${plan.planName}`,
          message: `Hi ${user.userName}, based on your usage patterns, we recommend the ${plan.planName} plan. Price: ₹${plan.price}, Data: ${plan.dataLimit}, Validity: ${plan.validityDays} days.`,
        }),
      });
      if (!res.ok) throw new Error(`Notification failed (${res.status})`);
      setNotifSent(true);
    } catch (e) { setNotifError(e.message); }
    finally { setNotifLoading(false); }
  };

  const matchPct = plan ? (plan.matchScore * 100).toFixed(1) : 0;

  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", boxShadow: T.shadowMd, position: "sticky", top: 80 }}>

      {/* Header */}
      <div style={{ background: T.brand, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "white", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 7, letterSpacing: "-0.2px" }}>
            <FiZap size={14} /> AI Recommendation
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 3 }}>
            {user.userName} · {user.mobileNumber}
          </div>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
          <FiX size={13} />
        </button>
      </div>

      {/* Current plan strip */}
      <div style={{ padding: "11px 20px", background: T.neutral50, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.neutral500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Plan</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.neutral900 }}>
          {user.currentPlanName
            ? <PlanBadge name={user.currentPlanName} />
            : <span style={{ color: T.neutral300, fontStyle: "italic", fontWeight: 400 }}>Unassigned</span>}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px 20px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "32px 0", color: T.neutral500 }}>
            <div style={{ width: 28, height: 28, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.brand}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 13 }}>Fetching recommendation…</div>
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: 14, borderRadius: 10, background: T.dangerBg, border: `1px solid #F5C6C2`, color: T.danger, fontSize: 12, textAlign: "center" }}>
            <FiAlertCircle size={16} style={{ display: "block", margin: "0 auto 8px" }} />
            {error}
          </div>
        )}

        {!loading && plan && (
          <>
            {/* Plan card */}
            <div style={{ background: T.neutral50, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 6, background: T.brandLight, color: T.brand, fontSize: 10, fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 7, border: `1px solid #BFDBFE` }}>
                    <FiZap size={9} /> AI Suggested
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: T.neutral900, letterSpacing: "-0.3px" }}>{plan.planName}</div>
                  <div style={{ fontSize: 11, color: T.neutral500, marginTop: 2, fontWeight: 600 }}>{plan.networkType}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: T.brand, lineHeight: 1, letterSpacing: "-0.5px" }}>₹{Number(plan.price).toFixed(0)}</div>
                  <div style={{ fontSize: 10, color: T.neutral500, marginTop: 2 }}>/plan</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                {[
                  [<FiWifi size={11} />,     plan.dataLimit    || "—", "Data"],
                  [<FiCalendar size={11} />, `${plan.validityDays || "—"} days`, "Validity"],
                ].map(([icon, val, label], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: T.brand }}>{icon}</span>
                    <span style={{ fontSize: 12, color: T.neutral700, fontWeight: 600, flex: 1 }}>{val}</span>
                    <span style={{ fontSize: 10, color: T.neutral500, fontWeight: 600 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Match score */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ background: T.neutral50, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.neutral500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Match Score</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: matchPct >= 70 ? T.success : T.warning, letterSpacing: "-0.5px" }}>{matchPct}%</div>
              </div>
              <div style={{ background: T.neutral50, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.neutral500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Plan Type</div>
                <div style={{ marginTop: 2 }}><PlanBadge name={plan.planType || plan.planName} /></div>
              </div>
            </div>

            {/* Insight */}
            {/* Recommendation insight — generate a contextual, per-plan reason */}
            {(() => {
              const getRecommendationInsight = (p) => {
                if (!p) return "Recommendation based on the user's usage profile.";
                // Accept multiple possible score fields from different services
                const rawScore = p.matchScore ?? p.match_score ?? p.score ?? p.match ?? null;
                const numericScore = typeof rawScore === 'number' ? rawScore : (typeof rawScore === 'string' && !isNaN(Number(rawScore)) ? Number(rawScore) : null);
                const scorePct = numericScore != null ? Math.round(numericScore * (numericScore > 1 ? 1 : 100)) : null;

                // Prefer structured recommendation label if available
                const recLabel = (p.recommendation_reason && p.recommendation_reason.label) || p.recommendation_label || p.reason_label || null;

                if (recLabel) {
                  const lbl = String(recLabel).toLowerCase();
                  if (lbl.includes('upgrade') || lbl.includes('urgent') || lbl.includes('overloaded') || lbl.includes('overuse')) return 'Upgrade recommended to prevent overages and improve experience.';
                  if (lbl.includes('cost') || lbl.includes('savings')) return 'Recommend a cost-saving plan to reduce monthly spend while meeting needs.';
                  if (lbl.includes('reward') || lbl.includes('loyal')) return 'Recommend a loyalty plan to reward high-usage customers.';
                  if (lbl.includes('downgrade') || lbl.includes('inactive')) return 'Recommend a downgrade to better match low usage and reduce cost.';
                }

                if (scorePct !== null) {
                  if (scorePct >= 75) return 'This plan closely matches the user — recommended for immediate switch.';
                  if (scorePct >= 50) return 'Good match; consider promoting this plan with a trial or small incentive.';
                  if (scorePct >= 30) return 'Partial match — consider bundling or a nearby tier for a better fit.';
                  return 'Low match score — explore alternate plans or personalized offers.';
                }

                const reasonText = String(p.reason || p.reasonText || p.recommendation_reason || '').toLowerCase();
                if (/overage|upgrade|exceed|extreme|overuse/.test(reasonText)) return 'Plan upgrade advised to avoid overage charges.';
                if (/downgrade|inactive|low usage|seldom/.test(reasonText)) return 'Recommend a downgrade to reduce cost while retaining the user.';
                if (/anomaly|unusual|spike/.test(reasonText)) return 'Unusual usage detected — recommend review before applying plan changes.';
                return 'Recommendation based on the user\'s usage profile; suggested plan aims to better match needs.';
              };
              const insight = getRecommendationInsight(plan);
              return (
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>Recommendation Insight</div>
                  <div style={{ fontSize: 12, color: "#1E40AF", lineHeight: 1.65 }}>{insight}</div>
                </div>
              );
            })()}

            {/* Notify */}
            {notifSent ? (
              <div style={{ padding: "12px 14px", borderRadius: 9, background: T.successBg, border: `1px solid #A9DFBF`, color: T.success, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <FiCheck size={14} /> Notification sent successfully
              </div>
            ) : (
              <>
                {notifError && (
                  <div style={{ padding: "10px 12px", borderRadius: 8, background: T.dangerBg, border: `1px solid #F5C6C2`, color: T.danger, fontSize: 12, marginBottom: 10 }}>
                    ⚠ {notifError}
                  </div>
                )}
                <button onClick={sendNotification} disabled={notifLoading}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 9, border: "none", background: notifLoading ? T.neutral100 : T.brand, color: notifLoading ? T.neutral500 : T.white, fontWeight: 700, fontSize: 13, cursor: notifLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
                  onMouseEnter={e => { if (!notifLoading) e.currentTarget.style.background = T.brandMid; }}
                  onMouseLeave={e => { if (!notifLoading) e.currentTarget.style.background = T.brand; }}>
                  {notifLoading ? "Sending…" : <><FiSend size={13} /> Send Recommendation</>}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
function UserManagement() {
  const navigate = useNavigate();
  const [users,         setUsers]         = useState([]);
  const [recommendUser, setRecommendUser] = useState(null);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [selectedPlan,  setSelectedPlan]  = useState("All Plans");
  const [selectedCity,  setSelectedCity]  = useState("All Cities");
  const [selectedRisk,  setSelectedRisk]  = useState("All Risk Levels");
  const [page,          setPage]          = useState(0);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredRow,    setHoveredRow]    = useState(null);

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { setPage(0); }, [searchTerm, selectedPlan, selectedCity, selectedRisk]);

  const fetchUsers = async () => {
    try { const data = await getUsers(); setUsers(data); }
    catch (e) { console.log(e); }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.userName     || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.mobileNumber || "").includes(searchTerm);
    const matchPlan   = selectedPlan === "All Plans"       || u.currentPlanName === selectedPlan;
    const matchCity   = selectedCity === "All Cities"      || u.city === selectedCity;
    const matchRisk   = selectedRisk === "All Risk Levels" || (u.riskLevel || "Low") === selectedRisk;
    return matchSearch && matchPlan && matchCity && matchRisk;
  });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const pagedUsers = filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const cities    = ["All Cities",  ...Array.from(new Set(users.map(u => u.city).filter(Boolean))).sort()];
  const planNames = ["All Plans",   ...Array.from(new Set(users.map(u => u.currentPlanName).filter(Boolean))).sort()];

  const hasFilters = searchTerm || selectedPlan !== "All Plans" || selectedCity !== "All Cities" || selectedRisk !== "All Risk Levels";

  const selectStyle = {
    padding: "9px 32px 9px 12px", borderRadius: 8,
    border: `1.5px solid ${T.border}`,
    background: T.white, color: T.neutral700, fontSize: 12, fontWeight: 600,
    cursor: "pointer", outline: "none", fontFamily: "inherit",
    appearance: "none", WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A6478' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", minWidth: 136,
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.neutral50, fontFamily: "'Instrument Sans','Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        select:focus, input:focus { border-color: ${T.brand} !important; box-shadow: 0 0 0 3px ${T.brandLight} !important; }
        select option { background: white; color: ${T.neutral900}; }
        input::placeholder { color: ${T.neutral300}; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 99px; }
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: "0 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, height: 64, boxShadow: "0 1px 0 #DDE1E9" }}>

        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <button onClick={() => navigate("/admin")}
            style={{ height: 64, paddingRight: 20, background: "none", border: "none", borderRight: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: T.neutral500, fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "color 0.15s", marginRight: 20 }}
            onMouseEnter={e => e.currentTarget.style.color = T.brand}
            onMouseLeave={e => e.currentTarget.style.color = T.neutral500}>
            <FiArrowLeft size={15} /> Dashboard
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: T.brandLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiUsers size={16} color={T.brand} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.neutral900, letterSpacing: "-0.3px" }}>Customer Management</div>
              <div style={{ fontSize: 11, color: T.neutral500, fontWeight: 500 }}>{users.length.toLocaleString()} customers registered</div>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowAddModal(true)}
            style={{ height: 36, padding: "0 16px", borderRadius: 8, background: T.brand, color: T.white, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7, transition: "background 0.15s", boxShadow: "0 2px 8px rgba(0,82,204,0.25)" }}
            onMouseEnter={e => e.currentTarget.style.background = T.brandMid}
            onMouseLeave={e => e.currentTarget.style.background = T.brand}>
            <FiUserPlus size={14} /> Add User
          </button>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: "24px 32px", maxWidth: 1560, margin: "0 auto", animation: "fadeIn 0.25s ease" }}>

        {/* Filter bar */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", boxShadow: T.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.neutral500, fontSize: 12, fontWeight: 700, marginRight: 4 }}>
            <FiSliders size={13} /> Filters
          </div>

          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 200, maxWidth: 280 }}>
            <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: searchFocused ? T.brand : T.neutral300, fontSize: 14, transition: "color 0.15s" }} />
            <input
              placeholder="Search by name or mobile..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              style={{ ...inputBase, paddingLeft: 36, borderColor: searchFocused ? T.brand : T.border, boxShadow: searchFocused ? `0 0 0 3px ${T.brandLight}` : "none" }}
            />
          </div>

          <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} style={selectStyle}>
            {planNames.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={selectStyle}>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selectedRisk} onChange={e => setSelectedRisk(e.target.value)} style={selectStyle}>
            <option value="All Risk Levels">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {hasFilters && (
            <button onClick={() => { setSearchTerm(""); setSelectedPlan("All Plans"); setSelectedCity("All Cities"); setSelectedRisk("All Risk Levels"); }}
              style={{ height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, color: T.neutral500, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.danger; e.currentTarget.style.color = T.danger; e.currentTarget.style.background = T.dangerBg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.neutral500; e.currentTarget.style.background = T.white; }}>
              <FiX size={12} /> Clear filters
            </button>
          )}

          <div style={{ marginLeft: "auto", fontSize: 12, color: T.neutral500, fontWeight: 600 }}>
            {filteredUsers.length !== users.length
              ? <><span style={{ color: T.brand, fontWeight: 800 }}>{filteredUsers.length}</span> of {users.length} users</>
              : <><span style={{ color: T.neutral900, fontWeight: 800 }}>{users.length}</span> users total</>}
          </div>
        </div>

        {/* Table + recommend panel */}
        <div style={{ display: "grid", gridTemplateColumns: recommendUser ? "1fr 310px" : "1fr", gap: 18, alignItems: "start" }}>

          {/* ── TABLE ── */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", boxShadow: T.shadow }}>

            {/* Table head */}
            <div style={{ display: "grid", gridTemplateColumns: "64px 2fr 1.5fr 1fr 1.7fr 1fr 120px", padding: "11px 22px", background: T.neutral50, fontSize: 11, fontWeight: 700, color: T.neutral500, textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: `1.5px solid ${T.border}` }}>
              <span>ID</span>
              <span>Customer</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FiPhone size={10} /> Mobile</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FiMapPin size={10} /> City</span>
              <span>Current Plan</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FiShield size={10} /> Risk</span>
              <span>Action</span>
            </div>

            {/* Rows */}
            {pagedUsers.map((user, i) => {
              const isActive = recommendUser?.userId === user.userId;
              return (
                <div key={user.userId}
                  onMouseEnter={() => setHoveredRow(user.userId)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 2fr 1.5fr 1fr 1.7fr 1fr 120px",
                    padding: "13px 22px", alignItems: "center",
                    borderBottom: i === pagedUsers.length - 1 ? "none" : `1px solid ${T.neutral100}`,
                    background: isActive ? T.brandLight : hoveredRow === user.userId ? T.neutral50 : T.white,
                    borderLeft: `3px solid ${isActive ? T.brand : "transparent"}`,
                    transition: "background 0.1s, border-left-color 0.1s",
                  }}>

                  <div style={{ fontSize: 11, color: T.neutral300, fontWeight: 700, fontFamily: "monospace" }}>#{user.userId}</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: isActive ? T.brand : T.neutral100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: isActive ? T.white : T.neutral500, flexShrink: 0, transition: "all 0.15s" }}>
                      {(user.userName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: T.neutral900, fontSize: 13 }}>{user.userName}</div>
                      {user.email && <div style={{ fontSize: 11, color: T.neutral500, marginTop: 1, display: "flex", alignItems: "center", gap: 3 }}><FiMail size={9} /> {user.email}</div>}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: T.neutral700, fontFamily: "monospace", fontWeight: 500 }}>{user.mobileNumber}</div>

                  <div style={{ fontSize: 12, color: T.neutral700, fontWeight: 500 }}>{user.city || "—"}</div>

                  <div>
                    {user.currentPlanName
                      ? <PlanBadge name={user.currentPlanName} />
                      : <span style={{ fontSize: 11, color: T.neutral300, fontStyle: "italic" }}>No plan</span>}
                  </div>

                  <div><RiskBadge risk={user.riskLevel || "Low"} /></div>

                  <div>
                    <button
                      onClick={() => setRecommendUser(isActive ? null : user)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "6px 12px", borderRadius: 7,
                        background: isActive ? T.brand : T.brandLight,
                        color: isActive ? T.white : T.brand,
                        border: `1px solid ${isActive ? T.brand : "#BFDBFE"}`,
                        cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.brand; e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.brand; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isActive ? T.brand : T.brandLight; e.currentTarget.style.color = isActive ? T.white : T.brand; e.currentTarget.style.borderColor = isActive ? T.brand : "#BFDBFE"; }}>
                      <FiZap size={11} />
                      {isActive ? "Close" : "Recommend"}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div style={{ textAlign: "center", padding: "56px 0", color: T.neutral300 }}>
                <FiUsers size={32} style={{ display: "block", margin: "0 auto 12px", opacity: 0.4 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: T.neutral500, marginBottom: 4 }}>No users found</div>
                <div style={{ fontSize: 13 }}>Try adjusting your filters or search query.</div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (() => {
              const from = page * PAGE_SIZE + 1;
              const to   = Math.min((page + 1) * PAGE_SIZE, filteredUsers.length);
              return (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 22px", borderTop: `1px solid ${T.border}`, background: T.neutral50 }}>
                  <span style={{ fontSize: 12, color: T.neutral500, fontWeight: 500 }}>
                    Showing <span style={{ color: T.neutral900, fontWeight: 700 }}>{from}–{to}</span> of <span style={{ color: T.neutral900, fontWeight: 700 }}>{filteredUsers.length}</span> results
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                      style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${T.border}`, background: page === 0 ? T.neutral50 : T.white, color: page === 0 ? T.neutral300 : T.neutral700, cursor: page === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                      <button key={i} onClick={() => setPage(i)}
                        style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${i === page ? T.brand : T.border}`, background: i === page ? T.brand : T.white, color: i === page ? T.white : T.neutral700, cursor: "pointer", fontSize: 12, fontWeight: i === page ? 800 : 500, transition: "all 0.15s" }}>
                        {i + 1}
                      </button>
                    ))}
                    <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                      style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${T.border}`, background: page >= totalPages - 1 ? T.neutral50 : T.white, color: page >= totalPages - 1 ? T.neutral300 : T.neutral700, cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Recommend panel */}
          {recommendUser && (
            <RecommendPanel user={recommendUser} onClose={() => setRecommendUser(null)} />
          )}
        </div>
      </div>

      {showAddModal && (
        <AddUserModal onClose={() => setShowAddModal(false)} onUserAdded={() => { fetchUsers(); setShowAddModal(false); }} />
      )}
    </div>
  );
}

export default UserManagement;