"use client";

import { useState, useCallback, use } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ExerciseView from "@/components/ExerciseView";
import type { GeneratedExercise } from "@/lib/mathGenerator";

const gradeInfo: Record<
  number,
  { name: string; emoji: string; color: string; mascot: string }
> = {
  1: { name: "Lớp 1", emoji: "🌟", color: "from-pink-400 to-rose-500", mascot: "🐱" },
  2: { name: "Lớp 2", emoji: "🌈", color: "from-orange-400 to-amber-500", mascot: "🐶" },
  3: { name: "Lớp 3", emoji: "🚀", color: "from-green-400 to-emerald-500", mascot: "🐰" },
  4: { name: "Lớp 4", emoji: "⭐", color: "from-blue-400 to-cyan-500", mascot: "🦊" },
  5: { name: "Lớp 5", emoji: "🏆", color: "from-purple-400 to-violet-500", mascot: "🦁" },
};

export default function GradePage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const resolvedParams = use(params);
  const gradeNum = Number(resolvedParams.grade);
  const info = gradeInfo[gradeNum];

  const [exercises, setExercises] = useState<GeneratedExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(10);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exercises/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: gradeNum, count }),
      });
      const data = await res.json();
      setExercises(data.exercises || []);
    } finally {
      setLoading(false);
    }
  }, [gradeNum, count]);

  if (!info) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">😵</div>
          <h1 className="text-2xl font-bold text-gray-700">
            Không tìm thấy lớp này!
          </h1>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-indigo-500 px-6 py-2 font-bold text-white"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-3xl bg-gradient-to-br ${info.color} p-8 text-center text-white shadow-xl`}
        >
          <div className="mb-4 text-7xl animate-float">{info.mascot}</div>
          <h1 className="mb-2 text-4xl font-black">
            {info.emoji} {info.name}
          </h1>
          <p className="mb-8 text-lg text-white/90">
            Sẵn sàng làm bài tập toán chưa nào? 🎉
          </p>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-white/80">
              Số câu hỏi:
            </label>
            <div className="flex justify-center gap-3">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`rounded-full px-5 py-2 font-bold transition ${
                    count === n
                      ? "bg-white text-indigo-600 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setStarted(true); fetchExercises(); }}
            className="rounded-full bg-white px-8 py-4 text-xl font-black text-indigo-600 shadow-xl transition hover:scale-105 hover:shadow-2xl"
          >
            🚀 Bắt đầu làm bài!
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="mx-auto mb-4 animate-spin text-indigo-500"
          />
          <p className="text-lg font-bold text-gray-600">
            Đang tạo bài tập cho bé... 📝
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <h1 className="text-xl font-extrabold text-gray-700">
          {info.emoji} {info.name} {info.mascot}
        </h1>
      </div>

      {exercises.length > 0 ? (
        <ExerciseView exercises={exercises} grade={gradeNum} />
      ) : (
        <div className="text-center">
          <p className="text-lg text-gray-500">Không có bài tập</p>
        </div>
      )}
    </div>
  );
}
