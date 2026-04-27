"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Star,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Confetti from "@/components/Confetti";

interface ExamQuestion {
  question: string;
  answer: string;
  options: string[];
  topic: string;
  explanation?: string;
}

interface ExamData {
  _id: string;
  title: string;
  grade: number;
  timeLimit: number;
  exercises: ExamQuestion[];
}

function shuffleArray(arr: string[]): string[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type ExamState = "loading" | "ready" | "running" | "finished" | "error";

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, token } = useAuth();

  const [exam, setExam] = useState<ExamData | null>(null);
  const [state, setState] = useState<ExamState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const finishExamRef = useRef<() => void>(undefined);

  useEffect(() => {
    fetch(`/api/exams/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Không tìm thấy đề thi");
        return r.json();
      })
      .then((data) => {
        setExam(data.exam);
        setTimeLeft(data.exam.timeLimit * 60);
        setAnswers(new Array(data.exam.exercises.length).fill(null));
        setShuffledOptions(shuffleArray(data.exam.exercises[0]?.options || []));
        setState("ready");
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setState("error");
      });
  }, [id]);

  const finishExam = useCallback(() => {
    if (!exam || state === "finished") return;
    setState("finished");
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setTimeTaken(elapsed);

    let correct = 0;
    answers.forEach((ans, i) => {
      if (ans === exam.exercises[i].answer) correct++;
    });
    setCorrectCount(correct);

    const score = Math.round((correct / exam.exercises.length) * 100);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch("/api/results", {
      method: "POST",
      headers,
      body: JSON.stringify({
        studentName: user?.displayName || "Học sinh",
        grade: exam.grade,
        topic: `Đề thi: ${exam.title}`,
        totalQuestions: exam.exercises.length,
        correctAnswers: correct,
        score,
        answers: [],
      }),
    }).catch(() => {});
  }, [exam, state, startTime, answers, token, user]);

  useEffect(() => {
    finishExamRef.current = finishExam;
  }, [finishExam]);

  useEffect(() => {
    if (state !== "running") return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          finishExamRef.current?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  const handleStart = () => {
    setState("running");
    setStartTime(Date.now());
  };

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    const newAnswers = [...answers];
    newAnswers[current] = option;
    setAnswers(newAnswers);
    if (option === exam?.exercises[current].answer) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleRestart = () => {
    if (!exam) return;
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setAnswers(new Array(exam.exercises.length).fill(null));
    setCorrectCount(0);
    setShowConfetti(false);
    setTimeTaken(0);
    setTimeLeft(exam.timeLimit * 60);
    setShuffledOptions(shuffleArray(exam.exercises[0]?.options || []));
    setState("ready");
  };

  const handleNext = () => {
    if (!exam) return;
    if (current + 1 >= exam.exercises.length) {
      finishExam();
    } else {
      const nextIdx = current + 1;
      setCurrent(nextIdx);
      setSelected(null);
      setAnswered(false);
      setShuffledOptions(shuffleArray(exam.exercises[nextIdx]?.options || []));
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (state === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 animate-spin text-orange-500" />
          <p className="text-lg font-bold text-gray-600">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle size={64} className="mx-auto mb-4 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-700">{errorMsg}</h2>
          <Link
            href="/exam"
            className="mt-4 inline-block rounded-full bg-indigo-500 px-6 py-2 font-bold text-white"
          >
            Xem danh sách đề thi
          </Link>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  if (state === "ready") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/exam"
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Danh sách đề thi
        </Link>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 p-8 text-center text-white shadow-xl"
        >
          <div className="mb-4 text-7xl animate-float">📝</div>
          <h1 className="mb-2 text-3xl font-black">{exam.title}</h1>
          <p className="mb-2 text-lg text-white/90">Lớp {exam.grade}</p>

          <div className="mb-6 flex justify-center gap-4">
            <div className="rounded-2xl bg-white/15 px-4 py-2 backdrop-blur-sm">
              <div className="text-2xl font-black">{exam.exercises.length}</div>
              <div className="text-xs font-bold text-white/80">câu hỏi</div>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-1 text-2xl font-black">
                <Clock size={20} />
                {exam.timeLimit}
              </div>
              <div className="text-xs font-bold text-white/80">phút</div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-white/10 p-4 text-left text-sm">
            <p className="font-bold text-yellow-200">Lưu ý:</p>
            <ul className="mt-2 space-y-1 text-white/90">
              <li>• Hết thời gian sẽ tự động nộp bài</li>
              <li>• Trả lời từng câu hỏi theo thứ tự</li>
              <li>• Không thể quay lại câu trước</li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            className="rounded-full bg-white px-8 py-4 text-xl font-black text-orange-600 shadow-xl transition hover:scale-105 hover:shadow-2xl"
          >
            Bắt đầu thi
          </button>
        </motion.div>
      </div>
    );
  }

  if (state === "finished") {
    const score = Math.round((correctCount / exam.exercises.length) * 100);
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Confetti />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl bg-gradient-to-br from-yellow-100 to-orange-100 p-8 text-center shadow-xl"
        >
          <Trophy className="mx-auto mb-4 text-yellow-500" size={64} />
          <h2 className="mb-2 text-3xl font-extrabold text-gray-800">
            Kết quả thi
          </h2>
          <p className="mb-1 text-lg font-bold text-gray-600">{exam.title}</p>
          <p className="mb-4 text-sm text-gray-500">Lớp {exam.grade}</p>

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

          <div className="mb-2 text-5xl font-extrabold text-indigo-600">
            {score}
            <span className="text-2xl">điểm</span>
          </div>
          <p className="mb-2 text-gray-600">
            Đúng {correctCount}/{exam.exercises.length} câu
          </p>
          <p className="mb-6 flex items-center justify-center gap-1 text-sm text-gray-500">
            <Clock size={14} />
            Thời gian: {minutes} phút {seconds} giây
            {timeLeft <= 0 && " (hết giờ)"}
          </p>

          {/* Detail review */}
          <div className="mb-6 space-y-2 text-left">
            <h3 className="text-sm font-bold text-gray-700">Chi tiết:</h3>
            {exam.exercises.map((q, i) => {
              const userAns = answers[i];
              const isRight = userAns === q.answer;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3 text-sm ${
                    isRight
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isRight ? (
                      <CheckCircle size={16} className="mt-0.5 shrink-0 text-green-500" />
                    ) : (
                      <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        Câu {i + 1}: {q.question}
                      </p>
                      {!isRight && (
                        <p className="text-xs text-red-600">
                          Bạn chọn: {userAns || "(chưa trả lời)"} · Đáp án: {q.answer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl"
            >
              <RotateCcw size={18} />
              Thi lại
            </button>
            <Link
              href="/exam"
              className="flex items-center gap-2 rounded-full bg-gray-100 px-6 py-3 font-bold text-gray-600 transition hover:bg-gray-200"
            >
              Danh sách đề thi
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Running state
  const exercise = exam.exercises[current];
  const isCorrect = selected === exercise?.answer;
  const progress =
    ((current + (answered ? 1 : 0)) / exam.exercises.length) * 100;
  const urgentTime = timeLeft <= 60;

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      {showConfetti && <Confetti />}

      {/* Timer bar */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-600">
          Câu {current + 1}/{exam.exercises.length}
        </span>
        <div
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-black ${
            urgentTime
              ? "animate-pulse bg-red-100 text-red-600"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="rounded-3xl bg-white p-6 shadow-xl sm:p-8"
        >
          <div className="mb-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
            {exercise.topic}
          </div>
          <h3 className="mb-6 text-2xl font-extrabold text-gray-800 sm:text-3xl">
            {exercise.question}
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {shuffledOptions.map((option, idx) => {
              const isThis = selected === option;
              const isAnswer = option === exercise.answer;
              let btnClass =
                "rounded-2xl border-2 p-4 text-left text-lg font-bold transition-all ";

              if (!answered) {
                btnClass +=
                  "border-gray-200 bg-gray-50 hover:border-orange-400 hover:bg-orange-50 cursor-pointer";
              } else if (isAnswer) {
                btnClass += "border-green-400 bg-green-50 text-green-700";
              } else if (isThis && !isAnswer) {
                btnClass += "border-red-400 bg-red-50 text-red-700";
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
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
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
                    <CheckCircle size={20} /> Đúng rồi!
                  </>
                ) : (
                  <>
                    <XCircle size={20} /> Sai rồi! Đáp án: {exercise.answer}
                  </>
                )}
              </div>
              {exercise.explanation && (
                <p className="mt-2 text-sm">{exercise.explanation}</p>
              )}
            </motion.div>
          )}

          {answered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex justify-end"
            >
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl"
              >
                {current + 1 >= exam.exercises.length
                  ? "Nộp bài"
                  : "Câu tiếp"}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
