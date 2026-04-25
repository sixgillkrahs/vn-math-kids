"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const gradeConfig = [
  {
    grade: 1,
    emoji: "🌟",
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-200",
    topics: "Cộng, trừ trong phạm vi 10",
    mascot: "🐱",
  },
  {
    grade: 2,
    emoji: "🌈",
    color: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-200",
    topics: "Cộng, trừ phạm vi 100, nhân 2-5",
    mascot: "🐶",
  },
  {
    grade: 3,
    emoji: "🚀",
    color: "from-green-400 to-emerald-500",
    shadow: "shadow-green-200",
    topics: "Nhân, chia, cộng trừ phạm vi 1000",
    mascot: "🐰",
  },
  {
    grade: 4,
    emoji: "⭐",
    color: "from-blue-400 to-cyan-500",
    shadow: "shadow-blue-200",
    topics: "Nhân nhiều chữ số, phân số",
    mascot: "🦊",
  },
  {
    grade: 5,
    emoji: "🏆",
    color: "from-purple-400 to-violet-500",
    shadow: "shadow-purple-200",
    topics: "Số thập phân, phần trăm, hình học",
    mascot: "🦁",
  },
];

export default function GradeCard({ grade }: { grade: number }) {
  const config = gradeConfig[grade - 1];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: grade * 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link href={`/grade/${grade}`}>
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.color} p-6 text-white shadow-xl ${config.shadow} cursor-pointer transition-shadow hover:shadow-2xl`}
        >
          <div className="absolute -right-4 -top-4 text-8xl opacity-20">
            {config.mascot}
          </div>
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-4xl">{config.emoji}</span>
              <h2 className="text-2xl font-extrabold">Lớp {config.grade}</h2>
            </div>
            <p className="text-sm font-medium text-white/90">
              {config.topics}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-3xl">{config.mascot}</span>
              <span className="rounded-full bg-white/25 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                Bắt đầu học →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
