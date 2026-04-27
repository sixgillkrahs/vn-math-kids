"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin?tab=scan");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-gray-500">Đang chuyển hướng...</p>
    </div>
  );
}
