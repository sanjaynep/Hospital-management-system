import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./appointment.css";
import "./profile.css";
import Dashboard_header from "./dashboard_header";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/user";

const symptomsList = [
  'back_pain','constipation','abdominal_pain','diarrhoea','mild_fever','yellow_urine',
  'yellowing_of_eyes','acute_liver_failure','fluid_overload','swelling_of_stomach',
  'swelled_lymph_nodes','malaise','blurred_and_distorted_vision','phlegm','throat_irritation',
  'redness_of_eyes','sinus_pressure','runny_nose','congestion','chest_pain','weakness_in_limbs',
  'fast_heart_rate','pain_during_bowel_movements','pain_in_anal_region','bloody_stool',
  'irritation_in_anus','neck_pain','dizziness','cramps','bruising','obesity','swollen_legs',
  'swollen_blood_vessels','puffy_face_and_eyes','enlarged_thyroid','brittle_nails',
  'swollen_extremeties','excessive_hunger','drying_and_tingling_lips','slurred_speech',
  'knee_pain','hip_joint_pain','muscle_weakness','stiff_neck','swelling_joints',
  'movement_stiffness','spinning_movements','loss_of_balance','unsteadiness',
  'weakness_of_one_body_side','loss_of_smell','bladder_discomfort','foul_smell_of urine',
  'continuous_feel_of_urine','passage_of_gases','internal_itching','depression',
  'irritability','muscle_pain','belly_pain'
];

const symptomLabels = {
  sinus_pressure: "headache"
};

const MAX_SELECTIONS = 5;

const BookAppointment = () => {
  const token = localStorage.getItem("access_token");
  const location = useLocation();
  const navigate = useNavigate();

  // Doctor passed from doctors_list or profile page
  const preSelectedDoctor = location.state?.doctor || null;

  // ── symptom selection state ──
  const [selectedSymptoms, setSelectedSymptoms] = useState(Array(MAX_SELECTIONS).fill(""));
  const chosenCount = selectedSymptoms.filter(Boolean).length;

  // ── prediction result ──
  const [disease, setDisease]           = useState("");
  const [specialization, setSpec]       = useState("");
  const [doctors, setDoctors]           = useState([]);

  // ── booking form ──
  const [selectedDoctor, setSelectedDoctor] = useState(preSelectedDoctor);
  const [selectedDate, setSelectedDate]     = useState("");
  const [slots, setSlots]                   = useState([]);
  const [selectedSlot, setSelectedSlot]     = useState("");
  const [reason, setReason]                 = useState("");

  // ── UI state ──
  // If doctor is pre-selected, start on "direct" flow (symptoms + date in one step)
  const [step, setStep]       = useState(preSelectedDoctor ? "direct" : "symptoms");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // ── helpers ──
  const handleChange = (index, value) => {
    const updated = [...selectedSymptoms];
    updated[index] = value;
    setSelectedSymptoms(updated);
  };

  const availableSymptoms = (index) =>
    symptomsList
      .filter(s => !selectedSymptoms.includes(s) || selectedSymptoms[index] === s)
      .sort((a, b) => a.replace(/_/g, " ").localeCompare(b.replace(/_/g, " ")));

  // ── REGULAR FLOW Step 1: predict ──
  const handlePredict = async () => {
    setError("");
    setLoading(true);
    try {
      const chosen = selectedSymptoms.filter(Boolean);
      const res = await axios.post(`${API}/predict/`, { symptoms: chosen },
        { headers: { "Content-Type": "application/json" } });
      setDisease(res.data.predicted_disease);
      setSpec(res.data.suggested_specialization);
      setDoctors(res.data.available_doctors || []);
      setStep("result");
    } catch (err) {
      setError(err.response?.data?.msg || "Prediction failed");
    }
    setLoading(false);
  };

  // ── REGULAR FLOW Step 2: pick doctor → load slots ──
  const pickDoctor = async (doc) => {
    setSelectedDoctor(doc);
    setSelectedSlot("");
    setSlots([]);
    setStep("booking");
  };

  const loadSlots = async (date) => {
    setSelectedDate(date);
    setSelectedSlot("");
    if (!selectedDoctor || !date) return;
    try {
      const res = await axios.get(`${API}/doctors/${selectedDoctor.id}/slots/?date=${date}`);
      setSlots(res.data.slots || []);
    } catch { setSlots([]); }
  };

  // ── DIRECT FLOW: predict + book in one step ──
  const handleDirectBook = async () => {
    setError("");
    if (!selectedSlot) { setError("Pick a time slot"); return; }
    setLoading(true);
    try {
      // First predict disease from symptoms
      const chosen = selectedSymptoms.filter(Boolean);
      const predRes = await axios.post(`${API}/predict/`, { symptoms: chosen },
        { headers: { "Content-Type": "application/json" } });
      const predictedDisease = predRes.data.predicted_disease;
      setDisease(predictedDisease);

      // Then book with the pre-selected doctor
      await axios.post(`${API}/appointments/`, {
        doctor: selectedDoctor.id,
        disease: predictedDisease,
        symptoms: chosen,
        date: selectedDate,
        time_slot: selectedSlot,
        priority: "normal",
        reason,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.msg || "Booking failed – slot may be taken");
    }
    setLoading(false);
  };

  // ── REGULAR FLOW Step 3: book ──
  const handleBook = async () => {
    setError("");
    if (!selectedSlot) { setError("Pick a time slot"); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/appointments/`, {
        doctor: selectedDoctor.id,
        disease,
        symptoms: selectedSymptoms.filter(Boolean),
        date: selectedDate,
        time_slot: selectedSlot,
        priority: "normal",
        reason,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.msg || "Booking failed – slot may be taken");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setStep(preSelectedDoctor ? "direct" : "symptoms");
    setSelectedSymptoms(Array(MAX_SELECTIONS).fill(""));
    setDisease("");
    setDoctors([]);
    setSelectedDoctor(preSelectedDoctor);
    setSelectedDate("");
    setSlots([]);
    setSelectedSlot("");
    setReason("");
    setError("");
  };

  // ── render ──
  return (
    <>
      <Dashboard_header />
      <div className="appointment-container">
        <h2 className="title">Book Appointment</h2>

       

        {/* ─── DIRECT FLOW: pre-selected doctor ─── */}
        {step === "direct" && selectedDoctor && (
          <>
            <div className="result-section" style={{ marginBottom: 16 }}>
              <h3>Booking with {selectedDoctor.fullname}</h3>
              <div className="result-row">
                <span>Specialization:</span>
                <strong>{selectedDoctor.specialization?.replace(/_/g, " ")}</strong>
              </div>
              {selectedDoctor.experience && (
                <div className="result-row">
                  <span>Experience:</span>
                  <strong>{selectedDoctor.experience} yrs</strong>
                </div>
              )}
            </div>

            <p className="subtitle">Select symptoms (at least 2, up to 5)</p>

            <div className="symptom-section">
              {selectedSymptoms.map((sym, i) => (
                <div className="select-group" key={i}>
                  <label>Symptom {i + 1}</label>
                  <select value={sym} onChange={e => handleChange(i, e.target.value)}>
                    <option value="" disabled>Select symptom</option>
                    {availableSymptoms(i).map((s, j) => (
                      <option key={j} value={s}>{symptomLabels[s] || s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {chosenCount < 2 && (
              <p style={{ color: "#c53030", fontWeight: 600 }}>Must select at least 2 symptoms</p>
            )}

            <div className="select-group">
              <label>Date</label>
              <input type="date" value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => loadSlots(e.target.value)} />
            </div>

            {slots.length > 0 && (
              <div className="slot-grid">
                {slots.map(s => (
                  <button key={s}
                    className={`slot-btn ${selectedSlot === s ? "slot-active" : ""}`}
                    onClick={() => setSelectedSlot(s)}>{s}</button>
                ))}
              </div>
            )}
            {selectedDate && slots.length === 0 && (
              <p className="place">No slots available on this date.</p>
            )}

            <div className="select-group">
              <label>Reason / Note (optional)</label>
              <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} />
            </div>

            <button className="book-btn"
              disabled={chosenCount < 2 || !selectedSlot || loading}
              onClick={handleDirectBook}>
              {loading ? "Booking…" : "Confirm Appointment"}
            </button>

             {error && <p className="error-msg">{error}</p>}
          </>
        )}

        {/* ─── REGULAR FLOW STEP: symptoms ─── */}
        {step === "symptoms" && (
          <>
            <p className="subtitle">Select symptoms (at least 2, up to 5)</p>

            <div className="symptom-section">
              {selectedSymptoms.map((sym, i) => (
                <div className="select-group" key={i}>
                  <label>Symptom {i + 1}</label>
                  <select value={sym} onChange={e => handleChange(i, e.target.value)}>
                    <option value="" disabled>Select symptom</option>
                    {availableSymptoms(i).map((s, j) => (
                      <option key={j} value={s}>{symptomLabels[s] || s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {chosenCount < 2 && (
              <p style={{ color: "#c53030", fontWeight: 600 }}>Must select at least 2 symptoms</p>
            )}

            <button className="book-btn" disabled={chosenCount < 2 || loading} onClick={handlePredict}>
              {loading ? "Predicting…" : "Predict Disease"}
            </button>

            {error && <p className="error-msg">{error}</p>}
          </>
        )}

        {/* ─── STEP: result → pick doctor ─── */}
        {step === "result" && (
          <div className="result-section">
            <h3>Prediction Result</h3>
            <div className="result-row">
              <span>Predicted Disease:</span>
              <strong>{disease}</strong>
            </div>
            <div className="result-row">
              <span>Suggested Specialization:</span>
              <strong>{specialization.replace(/_/g, " ")}</strong>
            </div>

            <h4 style={{ marginTop: 16 }}>Available Doctors</h4>
            {doctors.length === 0 ? (
              <p className="place">No doctors found for this specialization.</p>
            ) : (
              <div className="doctor-pick-list">
                {doctors.map(doc => (
                  <div key={doc.id} className="doctor-pick-card" onClick={() => pickDoctor(doc)}>
                    <div className="doc-avatar">{doc.fullname.charAt(0)}</div>
                    <div>
                      <strong>{doc.fullname}</strong>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                        {doc.specialization?.replace(/_/g, " ")} · {doc.experience} yrs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="book-btn" style={{ background: "#888", marginTop: 12 }} onClick={() => setStep("symptoms")}>
              ← Back
            </button>

            {error && <p className="error-msg">{error}</p>}
          </div>
        )}

        {/* ─── STEP: booking form (regular flow) ─── */}
        {step === "booking" && selectedDoctor && (
          <div className="result-section">
            <h3>Book with {selectedDoctor.fullname}</h3>
            <div className="result-row">
              <span>Disease:</span><strong>{disease}</strong>
            </div>

            <div className="select-group">
              <label>Date</label>
              <input type="date" value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => loadSlots(e.target.value)} />
            </div>

            {slots.length > 0 && (
              <div className="slot-grid">
                {slots.map(s => (
                  <button key={s}
                    className={`slot-btn ${selectedSlot === s ? "slot-active" : ""}`}
                    onClick={() => setSelectedSlot(s)}>{s}</button>
                ))}
              </div>
            )}
            {selectedDate && slots.length === 0 && (
              <p className="place">No slots available on this date.</p>
            )}

            <div className="select-group">
              <label>Reason / Note (optional)</label>
              <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} />
            </div>

            <button className="book-btn" disabled={!selectedSlot || loading} onClick={handleBook}>
              {loading ? "Booking…" : "Confirm Appointment"}
            </button>
            <button className="book-btn" style={{ background: "#888", marginTop: 8 }} onClick={() => setStep("result")}>
              ← Back
            </button>

            {error && <p className="error-msg">{error}</p>}
          </div>
        )}

        {/* ─── STEP: done ─── */}
        {step === "done" && (
          <div className="result-section" style={{ textAlign: "center" }}>
            <h3 style={{ color: "#10b981" }}>Appointment Booked!</h3>
            <p>Your appointment with <strong>{selectedDoctor?.fullname}</strong> on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong> is pending doctor confirmation.</p>
            <button className="book-btn" onClick={resetForm}>
              Book Another
            </button>
          </div>
        )}
      </div>

      <footer className="footer fs-6">©2023 HealthConnect. All rights reserved</footer>
    </>
  );
};

export default BookAppointment;