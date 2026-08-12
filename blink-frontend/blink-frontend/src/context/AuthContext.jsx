import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { login as apiLogin, signup as apiSignup, fetchProfile, updateProfile as apiUpdateProfile } from "../api.js";

const AUTH_STORAGE_KEY = "blink_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [restoring, setRestoring] = useState(true);

  // On first load, check for a saved token and confirm it's still
  // valid against the backend before trusting it.
  useEffect(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) {
      setRestoring(false);
      return;
    }
    fetchProfile(saved)
      .then((profile) => {
        setToken(saved);
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      })
      .finally(() => setRestoring(false));
  }, []);

  const persistSession = useCallback((newToken, newUser) => {
    localStorage.setItem(AUTH_STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await apiLogin({ email, password });
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const signup = useCallback(
    async (name, email, password) => {
      const data = await apiSignup({ name, email, password });
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      const updated = await apiUpdateProfile(token, updates);
      setUser(updated);
      return updated;
    },
    [token]
  );

  const value = { user, token, restoring, login, signup, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
