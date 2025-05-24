import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { loginUser, registerUser } from '../services/api'; // Assuming registerUser is also exported from api.js
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null); // To store auth errors

  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      // Set the token for future API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginUser(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setIsLoading(false);
      navigate('/'); // Navigate to home or dashboard after login
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Failed to login');
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await registerUser(userData); // Use registerUser from api.js
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setIsLoading(false);
      navigate('/'); // Navigate to home or dashboard after registration
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to register');
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
    navigate('/login'); // Navigate to login page after logout
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isLoading,
        error, // Provide error state
        login,
        register,
        logout,
        setError, // Provide a way to clear/set error if needed from components
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
