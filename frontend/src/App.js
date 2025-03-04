// App.js
import React, { useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import { AuthProvider } from "./components/AuthContext";
import { Toaster } from 'react-hot-toast';
import { App as CapApp } from '@capacitor/app';

// Separate component for back button handling using the new useNavigate hook
function AppBackButtonHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Add listener for the back button event
    const handleBackButton = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        navigate(-1); // Navigate back in the app's history (new syntax)
      } else {
        // If there's no history to go back, exit the app
        CapApp.exitApp();
      }
    });
    
    // Clean up the listener when the component unmounts
    return () => {
      // Use the returned value to remove just this listener
      if (handleBackButton) {
        handleBackButton.remove();
      }
    };
  }, [navigate]);
  
  return null; // This component doesn't render anything
}

// The AppBackButtonHandler needs to be inside Router context
function AppWithRouter() {
  return (
    <>
      <AppBackButtonHandler />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWithRouter />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: 'green',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: 'red',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
