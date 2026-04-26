"use client";

import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getInitialDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("tvk_install_dismissed");
}

function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as unknown as { standalone: boolean }).standalone)
  );
}

function getIsIOSSafari(): boolean {
  if (typeof window === "undefined") return false;
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;
  const isSafari =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  return isIOS && isSafari;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt] = useState(getIsIOSSafari);
  const [dismissed, setDismissed] = useState(getInitialDismissed);
  const [isStandalone] = useState(getIsStandalone);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (dismissed || isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed, isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
    localStorage.setItem("tvk_install_dismissed", "1");
  };

  if (dismissed || isStandalone) return null;
  if (!deferredPrompt && !showIOSPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-4 shadow-2xl border border-purple-100">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-xl">
            🧮
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">Cài đặt Toán Vui</h3>
            {showIOSPrompt ? (
              <p className="mt-1 text-sm text-gray-500">
                Bấm <Share size={14} className="inline text-blue-500" /> rồi chọn{" "}
                <strong>&quot;Thêm vào Màn hình chính&quot;</strong> để cài app.
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Cài app về điện thoại để học toán mọi lúc, mọi nơi!
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-full p-1 text-gray-300 hover:text-gray-500 transition"
          >
            <X size={18} />
          </button>
        </div>
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 font-bold text-white shadow-lg transition hover:shadow-xl"
          >
            <Download size={18} />
            Cài đặt ngay
          </button>
        )}
      </div>
    </div>
  );
}
