import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
      setError('confirm_password', { type: 'manual', message: 'Passwords do not match' });
      return;
    }

    try {
      const resp = await axios.post(
        `http://localhost:8000/api/user/pass_reset/${uid}/${token}/`,
        { password: data.new_password, password2: data.confirm_password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setMessage(resp.data.msg || 'Password changed successfully.');
      // optional: navigate to login after a short delay
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const res = err.response?.data;
      if (!err.response) {
        setErrorMsg('Network error. Please try again.');
      } else if (res) {
        // Map field errors
        if (res.password) {
          const msg = Array.isArray(res.password) ? res.password.join(' ') : String(res.password);
          setError('new_password', { type: 'server', message: msg });
        } else if (res.password2) {
          const msg = Array.isArray(res.password2) ? res.password2.join(' ') : String(res.password2);
          setError('confirm_password', { type: 'server', message: msg });
        } else if (res.msg) {
          setErrorMsg(String(res.msg));
        } else if (typeof res === 'object') {
          setErrorMsg(JSON.stringify(res));
        } else {
          setErrorMsg(String(res));
        }
      } else {
        setErrorMsg('Unexpected error');
      }
    }
  };

  return (
    <div className="login-box">
      <h3 style={{ marginBottom: 12 }}>Set a new password</h3>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="login-label">New password</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type={show.newP ? 'text' : 'password'}
            className="login-input"
            {...register('new_password', { required: { value: true, message: 'New password is required' }, minLength: { value: 8, message: 'Minimum 8 characters' } })}
            placeholder="Enter new password"
          />
          <button type="button" className="btn btn-light" onClick={() => setShow(s => ({ ...s, newP: !s.newP }))}>
            {show.newP ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.new_password && <p className="error-text">{errors.new_password.message}</p>}

        <label className="login-label" style={{ marginTop: 12 }}>Confirm password</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type={show.confirm ? 'text' : 'password'}
            className="login-input"
            {...register('confirm_password', { required: { value: true, message: 'Please confirm your password' } })}
            placeholder="Confirm new password"
          />
          <button type="button" className="btn btn-light" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}>
            {show.confirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.confirm_password && <p className="error-text">{errors.confirm_password.message}</p>}

        {error && <div className="error-text">{error}</div>}
        {message && <div className="text-success" style={{ marginTop: 8 }}>{message}</div>}

        <button type="submit" className="btn btn-primary login-btn mt-3" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Change password'}
        </button>

        <div style={{ marginTop: 12 }}>
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}