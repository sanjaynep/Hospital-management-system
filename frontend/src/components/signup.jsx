import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Header from "./header";
import "./signup.css";

export default function Signup() {
  const [show, setShow] = useState({ newP: false, confirm: false });
  const [message, setMessage] = useState({ text: "", type: "" });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const role = watch("role");

  const onSubmit = async (data) => {
    setMessage({ text: "", type: "" });
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("fullname", data.fullname);
      formData.append("password", data.password);
      formData.append("confirmpassword", data.confirmpassword);
      formData.append("role", data.role);
      formData.append("gender", data.gender);
      formData.append("contact",data.contact)
      if (data.profile && data.profile.length > 0) formData.append("profile", data.profile[0]);
      if (data.license_no) formData.append("license_no", data.license_no);
      if (data.specialization) formData.append("specialization", data.specialization);
      if (data.experience !== undefined && data.experience !== null) formData.append("experience", data.experience);

      const response = await axios.post("http://127.0.0.1:8000/api/user/register/", formData);
      setMessage({ text: response.data.msg, type: "success" });
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Registration failed";

      if (errorData?.errors) {
        const errs = errorData.errors;
        if (errs.non_field_errors) {
          errorMessage = Array.isArray(errs.non_field_errors) ? errs.non_field_errors[0] : errs.non_field_errors;
        } else if (errs.email) {
          errorMessage = Array.isArray(errs.email) ? errs.email[0] : errs.email;
        } else if (errs.password) {
          errorMessage = Array.isArray(errs.password) ? errs.password[0] : errs.password;
        } else if (errs.confirmpassword) {
          errorMessage = Array.isArray(errs.confirmpassword) ? errs.confirmpassword[0] : errs.confirmpassword;
        } else if (errs.fullname) {
          errorMessage = Array.isArray(errs.fullname) ? errs.fullname[0] : errs.fullname;
        } else {
          const firstField = Object.keys(errs)[0];
          const firstVal = errs[firstField];
          errorMessage = Array.isArray(firstVal) ? firstVal[0] : firstVal;
        }
      } else if (errorData?.msg) {
        errorMessage = errorData.msg;
      }

      setMessage({ text: errorMessage, type: "error" });
    }
  };

  return (
    <>
      <Header />
      <div className="signup-container">
        <p className="head">Create Account</p>

        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Role */}
          <div className="field-row">
            <label className="form-label">Create account as:</label>
            <select className="select_menu" {...register("role", { required: "Role is required" })} defaultValue="">
              <option value="" disabled hidden>Select role</option>
              <option value="user">User</option>
              <option value="doctor">Doctor</option>
            </select>
            {errors.role && <p className="error-text">{errors.role.message}</p>}
          </div>

          {/* Profile picture */}
          <div className="field-row">
            <label className="form-label">Profile picture (optional):</label>
            <input type="file" className="box" {...register("profile")} />
          </div>

          {/* Full name */}
          <div className="field-row">
            <label className="form-label">Full name</label>
            <input
              className="box"
              {...register("fullname", {
                required: "Full name is required",
                minLength: { value: 2, message: "Name should be at least 2 characters" },
                maxLength: { value: 20, message: "Name cannot be greater than 20 characters" },
              })}
              type="text"
              placeholder="Enter your name"
            />
            {errors.fullname && <p className="error-text">{errors.fullname.message}</p>}
          </div>

          {/* Email */}
          <div className="field-row">
            <label className="form-label">Email address</label>
            <input
              className="box"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" },
              })}
              type="email"
              placeholder="name@example.com"
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="field-row">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                className="box"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
                    message: "Must include uppercase, lowercase, number, and special character",
                  },
                })}
                type={show.newP ? "text" : "password"}
                placeholder="Enter password"
              />
              <span className="toggle-icon" onClick={() => setShow((s) => ({ ...s, newP: !s.newP }))}>
                {show.newP ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          {/* Confirm password */}
          <div className="field-row">
            <label className="form-label">Confirm password</label>
            <div className="password-wrapper">
              <input
                className="box"
                {...register("confirmpassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === watch("password") || "Passwords do not match",
                })}
                type={show.confirm ? "text" : "password"}
                placeholder="Confirm password"
              />
              <span className="toggle-icon" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}>
                {show.confirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmpassword && <p className="error-text">{errors.confirmpassword.message}</p>}
          </div>

          {/* Gender */}
          <div className="field-row">
            <label className="form-label">Gender</label>
            <select className="select_menu" {...register("gender", { required: "Gender is required" })} defaultValue="">
              <option value="" disabled hidden>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="error-text">{errors.gender.message}</p>}
          </div>

          <div className="field-row">
            <label className="form-label">Contact No</label>
            <input
              className="box"
              {...register("contact", { required: "Contact number is required" })}
              type="text"
              placeholder="Enter contact number"
            />
            {errors.contact && <p className="error-text">{errors.contact.message}</p>}
          </div>

          {/* Doctor-specific fields */}
          {role === "doctor" && (
            <>
              <div className="field-row">
                <label className="form-label">Medical license number</label>
                <input
                  className="box"
                  {...register("license_no", {
                    required: "License number is required",
                    minLength: { value: 3, message: "License number must be at least 3 characters" },
                  })}
                  type="text"
                  placeholder="Enter license number"
                />
                {errors.license_no && <p className="error-text">{errors.license_no.message}</p>}
              </div>

              <div className="field-row">
                <label className="form-label">Specialization</label>
                <select className="select_menu" {...register("specialization", { required: "Specialization is required" })}>
                  <option value="general_physician">General Physician</option>
                  <option value="dermatology">Dermato-Endocrine-Gyne Specialist</option>
                  <option value="cardiologist">Cardio-Pulmo Specialist</option>
                  <option value="neuro_ortho">Neuro-Ortho Specialist</option>
                </select>
                {errors.specialization && <p className="error-text">{errors.specialization.message}</p>}
              </div>

              <div className="field-row">
                <label className="form-label">Years of experience</label>
                <input
                  className="box"
                  {...register("experience", {
                    required: "Experience is required",
                    min: { value: 0, message: "Cannot be negative" },
                  })}
                  type="number"
                  min={0}
                  placeholder="Years of experience"
                />
                {errors.experience && <p className="error-text">{errors.experience.message}</p>}
              </div>
            </>
          )}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <p className="mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </>
  );
}
