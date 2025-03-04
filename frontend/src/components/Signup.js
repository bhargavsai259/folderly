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
  const [isRegistered, setIsRegistered] = useState(false); // New state to track registration success

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
      
      // Set registration success instead of navigating immediately
      setIsRegistered(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/login'); // Navigate to login after viewing success card
  };

  if (isRegistered) {
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
          <p id="message">
            Congratulations, your account has been successfully created.
          </p>
          <button id="contBtn" onClick={handleContinue}>Continue to Login</button>
        </div>
      </div>
    );
  }

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
          <!–-  <option value="admin">Admin</option>  -->
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
