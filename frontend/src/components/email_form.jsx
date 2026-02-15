import { useState } from "react";
import { useForm } from "react-hook-form";
import "./signup.css";
import axios from "axios";
import Header from "./header";

export default function Emailbox() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setMessage({ text: "", type: "" });
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/user/reset/",
        { email: data.email },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage({ text: response.data?.msg || "Check your email for next steps.", type: "success" });
    } catch (err) {
      if (!err.response) {
        setMessage({ text: "Network error. Please try again.", type: "error" });
      } else {
        const resData = err.response.data;
        if (resData && typeof resData === "object") {
          if (resData.email) {
            const msg = Array.isArray(resData.email) ? resData.email.join(" ") : String(resData.email);
            setError("email", { type: "server", message: msg });
          } else if (resData.errors) {
            setMessage({ text: resData.errors.msg || "Error occurred", type: "error" });
          } else {
            setMessage({ text: JSON.stringify(resData), type: "error" });
          }
        } else {
          setMessage({ text: "Unexpected server error", type: "error" });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="signup-container">
        <p className="head">Reset Password</p>

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

          {message.text && (
            <div className={message.type === "success" ? "text-success" : "error-text"}>
              {message.text}
            </div>
          )}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Sending..." : "Continue"}
          </button>
        </form>
      </div>
    </>
  );
}
