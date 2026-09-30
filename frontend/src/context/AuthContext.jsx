import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';
import { DEMO_USERS } from '../api/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('drivepulse_user');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    // Default to Passenger session so users can immediately book rides without login barriers
    const defaultRider = DEMO_USERS.customer;
    try {
      localStorage.setItem('drivepulse_user', JSON.stringify(defaultRider));
    } catch (e) {}
    return defaultRider;
  });
  const [token, setToken] = useState(() => localStorage.getItem('drivepulse_token') || null);
  const [loading, setLoading] = useState(false);

  // Load user profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (!token) return;
      try {
        const res = await authApi.getMe();
        if (res?.data) {
          setUser(res.data);
          localStorage.setItem('drivepulse_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('drivepulse_token', jwtToken);
      localStorage.setItem('drivepulse_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authApi.register(formData);
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('drivepulse_token', jwtToken);
      localStorage.setItem('drivepulse_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const switchRole = (newRole) => {
    let targetUser = DEMO_USERS.customer;
    if (newRole === 'ROLE_DRIVER' || newRole === 'driver') targetUser = DEMO_USERS.driver;
    else if (newRole === 'ROLE_ADMIN' || newRole === 'admin') targetUser = DEMO_USERS.admin;
    else targetUser = DEMO_USERS.customer;

    const simToken = `sim_jwt_${btoa(JSON.stringify(targetUser))}`;
    localStorage.setItem('drivepulse_token', simToken);
    localStorage.setItem('drivepulse_user', JSON.stringify(targetUser));
    setToken(simToken);
    setUser(targetUser);
    return targetUser;
  };

  const logout = () => {
    localStorage.removeItem('drivepulse_token');
    localStorage.removeItem('drivepulse_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
