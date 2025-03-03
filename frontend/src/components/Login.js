// src/components/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from './AuthContext';

//const SECRET_KEY = "Kedhareswarmatha";

const Login = () => {

  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from context
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // const encryptPassword = (password) => {
  //   return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  // };

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
    //  const encryptedPassword = encryptPassword(password);

      // Send the login request
      const res = await api.post('/api/auth/login', {
        email,
        password: password, // Using the unencrypted password as in your original code
      });

      // Use the login function from context
      login(res.data);

      // Redirect based on user role
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
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>EMAIL:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group ">
          <label>PASSWORD:</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              required
            />
            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Logging in...' : 'LOGIN'}
        </button>
      </form>
      {/* Divider with "or" text */}
      <div className="divider">
        <div className="divider-line"></div>
        <div className="divider-text">or</div>
        <div className="divider-line"></div>
      </div>
      <div className="links">
        <Link to="/forgot-password">Forgot Password?</Link>
        <div>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;