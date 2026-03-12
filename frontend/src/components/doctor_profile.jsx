
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    FaHeartbeat, FaSignOutAlt, FaUserMd,
    FaCalendarAlt, FaClock, FaSearch,
    FaCheck, FaTimes, FaClipboardList,
    FaHourglassHalf, FaBan, FaPhoneAlt,
    FaExclamationTriangle,
} from "react-icons/fa";
import "./doctor_profile.css";

const API = "http://127.0.0.1:8000/api/user";

const STATUS_CFG = {
    confirmed: { label: "Confirmed", cls: "badge-confirmed" },
    pending:   { label: "Pending",   cls: "badge-pending"   },
    cancelled: { label: "Cancelled", cls: "badge-cancelled" },
    completed: { label: "Completed", cls: "badge-confirmed" },
};

export default function DoctorProfile() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");

    const [appointments, setAppointments] = useState([]);
    const [search,       setSearch]       = useState("");
    const [filter,       setFilter]       = useState("all");
    const [expanded,     setExpanded]     = useState(null);
    const [showNotifs,   setShowNotifs]   = useState(false);
    const [doctorInfo,   setDoctorInfo]   = useState({});

    /* Fetch doctor info + appointments on mount */
    useEffect(() => {
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        axios.get(`${API}/welcome/`, { headers })
            .then(res => setDoctorInfo(res.data))
            .catch(() => {});

        axios.get(`${API}/appointments/`, { headers })
            .then(res => setAppointments(res.data))
            .catch(() => {});
    }, [token]);

    /* Notifications = pending appointments */
    const notifications = useMemo(
        () => appointments.filter(a => a.status === "pending"),
        [appointments]
    );

    /* Logout */
    const handleLogout = async () => {
        const access  = localStorage.getItem("access_token");
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) { localStorage.removeItem("access_token"); navigate("/login"); return; }
        try {
            await axios.post(`${API}/logout/`,
                { refresh },
                { headers: { "Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}) } }
            );
        } catch (e) { console.error("Logout failed:", e); }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        delete axios.defaults.headers.common["Authorization"];
        navigate("/login");
    };

    /* Approve / Cancel via API */
    const changeStatus = async (id, newStatus) => {
        try {
            const res = await axios.patch(
                `${API}/appointments/${id}/status/`,
                { status: newStatus },
                { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
            );
            setAppointments(prev => prev.map(a => a.id === id ? res.data : a));
        } catch (e) {
            const msg = e.response?.data?.msg || e.response?.data?.errors?.msg || "Status update failed";
            alert(msg);
            console.error("Status update failed:", msg, e);
        }
    };

    /* Stats */
    const stats = useMemo(() => ({
        total:     appointments.length,
        confirmed: appointments.filter(a => a.status === "confirmed").length,
        pending:   appointments.filter(a => a.status === "pending").length,
        cancelled: appointments.filter(a => a.status === "cancelled").length,
    }), [appointments]);

    /* Filtered + sorted list (emergency first) */
    const filtered = useMemo(() =>
        appointments
            .filter(a => {
                if (filter !== "all" && a.status !== filter) return false;
                if (search && !a.patient_name?.toLowerCase().includes(search.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => {
                if (a.priority === "emergency" && b.priority !== "emergency") return -1;
                if (b.priority === "emergency" && a.priority !== "emergency") return 1;
                return 0;
            }),
        [appointments, filter, search]
    );

    const fmtDate = (iso) =>
        new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
        <div className="da-root">
            {/* ── Header ── */}
            <header className="da-header">
                <div className="da-brand">
                    <FaHeartbeat className="da-brand-icon" />
                    <span className="da-brand-text">HealthConnect</span>
                </div>
                <div className="da-header-right">
                    <div className="da-notif-wrap">
                        <button className="da-icon-btn" title="Notifications"
                            onClick={() => setShowNotifs(v => !v)}
                            style={{ background: '#f8fafc', color: '#2563eb' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a6 6 0 00-6 6v4.586l-1.707 1.707A1 1 0 005 17h14a1 1 0 00.707-1.707L18 12.586V8a6 6 0 00-6-6zm0 20a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22z" /></svg>
                            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
                        </button>

                        {showNotifs && (
                            <div className="notif-panel">
                                <div className="notif-panel-header">
                                    <span>Notifications</span>
                                    <button className="notif-close" onClick={() => setShowNotifs(false)}><FaTimes /></button>
                                </div>
                                {notifications.length === 0 ? (
                                    <p className="notif-empty">No pending appointments.</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className="notif-item">
                                            <div className="notif-dot" />
                                            <div>
                                                <p className="notif-title">
                                                    {n.patient_name}
                                                    {n.priority === "emergency" && <FaExclamationTriangle style={{ color: "#ef4444", marginLeft: 6 }} />}
                                                </p>
                                                <p className="notif-sub">{fmtDate(n.date)} · {n.time_slot} · {n.disease || n.reason}</p>
                                            </div>
                                            <div className="notif-item-btns">
                                                <button className="btn-approve" title="Approve" onClick={() => changeStatus(n.id, "confirmed")}><FaCheck /></button>
                                                <button className="btn-cancel"  title="Cancel"  onClick={() => changeStatus(n.id, "cancelled")}><FaTimes /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <button className="da-logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </header>

            <div className="da-body">
                {/* ── Sidebar ── */}
                <aside className="da-sidebar">
                    <div className="da-card doctor-card">
                        <div className="dr-avatar">{doctorInfo.fullname?.slice(0, 2).toUpperCase() || "DR"}</div>
                        <h3 className="dr-name">{doctorInfo.fullname || "Doctor"}</h3>
                        <p className="dr-spec">{doctorInfo.specialization?.replace(/_/g, " ") || ""}</p>
                        <div className="dr-tags">
                            <span className="dr-tag"><FaUserMd /> {doctorInfo.experience || 0} yrs exp</span>
                        </div>
                        <div className="dr-divider" />
                        <div className="dr-quick-stat">
                            <div><span className="qs-val">{stats.pending}</span><span className="qs-lbl">Pending</span></div>
                            <div><span className="qs-val">{stats.total}</span><span className="qs-lbl">Total</span></div>
                        </div>
                    </div>
                </aside>

                {/* ── Main ── */}
                <main className="da-main">
                    {/* Stats row */}
                    <div className="stats-row">
                        <div className="stat-card" style={{ "--accent": "#2563eb" }}>
                            <FaClipboardList className="stat-icon" /><div><div className="stat-val">{stats.total}</div><div className="stat-lbl">Total</div></div>
                        </div>
                        <div className="stat-card" style={{ "--accent": "#10b981" }}>
                            <FaCheck className="stat-icon" /><div><div className="stat-val">{stats.confirmed}</div><div className="stat-lbl">Confirmed</div></div>
                        </div>
                        <div className="stat-card" style={{ "--accent": "#f59e0b" }}>
                            <FaHourglassHalf className="stat-icon" /><div><div className="stat-val">{stats.pending}</div><div className="stat-lbl">Pending</div></div>
                        </div>
                        <div className="stat-card" style={{ "--accent": "#ef4444" }}>
                            <FaBan className="stat-icon" /><div><div className="stat-val">{stats.cancelled}</div><div className="stat-lbl">Cancelled</div></div>
                        </div>
                    </div>

                    {/* Search & filter */}
                    <div className="da-card filter-bar">
                        <div className="da-search-box">
                            <FaSearch className="da-search-icon" />
                            <input type="text" className="da-search-input" placeholder="Search patient name…"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="filter-tabs">
                            {["all", "confirmed", "pending", "cancelled"].map(f => (
                                <button key={f}
                                    className={`filter-tab${filter === f ? " ft-active" : ""}`}
                                    onClick={() => setFilter(f)}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section heading */}
                    <div className="da-section-header">
                        <h2 className="da-section-title">All Appointments</h2>
                        <span className="da-count-badge">{filtered.length} appointment{filtered.length !== 1 ? "s" : ""}</span>
                    </div>

                    {/* Appointment cards */}
                    {filtered.length === 0 ? (
                        <div className="da-card da-empty">
                            <FaCalendarAlt className="da-empty-icon" />
                            <p>No appointments match your filters.</p>
                        </div>
                    ) : (
                        filtered.map(appt => (
                            <div key={appt.id} className={`da-card appt-card${expanded === appt.id ? " appt-expanded" : ""}${appt.priority === "emergency" ? " appt-emergency" : ""}`}>
                                <div className="appt-avatar">{appt.patient_name?.slice(0, 2).toUpperCase() || "?"}</div>

                                <div className="appt-info">
                                    <h3 className="appt-patient">
                                        {appt.patient_name}
                                        {appt.priority === "emergency" && (
                                            <span style={{ color: "#ef4444", fontSize: "0.75rem", marginLeft: 8, fontWeight: 700 }}>
                                                <FaExclamationTriangle /> EMERGENCY
                                            </span>
                                        )}
                                    </h3>
                                    <div className="appt-meta">
                                        <span className="appt-meta-item"><FaCalendarAlt /> {fmtDate(appt.date)}</span>
                                        <span className="appt-meta-item"><FaClock /> {appt.time_slot}</span>
                                        <span className="appt-meta-item">{appt.disease || appt.reason}</span>
                                    </div>
                                    {expanded === appt.id && (
                                        <div className="appt-expanded-body">
                                            {appt.reason && <p><strong>Reason:</strong> {appt.reason}</p>}
                                            {appt.symptoms?.length > 0 && (
                                                <p><strong>Symptoms:</strong> {appt.symptoms.map(s => s.replace(/_/g, " ")).join(", ")}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="appt-actions">
                                    <span className={`appt-badge ${STATUS_CFG[appt.status]?.cls || ""}`}>
                                        {STATUS_CFG[appt.status]?.label || appt.status}
                                    </span>
                                    <div className="appt-btns">
                                        <button className="btn-view" onClick={() => setExpanded(expanded === appt.id ? null : appt.id)}>
                                            {expanded === appt.id ? "Hide" : "View"}
                                        </button>
                                        {appt.status === "pending" && (
                                            <>
                                                <button className="btn-approve" title="Approve" onClick={() => changeStatus(appt.id, "confirmed")}>
                                                    <FaCheck /> <span className="btn-label">Approve</span>
                                                </button>
                                                <button className="btn-cancel" title="Disapprove" onClick={() => changeStatus(appt.id, "cancelled")}>
                                                    <FaTimes /> <span className="btn-label">Reject</span>
                                                </button>
                                            </>
                                        )}
                                        {appt.status === "confirmed" && (
                                            <button className="btn-approve" title="Mark as Completed" onClick={() => changeStatus(appt.id, "completed")}>
                                                <FaCheck /> <span className="btn-label">Complete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </main>
            </div>

            <footer className="da-footer">© 2026 HealthConnect. All rights reserved.</footer>
        </div>
    );
}
