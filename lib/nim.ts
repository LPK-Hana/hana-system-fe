export const NIM_PREFIX = 'HANA';

/** Pola NIM standar: HANA + 2 digit angkatan + 3 digit urut (contoh HANA05001). */
export const NIM_PATTERN = /^HANA(\d{2})(\d{3})$/;

export function buildNim(angkatan: string, urut: number): string {
  const ang = String(angkatan).replace(/\D/g, '').slice(0, 2).padStart(2, '0');
  const seq = String(urut).padStart(3, '0');
  return `${NIM_PREFIX}${ang}${seq}`;
}

export const DEMO_STUDENT_USERNAME = buildNim('01', 1);

function normalizeNoPesertaKey(noPeserta: string): string {
  let s = noPeserta.trim().toUpperCase();
  if (s.startsWith('\uFEFF')) s = s.slice(1);
  s = s.replace(/\s+/g, '');
  return s.replace(/\u00a0/g, '');
}

/** Dua digit setelah prefix NIM untuk tampilan (mis. HANA05001 → "05"). */
export function angkatanDigitsFromNoPeserta(noPeserta: string): string {
  const s = normalizeNoPesertaKey(noPeserta);
  const match = s.match(NIM_PATTERN);
  return match?.[1] ?? '';
}

/** Nilai integer untuk API / DB (mis. "05" → 5). */
export function angkatanIntFromNoPeserta(noPeserta: string): number | null {
  const d = angkatanDigitsFromNoPeserta(noPeserta);
  if (!d) return null;
  const n = parseInt(d, 10);
  return Number.isFinite(n) ? n : null;
}

export function parseNimParts(username: string): { angkatan: number; urut: number } | null {
  const match = normalizeNoPesertaKey(username).match(NIM_PATTERN);
  if (!match) return null;
  return { angkatan: Number(match[1]), urut: Number(match[2]) };
}
