"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Star,
} from "lucide-react";
import type { GeneratedExercise } from "@/lib/mathGenerator";
import Confetti from "@/components/Confetti";

function shuffleArray(arr: string[]): string[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface ExerciseViewProps {
  exercises: GeneratedExercise[];
  grade: number;
  authToken?: string | null;
  studentName?: string;
  onComplete?: (score: number) => void;
}

export default function ExerciseView({
  exercises,
  grade,
  authToken,
  studentName,
  onComplete,
}: ExerciseViewProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const exercise = exercises[current];
  const isCorrect = selected === exercise?.answer;
  const progress = ((current + (answered ? 1 : 0)) / exercises.length) * 100;

  const [shuffledOptions, setShuffledOptions] = useState(() =>
    shuffleArray(exercises[0]?.options || [])
  );

  const handleSelect = useCallback(
    (option: string) => {
      if (answered) return;
      setSelected(option);
      setAnswered(true);
      if (option === exercise.answer) {
        setCorrectCount((c) => c + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    },
    [answered, exercise]
  );

  const handleNext = useCallback(() => {
    if (current + 1 >= exercises.length) {
      setFinished(true);
      const finalScore = Math.round(
        ((correctCount + (isCorrect ? 0 : 0)) / exercises.length) * 100
      );
      onComplete?.(finalScore);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
      fetch("/api/results", {
        method: "POST",
        headers,
        body: JSON.stringify({
          studentName: studentName || "Học sinh",
          grade,
          topic: exercises[0]?.topic || "Bài tập",
          totalQuestions: exercises.length,
          correctAnswers: correctCount,
          score: finalScore,
          answers: [],
        }),
      }).catch(() => {});
    } else {
      const nextIdx = current + 1;
      setCurrent(nextIdx);
      setSelected(null);
      setAnswered(false);
      setShuffledOptions(shuffleArray(exercises[nextIdx]?.options || []));
    }
  }, [current, exercises, correctCount, isCorrect, onComplete, authToken, studentName, grade]);

  const handleRestart = useCallback(() => {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
    setShuffledOptions(shuffleArray(exercises[0]?.options || []));
  }, [exercises]);

  if (finished) {
    const score = Math.round((correctCount / exercises.length) * 100);
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto max-w-lg text-center"
      >
        <Confetti />
        <div className="rounded-3xl bg-gradient-to-br from-yellow-100 to-orange-100 p-8 shadow-xl">
          <Trophy className="mx-auto mb-4 text-yellow-500" size={64} />
          <h2 className="mb-2 text-3xl font-extrabold text-gray-800">
            🎉 Hoàn thành!
          </h2>
          <p className="mb-4 text-lg text-gray-600">Lớp {grade}</p>
          <div className="mb-4 flex justify-center gap-1">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                size={40}
                className={
                  s <= stars
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <div className="mb-4 text-5xl font-extrabold text-indigo-600">
            {score}
            <span className="text-2xl">điểm</span>
          </div>
          <p className="mb-6 text-gray-600">
            Đúng {correctCount}/{exercises.length} câu
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl"
            >
              <RotateCcw size={18} />
              Làm lại
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="mx-auto max-w-2xl">
      {showConfetti && <Confetti />}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-600">
          <span>
            Câu {current + 1}/{exercises.length}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-green-500" />
            {correctCount} đúng
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="rounded-3xl bg-white p-6 shadow-xl sm:p-8"
        >
          <div className="mb-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-600">
            {exercise.topic}
          </div>
          <h3 className="mb-4 text-2xl font-extrabold text-gray-800 sm:text-3xl">
            {exercise.question}
          </h3>

          {exercise.imageUrl && (
            <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200">
              <img
                src={exercise.imageUrl}
                alt="Hình minh họa"
                className="w-full object-contain"
                style={{ maxHeight: 300 }}
              />
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {shuffledOptions.map((option, idx) => {
              const isThis = selected === option;
              const isAnswer = option === exercise.answer;
              let btnClass =
                "rounded-2xl border-2 p-4 text-left text-lg font-bold transition-all ";

              if (!answered) {
                btnClass +=
                  "border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer";
              } else if (isAnswer) {
                btnClass +=
                  "border-green-400 bg-green-50 text-green-700";
              } else if (isThis && !isAnswer) {
                btnClass +=
                  "border-red-400 bg-red-50 text-red-700";
              } else {
                btnClass += "border-gray-200 bg-gray-50 opacity-50";
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!answered ? { scale: 1.02 } : {}}
                  whileTap={!answered ? { scale: 0.98 } : {}}
                  onClick={() => handleSelect(option)}
                  className={btnClass}
                  disabled={answered}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                    {answered && isAnswer && (
                      <CheckCircle className="ml-auto text-green-500" size={20} />
                    )}
                    {answered && isThis && !isAnswer && (
                      <XCircle className="ml-auto text-red-500" size={20} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 rounded-2xl p-4 ${
                isCorrect
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {isCorrect ? (
                  <>
                    <CheckCircle size={20} /> 🎉 Đúng rồi! Giỏi lắm!
                  </>
                ) : (
                  <>
                    <XCircle size={20} /> 😢 Sai rồi!
                  </>
                )}
              </div>
              {exercise.explanation && (
                <p className="mt-2 text-sm">{exercise.explanation}</p>
              )}
            </motion.div>
          )}

          {/* Next button */}
          {answered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex justify-end"
            >
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl"
              >
                {current + 1 >= exercises.length ? "Xem kết quả" : "Câu tiếp"}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
