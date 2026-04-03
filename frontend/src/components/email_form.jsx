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
    } 
   catch (err) {
  if (!err.response) {
    // No response at all (network issue)
    setMessage({ text: "Network error. Please try again.", type: "error" });
  } else {
    const resData = err.response.data;

    if (resData && typeof resData === "object") {
      // Handle wrapped errors from AccountErrorRenderer
      if (resData.errors) {
        const errors = resData.errors;

        // Field-specific error (like email)
        if (errors.email) {
          const msg = Array.isArray(errors.email)
            ? errors.email.join(" ")
            : String(errors.email);
          setError("email", { type: "server", message: msg });
        }
        // Non-field errors (general validation failures)
        else if (errors.non_field_errors) {
          const msg = Array.isArray(errors.non_field_errors)
            ? errors.non_field_errors.join(" ")
            : String(errors.non_field_errors);
          setMessage({ text: msg, type: "error" });
        }
        // Custom message key
        else if (errors.msg) {
          setMessage({ text: errors.msg, type: "error" });
        }
        // Fallback: show raw errors object
        else {
          setMessage({ text: JSON.stringify(errors), type: "error" });
        }
      } else {
        // Unexpected format
        setMessage({ text: JSON.stringify(resData), type: "error" });
      }
    } else {
      // Non-object response
      setMessage({ text: "Unexpected server error", type: "error" });
    }
  }
}
    finally {
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
