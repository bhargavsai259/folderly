// src/components/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from './AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from context
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Basic client-side validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/api/auth/login', {
        email,
        password: password,
      });

      login(res.data);

      if (res.data.user.role === 'admin') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      {/* Reference the image from the public folder */}
      <img src="/logo512.png" alt="App Logo" className="login-logo" />
      <h2>Snap Book</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>EMAIL:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>PASSWORD:</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={onChange}
              required
            />
            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Logging in...' : 'LOGIN'}
        </button>
      </form>
      <div className="divider">
        <div className="divider-line"></div>
        <div className="divider-text">or</div>
        <div className="divider-line"></div>
      </div>
      <div className="links">
        <Link to="/forgot-password">Forgot Password?</Link>
        <Link to="/register">Don't have an account? Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;