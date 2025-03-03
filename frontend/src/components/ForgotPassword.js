import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import api from '../utils/api';
import CryptoJS from 'crypto-js';
import '../styles/ForgotPassword.css';

const SECRET_KEY = "Kedhareswarmatha"; // Use the same key as in other components

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  };

  const sendResetOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setMessage(response.data.msg);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to process request');
      console.error('Send OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const encryptedPassword = encryptPassword(newPassword);
      console.log("Encrypted Password Sent to Backend:", encryptedPassword);

      const response = await api.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      if (response.status === 200) {
        setShowSuccessCard(true); // Show success card on successful password reset
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password');
      console.error('Reset password error:', err);
      if (err.response?.data?.msg?.includes('expired')) {
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleContinue = () => {
    navigate('/login'); // Navigate to login on continue button click
  };

  if (showSuccessCard) {
    return (
      <div id="card" className="animated fadeIn">
        <div id="upper-side">
          <svg
            version="1.1"
            id="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            xmlSpace="preserve"
          >
            <path
              d="M131.583,92.152l-0.026-0.041c-0.713-1.118-2.197-1.447-3.316-0.734l-31.782,20.257l-4.74-12.65 c-0.483-1.29-1.882-1.958-3.124-1.493l-0.045,0.017c-1.242,0.465-1.857,1.888-1.374,3.178l5.763,15.382 c0.131,0.351,0.334,0.65,0.579,0.898c0.028,0.029,0.06,0.052,0.089,0.08c0.08,0.073,0.159,0.147,0.246,0.209 c0.071,0.051,0.147,0.091,0.222,0.133c0.058,0.033,0.115,0.069,0.175,0.097c0.081,0.037,0.165,0.063,0.249,0.091 c0.065,0.022,0.128,0.047,0.195,0.063c0.079,0.019,0.159,0.026,0.239,0.037c0.074,0.01,0.147,0.024,0.221,0.027 c0.097,0.004,0.194-0.006,0.292-0.014c0.055-0.005,0.109-0.003,0.163-0.012c0.323-0.048,0.641-0.16,0.933-0.346l34.305-21.865 C131.967,94.755,132.296,93.271,131.583,92.152z"
            />
            <circle
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              strokeMiterlimit="10"
              cx="109.486"
              cy="104.353"
              r="32.53"
            />
          </svg>
          <h3 id="status">Success</h3>
        </div>
        <div id="lower-side">
          <p id="message">Your password has been successfully reset.</p>
          <button id="contBtn" onClick={handleContinue}>Continue to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      {step === 1 && (
        <form onSubmit={sendResetOTP}>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <div className="form-group">
            <label>EMAIL:</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="send-reset-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'SEND RESET CODE'}
          </button>

          <div className="divider">
            <div className="divider-line"></div>
            <div className="divider-text">or</div>
            <div className="divider-line"></div>
          </div>
          <div className="links">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      )}
      {step === 2 && !showSuccessCard && (
        <form onSubmit={resetPassword}>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <div className="form-group">
            <label>ENTER 6-DIGIT CODE:</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
          </div>
          <div className="form-group">
            <label>NEW PASSWORD:</label>
            <div className="password-input-container">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span className="password-toggle-icon" onClick={toggleNewPasswordVisibility}>
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>CONFIRM NEW PASSWORD:</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span className="password-toggle-icon" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="reset-password-button"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'RESET PASSWORD'}
          </button>

          
          <div className="links">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;