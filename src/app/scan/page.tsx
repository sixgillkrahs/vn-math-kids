"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Play, CheckCircle, Loader2, Pencil, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import FileUploader from "@/components/FileUploader";
import ExerciseView from "@/components/ExerciseView";
import type { GeneratedExercise } from "@/lib/mathGenerator";

interface ScannedExercise {
  question: string;
  answer: string;
  options?: string[];
  topic: string;
  explanation: string;
}

export default function ScanPage() {
  const [grade, setGrade] = useState(1);
  const [scannedRaw, setScannedRaw] = useState<ScannedExercise[] | null>(null);
  const [exercises, setExercises] = useState<GeneratedExercise[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleScanned = (scanned: ScannedExercise[]) => {
    setScannedRaw(scanned);
    setSaved(false);
    setSaveError(null);
    setEditingIdx(null);
  };

  const updateExercise = (idx: number, updated: ScannedExercise) => {
    if (!scannedRaw) return;
    const copy = [...scannedRaw];
    copy[idx] = updated;
    setScannedRaw(copy);
    setSaved(false);
  };

  const deleteExercise = (idx: number) => {
    if (!scannedRaw) return;
    const copy = scannedRaw.filter((_, i) => i !== idx);
    setScannedRaw(copy.length > 0 ? copy : null);
    setEditingIdx(null);
  };

  const handleSaveToBank = async () => {
    if (!scannedRaw) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/exercises/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises: scannedRaw, grade }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
      } else {
        setSaveError(data.error || "Không thể lưu bài tập");
      }
    } catch {
      setSaveError("Đã xảy ra lỗi khi lưu bài tập");
    } finally {
      setSaving(false);
    }
  };

  const handleStartExercises = () => {
    if (!scannedRaw) return;
    const mapped: GeneratedExercise[] = scannedRaw.map((ex) => ({
      question: ex.question,
      answer: ex.answer,
      topic: ex.topic,
      explanation: ex.explanation,
      options: ex.options && ex.options.length >= 2
        ? ex.options
        : generateOptionsFromAnswer(ex.answer),
    }));
    setExercises(mapped);
  };

  const handleReset = () => {
    setScannedRaw(null);
    setExercises(null);
    setSaved(false);
    setSaveError(null);
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

      {exercises ? (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-700">
              📝 Bài tập từ file đã quét
            </h2>
            <button
              onClick={handleReset}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200"
            >
              Quét lại
            </button>
          </div>
          <ExerciseView exercises={exercises} grade={grade} />
        </div>
      ) : scannedRaw ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-800">
              📋 Danh sách bài tập đã quét
            </h2>
            <button
              onClick={handleReset}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200"
            >
              Quét lại
            </button>
          </div>

          <p className="mb-4 text-sm text-gray-500">
            Tìm thấy <strong>{scannedRaw.length}</strong> bài tập từ file.
            Xem lại danh sách bên dưới, sau đó lưu vào ngân hàng đề hoặc bắt
            đầu làm bài.
          </p>

          <div className="mb-6 space-y-3">
            {scannedRaw.map((ex, i) => (
              <div
                key={i}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
                  editingIdx === i ? "border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200"
                }`}
              >
                {editingIdx === i ? (
                  <EditExerciseCard
                    exercise={ex}
                    index={i}
                    onSave={(updated) => {
                      updateExercise(i, updated);
                      setEditingIdx(null);
                    }}
                    onCancel={() => setEditingIdx(null)}
                    onDelete={() => deleteExercise(i)}
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{ex.question}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-medium text-green-600">
                          Đáp án: {ex.answer}
                        </span>
                        {ex.topic && (
                          <span className="ml-3 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            {ex.topic}
                          </span>
                        )}
                      </p>
                      {ex.options && ex.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {ex.options.map((opt, oi) => (
                            <span
                              key={oi}
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                      {ex.explanation && (
                        <p className="mt-1 text-xs text-gray-400">
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingIdx(i)}
                      className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      title="Chỉnh sửa"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSaveToBank}
              disabled={saving || saved}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 font-bold shadow-lg transition ${
                saved
                  ? "bg-green-500 text-white"
                  : saving
                    ? "bg-gray-300 text-gray-500"
                    : "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-xl"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang lưu...
                </>
              ) : saved ? (
                <>
                  <CheckCircle size={18} />
                  Đã lưu vào ngân hàng đề!
                </>
              ) : (
                <>
                  <Save size={18} />
                  Lưu vào ngân hàng đề
                </>
              )}
            </button>

            <button
              onClick={handleStartExercises}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl"
            >
              <Play size={18} />
              Bắt đầu làm bài
            </button>
          </div>

          {saveError && (
            <p className="mt-3 text-center text-sm font-semibold text-red-500">
              {saveError}
            </p>
          )}
        </motion.div>
      ) : (
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
                Xem lại danh sách bài tập và lưu vào ngân hàng đề
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-500">5.</span>
                Bé làm bài và xem kết quả ngay!
              </li>
            </ol>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function EditExerciseCard({
  exercise,
  index,
  onSave,
  onCancel,
  onDelete,
}: {
  exercise: ScannedExercise;
  index: number;
  onSave: (updated: ScannedExercise) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [question, setQuestion] = useState(exercise.question);
  const [answer, setAnswer] = useState(exercise.answer);
  const [options, setOptions] = useState<string[]>(exercise.options || []);
  const [topic, setTopic] = useState(exercise.topic);
  const [explanation, setExplanation] = useState(exercise.explanation);

  const updateOption = (oi: number, value: string) => {
    const copy = [...options];
    copy[oi] = value;
    setOptions(copy);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (oi: number) => {
    setOptions(options.filter((_, i) => i !== oi));
  };

  const handleSave = () => {
    const trimmedOpts = options.map((o) => o.trim()).filter(Boolean);
    if (!trimmedOpts.includes(answer.trim())) {
      trimmedOpts.unshift(answer.trim());
    }
    onSave({
      question: question.trim(),
      answer: answer.trim(),
      options: trimmedOpts,
      topic: topic.trim(),
      explanation: explanation.trim(),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-bold text-indigo-600">
          <Pencil size={14} />
          Chỉnh sửa câu {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className="rounded-full p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition"
            title="Xoá câu hỏi"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onCancel}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            title="Huỷ"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">Câu hỏi</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-green-600">Đáp án đúng</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 focus:border-green-400 focus:ring-2 focus:ring-green-100 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">Chủ đề</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">
          Các đáp án (bao gồm đáp án đúng)
        </label>
        <div className="space-y-2">
          {options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  opt.trim() === answer.trim()
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {String.fromCharCode(65 + oi)}
              </span>
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(oi, e.target.value)}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none ${
                  opt.trim() === answer.trim()
                    ? "border-green-300 bg-green-50 text-green-800 focus:ring-2 focus:ring-green-100"
                    : "border-gray-200 text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(oi)}
                  className="rounded-full p-1 text-gray-300 hover:text-red-500 transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              onClick={addOption}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition"
            >
              <Plus size={14} />
              Thêm đáp án
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">Giải thích</label>
        <input
          type="text"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="rounded-full px-4 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition"
        >
          Huỷ
        </button>
        <button
          onClick={handleSave}
          className="rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-indigo-600 transition"
        >
          Lưu thay đổi
        </button>
      </div>
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
