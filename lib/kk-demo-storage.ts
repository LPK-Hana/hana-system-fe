'use client';

/** Penyimpanan Kartu Keluarga di browser (mode demo / mockup). */

const PREFIX = 'gada_kk_demo_v1';

function key(userName: string, lang: 'id' | 'jp') {
  return `${PREFIX}:${userName.toUpperCase()}:${lang}`;
}

export function loadKkDemo(userName: string, lang: 'id' | 'jp'): Record<string, unknown> | null {
  if (typeof window === 'undefined' || !userName) return null;
  try {
    const raw = localStorage.getItem(key(userName, lang));
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function saveKkDemo(userName: string, lang: 'id' | 'jp', data: Record<string, unknown>) {
  if (typeof window === 'undefined' || !userName) return;
  localStorage.setItem(key(userName, lang), JSON.stringify(data));
}

export function hasKkDemo(userName: string): { has_kk_id: boolean; has_kk_jp: boolean } {
  return {
    has_kk_id: !!loadKkDemo(userName, 'id'),
    has_kk_jp: !!loadKkDemo(userName, 'jp'),
  };
}

export function clearKkDemo(userName: string) {
  if (typeof window === 'undefined' || !userName) return;
  localStorage.removeItem(key(userName, 'id'));
  localStorage.removeItem(key(userName, 'jp'));
}
