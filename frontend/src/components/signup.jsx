import Form from 'react-bootstrap/Form';
import { useForm } from "react-hook-form"
import './signup.css';



export default function Signup() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const role = watch("role");

  return (
    <>
      <div className="container ">
        <p className='head'>Create Account</p>
        <Form onSubmit={handleSubmit((data) => console.log(data))}>
          <Form.Label>Create account as:</Form.Label>
          <Form.Select className="select_menu" {...register("role", { required: "your role is required" })} aria-label="Default select example">
            <option value="" disabled selected hidden >Open this select menu</option>
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
            })} type="password" />
          </Form.Group>
          {errors.password && <p className='text-danger' role="alert">{errors.password.message}</p>}

          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Confirm password</Form.Label>
            <Form.Control className='box' {...register("confirmpassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match"
            })} type="password" />
          </Form.Group>
          {errors.confirmpassword && <p className='text-danger' role="alert">{errors.confirmpassword.message}</p>}

          <Form.Label>Gender</Form.Label>
          <Form.Select className="select_menu" {...register("gender", { required: "Gender is required" })} aria-label="Default select example">
            <option value="" disabled selected hidden >Open this select menu</option>
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
                } type="text"  />
              </Form.Group>
              {errors.license_no && <p className='text-danger' role="alert">{errors.license_no.message}</p>}

              <Form.Label>Specialization:</Form.Label>
              <Form.Select className="select_menu" {...register("specialization", { required: role === "doctor" ? "Specialization is required" : false })} aria-label="Default select example">
                <option value="general_physician">General Physician (MBBS, MD Internal Medicine)</option>
                <option value="dermatology">Dermatology (MD Dermatology)</option>
                <option value="cardiologist">Cardiologist (DM Cardiology)</option>
                <option value="emergency">Emergency Specialist (ER Physician, Trauma Specialist)</option>
              </Form.Select>
              {errors.qualification && <p className='text-danger' role="alert">{errors.qualification.message}</p>}
               
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
              {errors.experience && <p className='text-danger' role="alert">{errors.contact.message}</p>}

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
          <button type='submit' className='button' >Create account</button>
        </Form>
      </div>
    </>
  )
}