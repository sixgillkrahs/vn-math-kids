"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";

const AVATARS = ["🐱", "🐶", "🐰", "🦊", "🦁", "🐼", "🐨", "🐸", "🦋", "🐝"];

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState(1);
  const [avatar, setAvatar] = useState("🐱");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result;
    if (isRegister) {
      result = await register({
        username,
        password,
        displayName,
        grade,
        avatar,
      });
    } else {
      result = await login(username, password);
    }

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 text-6xl animate-float">🧮</div>
        <h1 className="text-3xl font-black text-gray-800">
          {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
        </h1>
        <p className="mt-2 text-gray-600">
          {isRegister
            ? "Tạo tài khoản để lưu thành tích nhé!"
            : "Chào mừng bé quay lại!"}
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-6 shadow-xl sm:p-8"
      >
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-bold text-gray-700">
            Tên đăng nhập
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="vd: hocsinh01"
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold transition focus:border-indigo-400 focus:outline-none"
            required
            minLength={3}
            maxLength={20}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-bold text-gray-700">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 text-lg font-semibold transition focus:border-indigo-400 focus:outline-none"
              required
              minLength={4}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isRegister && (
            <motion.div
              key="register-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-4">
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="vd: Bé Minh"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold transition focus:border-indigo-400 focus:outline-none"
                  required={isRegister}
                />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Lớp
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`flex-1 rounded-xl py-3 text-lg font-black transition ${
                        grade === g
                          ? "bg-indigo-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Chọn avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`rounded-xl p-2 text-3xl transition ${
                        avatar === a
                          ? "bg-indigo-100 shadow-md ring-2 ring-indigo-400"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-4 text-lg font-black text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : isRegister ? (
            <UserPlus size={22} />
          ) : (
            <LogIn size={22} />
          )}
          {loading
            ? "Đang xử lý..."
            : isRegister
              ? "Đăng ký"
              : "Đăng nhập"}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-sm font-semibold text-indigo-500 hover:text-indigo-700"
          >
            {isRegister
              ? "Đã có tài khoản? Đăng nhập"
              : "Chưa có tài khoản? Đăng ký ngay"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
