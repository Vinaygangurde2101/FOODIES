import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('naik_smartshop_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to load user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data.token) {
      localStorage.setItem('naik_smartshop_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data.token) {
      localStorage.setItem('naik_smartshop_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('naik_smartshop_token');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (preferences) => {
    const res = await authService.updatePreferences(preferences);
    if (res.success) {
      setUser(prev => prev ? { ...prev, preferences: res.data } : null);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updatePreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
