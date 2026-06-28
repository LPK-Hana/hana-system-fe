import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-6 relative overflow-hidden font-sans text-gray-800">
      <div className="hana-wagara" aria-hidden />

      <div className="relative z-10 w-full max-w-lg bg-white p-8 sm:p-10 md:p-12 lg:p-16 border border-gray-200/60 flex flex-col items-center">
        <div className="w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8 flex items-center justify-center border border-emerald-800/20 bg-white">
          <span className="font-serif text-3xl md:text-4xl text-emerald-900 tracking-widest">花</span>
        </div>

        <h2 className="text-[9px] md:text-[10px] font-semibold text-gray-400 tracking-[0.25em] md:tracking-[0.3em] uppercase mb-6 md:mb-8 text-center">
          System Administration
        </h2>

        <div className="flex items-center w-full max-w-[200px] md:max-w-xs mb-6 md:mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-700/30 to-transparent" />
        </div>

        <div className="flex flex-col items-center gap-1.5 md:gap-2 mb-8 md:mb-12">
          <p className="font-serif text-base md:text-lg text-gray-800 tracking-[0.2em] md:tracking-[0.25em] text-center uppercase">
            Hana System
          </p>
        </div>

        <div className="w-full space-y-4">
          <Link href="/admin" className="hana-portal-btn block text-center">
            <span>Administrator</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
