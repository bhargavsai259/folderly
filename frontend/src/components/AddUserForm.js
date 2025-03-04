import React, { useState } from "react";
import "../styles/adduserform.css";

const AddUserForm = ({ addUser, onSuccess }) => {
  const [user, setUser] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    capital: false,
    special: false,
    number: false
  });

  const validateForm = () => {
    // Username validation
    if (!user.username.trim()) {
      return "Username is required";
    }
    if (user.username.length < 3) {
      return "Username must be at least 3 characters long";
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(String(user.phone))) {
      return "Phone number must be exactly 10 digits";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return "Please enter a valid email address";
    }

    // Password validation
    if (!user.password) {
      return "Password is required";
    }

    // NEW PASSWORD VALIDATION RULES
    const hasLength = user.password.length >= 8;
    const hasCapital = /[A-Z]/.test(user.password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(user.password);
    const hasNumber = /\d/.test(user.password);

    setPasswordErrors({
      length: !hasLength,
      capital: !hasCapital,
      special: !hasSpecial,
      number: !hasNumber
    });

    if (!hasLength || !hasCapital || !hasSpecial || !hasNumber) {
      return "Password must contain at least 8 characters, one capital letter, one special character, and one number";
    }

    return null;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    setIsSubmitting(true);
    try {
      const success = await addUser(user);
      if (success) {
        // Reset form
        setUser({
          username: "",
          phone: "",
          email: "",
          password: "",
          role: "student",
        });
        setError("User added successfully!"); // Display success message
        setTimeout(() => {
          onSuccess();
        }, 2000); // Close the modal after 2 seconds
      } else {
        setError("Failed to add user. Please try again.");
        console.log(user)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));

    // Check password requirements as user types
    if (name === "password") {
      setPasswordErrors({
        length: value.length < 8,
        capital: !/[A-Z]/.test(value),
        special: !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
        number: !/\d/.test(value)
      });
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="add-user-form">
      {error && (
        <div className={error.includes("successfully") ? "success-message" : "error-message"}>
          {error}
        </div>
      )}
      
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={user.username}
        onChange={handleInputChange}
        required
        minLength={3}
        disabled={isSubmitting}
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone (10 digits)"
        value={user.phone}
        onChange={handleInputChange}
        required
        pattern="\d{10}"
        disabled={isSubmitting}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={user.email}
        onChange={handleInputChange}
        required
        disabled={isSubmitting}
      />

      <div className="password-input-container" style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
          className="password-input"
          style={{ paddingRight: "40px" }} // Add space for the icon
        />
        <button 
          type="button"
          className="password-toggle-button"
          onClick={togglePasswordVisibility}
          disabled={isSubmitting}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0
          }}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {/* Password requirements indicators */}
      {user.password && (
        <div className="password-requirements" style={{ marginTop: "5px", fontSize: "12px" }}>
          <div style={{ color: passwordErrors.length ? "#f44336" : "#4caf50" }}>
            {passwordErrors.length ? "✗" : "✓"} At least 8 characters
          </div>
          <div style={{ color: passwordErrors.capital ? "#f44336" : "#4caf50" }}>
            {passwordErrors.capital ? "✗" : "✓"} At least one capital letter
          </div>
          <div style={{ color: passwordErrors.special ? "#f44336" : "#4caf50" }}>
            {passwordErrors.special ? "✗" : "✓"} At least one special character
          </div>
          <div style={{ color: passwordErrors.number ? "#f44336" : "#4caf50" }}>
            {passwordErrors.number ? "✗" : "✓"} At least one number
          </div>
        </div>
      )}

      <select
        name="role"
        value={user.role}
        onChange={handleInputChange}
        disabled={isSubmitting}
      >
        <option value="admin">Admin</option>
        <option value="student">Student</option>
      </select>

      <button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding User..." : "Add User"}
      </button>
    </form>
  );
};

export default AddUserForm;
