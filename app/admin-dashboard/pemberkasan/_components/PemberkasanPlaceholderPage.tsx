"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: string;
}

export default function PemberkasanPlaceholderPage({ title }: Props) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F5F9FC] p-6 md:p-12 font-sans text-gray-800 relative overflow-hidden">
      <div className="raftel-wagara raftel-wagara-subtle" aria-hidden />
      <div className="relative z-10 max-w-3xl mx-auto bg-white p-8 md:p-12 border border-gray-200/60">
        <button
          onClick={() => router.push("/admin-dashboard/pemberkasan")}
          className="flex items-center gap-2 text-raftel-800 hover:text-raftel-950 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Kembali ke Pemberkasan
        </button>
        <h1 className="text-2xl md:text-3xl font-serif text-raftel-900 mb-3">{title}</h1>
        <p className="text-gray-500">Modul ini akan segera tersedia.</p>
      </div>
    </main>
  );
}
