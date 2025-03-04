import React, { useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import { BrowserRouter as Router, Routes, Route, useHistory } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import { AuthProvider } from "./components/AuthContext";
import { Toaster } from 'react-hot-toast';
import { App } from '@capacitor/app';

function AppBackButtonHandler() {
  const history = useHistory();

  useEffect(() => {
    // Add listener for the back button event
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        history.goBack(); // Navigate back in the app's history
      } else {
        // If there's no history to go back, exit the app
        App.exitApp();
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      App.removeAllListeners();
    };
  }, [history]);

  return null; // This component doesn't render anything
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppBackButtonHandler /> {/* Add the back button handler */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
        </Routes>
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
