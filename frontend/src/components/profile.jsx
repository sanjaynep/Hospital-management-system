import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaHeartbeat } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./profile.css"

// ── Dummy doctor data ─────────────────────────────────────────────────────────
// When backend is ready, replace this with:
//   const [doctors, setDoctors] = useState([]);
//   and fetch from GET /api/doctors/ inside useEffect
const DUMMY_DOCTORS = [
  { id: 1, name: "Dr. Aarav Mehta",  specialty: "Cardiologist",  experience: 12, available: true  },
  { id: 2, name: "Dr. Priya Sharma", specialty: "Dermatologist", experience: 8,  available: true  },
  { id: 3, name: "Dr. Rajesh Kumar", specialty: "Orthopedic",    experience: 15, available: false },
  { id: 4, name: "Dr. Sneha Patel",  specialty: "Neurologist",   experience: 10, available: true  },
  { id: 5, name: "Dr. Vikram Joshi", specialty: "Pediatrician",  experience: 6,  available: true  },
];
// ──────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  let [data, setdata] = useState({ email: "", username: "", id: "" })
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate()
  useEffect(() => {
    if (!token) return;

    axios.get("http://localhost:8000/api/user/welcome/", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setdata({ email: response.data.email, username: response.data.full_name, id: response.data.id });
      });

  }, [token])



  const handlelogout = async () => {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      // nothing to revoke — just clear and redirect
      localStorage.removeItem("access_token");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/user/logout/",
        { refresh },
        { headers: { "Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}), }, });

      if (res.status === 205 || res.status === 200) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        delete axios.defaults.headers.common["Authorization"];
        navigate("/login");
        return;
      }
    }
    catch (e) {

      console.error("Logout failed:");
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  return (
    <div className="page">
      <header className='header'>
        <div className="icons"><FaHeartbeat /><h1>HealthConnect</h1></div>
        <div className="header-actions">
          <button className="notification">
            Notifications
          </button>
          <button onClick={handlelogout} className="logout">
            Logout
          </button>
        </div>
      </header>

      <div className="main">
        <div className="left">
          <h1>Quick Links</h1>
          <button>Emergency Services</button>
          <button>Contact Support</button>
          <button>Doctors</button>
        </div>
        <div className="right">

          <div className="profile-banner">
            <div>
              <h2>Welcome, {data.username || "Guest"}</h2>
              <p>Find and book appointments with expert doctors</p>
            </div>
            <button onClick={() => navigate("/appointment")} className="book-btn">
              + Book Appointment
            </button>
          </div>

          <div className="doctors-section">
            <h3>Available Doctors</h3>
            <div className="doctor-cards">
              {DUMMY_DOCTORS.map(doc => (
                <div key={doc.id} className="doctor-card">
                  <div className="doc-header">
                    <div className="doc-avatar">{doc.name.charAt(0)}</div>
                    <div className="doc-info">
                      <h4>{doc.name}</h4>
                      <p>{doc.specialty}</p>
                      <span>{doc.experience} yrs experience</span>
                    </div>
                  </div>
                  <div className="doc-actions">
                    <span className={`avail-badge ${doc.available ? "avail" : "busy"}`}>
                      {doc.available ? "Available" : "Busy"}
                    </span>
                    <button
                      onClick={() => navigate("/appointment")}
                      disabled={!doc.available}
                      className="select-btn"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>


      <footer className="footer fs-6" >
        ©2023 HealthConnect. All rights reserved
      </footer>
    </div>
  );
}