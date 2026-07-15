"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LaporanRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/reports");
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm">Mengarahkan ke Pusat Laporan...</div>;
}
