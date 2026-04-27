"use client";

import Link from "next/link";
import {
  BookOpen,
  Home,
  ScanLine,
  Trophy,
  LogIn,
  LogOut,
  Flame,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";

export default function Header() {
  const { user, token, logout, loading } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user || !token) return;
    const controller = new AbortController();
    fetch("/api/streak", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => setStreak(d.currentStreak || 0))
      .catch(() => {});
    return () => controller.abort();
  }, [user, token]);

  return (
    <header className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 shadow-lg">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl group-hover:animate-bounce">🧮</span>
          <span className="text-xl font-extrabold text-white drop-shadow-md">
            Toán Vui Cấp 1
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <Home size={16} />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              <ScanLine size={16} />
              <span className="hidden sm:inline">Quản lý</span>
            </Link>
          )}
          <Link
            href="/leaderboard"
            className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <Trophy size={16} />
            <span className="hidden sm:inline">Xếp hạng</span>
          </Link>
          <span className="flex items-center gap-1 rounded-full bg-yellow-300 px-4 py-2 text-sm font-bold text-yellow-900 shadow">
            <BookOpen size={16} />
            <span className="hidden sm:inline">Lớp 1-5</span>
          </span>

          {/* Auth section */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  {streak > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-orange-400/90 px-3 py-2 text-sm font-bold text-white backdrop-blur-sm shadow">
                      <Flame size={16} className="text-yellow-200" />
                      {streak}
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded-full bg-white/30 px-3 py-2 text-sm font-bold text-white backdrop-blur-sm">
                    <span className="text-lg">{user.avatar}</span>
                    <span className="hidden sm:inline">{user.displayName}</span>
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 rounded-full bg-red-400/80 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-red-500"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow transition hover:shadow-md"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
