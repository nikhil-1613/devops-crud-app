import { createContext, useContext, useState, useCallback } from "react";
import api from "@/api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("ts_user");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  });

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("ts_token", data.token);
    localStorage.setItem("ts_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ts_token", data.token);
    localStorage.setItem("ts_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("ts_token");
    localStorage.removeItem("ts_user");
    setUser(null);
  }, []);

  // ─── Update user in memory + localStorage ─────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem("ts_user", JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
