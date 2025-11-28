import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from './api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('drive_token') || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem('drive_token', token); else localStorage.removeItem('drive_token');
  }, [token]);

  async function login(email, password) {
    const data = await api.login(email, password);
    if (data.token) {
      setToken(data.token);
      setUser(data.user || data.user);
    }
    return data;
  }

  async function register(email, password) {
    const data = await api.register(email, password);
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    if (token) {
      // Try to load user via token (not always returned)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, email: payload.email });
      } catch (err) {
        // no-op
      }
    }
  }, [token]);

  const value = {
    token,
    user,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
