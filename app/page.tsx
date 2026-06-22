"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;
    if (!userName.trim() || !password.trim()) {
      toast.error("Username dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    // Dummy logic
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);

    if (userName.trim() === "admin" && password === "admin") {
      toast.success("Selamat datang, Admin", { duration: 4500 });
      router.push("/admin");
    } else {
      toast.error("Login gagal. Cek username/password.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-6 relative overflow-hidden font-sans text-gray-800">
      {/* Decorative Soft Mesh Gradient / Natural Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft Green Glow */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-100/40 blur-[120px]" />
        {/* Warm Sand Glow */}
        <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-amber-50/50 blur-[100px]" />
        {/* Floral Pink Glow (subtle) */}
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-rose-50/40 blur-[100px]" />

        {/* Subtle Nature SVG Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0C13.431 0 0 13.431 0 30c0 16.569 13.431 30 30 30 16.569 0 30-13.431 30-30C60 13.431 46.569 0 30 0zm0 58C14.536 58 2 45.464 2 30S14.536 2 30 2s28 12.536 28 28-12.536 28-28 28z' fill='%23064E3B' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl p-8 sm:p-10 md:p-12 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        {/* Logo Text (Placeholder for Image) */}
        <div className="w-20 h-20 md:w-24 md:h-24 relative mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100/50 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-500">
          <span className="text-4xl md:text-5xl -rotate-3 hover:rotate-0 transition-transform duration-500">
            🌿
          </span>
        </div>

        {/* Brand name */}
        <div className="mb-1 text-center">
          <h1 className="text-3xl md:text-4xl font-serif text-emerald-900 tracking-wider">
            Hana
          </h1>
        </div>

        {/* Divider */}
        <div className="flex items-center w-full max-w-[200px] mb-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent"></div>
        </div>

        {/* Mock Login Form & Navigation */}
        <div className="w-full space-y-6 md:space-y-7">
          <div className="space-y-5">
            <div className="relative group">
              <label
                htmlFor="username"
                className="block text-xs font-medium text-gray-500 mb-1.5 transition-colors group-focus-within:text-emerald-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white/50 border border-emerald-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-300 outline-none text-gray-700 placeholder:text-gray-400 shadow-sm"
                placeholder="Masukkan username"
              />
            </div>

            <div className="relative group">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-500 mb-1.5 transition-colors group-focus-within:text-emerald-700"
              >
                Password
              </label>
              <div className="relative flex items-center bg-white/50 border border-emerald-100 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-400 transition-all duration-300 shadow-sm">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleLogin();
                  }}
                  autoComplete="current-password"
                  className="w-full flex-1 bg-transparent border-0 px-4 py-3 pr-12 focus:ring-0 outline-none text-gray-700 placeholder:text-gray-400 rounded-xl"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  aria-pressed={showPassword}
                  className="absolute right-2 p-2 text-emerald-400/80 hover:text-emerald-700 focus:outline-none rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-row w-full gap-4 pt-2">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex-1 group relative overflow-hidden bg-white border border-emerald-200 py-3 px-2 flex items-center justify-center transition-colors duration-500 ease-out disabled:opacity-60 rounded-xl"
            >
              <span className="relative z-10 text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-emerald-800 group-hover:text-emerald-900 transition-colors duration-500 flex items-center gap-1 sm:gap-2">
                <span>🌸</span> {isLoading ? "Memproses..." : "Login"}
              </span>
              <div className="absolute inset-0 bg-emerald-50/80 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-0"></div>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Hana System Project
          </p>
        </div>
      </div>
    </main>
  );
}
