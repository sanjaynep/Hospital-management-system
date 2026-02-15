import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from "react-hook-form"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './signup.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Header from './header';


export default function Login() {

    let [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [message, setMessage] = useState({ text: "", type: "" });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm()

    const onSubmit = async (data) => {
        setMessage({ text: "", type: "" });
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/user/login/",
                {
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
        }
        catch (err) {
            if (err.response && err.response.data.errors) {
                setMessage({ text: err.response.data.errors.msg, type: "" });
            }
            else {
                setMessage({ text: "Something went wrong", type: "" });
            }
        }
    }



    return (
        <>
            <Header />
            <div className="container  signup-container">
                <p className='head'>Login</p>

                {message.text && (
                    <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mx-5`}>
                        {message.text}
                    </div>
                )}

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control className='box' {...register("email", {
                            required: "Email is required",
                            maxLength: { value: 255 },
                        })} type="email" placeholder="name@example.com" />
                    </Form.Group>
                    {errors.email && <p className='text-danger' role="alert">{errors.email.message}</p>}


                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Password</Form.Label>
                        <div className="password-wrapper">
                            <Form.Control
                                className="transparent-input"
                                {...register("password", {
                                    required: "Password is required",
                                })}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                            />
                            <span
                                className="toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                    </Form.Group>
                    {errors.password && <p className='text-danger' role="alert">{errors.password.message}</p>}

                    <button className="button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Login"}
                    </button>
                </Form>
            </div>
        </>
    )
}