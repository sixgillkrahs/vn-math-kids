"use client";

import { motion } from "framer-motion";
import GradeCard from "@/components/GradeCard";
import Link from "next/link";
import { ScanLine } from "lucide-react";

export default function Home() {
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

      {/* Grade Cards */}
      <section className="mb-10">
        <h2 className="mb-6 text-center text-2xl font-extrabold text-gray-700">
          📚 Chọn lớp của bé
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((grade) => (
            <GradeCard key={grade} grade={grade} />
          ))}

          {/* AI Scan Card */}
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
        </div>
      </section>

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
