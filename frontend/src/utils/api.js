import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration and network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration (status 493)
    if (error.response?.status === 493) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/refresh-token`, { refreshToken });
          
          localStorage.setItem('accessToken', refreshResponse.data.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          await handleLogout(); // Use the new logout handler
          return Promise.reject(refreshError);
        }
      } else {
        await handleLogout(); // Use the new logout handler
      }
    }

    // Don't retry if we've already tried or it's not a network error
    if (originalRequest._retry || 
        (!error.code && error.response && error.response.status !== 0)) {
      return Promise.reject(error);
    }

    // Retry logic for network-related errors or 500s (server errors)
    if (error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'ERR_CONNECTION_RESET' ||
        (error.response && error.response.status >= 500)) {
      
      originalRequest._retry = true;
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Centralized logout handler
export const handleLogout = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (userId) {
      // Call the backend to delete the token document
      await api.post('/api/auth/logout', { userId });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage and redirect, even if the API call fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    window.location.href = '/login';
  }
};

export default api;
