"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, FolderOpen } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const days = ["日", "月", "火", "水", "木", "金", "土"];
      const day = days[now.getDay()];
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      setCurrentDate(`${year}年${month}月${date}日${day}曜日 ${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    router.replace("/");
  };

  return (
    <main className="min-h-screen bg-[#F4F7F4] p-6 md:p-12 relative overflow-hidden font-sans text-gray-800">
      <div className="hana-wagara hana-wagara-subtle" aria-hidden />

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4 pb-8 border-b border-gray-200/80">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="rounded-md border border-gray-200 bg-white p-2 text-emerald-800 shrink-0 mt-1">
                <Settings size={20} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-wide">
                  Administrator Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-800">
                  Selamat datang di sistem Hana, <span className="font-medium">ADMIN</span>
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-2 pl-0 sm:pl-11">
              <p className="text-base text-gray-900 leading-relaxed font-medium">{currentDate}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 inline-flex items-center gap-2 self-start rounded-md border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-600 hover:bg-red-800 hover:border-red-800 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </header>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <div
            onClick={() => router.push("/admin/pemberkasan")}
            className="hana-dashboard-card group block p-10 md:p-14"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 border border-emerald-800/20 flex items-center justify-center mb-8 text-emerald-800 bg-white group-hover:bg-emerald-800 group-hover:text-white transition-colors duration-500 ease-out">
                <FolderOpen size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-serif text-gray-900 mb-6 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Pemberkasan Dokumen
              </h2>
              <div className="flex items-center text-xs tracking-widest uppercase text-emerald-800 font-semibold">
                <span className="relative">
                  Kelola Dokumen
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-800 group-hover:w-full transition-all duration-500 ease-out" />
                </span>
                <svg
                  className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
