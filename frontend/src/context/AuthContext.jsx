// context/AuthContext.jsx
// Provides authentication state, JWT management, and user profile
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true during initial hydration

  // ─── Hydrate from localStorage on mount ────────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('blushbites_token');
    const savedUser = localStorage.getItem('blushbites_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('blushbites_token');
        localStorage.removeItem('blushbites_user');
      }
    }
    setLoading(false);
  }, []);

  // ─── Persist auth state to localStorage ────────────────────────────────────
  const persist = (newToken, newUser) => {
    localStorage.setItem('blushbites_token', newToken);
    localStorage.setItem('blushbites_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
    return data;
  }, []);

  // ─── Signup ─────────────────────────────────────────────────────────────────
  const signup = useCallback(async (formData) => {
    const { data } = await api.post('/auth/signup', formData);
    persist(data.token, data.user);
    return data;
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('blushbites_token');
    localStorage.removeItem('blushbites_user');
    setToken(null);
    setUser(null);
  }, []);

  // ─── Update profile ─────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    const updated = data.user;
    localStorage.setItem('blushbites_user', JSON.stringify(updated));
    setUser(updated);
    return data;
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
