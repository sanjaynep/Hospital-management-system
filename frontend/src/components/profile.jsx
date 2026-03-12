import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaExclamationTriangle, FaUserMd, FaHeadset, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaHourglassHalf } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./profile.css";
import Dashboard_header from "./dashboard_header";
import { MdOutlineCancel } from "react-icons/md";

const API = "http://127.0.0.1:8000/api/user";

const STATUS_ICON = {
  confirmed: <FaCheckCircle style={{ color: "#10b981" }} />,
  cancelled: <FaTimesCircle style={{ color: "#ef4444" }} />,
  pending:   <FaHourglassHalf style={{ color: "#f59e0b" }} />,
  completed: <FaCheckCircle style={{ color: "#2563eb" }} />,
};

export default function Dashboard() {
  const [data, setData]               = useState({ email: "", username: "", id: "" });
  const [doctors, setDoctors]         = useState([]);
  const [notifications, setNotifs]    = useState([]);
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    // user info
    axios.get(`${API}/welcome/`, { headers })
      .then(res => setData({ email: res.data.email, username: res.data.fullname || res.data.full_name, id: res.data.id }))
      .catch(() => {});

    // Top 4 doctors for preview
    axios.get(`${API}/doctors/`)
      .then(res => setDoctors(res.data.slice(0, 4)))
      .catch(() => {});

    // patient notifications (all appointments)
    axios.get(`${API}/notifications/`, { headers })
      .then(res => setNotifs(res.data))
      .catch(() => {});
  }, [token]);

  return (
    <div className="page">
      <Dashboard_header />

      <div className="main">
        {/* ── Left sidebar ── */}
        <div className="left">
          <h1>Quick Links</h1>
          <button className="ql-btn ql-emergency" onClick={() => navigate("/emergency")}>
            <FaExclamationTriangle /> Emergency Services
          </button>
          <button className="ql-btn ql-doctors" onClick={() => navigate("/doctors")}>
            <FaUserMd /> Doctors
          </button>
          <button className="ql-btn ql-support" onClick={() => alert("Call helpline: 112")}>
            <FaHeadset /> Contact Support
          </button>

          {/* Patient appointment history */}
          {notifications.length > 0 && (
            <>
              <h3 className="sidebar-heading">My Appointments</h3>
              {notifications.slice(0, 6).map(n => (
                <div key={n.id} className={`notif-card notif-${n.status}`}>
                  <MdOutlineCancel className="text-danger "style={{ cursor: "pointer", height:"15px"}} />
                  <div className="notif-icon">{STATUS_ICON[n.status]}</div>
                  <div className="notif-body">
                    <strong>{n.doctor_name}</strong>
                    <span className="notif-date"><FaCalendarAlt /> {n.date} · {n.time_slot}</span>
                    <span className="notif-status">
                      {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                      {n.priority === "emergency" && <span className="notif-emg-tag">EMERGENCY</span>}
                    </span>
                    {n.disease && <span className="notif-disease">{n.disease}</span>}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ── Right main content ── */}
        <div className="right">
          <div className="profile-banner">
            <div>
              <h2>Welcome, {data.username || "Guest"}</h2>
              <p>Find and book appointments with expert doctors</p>
            </div>
            <button onClick={() => navigate("/book_appointment")} className="book-btn">
              + Book Appointment
            </button>
          </div>

          <div className="doctors-section">
            <div className="section-header-row">
              <h3>Available Doctors</h3>
              <button className="view-all-btn" onClick={() => navigate("/doctors")}>View All →</button>
            </div>
            <div className="doctor-cards">
              {doctors.length === 0 && <p>No doctors registered yet.</p>}
              {doctors.map(doc => (
                <div key={doc.id} className="doctor-card">
                  <div className="doc-header">
                    <div className="doc-avatar">{doc.fullname?.charAt(0) || "D"}</div>
                    <div className="doc-info">
                      <h4>{doc.fullname}</h4>
                      <p>{doc.specialization?.replace(/_/g, " ")}</p>
                      <span>{doc.experience || 0} yrs experience</span>
                    </div>
                  </div>
                  <div className="doc-actions">
                    <span className="avail-badge avail">Available</span>
                    <button onClick={() => navigate("/book_appointment", { state: { doctor: doc } })} className="select-btn">
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="footer fs-6">©2023 HealthConnect. All rights reserved</footer>
    </div>
  );
}