import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple, consistent API base URL
const API_BASE_URL = 'http://localhost:8000';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Get token from localStorage
  const getStoredToken = () => {
    return localStorage.getItem('authToken');
  };

  // Save token to localStorage
  const saveToken = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  // Clear token from localStorage
  const clearToken = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Generic API request function with automatic auth
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getStoredToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Token ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`Making API request to: ${url}`, config);

    try {
      const response = await fetch(url, config);

      // Handle authentication errors
      if (response.status === 401) {
        console.log('Authentication failed, clearing token');
        clearToken();
        throw new Error('Authentication failed');
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return {};
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  };

  // Validate token on startup
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = getStoredToken();
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await apiRequest('/auth/validate');
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('Token validated successfully');
      } catch (error) {
        console.log('Token validation failed:', error.message);
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      saveToken(data.token);
      setUser(data.user || { email });
      setIsAuthenticated(true);
      
      console.log('Login successful');
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearToken();
    console.log('Logged out successfully');
  };

  // Simplified API methods
  const api = {
    get: (endpoint) => apiRequest(endpoint),
    post: (endpoint, data) => apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    put: (endpoint, data) => apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    patch: (endpoint, data) => apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (endpoint) => apiRequest(endpoint, {
      method: 'DELETE',
    }),
  };

  const value = {
    // State
    token,
    user,
    isAuthenticated,
    isLoading,
    
    // Auth methods
    login,
    logout,
    
    // API methods (new simplified approach)
    api,
    
    // Legacy methods (for backward compatibility)
    getToken: getStoredToken,
    fetchWithAuth: api.get,
    postWithAuth: api.post,
    putWithAuth: api.put,
    patchWithAuth: api.patch,
    deleteWithAuth: api.delete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}