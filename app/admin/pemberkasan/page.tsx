"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Building2,
  ArrowRight,
  Stamp,
  Home,
  Heart,
  UserCheck,
  LucideIcon,
} from "lucide-react";

type DocCard = {
  no: number;
  title: string;
  href: string;
  icon: LucideIcon;
};

const DOC_CARDS: DocCard[] = [
  { no: 1, title: "Dokumen Jishusei", href: "/admin/pemberkasan/jishusei", icon: Users },
  { no: 2, title: "Dokumen Perusahaan", href: "/admin/pemberkasan/perusahaan", icon: Building2 },
  { no: 3, title: "Dokumen Imigrasi Perusahaan", href: "/admin/pemberkasan/imigrasi-perusahaan", icon: Stamp },
  { no: 4, title: "Dokumen KK", href: "/admin/pemberkasan/kk", icon: Home },
  { no: 5, title: "Tanggungan Keluarga", href: "/admin/pemberkasan/tanggungan-keluarga", icon: Heart },
  { no: 6, title: "Dokumen Imigrasi Peserta", href: "/admin/pemberkasan/imigrasi-peserta", icon: UserCheck },
];

export default function PemberkasanPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F4F7F4] p-6 md:p-12 relative overflow-hidden font-sans text-gray-800">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-100/40 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-amber-50/50 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0C13.431 0 0 13.431 0 30c0 16.569 13.431 30 30 30 16.569 0 30-13.431 30-30C60 13.431 46.569 0 30 0zm0 58C14.536 58 2 45.464 2 30S14.536 2 30 2s28 12.536 28 28-12.536 28-28 28z' fill='%23064E3B' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => router.push("/admin")}
                className="p-2.5 bg-white border border-emerald-100 !rounded-xl shadow-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl md:text-4xl font-serif text-emerald-900 tracking-wide">
                Pemberkasan Dokumen
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-6 font-medium ml-[3.5rem]">
              Pilih kategori dokumen yang ingin dikelola.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-0 md:ml-[3.5rem]">
          {DOC_CARDS.map(({ no, title, href, icon: Icon }) => (
            <div
              key={href}
              onClick={() => router.push(href)}
              className="group bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-emerald-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1"
            >
              <div className="mb-6 flex justify-between items-start">
                <div className="inline-flex p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <span className="text-4xl font-serif text-emerald-100 font-bold group-hover:text-emerald-200 transition-colors">
                  {no}
                </span>
              </div>
              <h3 className="text-xl font-serif text-emerald-900 mb-8 flex-1">{title}</h3>
              <div className="flex items-center text-xs font-bold text-emerald-600 uppercase tracking-widest group-hover:text-emerald-800 transition-colors">
                Lihat Daftar
                <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
