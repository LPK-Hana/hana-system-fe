"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: string;
}

export default function PemberkasanPlaceholderPage({ title }: Props) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F4F7F4] p-6 md:p-12 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-emerald-50 shadow-sm">
        <button
          onClick={() => router.push("/admin/pemberkasan")}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Kembali ke Pemberkasan
        </button>
        <h1 className="text-2xl md:text-3xl font-serif text-emerald-900 mb-3">{title}</h1>
        <p className="text-gray-500">Modul ini akan segera tersedia.</p>
      </div>
    </main>
  );
}
