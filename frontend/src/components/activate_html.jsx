import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./signup.css";

export default function ActivateAccount() {
    const { uid, token } = useParams();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");
    const hasActivated = useRef(false);

    useEffect(() => {
        const activateAccount = async () => {
            // Prevent double activation due to React StrictMode
            if (hasActivated.current) return;
            hasActivated.current = true;

            try {
                const response = await axios.get(
                    `http://localhost:8000/api/user/activate/${uid}/${token}/`
                );
                setStatus("success");
                setMessage(response.data.msg);
            } catch (err) {
                setStatus("error");
                setMessage(err.response?.data?.msg || "Activation failed");
            }
        };

        if (uid && token) {
            activateAccount();
        }
    }, [uid, token]);

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-7">
                    <div className="form-box text-center">
                        {status === "loading" && <h1>Activating...</h1>}

                        {status === "success" && (
                            <>
                                <h1 style={{ color: "#28a745" }}> Account Activated!</h1>
                                <p className="mt-4">{message}</p>
                                <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link>
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <h1 style={{ color: "#dc3545" }}>✗ Activation Failed</h1>
                                <p className="mt-4">{message}</p>
                                <Link to="/register" className="btn btn-primary mt-3">Register Again</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}