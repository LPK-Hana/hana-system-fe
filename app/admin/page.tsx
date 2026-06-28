"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, ArrowRight, FolderOpen } from "lucide-react";
import { clearAuthCookie } from "../../lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const day = days[now.getDay()];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      setCurrentDate(`${year}年${month}月${date}日${day}曜日 ${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearAuthCookie();
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-[#F4F7F4] p-6 md:p-12 relative overflow-hidden font-sans text-gray-800">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-100/40 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-amber-50/50 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-white border border-emerald-100 rounded-xl shadow-sm text-emerald-700">
                <Settings size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif text-emerald-900 tracking-wide">
                Administrator Dashboard
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-6 font-medium">
              Selamat datang di sistem Hana, ADMIN
            </p>
            <p className="text-sm font-bold tracking-wider text-emerald-800">
              {currentDate}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors shadow-sm text-xs font-bold tracking-widest uppercase self-start"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => router.push("/admin/pemberkasan")}
            className="group bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-emerald-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1"
          >
            <div className="mb-6">
              <div className="inline-flex p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <FolderOpen size={28} strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-xl font-serif text-emerald-900 mb-8 flex-1">
              Pemberkasan Dokumen
            </h3>
            <div className="flex items-center text-xs font-bold text-emerald-600 uppercase tracking-widest group-hover:text-emerald-800 transition-colors">
              Kelola Dokumen
              <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
