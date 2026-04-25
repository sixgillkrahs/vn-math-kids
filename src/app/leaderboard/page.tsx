"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Star, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  totalScore: number;
  totalCorrect: number;
  totalQuestions: number;
  gamesPlayed: number;
  avgScore: number;
  bestScore: number;
}

const gradeInfo: Record<
  number,
  { name: string; emoji: string; color: string }
> = {
  1: { name: "Lớp 1", emoji: "🌟", color: "from-pink-400 to-rose-500" },
  2: { name: "Lớp 2", emoji: "🌈", color: "from-orange-400 to-amber-500" },
  3: { name: "Lớp 3", emoji: "🚀", color: "from-green-400 to-emerald-500" },
  4: { name: "Lớp 4", emoji: "⭐", color: "from-blue-400 to-cyan-500" },
  5: { name: "Lớp 5", emoji: "🏆", color: "from-purple-400 to-violet-500" },
};

function getRankIcon(rank: number) {
  if (rank === 1)
    return <span className="text-3xl">🥇</span>;
  if (rank === 2)
    return <span className="text-3xl">🥈</span>;
  if (rank === 3)
    return <span className="text-3xl">🥉</span>;
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-black text-gray-500">
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [grade, setGrade] = useState(user?.grade || 1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (g: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?grade=${g}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGradeChange = useCallback(
    (g: number) => {
      setGrade(g);
      fetchLeaderboard(g);
    },
    [fetchLeaderboard]
  );

  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    setInitialized(true);
    fetchLeaderboard(grade);
  }

  const info = gradeInfo[grade];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Quay lại
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <Trophy className="mx-auto mb-3 text-yellow-500" size={56} />
        <h1 className="text-3xl font-black text-gray-800 sm:text-4xl">
          Bảng Xếp Hạng
        </h1>
        <p className="mt-2 text-gray-600">
          Xem ai giỏi toán nhất nào!
        </p>
      </motion.div>

      {/* Grade selector */}
      <div className="mb-6 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((g) => (
          <button
            key={g}
            onClick={() => handleGradeChange(g)}
            className={`rounded-xl px-4 py-2 text-sm font-black transition ${
              grade === g
                ? `bg-gradient-to-r ${gradeInfo[g].color} text-white shadow-lg`
                : "bg-white text-gray-600 shadow hover:shadow-md"
            }`}
          >
            {gradeInfo[g].emoji} {gradeInfo[g].name}
          </button>
        ))}
      </div>

      {/* Grade banner */}
      <motion.div
        key={grade}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`mb-6 rounded-2xl bg-gradient-to-r ${info.color} p-4 text-center text-white shadow-lg`}
      >
        <h2 className="text-xl font-black">
          {info.emoji} Xếp hạng {info.name}
        </h2>
      </motion.div>

      {/* Leaderboard */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 size={40} className="animate-spin text-indigo-500" />
        </div>
      ) : leaderboard.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-white p-8 text-center shadow-lg"
        >
          <div className="mb-3 text-5xl">📊</div>
          <h3 className="mb-2 text-xl font-bold text-gray-700">
            Chưa có dữ liệu
          </h3>
          <p className="text-gray-500">
            Hãy đăng nhập và làm bài tập để xuất hiện trên bảng xếp hạng!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {leaderboard.map((entry, idx) => {
              const isMe = user?.id === entry.userId;
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-4 rounded-2xl p-4 shadow-md transition ${
                    isMe
                      ? "bg-indigo-50 ring-2 ring-indigo-400"
                      : entry.rank <= 3
                        ? "bg-yellow-50"
                        : "bg-white"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0">{getRankIcon(entry.rank)}</div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-3xl">{entry.avatar}</span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-800">
                        {entry.displayName}
                        {isMe && (
                          <span className="ml-1 text-xs text-indigo-500">
                            (Bạn)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.gamesPlayed} lượt chơi
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-600">
                        <Star size={14} className="text-yellow-500" />
                        TB: {entry.avgScore}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Medal size={12} />
                        Cao nhất: {entry.bestScore}
                      </div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-center">
                      <div className="text-lg font-black text-white">
                        {entry.totalScore}
                      </div>
                      <div className="text-[10px] font-bold text-white/70">
                        điểm
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
