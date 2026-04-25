"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  grade: number;
  avatar: string;
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  register: (data: {
    username: string;
    password: string;
    displayName: string;
    grade: number;
    avatar: string;
  }) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "tvk_token";
const USER_KEY = "tvk_user";

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getInitialUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(USER_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(getInitialToken);
  const loading = false;

  const saveAuth = useCallback((newToken: string, newUser: UserInfo) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error || "Đăng nhập thất bại" };
        saveAuth(data.token, data.user);
        return {};
      } catch {
        return { error: "Lỗi kết nối. Vui lòng thử lại." };
      }
    },
    [saveAuth]
  );

  const register = useCallback(
    async (data: {
      username: string;
      password: string;
      displayName: string;
      grade: number;
      avatar: string;
    }) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) return { error: result.error || "Đăng ký thất bại" };
        saveAuth(result.token, result.user);
        return {};
      } catch {
        return { error: "Lỗi kết nối. Vui lòng thử lại." };
      }
    },
    [saveAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
