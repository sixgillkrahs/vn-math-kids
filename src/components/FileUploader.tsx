"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, Loader2 } from "lucide-react";

export interface ScannedExerciseData {
  question: string;
  answer: string;
  topic: string;
  explanation: string;
  options?: string[];
  difficulty?: string;
  imageUrl?: string;
}

interface FileUploaderProps {
  grade: number;
  onExercisesScanned: (exercises: ScannedExerciseData[]) => void;
}

export default function FileUploader({
  grade,
  onExercisesScanned,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("grade", String(grade));

        const res = await fetch("/api/scan", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.exercises) {
          onExercisesScanned(data.exercises);
        } else {
          setError(data.error || "Không thể quét bài tập từ file");
        }
      } catch {
        setError("Đã xảy ra lỗi khi tải file");
      } finally {
        setUploading(false);
      }
    },
    [grade, onExercisesScanned]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-3xl border-4 border-dashed p-8 text-center transition-all hover:scale-[1.01] active:scale-[0.99] ${
          isDragActive
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={48} className="animate-spin text-indigo-500" />
            <p className="text-lg font-semibold text-indigo-600">
              🤖 AI đang quét bài tập...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-indigo-100 p-4">
              {isDragActive ? (
                <FileImage size={48} className="text-indigo-500" />
              ) : (
                <Upload size={48} className="text-indigo-400" />
              )}
            </div>
            <p className="text-lg font-bold text-gray-700">
              {isDragActive
                ? "Thả file vào đây! 📄"
                : "Kéo thả hoặc bấm để tải ảnh bài tập"}
            </p>
            <p className="text-sm text-gray-500">
              Hỗ trợ: JPG, PNG, WebP, PDF (tối đa 10MB)
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-3 text-center text-sm font-semibold text-red-500">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
