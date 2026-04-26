"use client";

import { useState, useCallback, use } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Sparkles, BookOpen, Play } from "lucide-react";
import Link from "next/link";
import ExerciseView from "@/components/ExerciseView";
import { useAuth } from "@/components/AuthProvider";
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

const difficultyOptions = [
  { value: "", label: "Tất cả", color: "bg-white/20 text-white" },
  { value: "easy", label: "Dễ", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Khó", color: "bg-yellow-100 text-yellow-700" },
  { value: "hard", label: "Nâng cao", color: "bg-red-100 text-red-700" },
];

type ExerciseMode = "select" | "new" | "bank";

export default function GradePage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const resolvedParams = use(params);
  const gradeNum = Number(resolvedParams.grade);
  const info = gradeInfo[gradeNum];
  const { user, token } = useAuth();

  const [exercises, setExercises] = useState<GeneratedExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<ExerciseMode>("select");
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankTotal, setBankTotal] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState("");

  const fetchNewExercises = useCallback(async () => {
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

  const fetchBankExercises = useCallback(async () => {
    setLoading(true);
    setBankError(null);
    try {
      const diffParam = difficulty ? `&difficulty=${difficulty}` : "";
      const res = await fetch(
        `/api/exercises/bank?grade=${gradeNum}&count=${count}${diffParam}`
      );
      const data = await res.json();
      if (data.exercises && data.exercises.length > 0) {
        const mapped: GeneratedExercise[] = data.exercises.map(
          (ex: {
            question: string;
            answer: string;
            options?: string[];
            topic?: string;
            explanation?: string;
          }) => ({
            question: ex.question,
            answer: ex.answer,
            options:
              ex.options && ex.options.length >= 4
                ? ex.options
                : generateOptionsFromAnswer(ex.answer),
            topic: ex.topic || "Bài tập",
            explanation: ex.explanation || "",
          })
        );
        setExercises(mapped);
      } else {
        setBankError(
          data.message || "Chưa có bài tập trong ngân hàng đề cho lớp này"
        );
        setStarted(false);
      }
    } catch {
      setBankError("Không thể tải bài tập từ ngân hàng đề");
      setStarted(false);
    } finally {
      setLoading(false);
    }
  }, [gradeNum, count, difficulty]);

  const checkBankTotal = useCallback(async (diff?: string) => {
    const d = diff ?? difficulty;
    try {
      const diffParam = d ? `&difficulty=${d}` : "";
      const res = await fetch(
        `/api/exercises/bank?grade=${gradeNum}&count=1${diffParam}`
      );
      const data = await res.json();
      setBankTotal(data.total ?? 0);
    } catch {
      setBankTotal(0);
    }
  }, [gradeNum, difficulty]);

  const handleStart = (selectedMode: "new" | "bank") => {
    setStarted(true);
    if (selectedMode === "new") {
      fetchNewExercises();
    } else {
      fetchBankExercises();
    }
  };

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
          <p className="mb-6 text-lg text-white/90">
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

          {mode === "select" ? (
            <div className="space-y-3">
              <p className="mb-3 text-sm font-bold text-white/80">
                Chọn nguồn bài tập:
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => handleStart("new")}
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-lg font-black text-indigo-600 shadow-xl transition hover:scale-105 hover:shadow-2xl"
                >
                  <Sparkles size={22} />
                  Tạo câu hỏi mới
                </button>
                <button
                  onClick={() => {
                    setMode("bank");
                    checkBankTotal();
                  }}
                  className="flex items-center justify-center gap-2 rounded-full bg-white/20 px-6 py-4 text-lg font-black text-white shadow-xl transition hover:scale-105 hover:bg-white/30 hover:shadow-2xl"
                >
                  <BookOpen size={22} />
                  Ngân hàng câu hỏi
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <BookOpen className="mx-auto mb-2" size={32} />
                <p className="text-sm font-bold">Ngân hàng câu hỏi</p>
                {bankTotal !== null && (
                  <p className="mt-1 text-xs text-white/70">
                    {bankTotal > 0
                      ? `Có ${bankTotal} bài tập sẵn cho ${info.name}`
                      : `Chưa có bài tập nào cho ${info.name}. Hãy quét bài tập trước!`}
                  </p>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-white/80">Mức độ:</p>
                <div className="flex justify-center gap-2">
                  {difficultyOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setDifficulty(opt.value);
                        setBankTotal(null);
                        checkBankTotal(opt.value);
                      }}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                        difficulty === opt.value
                          ? opt.value
                            ? opt.color + " shadow-lg"
                            : "bg-white text-indigo-600 shadow-lg"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {bankError && (
                <p className="text-sm font-semibold text-yellow-200">
                  {bankError}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => handleStart("bank")}
                  disabled={bankTotal === 0}
                  className={`flex items-center justify-center gap-2 rounded-full px-6 py-4 text-lg font-black shadow-xl transition ${
                    bankTotal === 0
                      ? "bg-white/30 text-white/50 cursor-not-allowed"
                      : "bg-white text-indigo-600 hover:scale-105 hover:shadow-2xl"
                  }`}
                >
                  <Play size={22} />
                  Bắt đầu làm bài
                </button>
                <button
                  onClick={() => {
                    setMode("select");
                    setBankError(null);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full bg-white/20 px-6 py-4 text-lg font-black text-white shadow-xl transition hover:scale-105 hover:bg-white/30"
                >
                  <ArrowLeft size={18} />
                  Quay lại
                </button>
              </div>
            </div>
          )}
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
      <ExerciseView
        exercises={exercises}
        grade={gradeNum}
        authToken={token}
        studentName={user?.displayName}
      />
    </div>
  );
}

function generateOptionsFromAnswer(answer: string): string[] {
  const unitMatch = answer.match(/^([\d.,/]+)\s*(.+)$/);
  const unit = unitMatch ? unitMatch[2] : "";
  const numStr = unitMatch ? unitMatch[1] : answer;
  const num = parseFloat(numStr.replace(",", "."));
  if (!isNaN(num)) {
    const opts = new Set<string>([answer]);
    const magnitude = Math.max(1, Math.floor(Math.abs(num) * 0.15) || 1);
    while (opts.size < 4) {
      const delta = Math.floor(Math.random() * magnitude * 2) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      const newNum = num + delta * sign;
      const formatted = Number.isInteger(num)
        ? String(Math.round(newNum))
        : newNum.toFixed(numStr.includes(".") ? (numStr.split(".")[1]?.length || 1) : 1);
      opts.add(unit ? `${formatted} ${unit}` : formatted);
    }
    return shuffleArr([...opts]);
  }
  return shuffleArr([answer, "Không xác định", "Đáp án khác", "Không có đáp án"]);
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
