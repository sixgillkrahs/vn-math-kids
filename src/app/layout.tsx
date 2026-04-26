import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Toán Vui Cấp 1 - Học Toán Thú Vị Cho Bé",
  description:
    "Ứng dụng học toán vui nhộn dành cho học sinh cấp 1 Việt Nam. Bài tập từ lớp 1 đến lớp 5 với AI quét bài tập thông minh.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧮</text></svg>",
    apple: "/icons/icon-192x192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Toán Vui",
  },
};

export const viewport: Viewport = {
  themeColor: "#a855f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${nunito.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 py-4 text-center text-sm font-semibold text-white">
            <p>🧮 Toán Vui Cấp 1 © 2025 - Học mà vui, vui mà học! 📚</p>
          </footer>
          <ServiceWorkerRegister />
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
