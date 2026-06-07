import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import Onboarding from "./Onboarding";
import { FiBell, FiTrendingUp, FiTarget, FiAlertCircle, FiBarChart2, FiLogOut, FiUser, FiClipboard, FiUsers, FiChevronRight, FiWifi, FiPhone, FiMessageSquare, FiZapOff } from "react-icons/fi";
import { hover } from "@testing-library/user-event/dist/hover";

/* ─── Multi-signal churn reason engine ─── */
const getChurnReason = (u) => {
  const score   = parseFloat(u.churn_score || 0);
  const eng     = parseFloat(u.engagement_score || 0);
  const anomaly = u.anomaly_flag === 1;
  const usage   = u.usage_level || "";
  const seg     = u.segment || "";

  // High risk combos
  if (score > 0.7 && anomaly && eng < 0.3)
    return { label: "Disengaged + Anomaly", color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" };
  if (score > 0.7 && usage === "Extreme Usage")
    return { label: "Plan Mismatch", color: "#ea580c", bg: "#fff7ed", border: "#fdba74" };
  if (score > 0.7 && seg === "Inactive Users")
    return { label: "Inactive — Lapsing", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" };
  if (score > 0.7 && eng < 0.4)
    return { label: "Low Engagement", color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  if (score > 0.7)
    return { label: "High Churn Risk", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" };

  // Medium risk combos
  if (score > 0.4 && anomaly)
    return { label: "Unusual Activity", color: "#9333ea", bg: "#faf5ff", border: "#d8b4fe" };
  if (score > 0.4 && eng < 0.3)
    return { label: "Fading Interest", color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
  if (score > 0.4 && usage === "Extreme Usage")
    return { label: "Overloaded Plan", color: "#0891b2", bg: "#e0f2fe", border: "#7dd3fc" };
  if (score > 0.4 && seg === "Casual Users")
    return { label: "Low Loyalty", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" };
  if (score > 0.4)
    return { label: "Moderate Risk", color: "#ca8a04", bg: "#fefce8", border: "#fde047" };

  // Low risk
  if (eng > 0.7 && seg === "Heavy Users")
    return { label: "Loyal Customer", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
  if (seg === "Heavy Users")
    return { label: "Price Sensitivity", color: "#0891b2", bg: "#e0f2fe", border: "#7dd3fc" };
  return { label: "Stable Customer", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
};

/* ─── AI Recommendation reason engine ─── */
const getRecommendationReason = (u) => {
  const score   = parseFloat(u.churn_score || 0);
  const eng     = parseFloat(u.engagement_score || 0);
  const anomaly = u.anomaly_flag === 1;
  const usage   = u.usage_level || "";
  const seg     = u.segment || "";
  const plan    = u.recommended_plan || "";

  if (usage === "Extreme Usage" && score > 0.7)
    return { label: "Urgent Upgrade", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" };
  if (usage === "Extreme Usage")
    return { label: "Plan Upgrade Needed", color: "#ea580c", bg: "#fff7ed", border: "#fdba74" };
  if (usage === "Very High Usage" && seg === "Heavy Users")
    return { label: "Premium Match", color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" };
  if (usage === "Very High Usage")
    return { label: "Plan Optimization", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" };
  if (anomaly && score > 0.5)
    return { label: "Anomaly-Driven Review", color: "#9333ea", bg: "#faf5ff", border: "#d8b4fe" };
  if (score > 0.6 && eng < 0.4)
    return { label: "Retention Incentive Plan", color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  if (seg === "Inactive Users")
    return { label: "Downgrade to Retain", color: "#0891b2", bg: "#e0f2fe", border: "#7dd3fc" };
  if (seg === "Casual Users" && usage === "Normal Usage")
    return { label: "Flexible Plan Fit", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" };
  if (eng > 0.7 && seg === "Heavy Users")
    return { label: "Loyalty Reward Plan", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
  if (usage === "Normal Usage" && score < 0.4)
    return { label: "Cost Savings Plan", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
  return { label: "AI Optimized Plan", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" };
};

/* ─── Human-readable explanations for each recommendation reason ─── */
const RECOMMENDATION_REASON_DETAILS = {
  "Urgent Upgrade": {
    icon: "🚨",
    what: "This user is hitting extreme usage limits AND has a high churn risk — a dangerous combination that means their current plan is failing them on multiple levels.",
    why: "When a customer both overuses their plan and is close to churning, the plan itself is likely a root cause. Overage frustration accelerates the departure decision.",
    action: "Immediately offer a higher-tier plan with a limited-time discount. Frame it as a cost-saving move vs. paying overages. Escalate to a retention specialist.",
  },
  "Plan Upgrade Needed": {
    icon: "📦",
    what: "The user consistently uses data, calls, or SMS at extreme levels that exceed what their current plan covers.",
    why: "Customers hitting plan ceilings regularly experience throttling or overage fees. This directly correlates with dissatisfaction and eventual switching.",
    action: "Proactively recommend the next tier up. Show a side-by-side comparison of current vs. upgraded plan costs including overages to make the value clear.",
  },
  "Premium Match": {
    icon: "⭐",
    what: "This user is a heavy, engaged user whose usage profile aligns perfectly with a premium plan's feature set.",
    why: "Heavy users who are already loyal benefit most from premium plans. Matching their actual usage to the right plan increases satisfaction and reduces churn risk.",
    action: "Offer a premium plan with personalized perks — priority service, extra data, or a loyalty bonus. Position it as an upgrade they've earned.",
  },
  "Plan Optimization": {
    icon: "⚡",
    what: "The user has very high usage but isn't quite at extreme levels. A mid-tier or optimized plan would match their actual consumption more efficiently.",
    why: "Users on mismatched plans — either too restrictive or unnecessarily expensive — are more likely to shop around. The right plan reduces friction.",
    action: "Recommend a plan tier that closely matches their usage pattern. Highlight the savings vs. overage costs and the benefits of a better-matched plan.",
  },
  "Anomaly-Driven Review": {
    icon: "🔍",
    what: "Unusual activity has been detected in this user's usage combined with a moderate-to-high churn score, suggesting their current plan no longer fits their behavior.",
    why: "Behavioral anomalies often mean a customer's needs have changed. They may have found a workaround, a competitor, or have an unresolved service issue.",
    action: "Review the anomaly in detail. Reach out to understand what changed and offer a plan that better suits their new usage pattern before they switch.",
  },
  "Retention Incentive Plan": {
    icon: "🎁",
    what: "This user shows both high churn risk and low engagement — the AI recommends a specific plan tied to a retention incentive to win back their attention.",
    why: "High-risk, low-engagement users respond best to tangible value: a plan with extra perks, a discount, or a bonus feature gives them a reason to stay.",
    action: "Bundle the recommended plan with a short-term incentive — free data for a month, waived activation fee, or a loyalty discount. Make staying feel rewarding.",
  },
  "Downgrade to Retain": {
    icon: "💤",
    what: "This user is in the inactive segment — they barely use their current plan. A lighter, cheaper plan reduces their cost and removes a reason to cancel.",
    why: "Inactive users often cancel because they feel they're paying for a plan they don't use. A downgrade offer shows the provider is looking out for their interests.",
    action: "Proactively offer a plan downgrade before the customer asks. Framing it as 'right-sizing' builds goodwill and keeps the customer on the books.",
  },
  "Flexible Plan Fit": {
    icon: "🔄",
    what: "This casual user with normal usage would benefit most from a flexible or prepaid-style plan that matches their light, inconsistent usage patterns.",
    why: "Casual users don't want to pay for features they rarely use. A flexible plan reduces resentment and increases the perceived value of staying.",
    action: "Recommend a flexible or pay-as-you-go style plan. Emphasize control and no wasted spend. This keeps casual users engaged without overpaying.",
  },
  "Loyalty Reward Plan": {
    icon: "🏆",
    what: "This is a highly engaged heavy user with a low churn risk. The AI recommends a loyalty-tier plan to recognize and reward their long-term value.",
    why: "Loyal high-usage customers are your most valuable segment. Rewarding them with a better plan deepens their commitment and turns them into brand advocates.",
    action: "Offer a loyalty plan with exclusive perks — higher data caps, priority support, or early feature access. Acknowledge them as a premium customer.",
  },
  "Cost Savings Plan": {
    icon: "💰",
    what: "This user has normal usage and a low churn score. The AI identifies an opportunity to recommend a more cost-effective plan that still meets their needs.",
    why: "Even satisfied customers appreciate knowing they're on the best-value plan. A proactive savings offer builds trust and preempts competitor price comparisons.",
    action: "Show the user they could save money on a slightly lower tier without losing meaningful features. Proactive transparency is a strong loyalty signal.",
  },
  "AI Optimized Plan": {
    icon: "🤖",
    what: "Based on a holistic analysis of this user's usage, engagement, churn risk, and segment classification, the AI has selected the most suitable plan available.",
    why: "Multiple moderate signals — none extreme on their own — combine to point toward this plan as the best overall fit for the user's current profile.",
    action: "Present the recommended plan with a clear explanation of why it was selected. Offer a no-commitment trial or easy switch to reduce friction.",
  },
};

const AIRecommendationCard = ({ reason }) => {
  const details = RECOMMENDATION_REASON_DETAILS[reason?.label] || {
    icon: "🤖",
    what: "Plan recommended based on AI analysis of usage, engagement, and behavioral patterns.",
    why: "Multiple data signals contribute to this plan recommendation.",
    action: "Present the recommended plan and explain its benefits relative to the user's current plan.",
  };
  return (
    <div style={{ border: `1.5px solid ${reason?.border || "#c7d2fe"}`, borderRadius: 12, overflow: "hidden", marginTop: 14 }}>
      <div style={{ background: reason?.bg || "#eef2ff", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${reason?.border || "#c7d2fe"}` }}>
        <span style={{ fontSize: 16 }}>{details.icon}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>AI Recommendation Reason</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: reason?.color || "#4f46e5" }}>{reason?.label || "AI Optimized Plan"}</span>
        </div>
      </div>
      <div style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, background: "white" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 3 }}>📌 Means</div>
          <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.6 }}>{details.what}</div>
        </div>
        <div style={{ borderLeft: "1px solid #f3f4f6", paddingLeft: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 3 }}>🔎 Why</div>
          <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.6 }}>{details.why}</div>
        </div>
        <div style={{ background: reason?.bg || "#eef2ff", border: `1px solid ${reason?.border || "#c7d2fe"}`, borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: reason?.color || "#4f46e5", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 3 }}>💡 Action</div>
          <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.6 }}>{details.action}</div>
        </div>
      </div>
    </div>
  );
};

/* ─── Human-readable explanations for each churn reason ─── */
const CHURN_REASON_DETAILS = {
  "Disengaged + Anomaly": {
    icon: "⚠️",
    what: "This user has very low engagement with the service AND unusual usage patterns have been detected — a dangerous combination that strongly predicts cancellation.",
    why: "Users who stop actively using a service but show sudden spikes or drops in activity are often testing alternatives or winding down before leaving.",
    action: "Reach out immediately with a personalized retention offer. Investigate the anomaly — it may indicate a complaint, billing issue, or competitor trial.",
  },
  "Plan Mismatch": {
    icon: "📦",
    what: "The user's current plan doesn't match their actual usage. They are consuming significantly more data or calls than their plan allows.",
    why: "Customers who consistently hit plan limits get frustrated with overage charges or throttling and tend to switch to a provider that better fits their needs.",
    action: "Proactively recommend an upgrade. Offer a limited-time discount on a higher-tier plan before they churn out of frustration.",
  },
  "Inactive — Lapsing": {
    icon: "💤",
    what: "This user has been classified in the 'Inactive Users' segment, meaning they rarely use their plan features — calls, data, and SMS activity are all low.",
    why: "Inactive users often keep a plan out of habit but are at high risk of canceling when they next review their expenses or receive a better offer.",
    action: "Send a re-engagement campaign highlighting unused features. Consider a plan downgrade option to retain them at a lower price point.",
  },
  "Low Engagement": {
    icon: "📉",
    what: "The user has a high churn score but low engagement — they are not actively interacting with apps, services, or support channels.",
    why: "Low engagement is one of the strongest signals of an impending cancellation. The customer has mentally already left.",
    action: "Trigger a win-back workflow: personalized SMS/email, loyalty reward, or a free data bonus to re-spark interest.",
  },
  "High Churn Risk": {
    icon: "🚨",
    what: "Our AI model has assigned this user a churn probability above 70%, meaning there is a very high chance they will cancel within the next billing cycle.",
    why: "Multiple risk factors are contributing to this score — usage trends, billing patterns, and behavioral signals all point toward imminent departure.",
    action: "Prioritize this user for direct outreach from a retention specialist. Offer contract incentives or plan perks to keep them.",
  },
  "Unusual Activity": {
    icon: "🔍",
    what: "The system detected an anomaly in this user's behavior — their usage pattern has changed significantly from their historical baseline.",
    why: "Sudden changes in how a customer uses their service (big drop in calls, spike in data, or complete inactivity) are early warning signs of churn.",
    action: "Investigate the anomaly. Check if there's an unresolved complaint or service issue. A proactive support call can prevent escalation.",
  },
  "Fading Interest": {
    icon: "🌅",
    what: "This user's engagement is declining over time. They are using the service less and less, suggesting they are losing interest or value in the plan.",
    why: "Gradual disengagement is harder to spot than sudden inactivity but is equally dangerous. These users drift away slowly unless something re-engages them.",
    action: "Send personalized content about new features or offers. A small usage reward (e.g., bonus data) can reset engagement levels.",
  },
  "Overloaded Plan": {
    icon: "⚡",
    what: "This user is on a plan that doesn't meet their usage needs — they consume data or minutes at an 'Extreme Usage' level relative to their plan tier.",
    why: "When customers feel constrained by their plan limits, they look for alternatives that give them more freedom. Overage fees accelerate this decision.",
    action: "Offer a seamless upgrade path. Show them how much they'd save on overages with a higher plan, framed as a cost benefit.",
  },
  "Low Loyalty": {
    icon: "🔄",
    what: "This user falls in the 'Casual Users' segment with a moderate churn score — they use the service lightly and haven't developed strong loyalty to the brand.",
    why: "Casual users with no strong attachment are quick to switch when a competitor offers a better deal or promotion.",
    action: "Build loyalty through a rewards program, long-term contract discount, or bundled services to increase switching costs.",
  },
  "Moderate Risk": {
    icon: "⚖️",
    what: "This user has a moderate churn probability (between 40–70%). They are not an immediate concern but need monitoring as their risk could escalate.",
    why: "Medium-risk users are often on the fence — a single bad experience (billing issue, service outage, competitor offer) can push them to high risk.",
    action: "Monitor closely and include in regular retention campaigns. No urgent action needed, but don't ignore them.",
  },
  "Loyal Customer": {
    icon: "⭐",
    what: "This user is a high-value, highly engaged customer who uses the service heavily and shows strong loyalty signals.",
    why: "High usage combined with low churn probability indicates they find real value in the service and are unlikely to leave.",
    action: "Reward their loyalty. Offer early access to new features, a loyalty discount on renewal, or a thank-you benefit to deepen the relationship.",
  },
  "Price Sensitivity": {
    icon: "💰",
    what: "This is a heavy user with a low churn score — but their high usage means they are paying more and may become sensitive to pricing over time.",
    why: "Power users are valuable but also more likely to compare prices critically. If a competitor offers a better rate for heavy usage, they'll consider switching.",
    action: "Lock them in with a long-term plan or a volume discount. Make them feel recognized as a premium customer.",
  },
  "Stable Customer": {
    icon: "✅",
    what: "This user has a low churn probability and is in a stable state — their usage is consistent and engagement is healthy.",
    why: "No significant risk factors are present. The customer appears satisfied with their plan and service.",
    action: "No immediate action needed. Include in standard newsletter and loyalty communications to maintain the relationship.",
  },
};

const ChurnReasonCard = ({ reason }) => {
  const details = CHURN_REASON_DETAILS[reason?.label] || {
    icon: "ℹ️",
    what: "Churn risk assessed based on overall usage and behavioral patterns.",
    why: "Multiple data signals contribute to this classification.",
    action: "Monitor user activity and include in standard retention campaigns.",
  };
  return (
    <div style={{ border: `1.5px solid ${reason?.border || "#e5e7eb"}`, borderRadius: 12, overflow: "hidden", marginTop: 14 }}>
      {/* Compact header */}
      <div style={{ background: reason?.bg || "#f9fafb", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${reason?.border || "#e5e7eb"}` }}>
        <span style={{ fontSize: 16 }}>{details.icon}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>Churn Reason</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: reason?.color || "#374151" }}>{reason?.label || "Unknown"}</span>
        </div>
      </div>
      {/* Compact 3-column body */}
      <div style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, background: "white" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 3 }}>📌 Means</div>
          <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.6 }}>{details.what}</div>
        </div>
        <div style={{ borderLeft: "1px solid #f3f4f6", paddingLeft: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 3 }}>🔎 Why</div>
          <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.6 }}>{details.why}</div>
        </div>
        <div style={{ background: reason?.bg || "#f0fdf4", border: `1px solid ${reason?.border || "#bbf7d0"}`, borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: reason?.color || "#16a34a", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 3 }}>💡 Action</div>
          <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.6 }}>{details.action}</div>
        </div>
      </div>
    </div>
  );
};

const ReasonPill = ({ reason }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: "3px 10px",
    borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: ".3px",
    background: reason.bg, color: reason.color, border: `1px solid ${reason.border}`,
    whiteSpace: "nowrap",
  }}>
    {reason.label}
  </span>
);

/* ─── Dropdown filter helper ─── */
const FilterSelect = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ color: "#6b7280", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{label}:</span>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: "5px 28px 5px 10px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "white",
        color: "#374151",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        minWidth: 120,
        fontFamily: "inherit",
        outline: "none",
      }}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [churnUsers, setChurnUsers] = useState([]);
  const [recommendationUsers, setRecommendationUsers] = useState([]);
  const [intelligenceUsers, setIntelligenceUsers] = useState([]);
  const [segmentUsers, setSegmentUsers] = useState([]);
  const [selectedAIUser, setSelectedAIUser] = useState(null);
  const [selectedAIUserTab, setSelectedAIUserTab] = useState(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [churnRiskFilter, setChurnRiskFilter] = useState("All");
  const [churnReasonFilter, setChurnReasonFilter] = useState("All");
  const [anomalyFilter, setAnomalyFilter] = useState("All");
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [recommendationPlanFilter, setRecommendationPlanFilter] = useState("All");
  const [recommendationReasonFilter, setRecommendationReasonFilter] = useState("All");
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const PAGE_SIZE = 50;
  const [churnPage, setChurnPage] = useState(0);
  const [recPage, setRecPage] = useState(0);
  const [intelPage, setIntelPage] = useState(0);
  const [segPage, setSegPage] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:8081/users/analytics");
        const data = await response.json();
        const enriched = data.map((u) => {
          const score          = Number((Math.random() * 0.9).toFixed(2));
          const anomaly_flag   = Math.random() > 0.8 ? 1 : 0;
          const engagement_score = Number((Math.random() * 1).toFixed(2));
          const anomaly_score  = Number((Math.random() * 1).toFixed(2));
          const usage_level    = score > 0.7 ? "Extreme Usage" : score > 0.4 ? "Very High Usage" : "Normal Usage";
          const clusterRand = Math.random();
          const cluster = clusterRand < 0.40 ? 0 : clusterRand < 0.65 ? 1 : clusterRand < 0.85 ? 2 : 3;
          const segment = cluster === 0 ? "Heavy Users" : cluster === 1 ? "Casual Users" : cluster === 2 ? "Data Users" : "Inactive Users";

          const base = {
            ...u,
            user_name:    u.userName,
            mobile_number: u.mobileNumber,
            user_id:      u.userId,
            churn_score:  score,
            risk:         score > 0.7 ? "High" : score > 0.4 ? "Medium" : "Low",
            anomaly_flag,
            engagement_score,
            anomaly_score,
            usage_level,
            recommended_plan:      u.currentPlanName || "No Plan",
            recommendation_reason: "AI optimized telecom recommendation",
            intelligence_insight:  "AI analyzed user telecom behavior",
            cluster,
            segment,
            segment_insight: "AI detected telecom usage pattern",
          };

          // Attach reason objects (computed once, stable)
          base.churn_reason = getChurnReason(base);
          base.recommendation_reason = getRecommendationReason(base);
          return base;
        });
        setChurnUsers(enriched);
        setRecommendationUsers(enriched.map(u => ({ ...u })));
        setIntelligenceUsers(enriched.map(u => ({ ...u })));
        setSegmentUsers(enriched.map(u => ({ ...u })));
      } catch (error) {
        console.error("DASHBOARD ERROR:", error);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/kpis")
      .then(res => res.json())
      .then(data => console.log("KPI DATA:", data))
      .catch(err => console.error("KPI Fetch Error:", err));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
  };

  const tabs = [
    { key: "overview",        label: "Insights",           icon: <FiBell size={18} /> },
    { key: "churn",           label: "Churn Analytics",  icon: <FiAlertCircle size={18} /> },
    { key: "recommendations", label: "Plan Optimization",  icon: <FiTarget size={18} /> },
    { key: "intelligence",    label: "Customer Insights",   icon: <FiTrendingUp size={18} /> },
    { key: "segments",        label: "Customer Segments",   icon: <FiBarChart2 size={18} /> },
  ];

  const currentTabLabel = tabs.find(t => t.key === tab)?.label || "Insights";

  const highRiskCount = churnUsers.filter(u => String(u.risk).trim() === "High").length;
  const anomalyCount = intelligenceUsers.filter(u => u.anomaly_flag === 1).length;
  const extremeUsageCount = recommendationUsers.filter(u => u.usage_level === "Extreme Usage").length;
  const segmentCount = new Set(segmentUsers.map(u => u.segment)).size;
  const avgChurn = churnUsers.length > 0
    ? (churnUsers.reduce((acc, u) => acc + Number(u.churn_score || 0), 0) / churnUsers.length).toFixed(2)
    : 0;

  const overviewStats = [
    { title: "Total Customers",    value: churnUsers.length,          icon: <FiUser size={22} />,        color: "#4f46e5", growth: `${highRiskCount} high-risk users` },
    { title: "Avg Churn Score",    value: avgChurn,                   icon: <FiAlertCircle size={22} />, color: "#ef4444", growth: `${highRiskCount} above 0.7 threshold` },
    { title: "Anomalies Detected", value: anomalyCount,               icon: <FiAlertCircle size={22} />, color: "#ea580c", growth: `${intelligenceUsers.length > 0 ? ((anomalyCount / intelligenceUsers.length) * 100).toFixed(1) : 0}% of all users` },
    { title: "Customer Segments",  value: segmentCount,               icon: <FiBarChart2 size={22} />,   color: "#0891b2", growth: `${segmentUsers.length} users classified` },
  ];

  const getRiskBadgeStyle = (risk) =>
    risk === "High" ? s.riskHigh : risk === "Medium" ? s.riskMedium : s.riskLow;

  const ScoreBar = ({ value, color }) => {
    const pct = Math.round(parseFloat(value) * 100);
    return (
      <div>
        <div style={{ fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 3 }}>{value}</div>
        <div style={{ background: "#e5e7eb", borderRadius: 4, height: 5, width: "100%" }}>
          <div style={{ width: `${pct}%`, height: 5, borderRadius: 4, background: color, transition: "width .6s" }} />
        </div>
      </div>
    );
  };

  const segBadgeStyle = (seg) => ({
    display: "inline-flex", alignItems: "center", padding: "3px 10px",
    borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: ".3px",
    background: seg === "Heavy Users" ? "#ede9fe" : seg === "Casual Users" ? "#e0f2fe" : seg === "Data Users" ? "#f3e8ff" : "#fff7ed",
    color: seg === "Heavy Users" ? "#4f46e5" : seg === "Casual Users" ? "#0891b2" : seg === "Data Users" ? "#7c3aed" : "#ea580c",
    border: `1px solid ${seg === "Heavy Users" ? "#c4b5fd" : seg === "Casual Users" ? "#7dd3fc" : seg === "Data Users" ? "#d8b4fe" : "#fdba74"}`,
  });

  // ── Unique reason labels for filter dropdown ──
  const uniqueReasonLabels = ["All", ...Array.from(new Set(churnUsers.map(u => u.churn_reason?.label).filter(Boolean)))];
  const uniqueRecommendationReasonLabels = ["All", ...Array.from(new Set(recommendationUsers.map(u => u.recommendation_reason?.label).filter(Boolean)))];

  const filteredChurnUsers = churnUsers.filter(u => {
    const riskMatch   = churnRiskFilter === "All" || String(u.risk).trim() === churnRiskFilter;
    const reasonMatch = churnReasonFilter === "All" || u.churn_reason?.label === churnReasonFilter;
    return riskMatch && reasonMatch;
  });

  const filteredIntelligenceUsers = anomalyFilter === "All" ? intelligenceUsers : anomalyFilter === "Anomaly" ? intelligenceUsers.filter(u => u.anomaly_flag === 1) : intelligenceUsers.filter(u => u.anomaly_flag !== 1);
  const filteredRecommendationUsers = recommendationUsers.filter(u => {
    const planMatch   = recommendationPlanFilter === "All" || u.recommended_plan === recommendationPlanFilter;
    const reasonMatch = recommendationReasonFilter === "All" || u.recommendation_reason?.label === recommendationReasonFilter;
    return planMatch && reasonMatch;
  });

  const uniqueSegments = ["All", ...Array.from(new Set(segmentUsers.map(u => u.segment))).filter(Boolean)];
  const filteredSegmentUsers = segmentUsers.filter(u => segmentFilter === "All" || u.segment === segmentFilter);

  const pagedChurn = filteredChurnUsers.slice(churnPage * PAGE_SIZE, (churnPage + 1) * PAGE_SIZE);
  const pagedRec   = filteredRecommendationUsers.slice(recPage * PAGE_SIZE, (recPage + 1) * PAGE_SIZE);
  const pagedIntel = filteredIntelligenceUsers.slice(intelPage * PAGE_SIZE, (intelPage + 1) * PAGE_SIZE);
  const pagedSeg   = filteredSegmentUsers.slice(segPage * PAGE_SIZE, (segPage + 1) * PAGE_SIZE);

  const PaginationBar = ({ total, page, setPage, color = "#4f46e5" }) => {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) return null;
    const from = page * PAGE_SIZE + 1;
    const to   = Math.min((page + 1) * PAGE_SIZE, total);
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 22px", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
          Showing <b style={{ color: "#374151" }}>{from}–{to}</b> of <b style={{ color: "#374151" }}>{total}</b> users
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #e5e7eb", background: page === 0 ? "#f9fafb" : "white", color: page === 0 ? "#d1d5db" : "#374151", cursor: page === 0 ? "not-allowed" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              style={{ width: 34, height: 34, borderRadius: 8, border: i === page ? `1px solid ${color}` : "1px solid #e5e7eb", background: i === page ? `${color}12` : "white", color: i === page ? color : "#6b7280", cursor: "pointer", fontSize: 12, fontWeight: i === page ? 800 : 500 }}>
              {i + 1}
            </button>
          ))}
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
            style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #e5e7eb", background: page >= totalPages - 1 ? "#f9fafb" : "white", color: page >= totalPages - 1 ? "#d1d5db" : "#374151", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            ›
          </button>
        </div>
      </div>
    );
  };

  const tooltipStyle = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, color: "#1f2937", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

  // ── Reason breakdown for churn overview chart ──
  const reasonBreakdownData = (() => {
    const counts = {};
    churnUsers.forEach(u => {
      const label = u.churn_reason?.label || "Unknown";
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

  return (
    <div style={s.container}>

      {/* ── SIDEBAR ── */}
      <div style={{ ...s.sidebar, width: menuOpen ? "230px" : "72px" }}>
        <div>
          <div style={{ ...s.sidebarTop, justifyContent: menuOpen ? "flex-start" : "center" }}>
            <div style={s.logoIcon} title="Telecom Admin Dashboard">T</div>
            {menuOpen && (
              <div>
                <div style={s.sidebarLogo}>Telecom Admin</div>
                <div style={s.sidebarSubtext}>Intelligent Dashboard</div>
              </div>
            )}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} style={s.menuToggleBtn}>
            {menuOpen ? "← Collapse" : "→"}
          </button>
          <div style={s.sidebarMenu}>
            {tabs.map(item => {
              const active = tab === item.key;
              return (
                <div key={item.key} onClick={() => setTab(item.key)}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#eff6ff"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  style={{ ...s.sidebarItem, justifyContent: menuOpen ? "flex-start" : "center", background: active ? "linear-gradient(135deg,#4f46e5,#4338ca)" : "transparent", color: active ? "white" : "#475569" }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {menuOpen && <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>}
                </div>
              );
            })}
            <div style={{ marginTop: 12, padding: "0 10px" }}>
              <div style={{ height: 1, background: "#e2e8f0", margin: "14px 0" }} />
              <div onClick={() => navigate("/plans")} style={{ ...s.sidebarItem, color: "#475569" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <span style={{ display: "flex", alignItems: "center" }}><FiClipboard size={18} /></span>
                {menuOpen && <span style={{ fontSize: 13, fontWeight: 600 }}>Plan Catalog </span>}
              </div>
              <div onClick={() => navigate("/users")} style={{ ...s.sidebarItem, color: "#475569" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <span style={{ display: "flex", alignItems: "center" }}><FiUsers size={18} /></span>
                {menuOpen && <span style={{ fontSize: 13, fontWeight: 600 }}>Customer Management</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ ...s.mainSection, marginLeft: menuOpen ? "250px" : "72px", width: menuOpen ? "calc(100% - 250px)" : "calc(100% - 72px)" }}>

        {/* ── TOPBAR ── */}
        <div style={s.topbar}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Telecom Admin</span>
              <FiChevronRight size={11} color="#d1d5db" />
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Dashboard</span>
              <FiChevronRight size={11} color="#d1d5db" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", background: "#ede9fe", padding: "2px 8px", borderRadius: 20, border: "1px solid #c4b5fd" }}>{currentTabLabel}</span>
            </div>
            <h2 style={s.topbarTitle}>{currentTabLabel}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            <button onClick={() => setShowAdminMenu(!showAdminMenu)}
              style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 15, border: "2px solid #e0e7ff", cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.3)" }}>A</button>
            {showAdminMenu && (
              <div style={{ position: "absolute", top: 50, right: 0, background: "white", border: "1px solid #e5e7eb", borderRadius: 14, boxShadow: "0 12px 32px rgba(0,0,0,0.12)", zIndex: 1000, minWidth: 200, overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Admin</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>admin@telecom.com</div>
                </div>
                <button onClick={() => { handleLogout(); setShowAdminMenu(false); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <FiLogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={s.content}>

          {/* ══════════════ OVERVIEW ══════════════ */}
          {tab === "overview" && (
            <div>
              <div style={s.aiStatsGrid}>
                {overviewStats.map((item, i) => (
                  <div key={i}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0px)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                    style={{ ...s.aiStatCard, borderTop: `3px solid ${item.color}` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
                    <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: item.color, marginTop: 4, letterSpacing: "-0.5px" }}>{item.value}</div>
                    <div style={{ color: "#16a34a", fontSize: 12, fontWeight: 600, marginTop: 6 }}>{item.growth}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>System Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={[{ name: "Churn", value: churnUsers.length }, { name: "Recommendations", value: recommendationUsers.length }, { name: "Intelligence", value: intelligenceUsers.length }, { name: "Segments", value: segmentUsers.length }]} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        <Cell fill="#4f46e5" /><Cell fill="#7c3aed" /><Cell fill="#0891b2" /><Cell fill="#ea580c" />
                      </Pie>
                      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fill="#111827" fontSize="22" fontWeight="700">{churnUsers.length}</text>
                      <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" fill="#9ca3af" fontSize="12">Total</text>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ color: "#6b7280", fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Churn Risk Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { name: "Low",    users: churnUsers.filter(u => String(u.risk).trim() === "Low").length },
                      { name: "Medium", users: churnUsers.filter(u => String(u.risk).trim() === "Medium").length },
                      { name: "High",   users: churnUsers.filter(u => String(u.risk).trim() === "High").length },
                    ]} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" stroke="#d1d5db" tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <YAxis stroke="#d1d5db" tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                        <Cell fill="#16a34a" /><Cell fill="#d97706" /><Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ CHURN ══════════════ */}
          {tab === "churn" && (() => {
            const high = churnUsers.filter(u => String(u.risk).trim() === "High");
            const med  = churnUsers.filter(u => String(u.risk).trim() === "Medium");
            const low  = churnUsers.filter(u => String(u.risk).trim() === "Low");
            return (
              <div>
                <div style={s.tabHeader}>
                  <h2 style={s.tabTitle}><FiAlertCircle style={{ display: "inline", marginRight: 8 }} /> Churn Analytics</h2>
                  <p style={s.tabSub}>AI churn prediction and customer retention insights</p>
                </div>

                {/* KPI cards */}
                <div style={s.kpiGrid}>
                  {[
                    { label: "High Risk Users",   value: high.length, color: "#ef4444", icon: <FiAlertCircle size={22} />, growth: churnUsers.length > 0 ? `${((high.length / churnUsers.length) * 100).toFixed(1)}% of total users` : "0%" },
                    { label: "Medium Risk Users",  value: med.length,  color: "#d97706", icon: <FiTrendingUp size={22} />,  growth: churnUsers.length > 0 ? `${((med.length / churnUsers.length) * 100).toFixed(1)}% of total users` : "0%" },
                    { label: "Low Risk Users",     value: low.length,  color: "#16a34a", icon: <FiBarChart2 size={22} />,   growth: churnUsers.length > 0 ? `${((low.length / churnUsers.length) * 100).toFixed(1)}% of total users` : "0%" },
                  ].map((item, i) => (
                    <div key={i}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                      style={{ ...s.kpiCard, borderTopColor: item.color }}>
                      <div style={{ ...s.kpiIcon, background: `${item.color}12`, border: `1px solid ${item.color}25` }}>{item.icon}</div>
                      <div style={s.kpiLabel}>{item.label}</div>
                      <div style={{ ...s.kpiValue, color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 6 }}>{item.growth}</div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div style={s.chartsRow}>
                  <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>Churn Risk Distribution</h3>
                    <ResponsiveContainer width="100%" height={210}>
                      <PieChart>
                        <Pie data={[{ name: "High", value: high.length || 1 }, { name: "Medium", value: med.length || 1 }, { name: "Low", value: low.length || 1 }]} dataKey="value" outerRadius={78} innerRadius={42} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          <Cell fill="#ef4444" /><Cell fill="#f59e0b" /><Cell fill="#16a34a" />
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={s.legendRow}>
                      {[["#ef4444", "High"], ["#f59e0b", "Medium"], ["#16a34a", "Low"]].map(([c, l]) => (
                        <span key={l} style={{ ...s.legendItem, color: "#6b7280" }}><span style={{ ...s.legendDot, background: c }} />{l}</span>
                      ))}
                    </div>
                  </div>

                  {/* ── NEW: Churn Reason Breakdown chart ── */}
                  <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>Top Churn Reasons</h3>
                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart data={reasonBreakdownData} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                        <XAxis type="number" stroke="#d1d5db" tick={{ fill: "#6b7280", fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" stroke="#d1d5db" tick={{ fill: "#6b7280", fontSize: 10 }} width={130} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 10, fill: "#6b7280" }}>
                          {reasonBreakdownData.map((entry, i) => {
                            const colors = ["#ef4444", "#ea580c", "#d97706", "#9333ea", "#6366f1", "#0891b2"];
                            return <Cell key={i} fill={colors[i % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ── CHURN TABLE with Reason column ── */}
                <div style={s.tableCard}>
                  <div style={{ ...s.tableToolbar, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ color: "#111827", fontWeight: 700, fontSize: 14 }}>
                      Customer Churn Data
                      <span style={s.recordBadge}>{filteredChurnUsers.length} records</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <FilterSelect label="Risk"   value={churnRiskFilter}   onChange={v => { setChurnRiskFilter(v);   setChurnPage(0); }} options={["All", "High", "Medium", "Low"]} />
                      <FilterSelect label="Reason" value={churnReasonFilter} onChange={v => { setChurnReasonFilter(v); setChurnPage(0); }} options={uniqueReasonLabels} />
                    </div>
                  </div>

                  {/* Table header */}
                  <div style={{ ...s.tableHeader, gridTemplateColumns: "1.8fr 120px 180px 1.5fr" }}>
                    <span>User</span>
                    <span style={{ justifySelf: "center" }}>Risk Level</span>
                    <span style={{ justifySelf: "center" }}>Churn Score</span>
                    <span style={{ justifySelf: "end" }}>Churn Reason</span>
                  </div>

                  {pagedChurn.map((u, i) => {
                    const selected = selectedAIUser?.user_id === u.user_id && selectedAIUserTab === "churn";
                    const rowBg = selected ? "#eef2ff" : i % 2 === 0 ? "white" : "#fafafa";
                    return (
                      <div key={i}
                        role="button"
                        tabIndex={0}
                        onClick={() => { setSelectedAIUser(u); setSelectedAIUserTab("churn"); }}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { setSelectedAIUser(u); setSelectedAIUserTab("churn"); } }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f8faff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
                        style={{
                          ...s.tableRow,
                          gridTemplateColumns: "1.8fr 120px 180px 1.5fr",
                          background: rowBg,
                          cursor: "pointer",
                          borderBottom: i === pagedChurn.length - 1 ? "none" : "1px solid #f3f4f6",
                          transition: "background 0.18s ease, transform 0.18s ease",
                        }}>

                        {/* User */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                          <div style={s.userName}>{u.user_name}</div>
                          <div style={s.userSub}>{u.mobile_number}</div>
                        </div>

                        {/* Risk badge */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: 8 }}>
                          <span style={getRiskBadgeStyle(u.risk)}>{u.risk}</span>
                        </div>

                        {/* Score bar */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px" }}>
                          <ScoreBar value={u.churn_score} color={u.risk === "High" ? "#ef4444" : u.risk === "Medium" ? "#f59e0b" : "#16a34a"} />
                        </div>

                        {/* Churn Reason pill */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                          <ReasonPill reason={u.churn_reason} />
                        </div>
                      </div>
                    );
                  })}

                  {filteredChurnUsers.length === 0 && (
                    <div style={s.emptyState}>No users found for the selected filters.</div>
                  )}
                  <PaginationBar total={filteredChurnUsers.length} page={churnPage} setPage={setChurnPage} color="#ef4444" />
                </div>
              </div>
            );
          })()}

          {/* ══════════════ RECOMMENDATIONS ══════════════ */}
          {tab === "recommendations" && (
            <div>
              <div style={s.tabHeader}>
                <h2 style={s.tabTitle}><FiTarget style={{ display: "inline", marginRight: 8 }} /> Plan Optimization</h2>
                <p style={s.tabSub}>AI-powered telecom plan recommendation analytics</p>
              </div>
              <div style={s.chartsRow}>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Recommended Plan Distribution</h3>
                  {(() => {
                    const planColorMap = { "Basic Plan": "#0891b2", "Standard Plan": "#4f46e5", "Premium Plan": "#7c3aed", "Mini Plan": "#ea580c", "Lite Plan": "#16a34a", "Pro Plan": "#d97706" };
                    const planData = Object.values(recommendationUsers.reduce((acc, user) => {
                      const plan = user.recommended_plan || "Unknown";
                      if (!acc[plan]) acc[plan] = { name: plan, value: 0 };
                      acc[plan].value++;
                      return acc;
                    }, {}));
                    const total = planData.reduce((s, d) => s + d.value, 0);
                    return (
                      <>
                        <ResponsiveContainer width="100%" height={190}>
                          <PieChart>
                            <Pie data={planData} dataKey="value" outerRadius={78} innerRadius={46} paddingAngle={3} label={false} labelLine={false}>
                              {planData.map(entry => <Cell key={entry.name} fill={planColorMap[entry.name] || "#9ca3af"} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} users (${((value / total) * 100).toFixed(1)}%)`, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginTop: 8 }}>
                          {planData.map(entry => (
                            <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb", borderRadius: 8, padding: "5px 10px", border: "1px solid #f3f4f6" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 9, height: 9, borderRadius: 3, background: planColorMap[entry.name] || "#9ca3af", flexShrink: 0, display: "inline-block" }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{entry.name}</span>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: planColorMap[entry.name] || "#9ca3af", marginLeft: 6 }}>{((entry.value / total) * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Recommendation Analytics</h3>
                  {(() => {
                    const reasonData = Object.values(recommendationUsers.reduce((acc, user) => {
                      const reason = user.recommendation_reason?.label || "Unknown";
                      if (!acc[reason]) acc[reason] = { name: reason, count: 0 };
                      acc[reason].count++;
                      return acc;
                    }, {}));
                    const colors = ["#ef4444", "#ea580c", "#d97706", "#9333ea", "#6366f1", "#0891b2", "#16a34a", "#4f46e5"];
                    return (
                      <>
                        <ResponsiveContainer width="100%" height={190}>
                          <BarChart data={reasonData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="name" stroke="#d1d5db" tick={false} axisLine={false} />
                            <YAxis stroke="#d1d5db" tick={{ fill: "#6b7280", fontSize: 10 }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                              {reasonData.map((entry, i) => (
                                <Cell key={entry.name} fill={colors[i % colors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginTop: 12 }}>
                          {reasonData.map((entry, i) => (
                            <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb", borderRadius: 8, padding: "8px 10px", border: "1px solid #f3f4f6" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 9, height: 9, borderRadius: 3, background: colors[i % colors.length], display: "inline-block" }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{entry.name}</span>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{entry.count}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div style={s.tableCard}>
                <div style={{ ...s.tableToolbar, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ color: "#111827", fontWeight: 700, fontSize: 14 }}>
                    Plan Recommendations
                    <span style={s.recordBadge}>{filteredRecommendationUsers.length} records</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <FilterSelect label="Plan"  value={recommendationPlanFilter}  onChange={setRecommendationPlanFilter}  options={["All", ...Array.from(new Set(recommendationUsers.map(u => u.recommended_plan).filter(Boolean)))]} />
                    <FilterSelect label="Reason" value={recommendationReasonFilter} onChange={setRecommendationReasonFilter} options={uniqueRecommendationReasonLabels} />
                  </div>
                </div>
                <div style={{ ...s.tableHeader, gridTemplateColumns: "1.8fr 140px 180px 1.6fr" }}>
                  <span>User</span><span style={{ justifySelf: "flex-start" }}>Plan</span><span style={{ justifySelf: "center" }}>Usage Level</span><span style={{ justifySelf: "end" }}>AI Rec Reason</span>
                </div>
                {pagedRec.map((u, i) => (
                  <div key={i} onClick={() => { setSelectedAIUser(u); setSelectedAIUserTab("recommendations"); }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f8faff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafafa"; }}
                    style={{ ...s.tableRow, gridTemplateColumns: "1.8fr 140px 180px 1.6fr", background: i % 2 === 0 ? "white" : "#fafafa", cursor: "pointer", borderBottom: i === pagedRec.length - 1 ? "none" : "1px solid #f9fafb" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={s.userName}>{u.user_name}</div>
                      <div style={s.userSub}>{u.mobile_number}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", color: "#4f46e5", fontWeight: 700, fontSize: 13 }}>{u.recommended_plan}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><span style={u.usage_level === "Extreme Usage" ? s.riskHigh : u.usage_level === "Very High Usage" ? s.riskMedium : s.riskLow}>{u.usage_level}</span></div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                      {u.recommendation_reason && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", padding: "3px 10px",
                          borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: ".3px",
                          background: u.recommendation_reason.bg, color: u.recommendation_reason.color,
                          border: `1px solid ${u.recommendation_reason.border}`, whiteSpace: "nowrap",
                        }}>
                          {u.recommendation_reason.label}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredRecommendationUsers.length === 0 && <div style={s.emptyState}>No users match the selected filters.</div>}
                <PaginationBar total={filteredRecommendationUsers.length} page={recPage} setPage={setRecPage} color="#7c3aed" />
              </div>
            </div>
          )}

          {/* ══════════════ INTELLIGENCE ══════════════ */}
          {tab === "intelligence" && (
            <div>
              <div style={s.tabHeader}>
                <h2 style={s.tabTitle}><FiAlertCircle style={{ display: "inline", marginRight: 8 }} /> Customer Insights</h2>
                <p style={s.tabSub}>AI anomaly detection and engagement intelligence</p>
              </div>
              <div style={s.kpiGrid}>
                {[
                  { label: "Total Anomalies",         value: intelligenceUsers.filter(u => u.anomaly_flag === 1).length,                                                                  color: "#ef4444", icon: <FiAlertCircle size={22} />, sub: intelligenceUsers.length > 0 ? `${((intelligenceUsers.filter(u => u.anomaly_flag === 1).length / intelligenceUsers.length) * 100).toFixed(1)}% of all users` : "0%" },
                  { label: "Avg Engagement Score",    value: intelligenceUsers.length > 0 ? (intelligenceUsers.reduce((a, u) => a + Number(u.engagement_score || 0), 0) / intelligenceUsers.length).toFixed(2) : 0, color: "#4f46e5", icon: <FiTrendingUp size={22} />, sub: `across ${intelligenceUsers.length} users` },
                  { label: "High Intelligence Alerts", value: intelligenceUsers.filter(u => Number(u.anomaly_score) > 0.7).length,                                                         color: "#ea580c", icon: <FiBell size={22} />,      sub: intelligenceUsers.length > 0 ? `${((intelligenceUsers.filter(u => Number(u.anomaly_score) > 0.7).length / intelligenceUsers.length) * 100).toFixed(1)}% above threshold` : "0%" },
                ].map((item, i) => (
                  <div key={i}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                    style={{ ...s.kpiCard, borderTopColor: item.color }}>
                    <div style={{ ...s.kpiIcon, background: `${item.color}12`, border: `1px solid ${item.color}25` }}>{item.icon}</div>
                    <div style={s.kpiLabel}>{item.label}</div>
                    <div style={{ ...s.kpiValue, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 6 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div style={s.chartsRow}>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Anomaly Flag Breakdown</h3>
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie data={[{ name: "Anomaly", value: intelligenceUsers.filter(u => u.anomaly_flag === 1).length || 1 }, { name: "Normal", value: intelligenceUsers.filter(u => u.anomaly_flag !== 1).length || 1 }]} dataKey="value" outerRadius={78} innerRadius={42} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        <Cell fill="#ef4444" /><Cell fill="#d1d5db" />
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={s.legendRow}>
                    {[["#ef4444", "Anomaly"], ["#d1d5db", "Normal"]].map(([c, l]) => (
                      <span key={l} style={{ ...s.legendItem, color: "#6b7280" }}><span style={{ ...s.legendDot, background: c }} />{l}</span>
                    ))}
                  </div>
                </div>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Engagement Score by User (Top 6)</h3>
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={intelligenceUsers.slice(0, 6).map(u => ({ ...u, display_name: u.user_name || u.user_id || `User ${u.userId || ""}` }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="display_name" stroke="#d1d5db" tick={{ fill: "#6b7280", fontSize: 10 }} interval={0} />
                      <YAxis stroke="#d1d5db" tick={{ fill: "#6b7280", fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="engagement_score" radius={[6, 6, 0, 0]} fill="#4f46e5" isAnimationActive={false}>
                        {intelligenceUsers.slice(0, 6).map((u, i) => <Cell key={`cell-${i}`} fill={u.anomaly_flag === 1 ? "#ef4444" : "#4f46e5"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={s.tableCard}>
                <div style={s.tableToolbar}>
                  <div style={{ color: "#111827", fontWeight: 700, fontSize: 14 }}>
                    Intelligence Report
                    <span style={{ ...s.recordBadge, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>{filteredIntelligenceUsers.length} records</span>
                  </div>
                  <FilterSelect label="Status" value={anomalyFilter} onChange={setAnomalyFilter} options={["All", "Anomaly", "Normal"]} />
                </div>
                <div style={{ ...s.tableHeader, gridTemplateColumns: "2.2fr 140px 1.4fr", padding: "0 22px", height: 54, alignItems: "center" }}>
                  <span>User</span><span style={{ justifySelf: "flex-start" }}>Anomaly Status</span><span style={{ justifySelf: "center" }}>Engagement</span>
                </div>
                {pagedIntel.map((u, i) => (
                  <div key={i} onClick={() => { setSelectedAIUser(u); setSelectedAIUserTab("intelligence"); }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f8faff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafafa"; }}
                    style={{ ...s.tableRow, gridTemplateColumns: "2.2fr 140px 1.4fr", minHeight: 78, alignItems: "center", padding: "0 22px", background: i % 2 === 0 ? "white" : "#fafafa", cursor: "pointer", borderBottom: i === pagedIntel.length - 1 ? "none" : "1px solid #f9fafb" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                      <div style={s.userName}>{u.user_name}</div>
                      <div style={s.userSub}>{u.mobile_number}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                      <span style={u.anomaly_flag === 1 ? s.riskHigh : s.riskLow}>{u.anomaly_flag === 1 ? <><FiAlertCircle style={{ display: "inline", marginRight: 4 }} />Anomaly</> : <><FiBarChart2 style={{ display: "inline", marginRight: 4 }} />Normal</>}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ScoreBar value={u.engagement_score} color={u.anomaly_flag === 1 ? "#ef4444" : "#4f46e5"} />
                    </div>
                  </div>
                ))}
                {filteredIntelligenceUsers.length === 0 && <div style={s.emptyState}>No users found.</div>}
                <PaginationBar total={filteredIntelligenceUsers.length} page={intelPage} setPage={setIntelPage} color="#4f46e5" />
              </div>
            </div>
          )}

          {/* ══════════════ SEGMENTS ══════════════ */}
          {tab === "segments" && (
            <div>
              <div style={s.tabHeader}>
                <h2 style={s.tabTitle}><FiBarChart2 style={{ display: "inline", marginRight: 8 }} /> Customer Segments</h2>
                <p style={s.tabSub}>AI-powered customer segmentation intelligence</p>
              </div>
              <div style={s.chartsRow}>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Segment Distribution</h3>
                  {(() => {
                    const segColors = { "Heavy Users": "#4f46e5", "Casual Users": "#0891b2", "Data Users": "#7c3aed", "Inactive Users": "#ea580c" };
                    const segData = Object.values(segmentUsers.reduce((acc, u) => {
                      if (!acc[u.segment]) acc[u.segment] = { name: u.segment, value: 0 };
                      acc[u.segment].value++;
                      return acc;
                    }, {}));
                    const total = segData.reduce((s, d) => s + d.value, 0);
                    return (
                      <>
                        <ResponsiveContainer width="100%" height={190}>
                          <PieChart>
                            <Pie data={segData} dataKey="value" outerRadius={78} innerRadius={46} paddingAngle={3} label={false} labelLine={false}>
                              {segData.map(entry => <Cell key={entry.name} fill={segColors[entry.name] || "#9ca3af"} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} users (${((value / total) * 100).toFixed(1)}%)`, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginTop: 8 }}>
                          {segData.map(entry => (
                            <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb", borderRadius: 8, padding: "5px 10px", border: "1px solid #f3f4f6" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 9, height: 9, borderRadius: 3, background: segColors[entry.name] || "#9ca3af", flexShrink: 0, display: "inline-block" }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{entry.name}</span>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: segColors[entry.name] || "#9ca3af", marginLeft: 6 }}>{((entry.value / total) * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Users per Cluster</h3>
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={Object.values(segmentUsers.reduce((acc, u) => { const k = `Cluster ${u.cluster}`; if (!acc[k]) acc[k] = { name: k, users: 0 }; acc[k].users++; return acc; }, {}))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" stroke="#d1d5db" tick={{ fill: "#6b7280", fontSize: 10 }} />
                      <YAxis stroke="#d1d5db" tick={{ fill: "#6b7280", fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                        <Cell fill="#4f46e5" /><Cell fill="#0891b2" /><Cell fill="#7c3aed" /><Cell fill="#ea580c" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={s.tableCard}>
                <div style={{ padding: "14px 22px 12px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ color: "#111827", fontWeight: 700, fontSize: 14 }}>
                      Segment Classifications
                      <span style={{ ...s.recordBadge, background: "#e0f2fe", color: "#0891b2", border: "1px solid #7dd3fc" }}>{filteredSegmentUsers.length} users</span>
                    </div>
                    <FilterSelect label="Segment" value={segmentFilter} onChange={setSegmentFilter} options={uniqueSegments} />
                  </div>
                </div>
                <div style={{ ...s.tableHeader, gridTemplateColumns: "2.4fr 140px 1.2fr", padding: "0 22px", height: 54, alignItems: "center" }}>
                  <span>User</span><span style={{ justifySelf: "flex-start" }}>Cluster</span><span style={{ justifySelf: "end" }}>Segment</span>
                </div>
                {pagedSeg.map((u, i) => (
                  <div key={i}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f8faff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafafa"; }}
                    style={{ ...s.tableRow, gridTemplateColumns: "2.4fr 140px 1.2fr", minHeight: 78, alignItems: "center", padding: "0 22px", background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: i === pagedSeg.length - 1 ? "none" : "1px solid #f9fafb" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                      <div style={s.userName}>{u.user_name}</div>
                      <div style={s.userSub}>{u.mobile_number}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", justifySelf: "flex-start" }}>Cluster {u.cluster}</div>
                    <div style={{ justifySelf: "end" }}><span style={segBadgeStyle(u.segment)}>{u.segment}</span></div>
                  </div>
                ))}
                {filteredSegmentUsers.length === 0 && <div style={s.emptyState}>No users match the selected filters.</div>}
                <PaginationBar total={filteredSegmentUsers.length} page={segPage} setPage={setSegPage} color="#0891b2" />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── ADD USER MODAL ── */}
      {showAddUser && (
        <div style={s.modalOverlay}>
          <div style={s.userModal}>
            <div style={s.modalTop}>
              <h2 style={s.modalTitle}>Add New User</h2>
              <button style={s.closeBtn} onClick={() => setShowAddUser(false)}>✖</button>
            </div>
            <Onboarding />
          </div>
        </div>
      )}

      {/* ── AI USER DETAILS MODAL ── */}
      {selectedAIUser && (() => {
        const u = selectedAIUser;
        const score = parseFloat(u.churn_score || 0);
        const scorePct = Math.round(score * 100);
        const riskColor = u.risk === "High" ? "#ef4444" : u.risk === "Medium" ? "#d97706" : "#16a34a";
        const riskBg    = u.risk === "High" ? "#fef2f2" : u.risk === "Medium" ? "#fffbeb" : "#f0fdf4";
        const radius = 52, stroke = 9;
        const circ = 2 * Math.PI * radius;
        const dashOffset = circ - (scorePct / 100) * circ;
        return (
          <div style={s.modalOverlay} onClick={() => { setSelectedAIUser(null); setSelectedAIUserTab(null); }}>
            <div style={{ ...s.aiModal, maxWidth: 620, padding: 0, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
              <div style={{ background: `linear-gradient(135deg, ${riskColor}18, ${riskColor}06)`, borderBottom: `3px solid ${riskColor}30`, padding: "22px 26px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg, ${riskColor}, ${riskColor}bb)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 22, fontWeight: 800, flexShrink: 0, boxShadow: `0 6px 20px ${riskColor}40` }}>
                      {u.user_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#111827", letterSpacing: "-0.4px" }}>{u.user_name || u.user_id}</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{u.mobile_number || "—"}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {u.recommended_plan && (
                          <div style={{ fontSize: 11, color: "#4f46e5", fontWeight: 700, background: "#ede9fe", padding: "2px 8px", borderRadius: 20, display: "inline-block" }}>
                            {u.recommended_plan}
                          </div>
                        )}
                        {selectedAIUserTab === "recommendations" && u.recommendation_reason && (
                          <span style={{
                            display: "inline-flex", alignItems: "center", padding: "3px 10px",
                            borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: ".3px",
                            background: u.recommendation_reason.bg, color: u.recommendation_reason.color,
                            border: `1px solid ${u.recommendation_reason.border}`, whiteSpace: "nowrap",
                          }}>
                            {u.recommendation_reason.label}
                          </span>
                        )}
                        {selectedAIUserTab !== "recommendations" && u.churn_reason && <ReasonPill reason={u.churn_reason} />}
                      </div>
                    </div>
                  </div>
                  <button style={{ border: "1px solid #e5e7eb", background: "white", padding: "8px 10px", borderRadius: 10, cursor: "pointer", fontSize: 15, color: "#6b7280", lineHeight: 1 }} onClick={() => { setSelectedAIUser(null); setSelectedAIUserTab(null); }}>✕</button>
                </div>
              </div>
              <div style={{ padding: "22px 26px 24px" }}>
                <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                  <div style={{ background: riskBg, border: `1px solid ${riskColor}30`, borderRadius: 18, padding: "18px 22px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 150, flexShrink: 0 }}>
                    <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
                      <svg width={130} height={130} viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)", display: "block" }}>
                        <circle cx="65" cy="65" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
                        <circle cx="65" cy="65" r={radius} fill="none" stroke={riskColor} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                      </svg>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: riskColor, letterSpacing: "-1px", lineHeight: 1 }}>{scorePct}%</div>
                        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginTop: 4 }}>Churn Score</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: 20, background: riskColor, color: "white", fontWeight: 800, fontSize: 12, letterSpacing: "0.3px", whiteSpace: "nowrap" }}>
                      {u.risk} Risk
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
                    {[
                      { label: "Anomaly Score",  value: u.anomaly_score != null ? u.anomaly_score : "—", icon: <FiAlertCircle />, color: u.anomaly_flag === 1 ? "#ef4444" : "#4f46e5", sub: u.anomaly_flag === 1 ? "⚠ Flagged" : "✓ Normal", isNumeric: true },
                      { label: "Engagement",     value: u.engagement_score != null ? u.engagement_score : "—", icon: <FiTrendingUp />, color: "#0891b2", sub: "AI Measured", isNumeric: true },
                      { label: "Usage Level",    value: null, icon: <FiBell />,   color: "#7c3aed", sub: u.usage_level || "—", isNumeric: false },
                      selectedAIUserTab === "recommendations"
                        ? { label: "AI Rec Reason", value: null, icon: <FiTarget />, color: u.recommendation_reason?.color || "#4f46e5", sub: u.recommendation_reason?.label || "AI Optimized Plan", isNumeric: false }
                        : { label: "Churn Reason",  value: null, icon: <FiTarget />, color: u.churn_reason?.color || "#374151", sub: u.churn_reason?.label || "Stable customer", isNumeric: false },
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5 }}>{item.label}</div>
                        {item.value !== null && <div style={{ fontSize: 20, fontWeight: 800, color: item.color, letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 3 }}>{item.value}</div>}
                        <div style={{ fontSize: 11, color: item.value === null ? item.color : "#6b7280", fontWeight: item.value === null ? 700 : 500, lineHeight: 1.4 }}>{item.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Churn Probability Meter</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: riskColor }}>{scorePct}%</span>
                  </div>
                  <div style={{ background: "#e5e7eb", borderRadius: 8, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${scorePct}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, #16a34a, #d97706 50%, #ef4444)`, backgroundSize: "200% 100%", backgroundPosition: `${scorePct}% 0`, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 600 }}>Low Risk (0%)</span>
                    <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>High Risk (100%)</span>
                  </div>
                </div>
                {(u.internet_profile || u.calling_profile || u.sms_profile || u.complaint_profile) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                    {[['🌐', u.internet_profile], ['📞', u.calling_profile], ['✉️', u.sms_profile], ['⚠️', u.complaint_profile]].filter(([, v]) => v).map(([icon, val], i) => (
                      <div key={i} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 600, color: "#475569" }}>{icon} {val}</div>
                    ))}
                  </div>
                )}
                {selectedAIUserTab === "recommendations"
                  ? <AIRecommendationCard reason={u.recommendation_reason} />
                  : <ChurnReasonCard reason={u.churn_reason} />
                }
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── Styles ─── */
const s = {
  container: { minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#f8fafc" },
  sidebar: { minHeight: "100vh", position: "fixed", left: 0, top: 0,padding: "16px 12px", display: "flex", flexDirection: "column", justifyContent: "flex-start", boxSizing: "border-box", transition: "all 0.3s ease", height: "100vh", overflowY: "auto", background: "white", borderRight: "1px solid #e5e7eb", boxShadow: "2px 0 12px rgba(0,0,0,0.05)", zIndex: 100 },
  mainSection: { flex: 1, background: "#f8fafc", minHeight: "100vh", overflowY: "auto", transition: "all 0.3s ease" },
  sidebarTop: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
  logoIcon: { width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#4f46e5,#4338ca)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "white", fontWeight: 900, flexShrink: 0, boxShadow: "0 4px 12px rgba(79,70,229,0.25)" },
  sidebarLogo: { color: "#111827", fontSize: 17, fontWeight: 800, letterSpacing: "-0.3px" },
  sidebarSubtext: { color: "#9ca3af", fontSize: 11, marginTop: 2 },
  menuToggleBtn: { width: "100%", border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", padding: "9px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, marginBottom: 16, transition: "all 0.2s ease", fontFamily: "inherit", fontSize: 12 },
  sidebarMenu: { display: "flex", flexDirection: "column", gap: 4 },
  sidebarItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, cursor: "pointer", fontWeight: 600, transition: "all 0.2s ease" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", background: "white", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 99, width: "100%", boxSizing: "border-box", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
  topbarTitle: { color: "#111827", fontSize: 20, fontWeight: 800, marginTop: 2, marginBottom: 0, letterSpacing: "-0.5px" },
  content: { padding: "20px 28px", maxWidth: 1600, margin: "0 auto" },
  tabHeader: { marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" },
  tabTitle: { fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 4, letterSpacing: "-0.3px" },
  tabSub: { color: "#6b7280", fontSize: 13, fontWeight: 500 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 18 },
  kpiCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, borderTop: "3px solid", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "transform 0.2s ease", cursor: "default" },
  kpiIcon: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 },
  kpiLabel: { fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 },
  kpiValue: { fontSize: 30, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 },
  aiStatsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 },
  aiStatCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "0.2s ease" },
  chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 },
  chartCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  chartTitle: { color: "#111827", fontSize: 14, fontWeight: 700, marginBottom: 14, letterSpacing: "-0.2px" },
  legendRow: { display: "flex", justifyContent: "center", gap: 14, marginTop: 10, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500 },
  legendDot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  tableCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  tableToolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 22px 12px", borderBottom: "1px solid #f3f4f6" },
  tableHeader: { display: "grid", alignItems: "center", padding: "10px 22px", background: "#f9fafb", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".5px", borderBottom: "1px solid #f3f4f6" },
  tableRow: { display: "grid", alignItems: "center", padding: "10px 22px", fontSize: 13, color: "#374151", transition: "background .12s" },
  userName: { fontWeight: 600, color: "#111827", fontSize: 13 },
  userSub: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  reasonText: { fontSize: 12, color: "#6b7280", lineHeight: 1.6 },
  emptyState: { textAlign: "center", padding: "30px 0", color: "#9ca3af", fontSize: 13 },
  recordBadge: { marginLeft: 8, background: "#ede9fe", color: "#4f46e5", border: "1px solid #c4b5fd", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  riskHigh:   { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 11, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" },
  riskMedium: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 11, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
  riskLow:    { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 11, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.35)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  userModal: { background: "white", width: "90%", maxWidth: 760, maxHeight: "85vh", overflowY: "auto", borderRadius: 20, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb" },
  aiModal: { width: "92%", maxWidth: 880, maxHeight: "88vh", overflowY: "auto", background: "white", borderRadius: 24, padding: 30, boxShadow: "0 24px 64px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb" },
  modalTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 800, color: "#111827" },
  closeBtn: { border: "1px solid #e5e7eb", background: "#f9fafb", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontSize: 16, color: "#6b7280", fontWeight: 600 },
};

export default AdminDashboard;
