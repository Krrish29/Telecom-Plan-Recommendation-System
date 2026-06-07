import React, { useState, useEffect } from "react";
import { getPlans, addPlan, updatePlan, deletePlan } from "../services/api";
import { FiEdit2, FiTrash2, FiArrowLeft, FiPlus, FiWifi, FiChevronRight, FiPackage, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/* ── Defined OUTSIDE component so React never recreates these on re-render ── */

const PLAN_FIELDS = [
  ["Plan Name",       "planName",     "text",   "e.g. Ultra 5G Pack"],
  ["Price (₹)",       "price",        "number", "e.g. 599"],
  ["Data Limit",      "dataLimit",    "text",   "e.g. 2GB/day"],
  ["Validity (Days)", "validityDays", "number", "e.g. 28"],
];

const inputStyle = {
  background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 10,
  padding: "11px 14px", color: "#111827", outline: "none", fontSize: 13,
  width: "100%", boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const selectStyle = {
  ...inputStyle,
  appearance: "none", WebkitAppearance: "none", cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  backgroundSize: "12px", paddingRight: 36,
};

const labelStyle = {
  fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase",
  letterSpacing: "0.5px", marginBottom: 6, display: "block",
};

/* ── Standalone components outside PlanManagement ── */

const ModalShell = ({ children, width = 500 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
    <div style={{ width, background: "white", borderRadius: 22, border: "1px solid #e5e7eb", boxShadow: "0 28px 70px rgba(0,0,0,0.18)", maxHeight: "92vh", overflowY: "auto" }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

/* ── Inline field renderer — used inside modals ── */
const PlanFields = ({ plan, setPlan }) => (
  <>
    {PLAN_FIELDS.map(([lbl, key, type, ph]) => (
      <Field key={key} label={lbl}>
        <input
          type={type}
          placeholder={ph}
          value={plan[key]}
          onChange={e => setPlan({ ...plan, [key]: e.target.value })}
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.08)"; }}
          onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
        />
      </Field>
    ))}
  </>
);

/* ────────────────────────────────────────────────── */

function PlanManagement() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification]       = useState(null);
  const [plans, setPlans]                     = useState([]);
  const [selectedPlan, setSelectedPlan]       = useState(null);
  const [hoveredRow, setHoveredRow]           = useState(null);
  const [newPlan, setNewPlan] = useState({
    planName: "", price: "", dataLimit: "", validityDays: "",
    planType: "Prepaid", networkType: "4G", callMinutes: "Unlimited", smsLimit: "100/day",
  });

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try { const data = await getPlans(); setPlans(data); } catch (e) { console.log(e); }
  };

  const handleAddPlan = async () => {
    try {
      await addPlan({
        planName: newPlan.planName, price: Number(newPlan.price),
        dataLimit: newPlan.dataLimit, validityDays: Number(newPlan.validityDays),
        planType: newPlan.planType, networkType: newPlan.networkType,
        callMinutes: newPlan.callMinutes || "Unlimited", smsLimit: newPlan.smsLimit || "100/day",
      });
      await fetchPlans();
      showNotification(`${newPlan.planName} added successfully`, "success");
      setShowAddModal(false);
      setNewPlan({ planName: "", price: "", dataLimit: "", validityDays: "", planType: "Prepaid", networkType: "4G", callMinutes: "Unlimited", smsLimit: "100/day" });
    } catch (e) { console.log(e); }
  };

  const handleEditPlan = async () => {
    try {
      await updatePlan(selectedPlan.planId, selectedPlan);
      await fetchPlans();
      showNotification(`${selectedPlan.planName} updated successfully`, "edit");
      setShowEditModal(false);
    } catch (e) { console.log(e); }
  };

  const handleDeletePlan = async () => {
    try {
      await deletePlan(selectedPlan.planId);
      await fetchPlans();
      showNotification(`${selectedPlan.planName} deleted successfully`, "delete");
      setShowDeleteModal(false);
    } catch (e) { console.log(e); }
  };

  const networkBadge = (type) => ({
    display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px",
    borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: type === "5G" ? "#ede9fe" : "#e0f2fe",
    color:      type === "5G" ? "#7c3aed" : "#0891b2",
    border:     `1px solid ${type === "5G" ? "#c4b5fd" : "#7dd3fc"}`,
  });

  const planTypeBadge = (type) => ({
    display: "inline-flex", alignItems: "center", padding: "3px 10px",
    borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: type === "Postpaid" ? "#fef3c7" : "#f0fdf4",
    color:      type === "Postpaid" ? "#d97706" : "#16a34a",
    border:     `1px solid ${type === "Postpaid" ? "#fde68a" : "#bbf7d0"}`,
  });

  const notifMeta = {
    success: { border: "#bbf7d0", iconBg: "#f0fdf4", iconColor: "#16a34a", bar: "#16a34a", icon: "✓", title: "Plan Added" },
    edit:    { border: "#fde68a", iconBg: "#fffbeb", iconColor: "#d97706", bar: "#d97706", icon: "✎", title: "Plan Updated" },
    delete:  { border: "#fecaca", iconBg: "#fef2f2", iconColor: "#ef4444", bar: "#ef4444", icon: "✕", title: "Plan Deleted" },
  };

  const stats = [
    { label: "Total Plans",  value: plans.length,                                        color: "#4f46e5", bg: "#ede9fe", icon: <FiPackage size={18} /> },
    { label: "Prepaid",      value: plans.filter(p => p.planType === "Prepaid").length,  color: "#16a34a", bg: "#f0fdf4", icon: <FiCheckCircle size={18} /> },
    { label: "Postpaid",     value: plans.filter(p => p.planType === "Postpaid").length, color: "#d97706", bg: "#fffbeb", icon: <FiCheckCircle size={18} /> },
    { label: "5G Plans",     value: plans.filter(p => p.networkType === "5G").length,    color: "#7c3aed", bg: "#f5f3ff", icon: <FiWifi size={18} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      <style>{`
        @keyframes toastIn  { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes shrink   { from { width: 100%; } to { width: 0%; } }
        @keyframes fadeUp   { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: #9ca3af; }
        select option { background: white; color: #111827; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}</style>

      {/* ── Toast Notification ── */}
      {notification && (() => {
        const m = notifMeta[notification.type];
        return (
          <div style={{ position: "fixed", top: 24, right: 24, minWidth: 290, borderRadius: 16, overflow: "hidden", zIndex: 9999, animation: "toastIn 0.2s ease forwards", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", background: "white", border: `1px solid ${m.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, background: m.iconBg, color: m.iconColor, fontWeight: 800 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{m.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{notification.message}</div>
              </div>
              <button onClick={() => setNotification(null)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 16, padding: "2px 4px", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ height: 3, background: "#f3f4f6", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", animation: "shrink 2.5s linear forwards", background: m.bar, borderRadius: "0 2px 2px 0" }} />
            </div>
          </div>
        );
      })()}

      {/* ── Topbar ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 99, boxSizing: "border-box", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate("/admin")}
            style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #e5e7eb", background: "white", color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.color = "#2563eb"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Dashboard</span>
              <FiChevronRight size={11} color="#d1d5db" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", background: "#ede9fe", padding: "2px 8px", borderRadius: 20, border: "1px solid #c4b5fd" }}>Plan Catalog</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.4px" }}>Plan Catalog</h2>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#4f46e5,#4338ca)", border: "none", color: "white", padding: "10px 20px", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", boxShadow: "0 4px 12px rgba(79,70,229,0.3)", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(79,70,229,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,70,229,0.3)"; }}
        >
          <FiPlus size={15} /> Add New Plan
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto", animation: "fadeUp 0.3s ease" }}>

        {/* Table card */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

          <div style={{ padding: "16px 22px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>All Plans</span>
              <span style={{ background: "#ede9fe", color: "#4f46e5", border: "1px solid #c4b5fd", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{plans.length} records</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 110px", padding: "11px 22px", background: "linear-gradient(to bottom,#f9fafb,#f3f4f6)", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".6px", borderBottom: "1.5px solid #e5e7eb" }}>
            <span>Plan Name</span><span>Type</span><span>Network</span><span>Data</span><span>Validity</span><span>Price</span><span>Actions</span>
          </div>

          {plans.map((plan, i) => (
            <div
              key={plan.planId}
              onMouseEnter={() => setHoveredRow(plan.planId)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 110px",
                padding: "14px 22px", alignItems: "center",
                borderLeft: hoveredRow === plan.planId ? "3px solid #4f46e5" : "3px solid transparent",
                background: hoveredRow === plan.planId ? "#f0f4ff" : "white",
                borderBottom: i === plans.length - 1 ? "none" : "1px solid #f9fafb",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#ede9fe,#e0e7ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FiPackage size={15} color="#4f46e5" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>{plan.planName}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{plan.callMinutes || "Unlimited"} calls</div>
                </div>
              </div>

              <div><span style={planTypeBadge(plan.planType)}>{plan.planType}</span></div>
              <div><span style={networkBadge(plan.networkType)}>{plan.networkType}</span></div>
              <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{plan.dataLimit}</div>

              <div>
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{plan.validityDays} days</div>
                <div style={{ marginTop: 4, background: "#f3f4f6", borderRadius: 4, height: 3, width: 60 }}>
                  <div style={{ width: `${Math.min((plan.validityDays / 365) * 100, 100)}%`, height: 3, borderRadius: 4, background: "#4f46e5" }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>₹{plan.price}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>per cycle</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setSelectedPlan(plan); setShowEditModal(true); }}
                  style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  title="Edit plan"
                  onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.transform = "scale(1.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => { setSelectedPlan(plan); setShowDeleteModal(true); }}
                  style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  title="Delete plan"
                  onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.transform = "scale(1.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", fontSize: 13 }}>
              <FiPackage size={32} color="#e5e7eb" style={{ display: "block", margin: "0 auto 10px" }} />
              No plans found. Click <b style={{ color: "#4f46e5" }}>Add New Plan</b> to get started.
            </div>
          )}
        </div>
      </div>

      {/* ══ ADD MODAL ══ */}
      {showAddModal && (
        <ModalShell>
          <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#4338ca)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FiPlus size={18} color="white" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>Add New Plan</h2>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Fill in the details below</p>
              </div>
            </div>
            <button onClick={() => setShowAddModal(false)} style={{ border: "1.5px solid #e5e7eb", background: "#f9fafb", padding: "7px 10px", borderRadius: 9, cursor: "pointer", color: "#6b7280", fontSize: 14, lineHeight: 1 }}>✕</button>
          </div>

          <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* ✅ Fixed: PlanFields is defined outside — no remount on state change */}
            <PlanFields plan={newPlan} setPlan={setNewPlan} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Plan Type">
                <select value={newPlan.planType} onChange={e => setNewPlan({ ...newPlan, planType: e.target.value })} style={selectStyle}>
                  <option value="Prepaid">Prepaid</option>
                  <option value="Postpaid">Postpaid</option>
                </select>
              </Field>
              <Field label="Network Type">
                <select value={newPlan.networkType} onChange={e => setNewPlan({ ...newPlan, networkType: e.target.value })} style={selectStyle}>
                  <option value="4G">4G</option>
                  <option value="5G">5G</option>
                </select>
              </Field>
            </div>

            {newPlan.planName && (
              <div style={{ background: "#f8faff", border: "1.5px solid #e0e7ff", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#ede9fe,#e0e7ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FiPackage size={16} color="#4f46e5" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{newPlan.planName}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    {newPlan.dataLimit && `${newPlan.dataLimit} · `}{newPlan.validityDays && `${newPlan.validityDays} days · `}
                    <span style={planTypeBadge(newPlan.planType)}>{newPlan.planType}</span>
                  </div>
                </div>
                {newPlan.price && <div style={{ fontSize: 18, fontWeight: 900, color: "#4f46e5" }}>₹{newPlan.price}</div>}
              </div>
            )}
          </div>

          <div style={{ padding: "16px 26px 22px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #f3f4f6" }}>
            <button onClick={() => setShowAddModal(false)} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "white", color: "#374151", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 13 }}>Cancel</button>
            <button
              onClick={handleAddPlan}
              style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4f46e5,#4338ca)", color: "white", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: 13, boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 18px rgba(79,70,229,0.4)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,70,229,0.3)"}
            >Add Plan</button>
          </div>
        </ModalShell>
      )}

      {/* ══ EDIT MODAL ══ */}
      {showEditModal && selectedPlan && (
        <ModalShell>
          <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#fef3c7,#fde68a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FiEdit2 size={17} color="#d97706" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>Edit Plan</h2>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{selectedPlan.planName}</p>
              </div>
            </div>
            <button onClick={() => setShowEditModal(false)} style={{ border: "1.5px solid #e5e7eb", background: "#f9fafb", padding: "7px 10px", borderRadius: 9, cursor: "pointer", color: "#6b7280", fontSize: 14, lineHeight: 1 }}>✕</button>
          </div>

          <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* ✅ Fixed: PlanFields is defined outside — no remount on state change */}
            <PlanFields plan={selectedPlan} setPlan={setSelectedPlan} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Plan Type">
                <select value={selectedPlan.planType} onChange={e => setSelectedPlan({ ...selectedPlan, planType: e.target.value })} style={selectStyle}>
                  <option value="Prepaid">Prepaid</option>
                  <option value="Postpaid">Postpaid</option>
                </select>
              </Field>
              <Field label="Network Type">
                <select value={selectedPlan.networkType} onChange={e => setSelectedPlan({ ...selectedPlan, networkType: e.target.value })} style={selectStyle}>
                  <option value="4G">4G</option>
                  <option value="5G">5G</option>
                </select>
              </Field>
            </div>
          </div>

          <div style={{ padding: "16px 26px 22px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #f3f4f6" }}>
            <button onClick={() => setShowEditModal(false)} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "white", color: "#374151", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 13 }}>Cancel</button>
            <button
              onClick={handleEditPlan}
              style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#d97706,#b45309)", color: "white", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: 13, boxShadow: "0 4px 12px rgba(217,119,6,0.3)" }}
            >Save Changes</button>
          </div>
        </ModalShell>
      )}

      {/* ══ DELETE MODAL ══ */}
      {showDeleteModal && (
        <ModalShell width={400}>
          <div style={{ padding: "32px 28px", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#fef2f2,#fee2e2)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", border: "1.5px solid #fecaca" }}>
              <FiTrash2 size={24} color="#ef4444" />
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#111827" }}>Delete Plan?</h2>
            <p style={{ color: "#6b7280", margin: "0 0 6px", fontSize: 13 }}>You are about to permanently delete</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 14px", margin: "4px 0 8px" }}>
              <FiPackage size={14} color="#4f46e5" />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{selectedPlan?.planName}</span>
            </div>
            <p style={{ color: "#9ca3af", fontSize: 12, margin: "6px 0 0" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 26 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "white", color: "#374151", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 13 }}>Cancel</button>
              <button
                onClick={handleDeletePlan}
                style={{ padding: "11px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: 13, boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 18px rgba(239,68,68,0.4)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)"}
              >Yes, Delete</button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

export default PlanManagement;