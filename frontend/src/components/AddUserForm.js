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
    if (user.password.length < 6) {
      return "Password must be at least 6 characters long";
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
    // Clear error when user starts typing
    if (error) setError("");
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

    <input
      type="password"
      name="password"
      placeholder="Password"
      value={user.password}
      onChange={handleInputChange}
      required
      minLength={6}
      disabled={isSubmitting}
    />

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
);};

export default AddUserForm;