// src/context/AuthContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import api, { handleLogout as apiLogout } from '../utils/api';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  // Initialize state from localStorage when the app loads
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
      setIsAdmin(userRole === 'admin');
    }
  }, []);

  // Login function that can be called from any component
 const login = (userData) => {
  localStorage.setItem('accessToken', userData.accessToken);
  localStorage.setItem('refreshToken', userData.refreshToken);
  localStorage.setItem('userRole', userData.user.role);
  localStorage.setItem('userId', userData.user.id);
  localStorage.setItem('userEmail', userData.user.email); // Store the email in localStorage
  
  setIsAuthenticated(true);
  setUserId(userData.user.id);
  setIsAdmin(userData.user.role === 'admin');
};

  // Logout function that uses the centralized logout handler from api.js
  const logout = async () => {
    await apiLogout();
    
    // These state updates will happen after localStorage is cleared in apiLogout
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserId(null);
  };

  // The value that will be provided to consumers of this context
  const value = {
    isAdmin,
    isAuthenticated,
    userId,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};