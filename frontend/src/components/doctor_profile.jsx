
import { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    FaHeartbeat, FaSignOutAlt, FaUserMd,
    FaCalendarAlt, FaClock, FaSearch, 
    FaCheck, FaTimes, FaClipboardList,
    FaHourglassHalf, FaBan, FaPhoneAlt,
} from "react-icons/fa";
import "./doctor_profile.css";

/* ─── Sample data (replace with API calls) ─────────────────── */
const SAMPLE_APPOINTMENTS = [
    { id: 1, patient: "John Doe",      avatar: "JD", date: "2026-02-21", time: "10:00 AM", reason: "General Checkup",   status: "confirmed", phone: "555-0101" },
    { id: 2, patient: "Sarah Smith",   avatar: "SS", date: "2026-02-21", time: "11:30 AM", reason: "Fever & Cold",      status: "pending",   phone: "555-0102" },
    { id: 3, patient: "Michael Brown", avatar: "MB", date: "2026-02-21", time: "01:00 PM", reason: "Follow-up",         status: "confirmed", phone: "555-0103" },
    { id: 4, patient: "Emily Davis",   avatar: "ED", date: "2026-02-22", time: "09:00 AM", reason: "Blood Pressure",    status: "confirmed", phone: "555-0104" },
    { id: 5, patient: "Robert Wilson", avatar: "RW", date: "2026-02-22", time: "02:30 PM", reason: "Diabetes Checkup",  status: "pending",   phone: "555-0105" },
    { id: 6, patient: "Lisa Anderson", avatar: "LA", date: "2026-02-23", time: "10:30 AM", reason: "Skin Rash",         status: "cancelled", phone: "555-0106" },
    { id: 7, patient: "James Taylor",  avatar: "JT", date: "2026-02-24", time: "03:00 PM", reason: "Back Pain",         status: "confirmed", phone: "555-0107" },
    { id: 8, patient: "Nancy Martinez",avatar: "NM", date: "2026-02-25", time: "01:30 PM", reason: "Vision Test",       status: "pending",   phone: "555-0108" },
];

const STATUS_CFG = {
    confirmed: { label: "Confirmed", cls: "badge-confirmed" },
    pending:   { label: "Pending",   cls: "badge-pending"   },
    cancelled: { label: "Cancelled", cls: "badge-cancelled" },
};

// MiniCalendar removed per request — calendar UI and filtering have been removed.

/* ─── Main Component ─────────────────────────────────────────── */
export default function DoctorProfile() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState(SAMPLE_APPOINTMENTS);
    const [search,       setSearch]       = useState("");
    const [filter,       setFilter]       = useState("all");
    const [expanded,     setExpanded]     = useState(null);
    const [showNotifs,   setShowNotifs]   = useState(false);

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
            await axios.post("http://127.0.0.1:8000/api/user/logout/",
                { refresh },
                { headers: { "Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}) } }
            );
        } catch (e) { console.error("Logout failed:", e); }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        delete axios.defaults.headers.common["Authorization"];
        navigate("/login");
    };

    /* Approve / Cancel inline */
    const changeStatus = (id, status) =>
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));

    /* Stats */
    const stats = useMemo(() => ({
        total:     appointments.length,
        confirmed: appointments.filter(a => a.status === "confirmed").length,
        pending:   appointments.filter(a => a.status === "pending").length,
        cancelled: appointments.filter(a => a.status === "cancelled").length,
    }), [appointments]);

    
    /* Filtered list (calendar filtering removed) */
    const filtered = useMemo(() => appointments.filter(a => {
        if (filter !== "all" && a.status !== filter) return false;
        if (search && !a.patient.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [appointments, filter, search]);

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
                        <button
                            className="da-icon-btn"
                            title="Notifications"
                            aria-label="Notifications"
                            onClick={() => { console.log('notif toggle'); setShowNotifs(v => !v); }}
                            style={{ background: '#f8fafc', color: '#2563eb' }}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                                <path d="M12 2a6 6 0 00-6 6v4.586l-1.707 1.707A1 1 0 005 17h14a1 1 0 00.707-1.707L18 12.586V8a6 6 0 00-6-6zm0 20a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22z" />
                            </svg>
                           
                            {notifications.length > 0 && (
                                <span className="notif-badge">{notifications.length}</span>
                            )}
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
                                                <p className="notif-title">{n.patient}</p>
                                                <p className="notif-sub">{fmtDate(n.date)} · {n.time} · {n.reason}</p>
                                            </div>
                                            <div className="notif-item-btns">
                                                <button className="btn-approve" title="Approve" onClick={() => { changeStatus(n.id, "confirmed"); }}><FaCheck /></button>
                                                <button className="btn-cancel"  title="Cancel"  onClick={() => { changeStatus(n.id, "cancelled"); }}><FaTimes /></button>
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

                    {/* Doctor card */}
                    <div className="da-card doctor-card">
                        <div className="dr-avatar">DM</div>
                        <h3 className="dr-name">Dr. David Miller</h3>
                        <p className="dr-spec">Cardiologist</p>
                        <div className="dr-tags">
                            <span className="dr-tag"><FaUserMd /> MBBS, MD</span>
                            <span className="dr-tag">12 yrs exp</span>
                        </div>
                        <div className="dr-divider" />
                        <div className="dr-quick-stat">
                            <div><span className="qs-val">{stats.confirmed}</span><span className="qs-lbl">Today's</span></div>
                            <div><span className="qs-val">{stats.total}</span><span className="qs-lbl">Total</span></div>
                        </div>
                    </div>

                    {/* Calendar removed */}

                </aside>

                {/* ── Main ── */}
                <main className="da-main">

                    {/* Stats row */}
                    <div className="stats-row">
                        <div className="stat-card" style={{ "--accent": "#2563eb" }}>
                            <FaClipboardList className="stat-icon" />
                            <div>
                                <div className="stat-val">{stats.total}</div>
                                <div className="stat-lbl">Total</div>
                            </div>
                        </div>
                        <div className="stat-card" style={{ "--accent": "#10b981" }}>
                            <FaCheck className="stat-icon" />
                            <div>
                                <div className="stat-val">{stats.confirmed}</div>
                                <div className="stat-lbl">Confirmed</div>
                            </div>
                        </div>
                        <div className="stat-card" style={{ "--accent": "#f59e0b" }}>
                            <FaHourglassHalf className="stat-icon" />
                            <div>
                                <div className="stat-val">{stats.pending}</div>
                                <div className="stat-lbl">Pending</div>
                            </div>
                        </div>
                        <div className="stat-card" style={{ "--accent": "#ef4444" }}>
                            <FaBan className="stat-icon" />
                            <div>
                                <div className="stat-val">{stats.cancelled}</div>
                                <div className="stat-lbl">Cancelled</div>
                            </div>
                        </div>
                    </div>

                    {/* Search & filter bar */}
                    <div className="da-card filter-bar">
                        <div className="da-search-box">
                            <FaSearch className="da-search-icon" />
                            <input
                                type="text"
                                className="da-search-input"
                                placeholder="Search patient name…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="filter-tabs">
                            {["all", "confirmed", "pending", "cancelled"].map(f => (
                                <button
                                    key={f}
                                    className={`filter-tab${filter === f ? " ft-active" : ""}`}
                                    onClick={() => setFilter(f)}
                                >
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
                            <div key={appt.id} className={`da-card appt-card${expanded === appt.id ? " appt-expanded" : ""}`}>
                                <div className="appt-avatar">{appt.avatar}</div>

                                <div className="appt-info">
                                    <h3 className="appt-patient">{appt.patient}</h3>
                                    <div className="appt-meta">
                                        <span className="appt-meta-item"><FaCalendarAlt /> {fmtDate(appt.date)}</span>
                                        <span className="appt-meta-item"><FaClock /> {appt.time}</span>
                                        <span className="appt-meta-item">{appt.reason}</span>
                                    </div>
                                    {/* Expanded details */}
                                    {expanded === appt.id && (
                                        <div className="appt-expanded-body">
                                            <span className="appt-meta-item"><FaPhoneAlt /> {appt.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="appt-actions">
                                    <span className={`appt-badge ${STATUS_CFG[appt.status].cls}`}>
                                        {STATUS_CFG[appt.status].label}
                                    </span>
                                    <div className="appt-btns">
                                        <button
                                            className="btn-view"
                                            onClick={() => setExpanded(expanded === appt.id ? null : appt.id)}
                                        >
                                            {expanded === appt.id ? "Hide" : "View"}
                                        </button>
                                        {appt.status === "pending" && (
                                            <>
                                                <button className="btn-approve" title="Approve" onClick={() => changeStatus(appt.id, "confirmed")}><FaCheck /></button>
                                                <button className="btn-cancel"  title="Cancel"  onClick={() => changeStatus(appt.id, "cancelled")}><FaTimes /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </main>
            </div>

            <footer className="da-footer">
                © 2026 HealthConnect. All rights reserved.
            </footer>
        </div>
    );
}
