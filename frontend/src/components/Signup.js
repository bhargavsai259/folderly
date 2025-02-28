import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import api from '../utils/api';
import { encryptPassword } from '../utils/encryption';
import '../styles/Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

  const { username, email, phone, password, confirmPassword, role } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const encryptedPassword = encryptPassword(password);
      console.log("Encrypted Password Sent:", encryptedPassword);
      const res = await api.post('/api/auth/register', {
        username,
        email,
        phone,
        password: password,
        role
      });
      navigate('/login'); // Navigate to login after signup
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={onSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>USERNAME:</label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={onChange}
            placeholder="Enter your username"
            required
          />
        </div>
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
        <div className="form-group">
          <label>PHONE NUMBER:</label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={onChange}
            placeholder="Enter your phone number"
            required
            pattern="[0-9]{10}"
          />
        </div>
        <div className="form-group">
          <label>PASSWORD:</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'} // Toggle password visibility
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className="form-group">
          <label>CONFIRM PASSWORD:</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'} // Toggle confirm password visibility
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm your password"
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className="form-group">
          <label>ACCOUNT TYPE:</label>
          <select
            name="role"
            value={role}
            onChange={onChange}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="signup-button">
          {loading ? 'Signing up...' : 'SIGN UP'}
        </button>
      </form>
      <div className="links">
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
};

export default Signup;