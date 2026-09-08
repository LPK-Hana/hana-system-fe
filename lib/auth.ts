/** Selaras dengan masa berlaku JWT di backend (24 jam). */
import { isDemoModeClient } from '@/lib/demo-mode';
import { GURU_HOME_PATH } from '@/lib/roles';

const ONE_DAY_SECONDS = 60 * 60 * 24;

export const JWT_SKEW_MS = 30_000;

export const AUTH_REASON_KEY = 'raftel_auth_reason';
export const LOGOUT_CONFIRM_EVENT = 'raftel:logout-confirm';

export type AuthReason = 'session_expired' | 'unauthorized' | 'logged_out';

const setCookie = (name: string, value: string, maxAge = ONE_DAY_SECONDS) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
};

function cookieMaxAgeFromToken(token: string): number {
  const expMs = parseJwtExpMs(token);
  if (expMs == null) return ONE_DAY_SECONDS;
  const remaining = Math.floor((expMs - Date.now()) / 1000);
  return Math.max(1, Math.min(ONE_DAY_SECONDS, remaining));
}

const removeCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

export type AuthSessionExtras = {
  userId?: number;
  name?: string;
};

export const saveAuthSession = (
  token: string,
  isAdminOrRole: number | string,
  userName: string,
  extras?: AuthSessionExtras,
) => {
  const roleStr = typeof isAdminOrRole === "string" ? isAdminOrRole : (isAdminOrRole === 1 ? "admin" : "student");

  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_role", roleStr);
  localStorage.setItem("auth_user_name", userName);

  // Tandai sebagai superadmin jika roleStr === 'superadmin'
  if (roleStr === "superadmin") {
    localStorage.setItem("auth_is_superadmin", "1");
  } else {
    localStorage.removeItem("auth_is_superadmin");
  }

  if (extras?.userId != null && extras.userId > 0) {
    localStorage.setItem("auth_user_id", String(extras.userId));
  } else {
    localStorage.removeItem("auth_user_id");
  }
  if (extras?.name != null && extras.name.trim()) {
    localStorage.setItem("auth_display_name", extras.name.trim());
  } else {
    localStorage.removeItem("auth_display_name");
  }

  const maxAge = cookieMaxAgeFromToken(token);
  setCookie('auth_role', roleStr, maxAge);
  setCookie('auth_token', token, maxAge);
};

export const clearAuthSession = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("auth_user_name");
  localStorage.removeItem("auth_user_id");
  localStorage.removeItem("auth_display_name");
  localStorage.removeItem("auth_is_superadmin");

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith("raftel_student_profile_v1")) {
        localStorage.removeItem(k);
      }
    }
  } catch {
    /* ignore */
  }

  removeCookie("auth_token");
  removeCookie("auth_role");
};

function decodeJwtPayloadJson(b64url: string): { exp?: number } {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (b64.length % 4)) % 4;
  if (pad) b64 += "=".repeat(pad);
  return JSON.parse(atob(b64)) as { exp?: number };
}

/** Mengurai klaim `exp` JWT / token demo (detik Unix) ke milidetik. */
export function parseJwtExpMs(token: string): number | null {
  try {
    if (token.startsWith("demo.")) {
      const payload = decodeJwtPayloadJson(token.slice(5));
      if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
        return null;
      }
      return payload.exp * 1000;
    }
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = decodeJwtPayloadJson(parts[1]!);
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
      return null;
    }
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isAuthSessionExpired(): boolean {
  if (typeof window === "undefined") return true;
  const token = localStorage.getItem("auth_token") || "";
  if (!token) return true;
  const expMs = parseJwtExpMs(token);
  if (expMs == null) return true;
  return Date.now() >= expMs - JWT_SKEW_MS;
}

/** Sisa masa berlaku token (ms). Null jika tidak ada token / tidak bisa diurai. */
export function getAuthTokenRemainingMs(): number | null {
  const token = getAuthToken();
  if (!token) return null;
  const expMs = parseJwtExpMs(token);
  if (expMs == null) return null;
  return expMs - Date.now() - JWT_SKEW_MS;
}

/**
 * Hapus sesi lalu muat ulang halaman login dengan alasan (toast dibaca di `/`).
 */
export function forceRelogin(reason: AuthReason): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AUTH_REASON_KEY, reason);
  } catch {
    /* ignore */
  }
  clearAuthSession();
  if (window.location.pathname !== "/") {
    window.location.assign("/");
  } else {
    window.location.reload();
  }
}

export function getDashboardPathForRole(): string {
  if (typeof window === "undefined") return "/";
  if (isSuperAdminSession() || localStorage.getItem("auth_role") === "superadmin") {
    return "/super-admin";
  }
  const role = localStorage.getItem("auth_role");
  if (role === "admin") return "/admin-dashboard/dashboard";
  if (role === "guru") return GURU_HOME_PATH;
  if (role === "guest") return "/cust-page";
  return "/student-dashboard";
}

/** Apakah masih ada sesi login aktif (token ada dan belum lewat 24 jam). */
export function hasActiveSession(): boolean {
  if (typeof window === "undefined") return false;
  const token = getAuthToken();
  return Boolean(token && !isAuthSessionExpired());
}

/** Tampilkan modal konfirmasi logout (ditangani LogoutGuard). */
export function requestLogoutConfirm(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LOGOUT_CONFIRM_EVENT));
}

/**
 * @deprecated Gunakan modal konfirmasi di LogoutGuard — jangan auto-clear di mount.
 */
export function clearAuthSessionOnLoginPage(): void {
  if (typeof window === "undefined") return;
  fetch("/api/auth/logout", { method: "POST" }).finally(() => {
    clearAuthSession();
  });
}

export function logoutUser(): void {
  const goBase = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  const timeout = AbortSignal.timeout(4000);
  const jobs: Promise<unknown>[] = [
    fetch("/api/auth/logout", { method: "POST", signal: timeout }).catch(() => undefined),
  ];
  if (goBase) {
    jobs.push(
      fetch(`${goBase}/auth/logout`, {
        method: "POST",
        credentials: "include",
        signal: timeout,
      }).catch(() => undefined),
    );
  }
  Promise.allSettled(jobs).finally(() => {
    forceRelogin("logged_out");
  });
}

/** Kembali ke halaman login — konfirmasi dulu (kecuali mode demo). */
export function exitToHome(): void {
  if (typeof window === "undefined") return;
  if (isDemoModeClient()) {
    window.location.assign("/");
    return;
  }
  requestLogoutConfirm();
}

export const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("auth_token") || "";
};

export const getAuthUserName = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("auth_user_name") || "";
};

export const getAuthUserId = () => {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem("auth_user_id");
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const getAuthRole = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("auth_role") || "";
};

export const getAuthDisplayName = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("auth_display_name") || "";
};

/** Cek apakah sesi ini adalah Super Admin (bypass FE-only, tidak perlu token backend valid) */
export const isSuperAdminSession = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("auth_is_superadmin") === "1";
};
