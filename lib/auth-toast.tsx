"use client";

import { toast } from "react-hot-toast";
import { CheckCircle2, Clock, LogOut, ShieldAlert, UserRoundX, WifiOff } from "lucide-react";

function ToastIcon({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${className}`}
    >
      {children}
    </span>
  );
}

export const authToast = {
  loginSuccess() {
    toast.success("Berhasil masuk", {
      duration: 3500,
      icon: (
        <ToastIcon className="bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={18} strokeWidth={2} />
        </ToastIcon>
      ),
    });
  },

  loginFailed(message?: string) {
    toast.error(message || "Login gagal", {
      duration: 4000,
      icon: (
        <ToastIcon className="bg-red-50 text-red-600">
          <ShieldAlert size={18} strokeWidth={2} />
        </ToastIcon>
      ),
    });
  },

  roleMismatch(message: string) {
    toast.error(message, {
      duration: 5000,
      icon: (
        <ToastIcon className="bg-amber-50 text-amber-700">
          <UserRoundX size={18} strokeWidth={2} />
        </ToastIcon>
      ),
    });
  },

  loggedOut() {
    toast.success("Anda telah keluar", {
      duration: 3500,
      icon: (
        <ToastIcon className="bg-slate-100 text-slate-600">
          <LogOut size={18} strokeWidth={2} />
        </ToastIcon>
      ),
    });
  },

  sessionExpired() {
    toast.error("Sesi berakhir setelah 24 jam. Silakan login lagi.", {
      duration: 5000,
      icon: (
        <ToastIcon className="bg-amber-50 text-amber-600">
          <Clock size={18} strokeWidth={2} />
        </ToastIcon>
      ),
    });
  },

  unauthorized() {
    toast.error("Sesi tidak valid. Silakan login lagi.", {
      duration: 4500,
      icon: (
        <ToastIcon className="bg-red-50 text-red-600">
          <ShieldAlert size={18} strokeWidth={2} />
        </ToastIcon>
      ),
    });
  },

  serverError() {
    toast.error("Tidak dapat menghubungi server", {
      duration: 4000,
      icon: (
        <ToastIcon className="bg-red-50 text-red-600">
          <WifiOff size={18} strokeWidth={2} />
        </ToastIcon>
      ),
    });
  },
};
