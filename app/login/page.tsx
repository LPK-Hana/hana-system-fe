"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { login, setAuthCookie } from "../../lib/auth";

export default function LoginPage() {
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
    const ok = await login(userName, password);
    setIsLoading(false);

    if (ok) {
      setAuthCookie();
      toast.success("Selamat datang, Admin");
      router.replace("/admin");
    } else {
      toast.error("Login gagal. Cek username/password.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-6 relative overflow-hidden font-sans text-gray-800">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-100/40 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-amber-50/50 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-emerald-900 tracking-wide">Hana System</h1>
          <p className="text-sm text-gray-500 mt-2">Masuk ke akun Anda</p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-gray-500 mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleLogin()}
              autoFocus
              className="w-full bg-white border border-emerald-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
              placeholder="admin"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleLogin()}
                autoComplete="current-password"
                className="w-full bg-white border border-emerald-100 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleLogin()}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {isLoading ? "Memproses..." : "Login"}
          </button>
        </div>
      </div>
    </main>
  );
}
