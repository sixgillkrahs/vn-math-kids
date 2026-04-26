import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Toán Vui Cấp 1 - Học Toán Thú Vị Cho Bé",
    short_name: "Toán Vui",
    description:
      "Ứng dụng học toán vui nhộn dành cho học sinh cấp 1 Việt Nam. Bài tập từ lớp 1 đến lớp 5.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf2f8",
    theme_color: "#a855f7",
    orientation: "portrait-primary",
    categories: ["education", "kids"],
    icons: [
      {
        src: "/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
