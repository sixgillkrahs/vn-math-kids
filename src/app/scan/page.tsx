"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileUploader from "@/components/FileUploader";
import ExerciseView from "@/components/ExerciseView";
import type { GeneratedExercise } from "@/lib/mathGenerator";

export default function ScanPage() {
  const [grade, setGrade] = useState(1);
  const [exercises, setExercises] = useState<GeneratedExercise[] | null>(null);

  const handleScanned = (
    scanned: {
      question: string;
      answer: string;
      topic: string;
      explanation: string;
    }[]
  ) => {
    const mapped: GeneratedExercise[] = scanned.map((ex) => ({
      question: ex.question,
      answer: ex.answer,
      topic: ex.topic,
      explanation: ex.explanation,
      options: generateOptionsFromAnswer(ex.answer),
    }));
    setExercises(mapped);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Quay lại
      </Link>

      {!exercises ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 text-center">
            <div className="mb-3 text-5xl">🤖</div>
            <h1 className="mb-2 text-3xl font-black text-gray-800">
              Quét Bài Tập Bằng AI
            </h1>
            <p className="text-gray-600">
              Tải lên ảnh hoặc file PDF chứa bài tập toán, AI sẽ tự động nhận
              dạng và tạo bài tập cho bé!
            </p>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Chọn lớp:
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`rounded-full px-5 py-2 font-bold transition ${
                    grade === g
                      ? "bg-indigo-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>
          </div>

          <FileUploader grade={grade} onExercisesScanned={handleScanned} />

          <div className="mt-8 rounded-2xl bg-white/60 p-6 shadow-md backdrop-blur-sm">
            <h3 className="mb-3 font-extrabold text-gray-700">
              📋 Hướng dẫn sử dụng
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-bold text-indigo-500">1.</span>
                Chọn lớp phù hợp với bé
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-500">2.</span>
                Chụp ảnh hoặc scan bài tập toán trong sách
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-500">3.</span>
                Tải ảnh lên (kéo thả hoặc bấm vào ô tải lên)
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-500">4.</span>
                AI sẽ nhận dạng và tạo bài tập trắc nghiệm
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-500">5.</span>
                Bé làm bài và xem kết quả ngay!
              </li>
            </ol>
          </div>
        </motion.div>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-700">
              📝 Bài tập từ file đã quét
            </h2>
            <button
              onClick={() => setExercises(null)}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200"
            >
              Quét lại
            </button>
          </div>
          <ExerciseView exercises={exercises} grade={grade} />
        </div>
      )}
    </div>
  );
}

function generateOptionsFromAnswer(answer: string): string[] {
  const num = parseFloat(answer);
  if (!isNaN(num)) {
    const opts = new Set<string>([answer]);
    while (opts.size < 4) {
      const delta = Math.floor(Math.random() * 5) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      opts.add(String(num + delta * sign));
    }
    return shuffleArr([...opts]);
  }
  return shuffleArr([answer, "?", "Không xác định", "Khác"]);
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
