"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  forceRelogin,
  getAuthToken,
  getAuthTokenRemainingMs,
  isAuthSessionExpired,
} from "@/lib/auth";

const CHECK_MS = 30_000;

export function AuthSessionWatcher() {
  const pathname = usePathname();
  const didTrigger = useRef(false);

  useEffect(() => {
    didTrigger.current = false;
  }, [pathname]);

  useEffect(() => {
    const expire = (reason: "session_expired" | "logged_out" = "session_expired") => {
      if (didTrigger.current) return;
      didTrigger.current = true;
      forceRelogin(reason);
    };

    const tick = () => {
      if (didTrigger.current) return;
      const token = getAuthToken();
      if (!token) return;
      if (!isAuthSessionExpired()) return;
      expire("session_expired");
    };

    tick();
    const intervalId = window.setInterval(tick, CHECK_MS);

    let expireTimer: number | undefined;
    const scheduleExact = () => {
      if (expireTimer != null) window.clearTimeout(expireTimer);
      const remaining = getAuthTokenRemainingMs();
      if (remaining == null) return;
      expireTimer = window.setTimeout(() => expire("session_expired"), Math.max(0, remaining));
    };
    scheduleExact();

    const onFocus = () => tick();
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "auth_token") return;
      if (!e.newValue && e.oldValue) {
        expire("logged_out");
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(intervalId);
      if (expireTimer != null) window.clearTimeout(expireTimer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname]);

  return null;
}
