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
  // Add state for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      // Encrypt the new password before sending
      const encryptedPassword = encryptPassword(newPassword);
      console.log("Encrypted Password Sent to Backend:", encryptedPassword);

      const response = await api.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword: encryptedPassword // Send encrypted password
      });

      setMessage(response.data.msg);
      // Add a slight delay before redirecting
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password');
      console.error('Reset password error:', err);
      // If OTP is expired, allow requesting a new one
      if (err.response?.data?.msg?.includes('expired')) {
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle functions for password visibility
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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
          <div className="links">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      )}
      {step === 2 && (
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