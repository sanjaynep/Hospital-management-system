import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaHeartbeat, FaArrowLeft, FaCheckCircle, FaPhoneAlt } from "react-icons/fa";
import Dashboard_header from "./dashboard_header";
import "./emergency.css";

const API = "http://127.0.0.1:8000/api/user";

export default function Emergency() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [conditions, setConditions]     = useState([]);
  const [selected, setSelected]         = useState("");
  const [result, setResult]             = useState(null);    // booked appointment
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  /* Load supported emergency conditions from backend */
  useEffect(() => {
    axios.get(`${API}/emergency/`)
      .then(res => setConditions(res.data.conditions || []))
      .catch(() => setConditions([
        "Heart Attack", "Stroke", "Snake Bite", "Severe Bleeding",
        "Seizure", "Breathing Difficulty", "Severe Burn",
        "Poisoning", "Accident / Trauma", "Anaphylaxis",
      ]));
  }, []);

  /* Book emergency (round-robin auto-assign) */
  const handleBook = async () => {
    if (!selected) { setError("Please select an emergency condition."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/emergency/`,
        { condition: selected },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Could not book emergency. Please call helpline.");
    }
    setLoading(false);
  };

  return (
    <>
      <Dashboard_header />

      <div className="emg-container">
        {/* ─── Header banner ─── */}
        <div className="emg-banner">
          <FaExclamationTriangle className="emg-banner-icon" />
          <div>
            <h2>Emergency Services</h2>
            <p>Select your emergency — a doctor will be assigned immediately via round-robin scheduling</p>
          </div>
        </div>

        {error && <p className="emg-error">{error}</p>}

        {/* ─── Condition selection ─── */}
        {!result && (
          <>
            <h3 className="emg-section-title">What is the emergency?</h3>
            <div className="emg-grid">
              {conditions.map(c => (
                <button
                  key={c}
                  className={`emg-card ${selected === c ? "emg-card-active" : ""}`}
                  onClick={() => { setSelected(c); setError(""); }}
                >
                  <FaHeartbeat className="emg-card-icon" />
                  <span>{c}</span>
                </button>
              ))}
            </div>

            <div className="emg-actions">
              <button className="emg-back" onClick={() => navigate("/profile")}>
                <FaArrowLeft /> Back to Dashboard
              </button>
              <button
                className="emg-book"
                disabled={!selected || loading}
                onClick={handleBook}
              >
                {loading ? "Assigning Doctor…" : "Book Emergency Now"}
              </button>
            </div>

            <div className="emg-helpline">
              <FaPhoneAlt /> If the situation is critical, call emergency helpline: <strong>112</strong>
            </div>
          </>
        )}

        {/* ─── Booking confirmation ─── */}
        {result && (
          <div className="emg-result">
            <FaCheckCircle className="emg-result-icon" />
            <h3>Emergency Appointment Booked!</h3>
            <div className="emg-result-details">
              <div className="emg-detail-row">
                <span>Condition</span><strong>{result.disease}</strong>
              </div>
              <div className="emg-detail-row">
                <span>Doctor</span><strong>{result.doctor_name}</strong>
              </div>
              <div className="emg-detail-row">
                <span>Date</span><strong>{result.date}</strong>
              </div>
              <div className="emg-detail-row">
                <span>Time Slot</span><strong>{result.time_slot}</strong>
              </div>
              <div className="emg-detail-row">
                <span>Status</span>
                <strong style={{ color: "#f59e0b" }}>
                  {result.status?.charAt(0).toUpperCase() + result.status?.slice(1)} — awaiting doctor confirmation
                </strong>
              </div>
            </div>
            <p className="emg-result-note">The doctor will confirm or reschedule shortly. Priority: <strong style={{ color: "#ef4444" }}>EMERGENCY</strong></p>
            <div className="emg-actions">
              <button className="emg-back" onClick={() => navigate("/profile")}>
                <FaArrowLeft /> Back to Dashboard
              </button>
              <button className="emg-book" onClick={() => { setResult(null); setSelected(""); }}>
                Book Another Emergency
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="footer fs-6">©2023 HealthConnect. All rights reserved</footer>
    </>
  );
}
