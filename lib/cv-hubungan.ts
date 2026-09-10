/** CV family relationship — Indonesian value ↔ Japanese kanji */

export type HubunganValue =
  | 'Ayah'
  | 'Ibu'
  | 'Kakak (L)'
  | 'Kakak (P)'
  | 'Adik (L)'
  | 'Adik (P)'
  | 'Suami'
  | 'Istri'
  | 'Anak (L)'
  | 'Anak (P)'
  | 'Kakek'
  | 'Nenek';

export const HUBUNGAN_OPTIONS: { value: HubunganValue; label: string }[] = [
  { value: 'Ayah', label: '父 / Ayah' },
  { value: 'Ibu', label: '母 / Ibu' },
  { value: 'Kakak (L)', label: '兄 / Kakak Laki-laki' },
  { value: 'Kakak (P)', label: '姉 / Kakak Perempuan' },
  { value: 'Adik (L)', label: '弟 / Adik Laki-laki' },
  { value: 'Adik (P)', label: '妹 / Adik Perempuan' },
  { value: 'Suami', label: '夫 / Suami' },
  { value: 'Istri', label: '妻 / Istri' },
  { value: 'Anak (L)', label: '息子 / Anak Laki-laki' },
  { value: 'Anak (P)', label: '娘 / Anak Perempuan' },
  { value: 'Kakek', label: '祖父 / Kakek' },
  { value: 'Nenek', label: '祖母 / Nenek' },
];

const HUBUNGAN_TO_JP: Record<string, string> = {
  Ayah: '父',
  Ibu: '母',
  'Kakak (L)': '兄',
  'Kakak (P)': '姉',
  'Adik (L)': '弟',
  'Adik (P)': '妹',
  Suami: '夫',
  Istri: '妻',
  'Anak (L)': '息子',
  'Anak (P)': '娘',
  Kakek: '祖父',
  Nenek: '祖母',
};

/** Alternate spellings / legacy DB values → canonical Japanese */
const HUBUNGAN_ALIASES: Record<string, string> = {
  ayah: '父',
  bapak: '父',
  father: '父',
  ibu: '母',
  mother: '母',
  'kakak (l)': '兄',
  'kakak laki-laki': '兄',
  'kakak laki laki': '兄',
  'kakak (p)': '姉',
  'kakak perempuan': '姉',
  'adik (l)': '弟',
  'adik laki-laki': '弟',
  'adik laki laki': '弟',
  'adik (p)': '妹',
  'adik perempuan': '妹',
  suami: '夫',
  husband: '夫',
  istri: '妻',
  wife: '妻',
  'anak (l)': '息子',
  'anak laki-laki': '息子',
  'anak laki laki': '息子',
  'anak (p)': '娘',
  'anak perempuan': '娘',
  anak: '子',
  kakek: '祖父',
  nenek: '祖母',
};

const JP_VALUES = new Set(Object.values(HUBUNGAN_TO_JP));

/** Convert hubungan (form value or legacy text) to Japanese kanji for CV display. */
export function hubunganToJapanese(value: string): string {
  if (!value || !value.trim()) return '-';

  const trimmed = value.trim();
  if (HUBUNGAN_TO_JP[trimmed]) return HUBUNGAN_TO_JP[trimmed];
  if (JP_VALUES.has(trimmed)) return trimmed;

  const alias = HUBUNGAN_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;

  return trimmed;
}

/** Normalize stored hubungan to canonical form value when possible. */
export function normalizeHubungan(value: string): string {
  if (!value?.trim()) return '';
  const trimmed = value.trim();
  if (HUBUNGAN_TO_JP[trimmed]) return trimmed;

  const fromJp = HUBUNGAN_OPTIONS.find((o) => hubunganToJapanese(o.value) === trimmed);
  if (fromJp) return fromJp.value;

  const aliasKey = Object.entries(HUBUNGAN_ALIASES).find(([, jp]) => jp === trimmed)?.[0];
  if (aliasKey) {
    const match = HUBUNGAN_OPTIONS.find(
      (o) => o.value.toLowerCase() === aliasKey || hubunganToJapanese(o.value) === HUBUNGAN_ALIASES[aliasKey],
    );
    if (match) return match.value;
  }

  const lower = trimmed.toLowerCase();
  const byAlias = HUBUNGAN_OPTIONS.find((o) => o.value.toLowerCase() === lower);
  if (byAlias) return byAlias.value;

  const byAliasText = Object.entries(HUBUNGAN_ALIASES).find(([k]) => k === lower);
  if (byAliasText) {
    const opt = HUBUNGAN_OPTIONS.find((o) => hubunganToJapanese(o.value) === byAliasText[1]);
    if (opt) return opt.value;
  }

  return trimmed;
}
