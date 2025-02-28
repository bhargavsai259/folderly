// src/App.js
import React from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import { AuthProvider } from "./components/AuthContext"; // Import the AuthProvider

function App() {
  return (
    <AuthProvider> {/* Wrap everything with AuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;