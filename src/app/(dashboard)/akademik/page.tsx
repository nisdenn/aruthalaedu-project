"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AkademikRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/academic");
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm">Mengarahkan ke panel Akademik...</div>;
}
