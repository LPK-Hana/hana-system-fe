import { translateToKatakana } from './translations';
import { CITY_JP, PROVINCE_JP } from './regionVocabulary';

function normKey(val: string): string {
  return val
    .trim()
    .toUpperCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/PROVINSI|PROV\.|PROV/g, '')
    .replace(/KABUPATEN|KAB\.|KAB/g, '')
    .replace(/KOTA\s+ADMINISTRASI/g, '')
    .replace(/\bKOTA\b/g, '')
    .replace(/DAERAH\s+ISTIMEWA/g, 'DI')
    .replace(/SUMATERA/g, 'SUMATRA')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lookupExact(map: Record<string, string>, val: string): string | undefined {
  const key = normKey(val);
  if (!key) return undefined;
  if (map[key]) return map[key];

  // Coba tanpa kata umum di awal/akhir
  const stripped = key
    .replace(/^ADMINISTRASI\s+/, '')
    .replace(/^DAERAH\s+KHUSUS\s+IBUKOTA\s+/, '')
    .replace(/^DKI\s+/, '')
    .trim();
  if (stripped && map[stripped]) return map[stripped];

  return undefined;
}

function lookupFuzzy(map: Record<string, string>, val: string): string | undefined {
  const exact = lookupExact(map, val);
  if (exact) return exact;

  const key = normKey(val);
  if (!key) return undefined;

  // Cocokkan entri terpanjang dulu agar "JAKARTA TIMUR" tidak tertangkap "JAKARTA"
  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [k, v] of entries) {
    if (key === k || key.includes(k) || k.includes(key)) return v;
  }

  return undefined;
}

/** Katakana/kanji JP untuk nama provinsi; fallback transliterasi katakana */
export function translateProvinceToJp(val: string): string {
  if (!val?.trim()) return '';
  return lookupFuzzy(PROVINCE_JP, val) ?? translateToKatakana(val);
}

/** Katakana/kanji JP untuk nama kota/kabupaten; fallback transliterasi katakana */
export function translateCityToJp(val: string): string {
  if (!val?.trim()) return '';
  return lookupFuzzy(CITY_JP, val) ?? translateToKatakana(val);
}

/** Terjemahkan nama wilayah — coba kota dulu, lalu provinsi, lalu katakana */
export function translateRegionToJp(val: string): string {
  if (!val?.trim()) return '';
  const city = lookupFuzzy(CITY_JP, val);
  if (city) return city;
  const prov = lookupFuzzy(PROVINCE_JP, val);
  if (prov) return prov;
  return translateToKatakana(val);
}

export function buildDomisiliJpFromParts(parts: {
  kelurahan?: string;
  kecamatan?: string;
  kabKota?: string;
  provinsi?: string;
  kelurahanJp?: string;
  kecamatanJp?: string;
  kabKotaJp?: string;
  provinsiJp?: string;
}): string {
  const kel = parts.kelurahanJp?.trim() || translateRegionToJp(parts.kelurahan || '');
  const kec = parts.kecamatanJp?.trim() || translateRegionToJp(parts.kecamatan || '');
  const kab = parts.kabKotaJp?.trim() || translateCityToJp(parts.kabKota || '');
  const prov = parts.provinsiJp?.trim() || translateProvinceToJp(parts.provinsi || '');
  return [kel, kec, kab, prov].filter(Boolean).join('・');
}

export function buildDomisiliKatakanaFromParts(parts: {
  kelurahan?: string;
  kecamatan?: string;
  kabKota?: string;
  provinsi?: string;
}): string {
  return buildDomisiliJpFromParts(parts);
}
