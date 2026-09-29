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
    return DEMO_USERS.customer;
  });
  const [token, setToken] = useState(localStorage.getItem('drivepulse_token') || 'demo_token');
  const [loading, setLoading] = useState(false);

  // Load user profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authApi.getMe();
        if (res?.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('drivepulse_token', jwtToken);
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

  const logout = () => {
    localStorage.removeItem('drivepulse_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitchRole = async (targetRole) => {
    let email = 'customer@drivepulse.com';
    let password = 'password123';

    if (targetRole === 'ROLE_DRIVER') {
      email = 'driver@drivepulse.com';
      password = 'password123';
    } else if (targetRole === 'ROLE_ADMIN') {
      email = 'admin@drivepulse.com';
      password = 'admin123';
    }

    try {
      const res = await authApi.login({ email, password });
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('drivepulse_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Quick role switch error:", err);
    }
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
        quickSwitchRole,
        isCustomer: user?.role === 'ROLE_CUSTOMER',
        isDriver: user?.role === 'ROLE_DRIVER',
        isAdmin: user?.role === 'ROLE_ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
