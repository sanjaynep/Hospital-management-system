import { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import './signup.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Header from './header';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: "", type: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setMessage({ text: "", type: "" });
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/user/login/", {
        email: data.email,
        password: data.password,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      const token = response.data.token;
      if (token && token.access) {
        localStorage.setItem("access_token", token.access);
        localStorage.setItem("refresh_token", token.refresh);
      }
      setMessage({ text: response.data.msg || "Login successful", type: "success" });
      navigate("/profile");
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setMessage({ text: err.response.data.errors.msg, type: "error" });
      } else {
        setMessage({ text: "Something went wrong", type: "error" });
      }
    }
  };

  return (
    <>
      <Header />
      <div className="signup-container">
        <p className="head">Login</p>

        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field-row">
            <label className="form-label">Email address</label>
            <input
              className="box"
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="name@example.com"
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="field-row">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                className="box"
                {...register("password", { required: "Password is required" })}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <span className="toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <p className="mt-3">
            Forgot your password? <Link to="/resetpassword">Click here</Link>
          </p>
        </form>
      </div>
    </>
  );
}
