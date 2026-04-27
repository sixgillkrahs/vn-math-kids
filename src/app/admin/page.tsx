"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  ShieldAlert,
  ScanLine,
  PenLine,
  FileText,
  Clock,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import { useAuth } from "@/components/AuthProvider";

interface QuestionForm {
  question: string;
  answer: string;
  options: string[];
  topic: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  imageUrl: string;
  uploading: boolean;
}

const emptyQuestion = (): QuestionForm => ({
  question: "",
  answer: "",
  options: ["", "", "", ""],
  topic: "",
  explanation: "",
  difficulty: "easy",
  imageUrl: "",
  uploading: false,
});

interface ScannedExercise {
  question: string;
  answer: string;
  options?: string[];
  topic: string;
  explanation: string;
  difficulty?: "easy" | "medium" | "hard";
  imageUrl?: string;
}

const difficultyLabels: Record<string, { label: string; color: string }> = {
  easy: { label: "Dễ", color: "bg-green-100 text-green-700" },
  medium: { label: "Khó", color: "bg-yellow-100 text-yellow-700" },
  hard: { label: "Nâng cao", color: "bg-red-100 text-red-700" },
};

type Tab = "manual" | "scan";
type SaveTarget = "bank" | "exam";

function AdminGuard() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto max-w-md text-center"
      >
        <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 p-8 shadow-xl">
          <ShieldAlert className="mx-auto mb-4 text-orange-500" size={64} />
          <h2 className="mb-2 text-2xl font-extrabold text-gray-800">
            Chỉ dành cho Admin
          </h2>
          <p className="mb-6 text-gray-600">
            Trang quản lý chỉ dành cho tài khoản admin.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl"
            >
              Đăng nhập
            </Link>
            <Link
              href="/"
              className="rounded-full bg-gray-100 px-6 py-3 font-bold text-gray-600 transition hover:bg-gray-200"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function generateOptionsFromAnswer(answer: string): string[] {
  const unitMatch = answer.match(/^([\d.,/]+)\s*([a-zA-Z%°²³µ].*)$/);
  const unit = unitMatch ? unitMatch[2] : "";
  const numStr = unitMatch ? unitMatch[1] : answer;
  const num = parseFloat(numStr.replace(",", "."));
  if (!isNaN(num)) {
    const offsets = [
      Math.max(1, Math.floor(num * 0.1)),
      Math.max(2, Math.floor(num * 0.2)),
      Math.max(3, Math.floor(num * 0.3)),
    ];
    const wrong = offsets.map((o, i) =>
      i % 2 === 0 ? `${num + o}${unit ? " " + unit : ""}` : `${num - o}${unit ? " " + unit : ""}`
    );
    return [answer, ...wrong].sort(() => Math.random() - 0.5);
  }
  return [answer, "Đáp án B", "Đáp án C", "Đáp án D"];
}

function AdminPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = user?.role === "admin";

  const initialTab = searchParams.get("tab") === "scan" ? "scan" : "manual";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [saveTarget, setSaveTarget] = useState<SaveTarget>("bank");
  const [grade, setGrade] = useState(1);

  // Manual creation state
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);

  // Exam fields
  const [examTitle, setExamTitle] = useState("");
  const [examTimeLimit, setExamTimeLimit] = useState(30);

  // Scan state
  const [scannedExercises, setScannedExercises] = useState<ScannedExercise[] | null>(null);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isAdmin) return <AdminGuard />;

  const updateQuestion = (idx: number, field: keyof QuestionForm, value: string | string[]) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
    setSaved(false);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[oIdx] = value;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
    setSaved(false);
  };

  const addOption = (qIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], options: [...copy[qIdx].options, ""] };
      return copy;
    });
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = {
        ...copy[qIdx],
        options: copy[qIdx].options.filter((_, i) => i !== oIdx),
      };
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
    setSaved(false);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleImageUpload = async (qIdx: number, file: File) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], uploading: true };
      return copy;
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setQuestions((prev) => {
          const copy = [...prev];
          copy[qIdx] = { ...copy[qIdx], imageUrl: data.url, uploading: false };
          return copy;
        });
      } else {
        alert(data.error || "Upload thất bại");
        setQuestions((prev) => {
          const copy = [...prev];
          copy[qIdx] = { ...copy[qIdx], uploading: false };
          return copy;
        });
      }
    } catch {
      alert("Lỗi upload ảnh");
      setQuestions((prev) => {
        const copy = [...prev];
        copy[qIdx] = { ...copy[qIdx], uploading: false };
        return copy;
      });
    }
  };

  const handleScannedImageUpload = async (idx: number, file: File) => {
    if (!scannedExercises) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setScannedExercises((prev) => {
          if (!prev) return prev;
          const copy = [...prev];
          copy[idx] = { ...copy[idx], imageUrl: data.url };
          return copy;
        });
      } else {
        alert(data.error || "Upload thất bại");
      }
    } catch {
      alert("Lỗi upload ảnh");
    }
  };

  const handleScanned = (scanned: Array<{ question: string; answer: string; topic: string; explanation: string; options?: string[]; difficulty?: string; imageUrl?: string }>) => {
    setScannedExercises(scanned.map((ex) => ({
      ...ex,
      difficulty: (ex.difficulty as ScannedExercise["difficulty"]) || "easy",
    })));
    setSaved(false);
    setSaveError(null);
  };

  const deleteScannedExercise = (idx: number) => {
    if (!scannedExercises) return;
    const copy = scannedExercises.filter((_, i) => i !== idx);
    setScannedExercises(copy.length > 0 ? copy : null);
  };

  const getExercisesToSave = () => {
    if (tab === "scan" && scannedExercises) {
      return scannedExercises.map((ex) => ({
        question: ex.question,
        answer: ex.answer,
        options: ex.options && ex.options.length >= 2
          ? ex.options
          : generateOptionsFromAnswer(ex.answer),
        topic: ex.topic || "Bài tập",
        explanation: ex.explanation || "",
        difficulty: ex.difficulty || "easy",
        imageUrl: ex.imageUrl || "",
      }));
    }
    return questions
      .filter((q) => q.question.trim() && q.answer.trim())
      .map((q) => ({
        question: q.question.trim(),
        answer: q.answer.trim(),
        options: q.options.filter((o) => o.trim()),
        topic: q.topic.trim() || "Bài tập",
        explanation: q.explanation.trim(),
        difficulty: q.difficulty,
        imageUrl: q.imageUrl,
      }));
  };

  const handleSave = async () => {
    const exercises = getExercisesToSave();
    if (exercises.length === 0) {
      setSaveError("Chưa có câu hỏi nào để lưu.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      if (saveTarget === "bank") {
        const res = await fetch("/api/exercises/bank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercises, grade }),
        });
        const data = await res.json();
        if (res.ok) {
          setSaved(true);
        } else {
          setSaveError(data.error || "Không thể lưu bài tập");
        }
      } else {
        const title = examTitle.trim() || `Đề thi Lớp ${grade}`;
        const res = await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            grade,
            timeLimit: examTimeLimit,
            exercises,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSaved(true);
          setTimeout(() => router.push(`/exam/${data.examId}`), 1000);
        } else {
          setSaveError(data.error || "Không thể tạo đề thi");
        }
      }
    } catch {
      setSaveError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const exerciseCount = tab === "scan" && scannedExercises
    ? scannedExercises.length
    : questions.filter((q) => q.question.trim() && q.answer.trim()).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Quay lại
      </Link>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <h1 className="mb-2 text-3xl font-black text-gray-800">
          📚 Quản lý câu hỏi
        </h1>
        <p className="text-gray-500">
          Tạo câu hỏi thủ công hoặc quét từ file, upload ảnh cho câu hỏi có hình
        </p>
      </motion.div>

      {/* Tab selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab("manual")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
            tab === "manual"
              ? "bg-indigo-500 text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <PenLine size={16} />
          Tạo thủ công
        </button>
        <button
          onClick={() => setTab("scan")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
            tab === "scan"
              ? "bg-indigo-500 text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <ScanLine size={16} />
          Quét từ file
        </button>
      </div>

      {/* Grade + Save target */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500">Lớp</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`rounded-full px-3 py-1 text-sm font-bold transition ${
                  grade === g
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500">Lưu vào</label>
          <div className="flex gap-1">
            <button
              onClick={() => setSaveTarget("bank")}
              className={`flex items-center gap-1 rounded-full px-4 py-1 text-sm font-bold transition ${
                saveTarget === "bank"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Save size={14} />
              Ngân hàng đề
            </button>
            <button
              onClick={() => setSaveTarget("exam")}
              className={`flex items-center gap-1 rounded-full px-4 py-1 text-sm font-bold transition ${
                saveTarget === "exam"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FileText size={14} />
              Tạo đề thi
            </button>
          </div>
        </div>
      </div>

      {/* Exam fields */}
      {saveTarget === "exam" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4"
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold text-orange-600">
                Tên đề thi
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder={`Đề thi Lớp ${grade}`}
                className="w-full rounded-xl border border-orange-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-bold text-orange-600">
                <Clock size={12} />
                Thời gian (phút)
              </label>
              <div className="flex gap-1">
                {[15, 30, 45, 60, 90].map((t) => (
                  <button
                    key={t}
                    onClick={() => setExamTimeLimit(t)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                      examTimeLimit === t
                        ? "bg-orange-500 text-white"
                        : "bg-white text-orange-600 hover:bg-orange-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Manual tab */}
      {tab === "manual" && (
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <motion.div
              key={qIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-600">
                  Câu {qIdx + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIdx)}
                    className="rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Question text */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-bold text-gray-500">
                  Câu hỏi
                </label>
                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {/* Image upload */}
              <div className="mb-3">
                <label className="mb-1 flex items-center gap-1 text-xs font-bold text-gray-500">
                  <ImageIcon size={12} />
                  Hình ảnh (tùy chọn)
                </label>
                {q.imageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={q.imageUrl}
                      alt="Ảnh câu hỏi"
                      className="max-h-40 rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={() => updateQuestion(qIdx, "imageUrl", "")}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400 transition hover:border-indigo-300 hover:text-indigo-500">
                    {q.uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ImageIcon size={16} />
                    )}
                    {q.uploading ? "Đang upload..." : "Chọn ảnh"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(qIdx, file);
                      }}
                      disabled={q.uploading}
                    />
                  </label>
                )}
              </div>

              {/* Answer */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-bold text-gray-500">
                  Đáp án đúng
                </label>
                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) => updateQuestion(qIdx, "answer", e.target.value)}
                  placeholder="Nhập đáp án đúng..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {/* Options */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-bold text-gray-500">
                  Các đáp án (bao gồm đáp án đúng)
                </label>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="mb-1 flex items-center gap-2">
                    <span className="w-5 text-center text-xs font-bold text-gray-400">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                      placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none ${
                        opt === q.answer && opt
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200"
                      }`}
                    />
                    {q.options.length > 2 && (
                      <button
                        onClick={() => removeOption(qIdx, oIdx)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addOption(qIdx)}
                  className="mt-1 flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700"
                >
                  <Plus size={12} />
                  Thêm đáp án
                </button>
              </div>

              {/* Topic + Difficulty + Explanation */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold text-gray-500">
                    Chủ đề
                  </label>
                  <input
                    type="text"
                    value={q.topic}
                    onChange={(e) => updateQuestion(qIdx, "topic", e.target.value)}
                    placeholder="Ví dụ: Phép cộng"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">
                    Mức độ
                  </label>
                  <select
                    value={q.difficulty}
                    onChange={(e) =>
                      updateQuestion(qIdx, "difficulty", e.target.value)
                    }
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Khó</option>
                    <option value="hard">Nâng cao</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs font-bold text-gray-500">
                  Giải thích (tùy chọn)
                </label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)}
                  placeholder="Giải thích đáp án..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </motion.div>
          ))}

          <button
            onClick={addQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-bold text-gray-400 transition hover:border-indigo-300 hover:text-indigo-500"
          >
            <Plus size={18} />
            Thêm câu hỏi
          </button>
        </div>
      )}

      {/* Scan tab */}
      {tab === "scan" && !scannedExercises && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 text-center text-sm text-gray-500">
            Upload file ảnh hoặc PDF chứa bài tập, AI sẽ tự động nhận dạng
          </div>
          <FileUploader grade={grade} onExercisesScanned={handleScanned} />
        </motion.div>
      )}

      {/* Scanned results */}
      {tab === "scan" && scannedExercises && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Tìm thấy <strong>{scannedExercises.length}</strong> bài tập
            </p>
            <button
              onClick={() => setScannedExercises(null)}
              className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-200"
            >
              Quét lại
            </button>
          </div>

          <div className="space-y-3">
            {scannedExercises.map((ex, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-sm font-bold text-indigo-600">
                    Câu {i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {ex.difficulty && difficultyLabels[ex.difficulty] && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${difficultyLabels[ex.difficulty].color}`}
                      >
                        {difficultyLabels[ex.difficulty].label}
                      </span>
                    )}
                    <button
                      onClick={() => deleteScannedExercise(i)}
                      className="rounded-full p-1 text-red-400 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="mb-2 font-semibold text-gray-800">{ex.question}</p>
                <p className="mb-2 text-sm text-green-600">
                  Đáp án: {ex.answer}
                </p>

                {/* Image for scanned exercise */}
                <div className="mb-2">
                  {ex.imageUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={ex.imageUrl}
                        alt="Ảnh câu hỏi"
                        className="max-h-32 rounded-xl border border-gray-200"
                      />
                      <button
                        onClick={() => {
                          const copy = [...scannedExercises];
                          copy[i] = { ...copy[i], imageUrl: "" };
                          setScannedExercises(copy);
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-gray-200 px-3 py-1.5 text-xs text-gray-400 hover:border-indigo-300 hover:text-indigo-500">
                      <ImageIcon size={12} />
                      Thêm ảnh
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleScannedImageUpload(i, file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {ex.options && ex.options.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ex.options.map((opt, oi) => (
                      <span
                        key={oi}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          opt === ex.answer
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Save button */}
      {exerciseCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          {saveError && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold shadow-lg transition ${
              saved
                ? "bg-green-500 text-white"
                : saving
                  ? "bg-gray-300 text-gray-500"
                  : saveTarget === "exam"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle size={20} />
                {saveTarget === "exam" ? "Đã tạo đề thi!" : "Đã lưu vào ngân hàng đề!"}
              </>
            ) : saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={20} />
                {saveTarget === "exam"
                  ? `Tạo đề thi (${exerciseCount} câu)`
                  : `Lưu ${exerciseCount} câu vào ngân hàng đề`}
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={48} className="animate-spin text-indigo-500" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
