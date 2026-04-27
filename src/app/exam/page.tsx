"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  FileText,
  Loader2,
  Play,
} from "lucide-react";
import Link from "next/link";

interface ExamSummary {
  _id: string;
  title: string;
  grade: number;
  timeLimit: number;
  difficulty?: string;
  questionCount: number;
  createdAt: string;
}

const gradeColors: Record<number, string> = {
  1: "from-pink-400 to-rose-500",
  2: "from-orange-400 to-amber-500",
  3: "from-green-400 to-emerald-500",
  4: "from-blue-400 to-cyan-500",
  5: "from-purple-400 to-violet-500",
};

const difficultyLabels: Record<string, { label: string; color: string }> = {
  easy: { label: "Dễ", color: "bg-green-100 text-green-700" },
  medium: { label: "Khó", color: "bg-yellow-100 text-yellow-700" },
  hard: { label: "Nâng cao", color: "bg-red-100 text-red-700" },
};

export default function ExamListPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState(0);

  useEffect(() => {
    const params = gradeFilter ? `?grade=${gradeFilter}` : "";
    fetch(`/api/exams${params}`)
      .then((r) => r.json())
      .then((data) => setExams(data.exams || []))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, [gradeFilter]);

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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 text-5xl">📝</div>
        <h1 className="mb-2 text-3xl font-black text-gray-800">
          Danh sách đề thi
        </h1>
        <p className="text-gray-600">
          Chọn đề thi và thử sức với thời gian giới hạn!
        </p>
      </motion.div>

      {/* Grade filter */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => { if (gradeFilter === 0) return; setLoading(true); setGradeFilter(0); }}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
            gradeFilter === 0
              ? "bg-indigo-500 text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </button>
        {[1, 2, 3, 4, 5].map((g) => (
          <button
            key={g}
            onClick={() => { if (gradeFilter === g) return; setLoading(true); setGradeFilter(g); }}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              gradeFilter === g
                ? "bg-indigo-500 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Lớp {g}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={40} className="animate-spin text-orange-500" />
        </div>
      ) : exams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-gray-50 p-8 text-center"
        >
          <FileText size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-bold text-gray-500">
            Chưa có đề thi nào
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Admin có thể tạo đề thi bằng cách scan file ở trang Quét Bài Tập
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam, i) => (
            <motion.div
              key={exam._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/exam/${exam._id}`}>
                <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                        gradeColors[exam.grade] || "from-gray-400 to-gray-500"
                      } text-lg font-black text-white`}
                    >
                      {exam.grade}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition">
                        {exam.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText size={12} />
                          {exam.questionCount} câu
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {exam.timeLimit} phút
                        </span>
                        {exam.difficulty &&
                          difficultyLabels[exam.difficulty] && (
                            <span
                              className={`rounded-full px-2 py-0.5 font-medium ${
                                difficultyLabels[exam.difficulty].color
                              }`}
                            >
                              {difficultyLabels[exam.difficulty].label}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                        <Play size={14} />
                        Thi ngay
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
