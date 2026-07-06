"use client";

import dynamic from "next/dynamic";

const JishuseiPageContent = dynamic(() => import("./JishuseiPageContent"), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-[#F4F7F4] p-6 md:p-12 font-sans text-gray-800 flex items-center justify-center">
      <p className="text-sm text-gray-500">Memuat halaman...</p>
    </main>
  ),
});

export default function DokumenJishuseiPage() {
  return <JishuseiPageContent />;
}
