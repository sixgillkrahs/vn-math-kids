"use client";

import { motion } from "framer-motion";
import GradeCard from "@/components/GradeCard";
import Link from "next/link";
import { ScanLine, Trophy, Flame, FileText } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";

export default function Home() {
  const { user, token } = useAuth();
  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    longestStreak: number;
    activeToday: boolean;
  } | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    fetch("/api/streak", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setStreakData(d))
      .catch(() => {});
  }, [user, token]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="mb-4 text-6xl animate-float">🧮</div>
        <h1 className="mb-3 text-4xl font-black text-gray-800 sm:text-5xl">
          Chào mừng bé đến với{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Toán Vui!
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-gray-600">
          Cùng học toán với những bài tập thú vị dành cho học sinh cấp 1 từ lớp
          1 đến lớp 5 nhé! 🌟
        </p>
      </motion.div>

      {/* Streak Card */}
      {user && streakData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="mx-auto max-w-md rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 p-5 text-center text-white shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <Flame size={32} className="text-yellow-200" />
              <div>
                <div className="text-3xl font-black">
                  {streakData.currentStreak} ngày
                </div>
                <div className="text-sm font-semibold text-white/80">
                  {streakData.activeToday
                    ? "Hôm nay đã học rồi!"
                    : "Hãy làm bài để giữ chuỗi streak!"}
                </div>
              </div>
            </div>
            {streakData.longestStreak > 0 && (
              <div className="mt-2 text-xs text-white/70">
                Kỷ lục: {streakData.longestStreak} ngày liên tiếp
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Grade Cards */}
      <section className="mb-10">
        <h2 className="mb-6 text-center text-2xl font-extrabold text-gray-700">
          📚 Chọn lớp của bé
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((grade) => (
            <GradeCard key={grade} grade={grade} />
          ))}

          {/* AI Scan Card - Admin only */}
          {user?.role === "admin" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/scan">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-400 to-cyan-500 p-6 text-white shadow-xl shadow-teal-200 cursor-pointer transition-shadow hover:shadow-2xl">
                  <div className="absolute -right-4 -top-4 text-8xl opacity-20">
                    🤖
                  </div>
                  <div className="relative z-10">
                    <div className="mb-2 flex items-center gap-2">
                      <ScanLine size={36} />
                      <h2 className="text-2xl font-extrabold">Quét Bài Tập</h2>
                    </div>
                    <p className="text-sm font-medium text-white/90">
                      Dùng AI để quét bài tập từ ảnh hoặc file PDF
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-3xl">📷</span>
                      <span className="rounded-full bg-white/25 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                        Tải ảnh lên →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Exam Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/exam">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white shadow-xl shadow-red-200 cursor-pointer transition-shadow hover:shadow-2xl">
                <div className="absolute -right-4 -top-4 text-8xl opacity-20">
                  ⏰
                </div>
                <div className="relative z-10">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText size={36} />
                    <h2 className="text-2xl font-extrabold">Thi Đấu</h2>
                  </div>
                  <p className="text-sm font-medium text-white/90">
                    Làm đề thi có thời gian giới hạn!
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-3xl">📝</span>
                    <span className="rounded-full bg-white/25 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                      Vào thi →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Leaderboard Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/leaderboard">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white shadow-xl shadow-orange-200 cursor-pointer transition-shadow hover:shadow-2xl">
                <div className="absolute -right-4 -top-4 text-8xl opacity-20">
                  🏆
                </div>
                <div className="relative z-10">
                  <div className="mb-2 flex items-center gap-2">
                    <Trophy size={36} />
                    <h2 className="text-2xl font-extrabold">Bảng Xếp Hạng</h2>
                  </div>
                  <p className="text-sm font-medium text-white/90">
                    Xem ai giỏi toán nhất nào! Thi đua cùng bạn bè
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-3xl">🥇</span>
                    <span className="rounded-full bg-white/25 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                      Xem ngay →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Login prompt */}
      {!user && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-10"
        >
          <Link href="/login">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-center text-white shadow-lg transition hover:shadow-xl">
              <p className="text-lg font-bold">
                🔑 Đăng nhập để lưu thành tích và lên bảng xếp hạng!
              </p>
              <p className="mt-1 text-sm text-white/80">
                Bấm vào đây để đăng nhập hoặc tạo tài khoản mới
              </p>
            </div>
          </Link>
        </motion.section>
      )}

      {/* Features */}
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              emoji: "🎯",
              title: "Bài tập phù hợp",
              desc: "Được thiết kế theo chương trình học Việt Nam",
            },
            {
              emoji: "🤖",
              title: "AI thông minh",
              desc: "Quét và nhận dạng bài tập từ ảnh tự động",
            },
            {
              emoji: "🏆",
              title: "Theo dõi tiến bộ",
              desc: "Xem kết quả và cải thiện mỗi ngày",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="rounded-2xl bg-white/60 p-5 text-center shadow-md backdrop-blur-sm"
            >
              <div className="mb-2 text-4xl">{f.emoji}</div>
              <h3 className="mb-1 font-extrabold text-gray-700">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
