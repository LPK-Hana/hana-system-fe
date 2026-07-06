"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Building2,
  Stamp,
  Home,
  Heart,
  UserCheck,
  LucideIcon,
} from "lucide-react";

const WAGARA_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%23047857' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  backgroundSize: "40px 40px",
};

type DocCard = {
  title: string;
  href: string;
  icon: LucideIcon;
  cta: string;
};

const DOC_CARDS: DocCard[] = [
  { title: "Dokumen Jishusei", href: "/admin-dashboard/pemberkasan/jishusei", icon: Users, cta: "Lihat Daftar" },
  { title: "Dokumen Perusahaan", href: "/admin-dashboard/pemberkasan/perusahaan", icon: Building2, cta: "Lihat Daftar" },
  { title: "Dokumen Imigrasi Perusahaan", href: "/admin-dashboard/pemberkasan/imigrasi-perusahaan", icon: Stamp, cta: "Lihat Daftar" },
  { title: "Dokumen KK", href: "/admin-dashboard/pemberkasan/kk", icon: Home, cta: "Lihat Daftar" },
  { title: "Tanggungan Keluarga", href: "/admin-dashboard/pemberkasan/tanggungan-keluarga", icon: Heart, cta: "Lihat Daftar" },
  { title: "Dokumen Imigrasi Peserta", href: "/admin-dashboard/pemberkasan/imigrasi-peserta", icon: UserCheck, cta: "Lihat Daftar" },
];

export default function PemberkasanPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F4F7F4] font-sans text-gray-800 p-6 md:p-12 relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none" style={WAGARA_STYLE} />
      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex flex-col gap-6 pb-8 border-b border-gray-200/80 mb-12">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin-dashboard/dashboard")}
              className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shrink-0 mt-1"
              aria-label="Kembali ke dashboard"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-wide">
                Pemberkasan Dokumen
              </h1>
              <p className="mt-2 text-sm text-gray-800">
                Pilih kategori dokumen yang ingin dikelola.
              </p>
            </div>
          </div>
        </header>

        <div className="mt-12 grid md:grid-cols-2 gap-8 lg:gap-12">
          {DOC_CARDS.map(({ title, href, icon: Icon, cta }) => (
            <Link
              key={href}
              href={href}
              className="group block relative bg-white p-10 md:p-14 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
              <div className="relative z-10">
                <div className="w-14 h-14 border border-emerald-900/20 flex items-center justify-center mb-8 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-serif text-gray-900 mb-6 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                  {title}
                </h2>
                <div className="flex items-center text-xs tracking-widest uppercase text-emerald-900 font-semibold">
                  <span className="relative">
                    {cta}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-900 group-hover:w-full transition-all duration-500 ease-out" />
                  </span>
                  <svg className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
