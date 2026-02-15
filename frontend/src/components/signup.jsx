import { useState } from "react";
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Header from "./header";


import './signup.css';


export default function Signup() {
 const [show, setShow] = useState({ newP: false, confirm: false });

  const [message, setMessage] = useState({ text: "", type: "" });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors ,isSubmitting},
  } = useForm();

  const role = watch("role");

  const onSubmit = async (data) => {
    setMessage({ text: "", type: "" });
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('fullname', data.fullname);
      formData.append('password', data.password);
      formData.append('confirmpassword', data.confirmpassword);
      formData.append('role', data.role);
      formData.append('gender', data.gender);
      if (data.profile && data.profile.length > 0) formData.append('profile', data.profile[0]);
      if (data.license_no) formData.append('license_no', data.license_no);
      if (data.specialization) formData.append('specialization', data.specialization);
      if (data.contact) formData.append('contact', data.contact);
      if (data.experience !== undefined && data.experience !== null) formData.append('experience', data.experience);

      const response = await axios.post("http://127.0.0.1:8000/api/user/register/", formData, {
        headers: { /* Let axios set Content-Type for multipart */ },
      });
      setMessage({ text: response.data.msg, type: "success" });
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Registration failed";

      if (errorData?.errors) {
        const errors = errorData.errors;
        // Prefer non-field or relevant field messages in order
        if (errors.non_field_errors) {
          errorMessage = Array.isArray(errors.non_field_errors) ? errors.non_field_errors[0] : errors.non_field_errors;
        } else if (errors.email) {
          errorMessage = Array.isArray(errors.email) ? errors.email[0] : errors.email;
        } else if (errors.password) {
          errorMessage = Array.isArray(errors.password) ? errors.password[0] : errors.password;
        } else if (errors.confirmpassword) {
          errorMessage = Array.isArray(errors.confirmpassword) ? errors.confirmpassword[0] : errors.confirmpassword;
        } else if (errors.fullname) {
          errorMessage = Array.isArray(errors.fullname) ? errors.fullname[0] : errors.fullname;
        } else {
          const firstField = Object.keys(errors)[0];
          const firstVal = errors[firstField];
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
      <div className="container signup-container">
        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mx-5`}>
            {message.text}
          </div>
        )}
        <p className='head'>Create Account</p>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Label>Create account as:</Form.Label>
          <Form.Select defaultValue="" className="select_menu" {...register("role", { required: "your role is required" })} aria-label="Default select example">
            <option value="" disabled hidden >Open this select menu</option>
            <option value="user">User</option>
            <option value="doctor">Doctor</option>
          </Form.Select>
          {errors.role && <p className='text-danger' role="alert">{errors.role.message}</p>}

          <Form.Group controlId="formFileSm" className="mb-3">
            <Form.Label>Profile picture:</Form.Label>
            <Form.Control type="file" {...register("profile")} />
          </Form.Group>

          <Form.Group className="mb-3 " controlId="exampleForm.ControlInput1">
            <Form.Label>User name</Form.Label>
            <Form.Control className='box' {...register("fullname", {
              required: true, maxLength: {
                value: 20,
                message: "Name cannot be greater then 20 letters"
              },
              minLength: {
                value: 2,
                message: "Name should be greater then 2 letter"
              }
            })} type="text" placeholder="Please enter name" />
          </Form.Group>
          {errors.fullname && <p className='text-danger' role="alert">{errors.fullname.message}</p>}

          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Email address</Form.Label>
            <Form.Control className='box' {...register("email", {
              required: "Email is required",
              maxLength: { value: 255 },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format"
              }
            })} type="email" placeholder="name@example.com" />
          </Form.Group>
          {errors.email && <p className='text-danger' role="alert">{errors.email.message}</p>}

          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Password</Form.Label>
            <div className="password-wrapper">
              <Form.Control className='box' {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
                  message: "Password must include uppercase, lowercase, number, and special character"
                }
              })}  type={show.newP ? 'text' : 'password'} />
              <span
                className="toggle-icon"
                onClick={() => setShow(s => ({ ...s, newP: !s.newP }))}
              >
                 {show.newP ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </Form.Group>
          {errors.password && <p className='text-danger' role="alert">{errors.password.message}</p>}

          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Confirm password</Form.Label>
            <div className="password-wrapper">
              <Form.Control className='box' {...register("confirmpassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match"
              })} type={show.confirm ? "text" : "password"} />
              <span
                className="toggle-icon"
                 onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
              >
               {show.confirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </Form.Group>
          {errors.confirmpassword && <p className='text-danger' role="alert">{errors.confirmpassword.message}</p>}

          <Form.Label>Gender</Form.Label>
          <Form.Select defaultValue="" className="select_menu" {...register("gender", { required: "Gender is required" })} aria-label="Default select example">
            <option value="" disabled hidden >Open this select menu</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Form.Select>
          {errors.gender && <p className='text-danger' role="alert">{errors.gender.message}</p>}

          {role === "doctor" && (
            <>
              <Form.Group className="mb-3 " controlId="exampleForm.ControlInput1">
                <Form.Label>Medical license number:</Form.Label>
                <Form.Control className='box' {...register("license_no", {
                  required: role === "doctor" ? "License number is required" : false,

                  minLength: {
                    value: 3,
                    message: "License number must be at least 3 digits"
                  }
                }
                )
                } type="text" />
              </Form.Group>
              {errors.license_no && <p className='text-danger' role="alert">{errors.license_no.message}</p>}

              <Form.Label>Specialization:</Form.Label>
              <Form.Select className="select_menu" {...register("specialization", { required: role === "doctor" ? "Specialization is required" : false })} aria-label="Default select example">
                <option value="general_physician">General Physician (MBBS, MD Internal Medicine)</option>
                <option value="dermatology">Dermato-Endocrine-Gyne Specialist (MD Dermatology)</option>
                <option value="cardiologist">Cardio-Pulmo Specialist  (DM Cardiology)</option>
                <option value="neuro_ortho">Neuro-Ortho Specialist</option>
              </Form.Select>
              {errors.specialization && <p className='text-danger' role="alert">{errors.specialization.message}</p>}

              <Form.Group className="mb-3 " controlId="exampleForm.ControlInput1">
                <Form.Label>Contact No:</Form.Label>
                <Form.Control className='box' {...register("contact", {
                  required: role === "doctor" ? "Contact number is required" : false,
                  min: {
                    value: 2,
                    message: "Contact numbers cannot be less then 2 "
                  }

                })} type="text" />
              </Form.Group>
              {errors.contact && <p className='text-danger' role="alert">{errors.contact.message}</p>}

              <Form.Group className="mb-3 " controlId="exampleForm.ControlInput1">
                <Form.Label>Year of experience</Form.Label>
                <Form.Control className='box' {...register("experience", {
                  required: role === "doctor" ? "License number is required" : false,
                  min: {
                    value: 0,
                    message: "Negative numbers are not allowed"
                  }
                })} type="number" min={0} />
              </Form.Group>
              {errors.experience && <p className='text-danger' role="alert">{errors.experience.message}</p>}
            </>)}
          <button type='submit' className='button'  disabled={isSubmitting} >{isSubmitting ? "Submitting..." : "Create account"}</button>
        </Form>
      </div>
    </>
  )
}