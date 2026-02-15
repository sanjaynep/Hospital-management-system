import { useState } from "react";
import { useForm } from "react-hook-form"
import "./signup.css"
import axios from "axios";



export default function Emailbox() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm()

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

            // success - show confirmation message
            setMessage({ text: response.data?.detail || "Check your email for next steps.", type: "success" });
        } catch (err) {
            // Network / no response
            if (!err.response) {
                setMessage({ text: "Network error. Please try again.", type: "error" });
            } else {
                const resData = err.response.data;

                // If backend returns field errors like { email: ["..."] }
                if (resData && typeof resData === 'object') {
                    // map known field errors to the react-hook-form field
                    if (resData.email) {
                        const msg = Array.isArray(resData.email) ? resData.email.join(' ') : String(resData.email);
                        setError('email', { type: 'server', message: msg });
                    } else if (resData.detail) {
                        setMessage({ text: String(resData.detail), type: 'error' });
                    } else {
                        // fallback - stringify the response body
                        setMessage({ text: JSON.stringify(resData), type: 'error' });
                    }
                } else {
                    setMessage({ text: 'Unexpected server error', type: 'error' });
                }
            }
        } finally {
            setLoading(false);
        }
    }

    return (
            <>
                <div className="login-box">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>

                        <label className="login-label">Email address</label>
                        <input
                            type="email"
                            className="login-input"
                            {...register("email", {
                                required: { value: true, message: "Email is required" },
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format"
                                }
                            })}
                            placeholder="name@example.com"
                        />

                        {message.text && (
                            <div className={message.type === 'error' ? 'error-text' : 'text-success'} role="status">{message.text}</div>
                        )}

                        {errors.email && (
                            <p className="error-text" role="alert">{errors.email.message}</p>
                        )}

                        <button type="submit" className="btn btn-primary login-btn mt-3" disabled={loading}>
                            {loading ? 'Sending...' : 'Continue'}
                        </button>
                    </form>
                </div>
            </>
        )
    }