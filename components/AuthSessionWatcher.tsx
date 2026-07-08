"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { forceRelogin, getAuthToken, isAuthSessionExpired } from "@/lib/auth";

const CHECK_MS = 30_000;

export function AuthSessionWatcher() {
  const pathname = usePathname();
  const didTrigger = useRef(false);

  useEffect(() => {
    didTrigger.current = false;
  }, [pathname]);

  useEffect(() => {
    const tick = () => {
      if (didTrigger.current) return;
      const token = getAuthToken();
      if (!token) return;
      if (!isAuthSessionExpired()) return;
      didTrigger.current = true;
      forceRelogin("session_expired");
    };

    tick();
    const id = window.setInterval(tick, CHECK_MS);
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  return null;
}
