import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./signup.css";
import Header from "./header";

export default function New_password() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const [show, setShow] = useState({ newP: false, confirm: false });
  const [message, setMessage] = useState("");
  const [error, setErrorMsg] = useState("");

  const onSubmit = async (data) => {
    setMessage("");
    setErrorMsg("");

    if (data.new_password !== data.confirm_password) {
      setError("confirm_password", { type: "manual", message: "Passwords do not match" });
      return;
    }

    try {
      const resp = await axios.post(
        `http://localhost:8000/api/user/pass_reset/${uid}/${token}/`,
        { password: data.new_password, confirmpassword: data.confirm_password },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(resp.data.msg || "Password changed successfully.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const res = err.response?.data;
      if (!err.response) {
        setErrorMsg("Network error. Please try again.");
      } else if (res) {
        if (res.password) {
          const msg = Array.isArray(res.password) ? res.password.join(" ") : String(res.password);
          setError("new_password", { type: "server", message: msg });
        } else if (res.confirmpassword) {
          const msg = Array.isArray(res.confirmpassword) ? res.confirmpassword.join(" ") : String(res.confirmpassword);
          setError("confirm_password", { type: "server", message: msg });
        } else if (res.msg) {
          setErrorMsg(String(res.msg));
        } else if (res.errors) {
          setErrorMsg(res.errors.msg || JSON.stringify(res.errors));
        } else {
          setErrorMsg(JSON.stringify(res));
        }
      } else {
        setErrorMsg("Unexpected error");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="signup-container">
        <p className="head">Set New Password</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field-row">
            <label className="form-label">New password</label>
            <div className="password-wrapper">
              <input
                type={show.newP ? "text" : "password"}
                className="box"
                {...register("new_password", {
                  required: "New password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
                placeholder="Enter new password"
              />
              <span className="toggle-icon" onClick={() => setShow((s) => ({ ...s, newP: !s.newP }))}>
                {show.newP ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.new_password && <p className="error-text">{errors.new_password.message}</p>}
          </div>

          <div className="field-row">
            <label className="form-label">Confirm password</label>
            <div className="password-wrapper">
              <input
                type={show.confirm ? "text" : "password"}
                className="box"
                {...register("confirm_password", { required: "Please confirm your password" })}
                placeholder="Confirm new password"
              />
              <span className="toggle-icon" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}>
                {show.confirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirm_password && <p className="error-text">{errors.confirm_password.message}</p>}
          </div>

          {error && <div className="error-text">{error}</div>}
          {message && <div className="text-success">{message}</div>}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Change Password"}
          </button>

          <p className="mt-3">
            <Link to="/login">Back to login</Link>
          </p>
        </form>
      </div>
    </>
  );
}