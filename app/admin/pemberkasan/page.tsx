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
      <div className="hana-wagara hana-wagara-subtle" aria-hidden />

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex flex-col gap-6 pb-8 border-b border-gray-200/80 mb-12">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-md border border-gray-200 bg-white p-2 text-emerald-800 hover:bg-gray-50 hover:border-gray-300 transition-colors shrink-0 mt-1"
              aria-label="Kembali ke dashboard"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-wide">
                Pemberkasan Dokumen
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Pilih kategori dokumen yang ingin dikelola.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {DOC_CARDS.map(({ no, title, href, icon: Icon }) => (
            <Link key={href} href={href} className="hana-dashboard-card group block p-10 md:p-12">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 border border-emerald-800/20 flex items-center justify-center text-emerald-800 bg-white group-hover:bg-emerald-800 group-hover:text-white transition-colors duration-500 ease-out">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-3xl font-serif text-emerald-100 font-bold group-hover:text-emerald-200 transition-colors">
                    {no}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-serif text-gray-900 mb-6 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                  {title}
                </h2>
                <div className="flex items-center text-xs tracking-widest uppercase text-emerald-800 font-semibold">
                  <span className="relative">
                    Lihat Daftar
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
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
