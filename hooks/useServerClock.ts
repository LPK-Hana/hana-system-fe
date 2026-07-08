'use client';

import { useEffect, useState } from 'react';
import { isDemoModeClient } from '@/lib/demo-mode';

const TIMEZONE = 'Asia/Jakarta';

export function formatJapaneseDateTime(d: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function useServerClock() {
  const [serverNow, setServerNow] = useState<Date | null>(null);

  useEffect(() => {
    if (isDemoModeClient()) {
      const tick = () => setServerNow(new Date());
      tick();
      const id = window.setInterval(tick, 1000);
      return () => window.clearInterval(id);
    }

    let cancelled = false;
    let serverOffsetMs = 0;
    let offsetReady = false;

    (async () => {
      try {
        const res = await fetch('/api/server-time', { cache: 'no-store' });
        if (!res.ok) throw new Error('time');
        const { iso } = (await res.json()) as { iso?: string };
        const serverMs = iso ? new Date(iso).getTime() : NaN;
        if (!cancelled && Number.isFinite(serverMs)) {
          serverOffsetMs = serverMs - Date.now();
          offsetReady = true;
          const tick = () => setServerNow(new Date(Date.now() + serverOffsetMs));
          tick();
          const id = window.setInterval(tick, 1000);
          return () => window.clearInterval(id);
        }
      } catch {
        if (!cancelled) {
          serverOffsetMs = 0;
          offsetReady = true;
        }
      }
      if (!cancelled && offsetReady) {
        const tick = () => setServerNow(new Date(Date.now() + serverOffsetMs));
        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return serverNow;
}
