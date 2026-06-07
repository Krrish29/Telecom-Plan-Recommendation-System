import React, { useState, useEffect } from "react";
import {
  FiBell, FiBarChart2, FiTrendingUp, FiTarget, FiLogOut,
  FiRefreshCw, FiChevronRight, FiWifi, FiPhone,
  FiMessageSquare, FiCalendar, FiAlertCircle, FiGrid, FiSearch,
  FiFilter, FiX, FiTrendingDown, FiAward
} from "react-icons/fi";
import { logout, getPlans } from "../services/api";

const USER_SERVICE_URL      = "http://localhost:8081";
const PLAN_SERVICE_URL      = "http://localhost:8082/plans";
const ANALYTICS_SERVICE_URL = "http://localhost:8083/analytics";

/* ─── Donut ─── */
const Donut = ({ pct, color, label, value }) => {
  const R = 38, stroke = 8, circ = 2 * Math.PI * R;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)", display: "block" }}>
          <circle cx={48} cy={48} r={R} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          <circle cx={48} cy={48} r={R} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset .8s ease" }} />
        </svg>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>{label}</div>
        </div>
      </div>
    </div>
  );
};

const notifStyle = (type) => {
  const t = (type || "").toUpperCase();
  if (["PLAN_UPDATE","PLAN_CHANGE","PLAN_UPGRADE","WARNING","PLAN_RECOMMENDATION"].includes(t))
    return { bg: "#fffbeb", border: "#fde68a", dot: "#d97706" };
  if (["WELCOME","LOGIN","OFFER"].includes(t))
    return { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a" };
  if (["ALERT","ERROR"].includes(t))
    return { bg: "#fef2f2", border: "#fecaca", dot: "#ef4444" };
  return { bg: "#f9fafb", border: "#e5e7eb", dot: "#9ca3af" };
};

const PlanBadge = ({ type }) => {
  const map = {
    Prepaid:  { bg: "#e0f2fe", color: "#0891b2", border: "#7dd3fc" },
    Postpaid: { bg: "#f3e8ff", color: "#7c3aed", border: "#d8b4fe" },
  };
  const st = map[type] || { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
      {type}
    </span>
  );
};

const planAccent = (type) => {
  if (!type) return "#0891b2";
  const t = type.toLowerCase();
  if (t.includes("premium") || t.includes("postpaid")) return "#7c3aed";
  if (t.includes("standard") || t.includes("pro"))     return "#4f46e5";
  return "#0891b2";
};

/* ─── Plan card ─── */
const PlanCard = ({ plan, rank, onClick }) => {
  const accent = planAccent(plan.planType);
  const rankConfig = {
    0: { border: `2px solid ${accent}`, shadow: `0 4px 20px ${accent}30` },
    1: { border: "1px solid #e5e7eb",   shadow: "0 1px 4px rgba(0,0,0,0.06)" },
    2: { border: "1px solid #e5e7eb",   shadow: "0 1px 4px rgba(0,0,0,0.06)" },
  }[rank] || { border: "1px solid #e5e7eb", shadow: "0 1px 4px rgba(0,0,0,0.06)" };

  return (
    <div onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = rankConfig.shadow; }}
      style={{ background: "white", border: rankConfig.border, borderRadius: 16, padding: "20px 18px", cursor: "pointer", transition: "0.2s ease", position: "relative", boxShadow: rankConfig.shadow }}>
      {rank === 0 && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${accent},${accent}bb)`, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>⭐ TOP PICK</div>}
      {rank === 1 && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#f1f5f9", color: "#64748b", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap", border: "1px solid #e2e8f0" }}>2nd Choice</div>}
      {rank === 2 && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#f1f5f9", color: "#64748b", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap", border: "1px solid #e2e8f0" }}>3rd Choice</div>}
      <div style={{ marginBottom: 10, marginTop: rank === 0 ? 4 : 0 }}><PlanBadge type={plan.planType || "Prepaid"} /></div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 2 }}>{plan.planName}</div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>{plan.networkType}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: accent, letterSpacing: "-0.5px" }}>
        ₹{Number(plan.price).toFixed(0)}<span style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af" }}>/plan</span>
      </div>
      <div style={{ height: 1, background: "#f3f4f6", margin: "14px 0" }} />
      {[
        [<FiWifi size={12} />,          plan.dataLimit    || "—", "Data"],
        [<FiPhone size={12} />,         plan.callMinutes  || "—", "Calls"],
        [<FiMessageSquare size={12} />, plan.smsLimit     || "—", "SMS"],
        [<FiCalendar size={12} />,      `${plan.validityDays || "—"} days`, "Validity"],
      ].map(([icon, val, label], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <span style={{ color: accent }}>{icon}</span>
          <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{val}</span>
          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>{label}</span>
        </div>
      ))}
      <button style={{ marginTop: 14, width: "100%", padding: "9px 0", borderRadius: 10, background: rank === 0 ? `linear-gradient(135deg,${accent},${accent}bb)` : "#f9fafb", color: rank === 0 ? "white" : "#374151", border: rank === 0 ? "none" : "1px solid #e5e7eb", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
        {rank === 0 ? "Recharge Now" : "Select Plan"}
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
function UserDashboard({ onLogout }) {
  const [tab, setTab]                         = useState("dashboard");
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const [showNotifPanel, setShowNotifPanel]   = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } })();
  const userName   = storedUser.username || storedUser.name || "User";

  const [userMobile, setUserMobile] = useState(
    storedUser.mobileNumber || storedUser.mobile || storedUser.mobile_number ||
    storedUser.phoneNumber  || storedUser.phone  || ""
  );
  const [mobile, setMobile] = useState(
    storedUser.mobileNumber || storedUser.mobile || storedUser.mobile_number ||
    storedUser.phoneNumber  || storedUser.phone  || ""
  );

  // ── Plans ──────────────────────────────────────────────────────────────────
  const [allPlans,    setAllPlans]    = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [recPlans,    setRecPlans]    = useState([]);
  const [recLoading,  setRecLoading]  = useState(false);
  const [recError,    setRecError]    = useState("");
  const [recFetched,  setRecFetched]  = useState(false);
  const [compareView, setCompareView] = useState("recommendations"); // "recommendations" or "all-plans"

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [readIds,       setReadIds]       = useState(new Set());

  // ── Plan detail modal ─────────────────────────────────────────────────────
  const [selectedPlan, setSelectedPlan] = useState(null);

  // ── Analytics state ───────────────────────────────────────────────────────
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [totalComplaints,  setTotalComplaints]  = useState(null);   // int   from /complaints/{id}
  const [usageHistory,     setUsageHistory]     = useState([]);     // array from /history/{id}

  // ── Load ALL plans on mount ───────────────────────────────────────────────
  useEffect(() => {
    const fetchAllPlans = async () => {
      try {
        const plans = await getPlans();
        if (Array.isArray(plans) && plans.length > 0) {
          setAllPlans(plans);
        }
      } catch (err) {
        console.warn("Plan fetch failed:", err);
      }
    };
    fetchAllPlans();
  }, []);

  // ── Fetch user profile to get mobile + userId ─────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.userId) return;
        const res = await fetch(`${USER_SERVICE_URL}/users/${user.userId}`);
        if (!res.ok) return;
        const data = await res.json();
        const mob = data.mobileNumber || data.mobile || data.mobile_number || data.phoneNumber || data.phone || "";
        if (mob) { setUserMobile(mob); setMobile(prev => prev || mob); }
      } catch (e) { console.log("Profile fetch:", e); }
    };
    fetchProfile();
  }, []);

  // ── Load notifications ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;
        const res = await fetch(`${USER_SERVICE_URL}/notifications/user/${user.userId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const hasWelcome = data.some(n =>
            (n.type || "").toUpperCase() === "WELCOME" ||
            (n.title || "").toLowerCase().includes("welcome")
          );
          const storedU = (() => { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } })();
          const displayName = storedU.username || storedU.name || "User";
          const welcomeNotif = hasWelcome ? [] : [{
            id: "local-welcome", type: "WELCOME",
            title: "Welcome back, " + displayName + "! 👋",
            message: "Great to see you again. Your personalized plan recommendations are ready below.",
            createdAt: new Date().toISOString(),
          }];
          setNotifications([...welcomeNotif, ...data]);
        }
      } catch (e) { console.log(e); }
    };
    fetchNotifs();
  }, []);

  // ── Fetch analytics when user switches to Analytics tab ───────────────────
  useEffect(() => {
    if (tab !== "analytics") return;
    const fetchAnalytics = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.userId) return;
        const uid = user.userId;
        setAnalyticsLoading(true);

        const [avgRes, callsRes, smsRes, complaintsRes, histRes] = await Promise.all([
          fetch(`${ANALYTICS_SERVICE_URL}/average/${uid}`),
          fetch(`${ANALYTICS_SERVICE_URL}/calls/${uid}`),
          fetch(`${ANALYTICS_SERVICE_URL}/sms/${uid}`),
          fetch(`${ANALYTICS_SERVICE_URL}/complaints/${uid}`),
          fetch(`${ANALYTICS_SERVICE_URL}/history/${uid}`),
        ]);

        if (complaintsRes.ok) setTotalComplaints(await complaintsRes.json());
        if (histRes.ok) {
          const hist = await histRes.json();
          if (Array.isArray(hist)) setUsageHistory(hist);
        }
      } catch (e) {
        console.warn("Analytics fetch failed:", e);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, [tab]);

  const markAsRead    = (id) => setReadIds(prev => new Set([...prev, id]));
  const markAllAsRead = ()   => setReadIds(new Set(notifications.map(n => n.id)));
  const unreadCount   = notifications.filter(n => !readIds.has(n.id)).length;

  // ── Get Recommendations ───────────────────────────────────────────────────
  const handleGetRecommendations = async () => {
    const num = mobile.trim();
    if (!num) { setRecError("Please enter a mobile number first."); return; }
    setRecError(""); setRecLoading(true); setRecFetched(false); setRecPlans([]); setCurrentPlan(null);
    try {
      const userRes = await fetch(`${USER_SERVICE_URL}/users/mobile/${num}`);
      if (userRes.status === 404) throw new Error(`No user found for mobile number ${num}.`);
      if (!userRes.ok)            throw new Error(`User Service error (${userRes.status}).`);
      const userData = await userRes.json();

      const enrolledPlanId = userData.currentPlanId;
      let plansToSearch = allPlans;
      if (plansToSearch.length === 0) {
        try {
          const plansRes   = await fetch(PLAN_SERVICE_URL);
          const freshPlans = await plansRes.json();
          if (Array.isArray(freshPlans) && freshPlans.length > 0) { setAllPlans(freshPlans); plansToSearch = freshPlans; }
        } catch (e) { console.warn("Could not fetch plans:", e); }
      }
      const enrolledPlan = enrolledPlanId
        ? plansToSearch.find(p => String(p.planId) === String(enrolledPlanId)) || null
        : null;

      if (!enrolledPlan && userData.currentPlanName) {
        setCurrentPlan({ planId: enrolledPlanId, planName: userData.currentPlanName, planType: userData.currentPlanName, price: "—", dataLimit: "—", callMinutes: "—", smsLimit: "—", validityDays: "—", networkType: "—" });
      } else {
        setCurrentPlan(enrolledPlan);
      }

      const recRes  = await fetch(`http://localhost:8084/recommend/mobile/${num}`);
      if (!recRes.ok) throw new Error(`Recommendation Service error (${recRes.status}).`);
      const recData = await recRes.json();
      const topRecs = Array.isArray(recData) ? recData.slice(0, 3) : [];
      if (topRecs.length === 0) throw new Error("No recommendations returned.");
      setRecPlans(topRecs);
    } catch (err) {
      console.error(err);
      setRecError(err.message || "Could not reach services.");
    } finally {
      setRecLoading(false); setRecFetched(true);
    }
  };

  const handleLogout = () => { logout(); if (onLogout) onLogout(); };

  const tabs = [
    { key: "dashboard", label: "Recommendations", icon: <FiTarget size={18} />    },
    { key: "compare",   label: "Plans",   icon: <FiBarChart2 size={18} /> },
    { key: "analytics", label: "Analytics",       icon: <FiTrendingUp size={18} />},
  ];

  const comparePlans = recFetched && recPlans.length > 0
    ? [
        currentPlan ? { label: "Current Plan", plan: currentPlan, tag: "📋" } : null,
        recPlans[0] ? { label: "Top Pick",     plan: recPlans[0], tag: "⭐" } : null,
        recPlans[1] ? { label: "2nd Choice",   plan: recPlans[1], tag: "2nd" } : null,
        recPlans[2] ? { label: "3rd Choice",   plan: recPlans[2], tag: "3rd" } : null,
      ].filter(Boolean)
    : [];



  // ── Derived analytics values ──────────────────────────────────────────────
  // Single record — pull values directly from the one history row
  const latestRecord  = usageHistory.length > 0 ? usageHistory[0] : null;
  const latestData    = latestRecord?.dataUsedGb      || 0;
  const latestCalls   = latestRecord?.callMinutesUsed || 0;
  const latestSms     = latestRecord?.smsUsed         || 0;

  /* ─── RENDER ─── */
  return (
    <div style={s.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ══ SIDEBAR ══ */}
      <div style={{ ...s.sidebar, width: sidebarOpen ? "230px" : "72px" }}>
        <div>
          <div style={{ ...s.sidebarTop, justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            <div style={s.logoIcon}>📶</div>
            {sidebarOpen && (
              <div>
                <div style={s.sidebarLogo}>Telecom User</div>
                <div style={s.sidebarSubtext}>Smart Recharge Portal</div>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={s.menuToggleBtn}>
            {sidebarOpen ? "← Collapse" : "→"}
          </button>
          <div style={s.sidebarMenu}>
            {tabs.map(item => {
              const active = tab === item.key;
              return (
                <div key={item.key} onClick={() => setTab(item.key)}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#eff6ff"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  style={{ ...s.sidebarItem, justifyContent: sidebarOpen ? "flex-start" : "center", background: active ? "linear-gradient(135deg,#06b6d4,#0891b2)" : "transparent", color: active ? "white" : "#475569" }}>
                  <span>{item.icon}</span>
                  {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div />
      </div>

      {/* ══ MAIN ══ */}
      <div style={{ ...s.mainSection, marginLeft: sidebarOpen ? "230px" : "72px" }}>

        {/* Topbar */}
        <div style={s.topbar}>
          <div>
            <h2 style={s.topbarTitle}>Telecom Recommendation Portal</h2>
            <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 500 }}>Personalized recharge plans and analytics</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
            <div onClick={() => { setShowNotifPanel(!showNotifPanel); setShowProfileMenu(false); }}
              style={{ width: 40, height: 40, borderRadius: 12, background: "white", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <FiBell size={18} color="#374151" />
              {unreadCount > 0 && (
                <div style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                  {unreadCount}
                </div>
              )}
            </div>
            <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifPanel(false); }}
              style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#06b6d4,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>
              {userName.charAt(0).toUpperCase()}
            </button>

            {showProfileMenu && (
              <div style={{ position: "absolute", top: 50, right: 0, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.12)", zIndex: 1000, minWidth: 220 }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{userName}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <FiPhone size={11} />{userMobile || "Mobile not available"}
                  </div>
                </div>
                <button onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <FiLogOut size={16} /> Logout
                </button>
              </div>
            )}

            {showNotifPanel && (
              <div style={{ position: "absolute", top: 54, right: 0, width: 380, maxHeight: 500, overflowY: "auto", background: "white", border: "1px solid #e5e7eb", borderRadius: 16, boxShadow: "0 16px 40px rgba(0,0,0,0.12)", zIndex: 1000, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
                    Notifications
                    {unreadCount > 0 && <span style={{ marginLeft: 8, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{unreadCount} unread</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} style={{ fontSize: 11, fontWeight: 700, color: "#0891b2", background: "#e0f2fe", border: "1px solid #7dd3fc", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                      Mark all as read
                    </button>
                  )}
                </div>
                {notifications.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13 }}>No notifications yet.</div>}
                {notifications.map((n, i) => {
                  const isRead = readIds.has(n.id);
                  const ns = notifStyle(n.type || "offer");
                  return (
                    <div key={n.id || i} style={{ padding: "12px 14px", borderRadius: 12, background: isRead ? "#f9fafb" : ns.bg, border: `1px solid ${isRead ? "#e5e7eb" : ns.border}`, marginBottom: 10, opacity: isRead ? 0.6 : 1, transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isRead ? "#9ca3af" : "#111827", display: "flex", alignItems: "center", gap: 6 }}>
                          {!isRead && <span style={{ width: 7, height: 7, borderRadius: "50%", background: ns.dot, display: "inline-block", flexShrink: 0 }} />}
                          {n.title || n.subject || "Notification"}
                        </div>
                        {!isRead && <button onClick={() => markAsRead(n.id)} style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", background: "white", border: "1px solid #e5e7eb", padding: "2px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0 }}>Mark read</button>}
                        {isRead && <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 8 }}>Read</span>}
                      </div>
                      <div style={{ fontSize: 12, color: isRead ? "#9ca3af" : "#6b7280", lineHeight: 1.6 }}>{n.message || n.body || ""}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ CONTENT ══ */}
        <div style={s.content}>

          {/* ════ RECOMMENDATIONS TAB ════ */}
          {tab === "dashboard" && (
            <div>
              <div style={s.tabHeader}>
                <h2 style={s.tabTitle}><FiTarget style={{ display: "inline", marginRight: 8 }} />Recommendations</h2>
                <p style={s.tabSub}>Your personalized telecom plan suggestions powered by AI</p>
              </div>
              <div style={{ ...s.tableCard, marginBottom: 24, padding: "18px 22px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Get Personalized Recommendations</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>Enter your mobile number to get your top plan + 2 alternative recommendations.</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <input value={mobile} onChange={e => { setMobile(e.target.value); setRecError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleGetRecommendations()} placeholder="e.g. 9876543210"
                    style={{ flex: 1, minWidth: 200, padding: "10px 14px", borderRadius: 10, border: `1px solid ${recError ? "#fca5a5" : "#e5e7eb"}`, fontSize: 14, fontFamily: "inherit", color: "#374151", outline: "none" }} />
                  <button onClick={handleGetRecommendations} disabled={recLoading}
                    style={{ padding: "10px 24px", borderRadius: 10, background: recLoading ? "#e0f2fe" : "linear-gradient(135deg,#06b6d4,#0891b2)", color: recLoading ? "#0891b2" : "white", border: "none", fontWeight: 700, fontSize: 13, cursor: recLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    <FiRefreshCw size={14} style={{ animation: recLoading ? "spin 1s linear infinite" : "none" }} />
                    {recLoading ? "Fetching..." : "Get Recommendations"}
                  </button>
                </div>
                {recError && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", fontSize: 12, fontWeight: 500 }}>
                    ⚠ {recError}
                    <div style={{ marginTop: 4, fontSize: 11, color: "#9ca3af" }}>Make sure User Service is running on <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: 4 }}>{USER_SERVICE_URL}</code></div>
                  </div>
                )}
                {recFetched && !recError && recPlans.length > 0 && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: 12, fontWeight: 600 }}>
                    ✓ Showing top pick + {recPlans.length - 1} alternatives for {mobile}
                    {currentPlan && <span style={{ marginLeft: 8, color: "#0891b2" }}>· Current plan: <b>{currentPlan.planName}</b></span>}
                  </div>
                )}
              </div>
              {!recFetched && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>Enter your mobile number above</div>
                  <div style={{ fontSize: 13 }}>Your top pick and 2 alternative plans will appear here.</div>
                </div>
              )}
              {recFetched && recPlans.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
                    Your Personalized Plans
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, marginLeft: 6 }}>Top pick + 2 alternatives</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 20, marginBottom: 28, alignItems: "start" }}>
                    {recPlans.slice(0, 3).map((plan, idx) => (
                      <PlanCard key={plan.planId || idx} plan={plan} rank={idx} onClick={() => setSelectedPlan(plan)} />
                    ))}
                  </div>
                </>
              )}
              {recFetched && recPlans.length === 0 && !recError && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280" }}>No plans found for this number.</div>
                </div>
              )}
            </div>
          )}

          {/* ════ COMPARE TAB ════ */}
          {tab === "compare" && (
            <div>
              <div style={s.tabHeader}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={s.tabTitle}><FiBarChart2 style={{ display: "inline", marginRight: 8 }} />Plans</h2>
                    <p style={s.tabSub}>{compareView === "all-plans" ? "Browse and compare all available plans" : (recFetched && comparePlans.length > 0 ? "Your current enrolled plan vs AI recommended alternatives" : "Go to Recommendations tab and enter your mobile number first")}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setCompareView("recommendations")}
                      style={{ padding: "8px 16px", borderRadius: 10, background: compareView === "recommendations" ? "linear-gradient(135deg,#06b6d4,#0891b2)" : "#f3f4f6", color: compareView === "recommendations" ? "white" : "#6b7280", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
                      <FiTarget size={14} /> Your Recommendations
                    </button>
                    <button onClick={() => setCompareView("all-plans")}
                      style={{ padding: "8px 16px", borderRadius: 10, background: compareView === "all-plans" ? "linear-gradient(135deg,#06b6d4,#0891b2)" : "#f3f4f6", color: compareView === "all-plans" ? "white" : "#6b7280", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
                      <FiGrid size={14} /> All Plans
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── Recommendations View ─── */}
              {compareView === "recommendations" && (
                <>
                  {(!recFetched || comparePlans.length === 0) && (
                    <div style={{ ...s.tableCard, padding: 48, textAlign: "center" }}>
                      <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 8 }}>No data to compare yet</div>
                      <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>Enter your mobile number in the Recommendations tab first.</div>
                      <button onClick={() => setTab("dashboard")} style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#06b6d4,#0891b2)", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Go to Recommendations →</button>
                    </div>
                  )}
                  {recFetched && comparePlans.length > 0 && (
                    <div style={{ ...s.tableCard, overflow: "auto" }}>
                      <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${comparePlans.length}, 1fr)`, background: "#f9fafb", borderBottom: "1px solid #f3f4f6", minWidth: 600 }}>
                        <div style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Feature</div>
                        {comparePlans.map((c, ci) => {
                          const isCurrentPlan = c.label === "Current Plan";
                          const isTopPick     = c.label === "Top Pick";
                          return (
                            <div key={ci} style={{ padding: "14px 20px", borderLeft: "1px solid #f3f4f6", background: isTopPick ? "linear-gradient(135deg,#06b6d4,#0891b2)" : isCurrentPlan ? "#f0fdf4" : "transparent", position: "relative" }}>
                              {isTopPick     && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "#0e7490", color: "white", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: "0 0 8px 8px", letterSpacing: ".5px", whiteSpace: "nowrap" }}>⭐ AI RECOMMENDED</div>}
                              {isCurrentPlan && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "#16a34a", color: "white", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: "0 0 8px 8px", letterSpacing: ".5px", whiteSpace: "nowrap" }}>📋 YOUR PLAN</div>}
                              <div style={{ fontSize: 10, fontWeight: 700, color: isTopPick ? "rgba(255,255,255,0.75)" : isCurrentPlan ? "#16a34a" : "#9ca3af", textTransform: "uppercase", marginBottom: 4, marginTop: (isTopPick || isCurrentPlan) ? 10 : 0 }}>{c.tag} {c.label}</div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: isTopPick ? "white" : planAccent(c.plan.planType) }}>{c.plan.planName}</div>
                            </div>
                          );
                        })}
                      </div>
                      {[
                        { label: "Price",    icon: "💰", field: p => p.price       !== "—" ? `₹${Number(p.price).toFixed(0)}` : "—" },
                        { label: "Data",     icon: "📡", field: p => p.dataLimit    || "—" },
                        { label: "Calls",    icon: "📞", field: p => p.callMinutes  || "—" },
                        { label: "SMS",      icon: "✉️",  field: p => p.smsLimit     || "—" },
                        { label: "Validity", icon: "📅", field: p => p.validityDays !== "—" ? `${p.validityDays} days` : "—" },
                        { label: "Network",  icon: "🌐", field: p => p.networkType  || "—" },
                        { label: "Type",     icon: "🏷️", field: p => <PlanBadge type={p.planType} /> },
                      ].map((row, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: `180px repeat(${comparePlans.length}, 1fr)`, background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f9fafb", minWidth: 600 }}>
                          <div style={{ padding: "13px 20px", fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", gap: 8 }}><span>{row.icon}</span>{row.label}</div>
                          {comparePlans.map((c, ci) => {
                            const isCurrentPlan = c.label === "Current Plan";
                            const isTopPick     = c.label === "Top Pick";
                            return (
                              <div key={ci} style={{ padding: "13px 20px", fontSize: 13, fontWeight: (isTopPick || isCurrentPlan) ? 800 : 700, color: isTopPick ? "#0e7490" : isCurrentPlan ? "#16a34a" : "#374151", borderLeft: `1px solid ${isTopPick ? "#a5f3fc" : isCurrentPlan ? "#bbf7d0" : "#f3f4f6"}`, background: isTopPick ? "#ecfeff" : isCurrentPlan ? "#f0fdf4" : "transparent", display: "flex", alignItems: "center" }}>
                              {row.field(c.plan)}
                            </div>
                          );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ─── All Plans View ─── */}
              {compareView === "all-plans" && (
                <>
                  {allPlans.length === 0 ? (
                    <div style={{ ...s.tableCard, padding: 48, textAlign: "center" }}>
                      <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 8 }}>No plans available</div>
                      <div style={{ fontSize: 13, color: "#9ca3af" }}>Plans will be loaded from the database.</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Available Plans</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>{allPlans.length} {allPlans.length === 1 ? "plan" : "plans"} available across all networks</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20, marginBottom: 28 }}>
                        {allPlans.map((plan, idx) => (
                          <PlanCard key={plan.planId || idx} plan={plan} rank={3} onClick={() => setSelectedPlan(plan)} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

{/* ════ ANALYTICS TAB ════ */}
{tab === "analytics" && (
  <div>
    <div style={s.tabHeader}>
      <h2 style={s.tabTitle}><FiTrendingUp style={{ display: "inline", marginRight: 8 }} />Analytics</h2>
      <p style={s.tabSub}>Your usage breakdown</p>
    </div>

    {analyticsLoading && (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTop: "3px solid #0891b2", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <div style={{ fontSize: 13 }}>Loading analytics...</div>
      </div>
    )}

    {!analyticsLoading && (
      <>

        {/* ── Usage Breakdown Donuts ── */}
        {latestRecord && (
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Usage Breakdown</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 28 }}>
              How your usage compares to typical plan limits · Last active: {latestRecord.lastActive ? new Date(latestRecord.lastActive).toLocaleDateString() : "—"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

              {/* Data Donut */}
              {(() => {
                const pct = Math.min(100, (latestData / 80) * 100);
                const R = 52, stroke = 10, circ = 2 * Math.PI * R;
                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
                    <div style={{ position: "relative", width: 124, height: 124, marginBottom: 16 }}>
                      <svg width={124} height={124} viewBox="0 0 124 124" style={{ transform: "rotate(-90deg)", display: "block" }}>
                        <circle cx={62} cy={62} r={R} fill="none" stroke="#e0f2fe" strokeWidth={stroke} />
                        <circle cx={62} cy={62} r={R} fill="none" stroke="#0891b2" strokeWidth={stroke}
                          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
                          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                      </svg>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#0891b2", lineHeight: 1 }}>{pct.toFixed(0)}%</div>
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>of 80 GB</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>📡 Data Used</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0891b2" }}>{latestData.toFixed(2)} GB</div>
                    <div style={{ marginTop: 8, padding: "4px 12px", borderRadius: 20, background: pct > 80 ? "#fef2f2" : "#e0f2fe", color: pct > 80 ? "#ef4444" : "#0891b2", fontSize: 11, fontWeight: 700 }}>
                      {pct > 80 ? "⚠ High Usage" : pct > 50 ? "Moderate" : "Low Usage"}
                    </div>
                  </div>
                );
              })()}

              {/* Calls Donut */}
              {(() => {
                const pct = Math.min(100, (latestCalls / 900) * 100);
                const R = 52, stroke = 10, circ = 2 * Math.PI * R;
                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
                    <div style={{ position: "relative", width: 124, height: 124, marginBottom: 16 }}>
                      <svg width={124} height={124} viewBox="0 0 124 124" style={{ transform: "rotate(-90deg)", display: "block" }}>
                        <circle cx={62} cy={62} r={R} fill="none" stroke="#f3e8ff" strokeWidth={stroke} />
                        <circle cx={62} cy={62} r={R} fill="none" stroke="#7c3aed" strokeWidth={stroke}
                          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
                          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                      </svg>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#7c3aed", lineHeight: 1 }}>{pct.toFixed(0)}%</div>
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>of 900 min</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>📞 Call Minutes</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#7c3aed" }}>{latestCalls} min</div>
                    <div style={{ marginTop: 8, padding: "4px 12px", borderRadius: 20, background: pct > 80 ? "#fef2f2" : "#f3e8ff", color: pct > 80 ? "#ef4444" : "#7c3aed", fontSize: 11, fontWeight: 700 }}>
                      {pct > 80 ? "⚠ High Usage" : pct > 50 ? "Moderate" : "Low Usage"}
                    </div>
                  </div>
                );
              })()}

              {/* SMS Donut */}
              {(() => {
                const pct = Math.min(100, (latestSms / 200) * 100);
                const R = 52, stroke = 10, circ = 2 * Math.PI * R;
                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
                    <div style={{ position: "relative", width: 124, height: 124, marginBottom: 16 }}>
                      <svg width={124} height={124} viewBox="0 0 124 124" style={{ transform: "rotate(-90deg)", display: "block" }}>
                        <circle cx={62} cy={62} r={R} fill="none" stroke="#dcfce7" strokeWidth={stroke} />
                        <circle cx={62} cy={62} r={R} fill="none" stroke="#16a34a" strokeWidth={stroke}
                          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
                          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                      </svg>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#16a34a", lineHeight: 1 }}>{pct.toFixed(0)}%</div>
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>of 200 SMS</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>✉️ SMS Used</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#16a34a" }}>{latestSms}</div>
                    <div style={{ marginTop: 8, padding: "4px 12px", borderRadius: 20, background: pct > 80 ? "#fef2f2" : "#dcfce7", color: pct > 80 ? "#ef4444" : "#16a34a", fontSize: 11, fontWeight: 700 }}>
                      {pct > 80 ? "⚠ High Usage" : pct > 50 ? "Moderate" : "Low Usage"}
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        )}

        {/* ── Complaints Card ── */}
        {latestRecord && (
          <div style={{ background: totalComplaints > 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${totalComplaints > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 16, padding: "20px 28px", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: totalComplaints > 0 ? "#fee2e2" : "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FiAlertCircle size={24} color={totalComplaints > 0 ? "#ef4444" : "#16a34a"} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: totalComplaints > 0 ? "#ef4444" : "#16a34a", marginBottom: 4 }}>
                {totalComplaints > 0 ? `${totalComplaints} Complaint${totalComplaints > 1 ? "s" : ""} Raised` : "No Complaints"}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {totalComplaints > 0
                  ? "Our team will review and get back to you shortly."
                  : "Great! You have no complaints on record for this period."}
              </div>
            </div>
            {latestRecord.lastActive && (
              <div style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 600, color: "#374151" }}>Last Active</div>
                <div>{new Date(latestRecord.lastActive).toLocaleDateString()}</div>
              </div>
            )}
          </div>
        )}

        {!latestRecord && !analyticsLoading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280" }}>No usage data available.</div>
          </div>
        )}
      </>
    )}
  </div>
)}
        </div>
      </div>

      {/* ══ PLAN DETAIL MODAL ══ */}
      {selectedPlan && (() => {
        const p     = selectedPlan;
        const color = planAccent(p.planType);
        return (
          <div style={s.modalOverlay} onClick={() => setSelectedPlan(null)}>
            <div style={{ ...s.aiModal, maxWidth: 480, padding: 0, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
              <div style={{ background: `linear-gradient(135deg,${color}18,${color}06)`, borderBottom: `3px solid ${color}30`, padding: "22px 26px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <PlanBadge type={p.planType || "Prepaid"} />
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#111827", marginTop: 8 }}>{p.planName}</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color, marginTop: 4, letterSpacing: "-1px" }}>
                      ₹{Number(p.price).toFixed(0)}<span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>/plan</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPlan(null)} style={{ border: "1px solid #e5e7eb", background: "white", padding: "8px 10px", borderRadius: 10, cursor: "pointer", fontSize: 15, color: "#6b7280" }}>✕</button>
                </div>
              </div>
              <div style={{ padding: "22px 26px 24px" }}>
                {[
                  ["📡 Data",     p.dataLimit   || "—"],
                  ["📞 Calls",    p.callMinutes || "—"],
                  ["✉️ SMS",      p.smsLimit    || "—"],
                  ["📅 Validity", `${p.validityDays || "—"} days`],
                  ["🌐 Network",  p.networkType || "—"],
                ].map(([label, val], i, arr) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{val}</span>
                  </div>
                ))}
                <button style={{ marginTop: 20, width: "100%", padding: "13px 0", borderRadius: 12, background: `linear-gradient(135deg,${color},${color}bb)`, color: "white", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Recharge Now <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const s = {
  container:     { minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", background: "#fafbfc" },
  sidebar:       { minHeight: "100vh", position: "fixed", left: 0, top: 0, padding: "24px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box", transition: "all 0.3s ease", height: "100vh", overflowY: "auto", background: "#ffffff", borderRight: "1px solid #e8eaed", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", zIndex: 100 },
  mainSection:   { minHeight: "100vh", background: "#fafbfc", transition: "all 0.3s ease" },
  sidebarTop:    { display: "flex", alignItems: "center", gap: 14, marginBottom: 20 },
  logoIcon:      { width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#06b6d4,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: "0 4px 16px rgba(6,182,212,0.25)" },
  sidebarLogo:   { color: "#111827", fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px" },
  sidebarSubtext:{ color: "#8b92a1", fontSize: 11, marginTop: 3, fontWeight: 500 },
  menuToggleBtn: { width: "100%", border: "1.5px solid #e8eaed", background: "#f8f9fb", color: "#6b7280", padding: "10px 12px", borderRadius: 9, cursor: "pointer", fontWeight: 700, marginBottom: 18, fontFamily: "inherit", fontSize: 12 },
  sidebarMenu:   { display: "flex", flexDirection: "column", gap: 3 },
  sidebarItem:   { display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 11, cursor: "pointer", fontWeight: 600, transition: "all 0.2s ease", fontSize: 13 },
  topbar:        { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "#ffffff", borderBottom: "1px solid #e8eaed", position: "sticky", top: 0, zIndex: 99, boxSizing: "border-box", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  topbarTitle:   { color: "#111827", fontSize: 22, fontWeight: 800, marginBottom: 2, letterSpacing: "-0.5px" },
  content:       { padding: "28px 32px", maxWidth: 1680, margin: "0 auto" },
  tabHeader:     { marginBottom: 24, paddingBottom: 20, borderBottom: "1.5px solid #e8eaed" },
  tabTitle:      { fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 6, letterSpacing: "-0.5px" },
  tabSub:        { color: "#6b7280", fontSize: 14, fontWeight: 500 },
  kpiCard:       { background: "white", border: "1.5px solid #e8eaed", borderRadius: 14, borderTop: "3px solid", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)" },
  chartCard:     { background: "white", border: "1.5px solid #e8eaed", borderRadius: 14, padding: "24px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  chartTitle:    { color: "#111827", fontSize: 15, fontWeight: 700, marginBottom: 18 },
  tableCard:     { background: "white", border: "1.5px solid #e8eaed", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  tableToolbar:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 26px", borderBottom: "1.5px solid #f0f1f4" },
  tableHeader:   { display: "grid", padding: "14px 26px", background: "#f8f9fc", fontSize: 11, fontWeight: 700, color: "#8b92a1", textTransform: "uppercase", letterSpacing: ".7px", borderBottom: "1.5px solid #e8eaed" },
  tableRow:      { display: "grid", padding: "16px 26px", alignItems: "center", fontSize: 13, color: "#374151", transition: "background .12s" },
  tableLabel:    { fontWeight: 600, color: "#111827", fontSize: 14 },
  recordBadge:   { marginLeft: 10, background: "#e0f2fe", color: "#0891b2", border: "1.5px solid #7dd3fc", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  modalOverlay:  { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(8px)" },
  aiModal:       { width: "92%", maxWidth: 880, maxHeight: "88vh", overflowY: "auto", background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1.5px solid #e8eaed" },
};

export default UserDashboard;