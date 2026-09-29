import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('drivepulse_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('drivepulse_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
        } catch (err) {
          console.error("Session expired, switching to demo customer", err);
          await quickSwitchRole('ROLE_CUSTOMER');
        }
      } else {
        // Default login as demo customer on fresh start
        await quickSwitchRole('ROLE_CUSTOMER');
      }
      setLoading(false);
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
