import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserMd, FaSearch, FaArrowLeft, FaCalendarAlt,
} from "react-icons/fa";
import Dashboard_header from "./dashboard_header";
import "./doctors_list.css";

const API = "http://127.0.0.1:8000/api/user";

const SPEC_LABELS = {
  general_physician: "General Physician",
  neuro_ortho:       "Neuro-Ortho",
  cardiologist:      "Cardiologist",
  dermatology:       "Dermatology",
};

export default function DoctorsList() {
  const navigate = useNavigate();
  const [doctors, setDoctors]   = useState([]);
  const [search, setSearch]     = useState("");
  const [specFilter, setSpec]   = useState("all");

  useEffect(() => {
    axios.get(`${API}/doctors/`)
      .then(res => setDoctors(res.data))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() =>
    doctors.filter(d => {
      if (specFilter !== "all" && d.specialization !== specFilter) return false;
      if (search && !d.fullname.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [doctors, search, specFilter]
  );

  return (
    <>
      <Dashboard_header />

      <div className="dl-container">
        <div className="dl-top-bar">
          <button className="dl-back" onClick={() => navigate("/profile")}>
            <FaArrowLeft /> Back
          </button>
          <h2 className="dl-title"><FaUserMd /> Our Doctors</h2>
        </div>

        {/* Filter bar */}
        <div className="dl-filter-bar">
          <div className="dl-search-box">
            <FaSearch className="dl-search-icon" />
            <input
              type="text"
              placeholder="Search doctor name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="dl-spec-tabs">
            <button className={`dl-tab ${specFilter === "all" ? "dl-tab-active" : ""}`}
              onClick={() => setSpec("all")}>All</button>
            {Object.entries(SPEC_LABELS).map(([key, label]) => (
              <button key={key}
                className={`dl-tab ${specFilter === key ? "dl-tab-active" : ""}`}
                onClick={() => setSpec(key)}>{label}</button>
            ))}
          </div>
        </div>

        {/* Doctor grid */}
        <div className="dl-count">{filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found</div>
        {filtered.length === 0 ? (
          <div className="dl-empty">
            <FaUserMd className="dl-empty-icon" />
            <p>No doctors match your search.</p>
          </div>
        ) : (
          <div className="dl-grid">
            {filtered.map(doc => (
              <div key={doc.id} className="dl-card">
                <div className="dl-avatar">{doc.fullname?.charAt(0) || "D"}</div>
                <div className="dl-info">
                  <h4>{doc.fullname}</h4>
                  <p className="dl-spec">{SPEC_LABELS[doc.specialization] || doc.specialization?.replace(/_/g, " ")}</p>
                  <span className="dl-exp">{doc.experience || 0} yrs experience</span>
                </div>
                <div className="dl-card-actions">
                  <span className="dl-badge-avail">Available</span>
                  <button className="dl-book-btn" onClick={() => navigate("/book_appointment")}>
                    <FaCalendarAlt /> Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer fs-6">©2023 HealthConnect. All rights reserved</footer>
    </>
  );
}
