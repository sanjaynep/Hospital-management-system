import React, { useState } from "react";
import "./appointment.css";
import "./profile.css"
import Dashboard_header from "./dashboard_header";
import axios from "axios";

const symptomsList = [
  'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine',
  'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach',
  'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision', 'phlegm', 'throat_irritation',
  'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion', 'chest_pain', 'weakness_in_limbs',
  'fast_heart_rate', 'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool',
  'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 'bruising', 'obesity', 'swollen_legs',
  'swollen_blood_vessels', 'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails',
  'swollen_extremeties', 'excessive_hunger', 'drying_and_tingling_lips', 'slurred_speech',
  'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints',
  'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness',
  'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of urine',
  'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'depression',
  'irritability', 'muscle_pain', 'belly_pain'
];


const MAX_SELECTIONS = 5;

const BookAppointment = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState(
    Array(MAX_SELECTIONS).fill("")
  );

  const [disease,setdisease] = useState("");
  const [doctor,setdoctor] = useState("");
  const chosenCount = selectedSymptoms.filter(Boolean).length;

  const handleChange = (index, value) => {
    const updated = [...selectedSymptoms];
    updated[index] = value;
    setSelectedSymptoms(updated);
  };

  const availableSymptoms = (index) => {
    return symptomsList
      .filter(
        symptom =>
          !selectedSymptoms.includes(symptom) ||
          selectedSymptoms[index] === symptom
      )
      .sort((a, b) =>
        a.replace(/_/g, " ").localeCompare(b.replace(/_/g, " "))
      );
  };

  const handle_predict = async () => {
    // send only non-empty selections to the backend
    const chosen = selectedSymptoms.filter(Boolean);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/user/predict/',
        { symptoms: chosen },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    
    const disease = response.data.predicted_disease;
    const doctor = response.data.suggested_doctor;

    setdisease(disease)
    setdoctor(doctor)
    console.log(disease)
    console.log(doctor)
    }
    catch(err){} 


  }

  return (
    <>
      <Dashboard_header />
      <div className="appointment-container">
        <h2 className="title">Book Appointment</h2>

        <p className="subtitle">Select symptoms ( at lease 2 and up to 5)</p>

        <div className="symptom-section">
          {selectedSymptoms.map((symptom, index) => (
            <div className="select-group" key={index}>
              <label>Selection {index + 1}</label>
              <select
                value={symptom}
                onChange={(e) => handleChange(index, e.target.value)}
              >
                <option value="" disabled>
                  Select symptoms
                </option>
                {availableSymptoms(index).map((sym, i) => (
                  <option key={i} value={sym}>
                    {sym.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {chosenCount < 2 && (
          <div style={{ color: "#c53030", marginTop: 8, fontWeight: 600 }}>
            Must select at least 2 symptoms
          </div>
        )}

        <div className="result-section">
          <h3>Prediction Result</h3>

          <div className="result-row">
            <span>Predicted Disease:</span>
            <span className="place">{disease}</span>
          </div>

          <div className="result-row">
            <span>Suggested Doctor:</span>
            <a href="/doctor-profile/123" className="doctor-link">
              {doctor}
            </a>
          </div>

          
          <button
            className="book-btn"
            onClick={handle_predict}
            disabled={selectedSymptoms.filter(Boolean).length < 2}
            title={
              selectedSymptoms.filter(Boolean).length < 2
                ? "Select at least two symptoms"
                : "Book Appointment"
            }
          >
            Book Appointment
          </button>
        </div>
      </div>
      <footer className="footer fs-6" >
        ©2023 HealthConnect. All rights reserved
      </footer>
    </>
  );
};

export default BookAppointment;