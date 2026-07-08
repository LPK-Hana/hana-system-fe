export interface KkEducationOption {
  /** Canonical value stored on KK (matches Dukcapil wording). */
  id: string;
  /** Human-readable Indonesian label for dropdowns. */
  label: string;
  /** Japanese label for JP KK template. */
  jp: string;
  /** OCR / legacy aliases that normalize to `id`. */
  aliases?: string[];
}

/** Official KK education levels (Indonesian ↔ Japanese). */
export const KK_EDUCATION_OPTIONS: KkEducationOption[] = [
  {
    id: 'TIDAK/BELUM SEKOLAH',
    label: 'Tidak/Belum Sekolah',
    jp: '未就学・学歴なし',
    aliases: ['BELUM SEKOLAH', 'TIDAK SEKOLAH', 'BELUM/BELUM SEKOLAH'],
  },
  {
    id: 'BELUM TAMAT SD/SEDERAJAT',
    label: 'Belum Tamat SD/Sederajat',
    jp: '小学校未卒',
  },
  {
    id: 'TAMAT SD/SEDERAJAT',
    label: 'Tamat SD/Sederajat',
    jp: '小学校卒業',
    aliases: ['SD/SEDERAJAT', 'TAMAT SD'],
  },
  {
    id: 'SLTP/SEDERAJAT',
    label: 'SLTP/Sederajat (SMP)',
    jp: '中学校卒業',
    aliases: ['SLTP SEDERAJAT'],
  },
  {
    id: 'SLTA/SEDERAJAT',
    label: 'SLTA/Sederajat (SMA/SMK)',
    jp: '高校卒業',
    aliases: ['SLTA SEDERAJAT', 'SMA/SMK', 'SMA', 'SMK'],
  },
  {
    id: 'DIPLOMA I/II',
    label: 'Diploma I/II',
    jp: 'ディプロマI/II',
    aliases: ['DIPLOMA I', 'DIPLOMA II', 'D1', 'D2'],
  },
  {
    id: 'AKADEMI/DIPLOMA III',
    label: 'Akademi/Diploma III',
    jp: 'アカデミー/ディプロマIII',
    aliases: ['AKADEMI', 'DIPLOMA III', 'D3', 'SARJANA MUDA'],
  },
  {
    id: 'DIPLOMA IV/STRATA I',
    label: 'Diploma IV/Strata I (S1)',
    jp: '学士（S1）',
    aliases: [
      'DIPLOMA IV/STRATA I (S1)',
      'DIPLOMA IV',
      'STRATA I',
      'S1/DIV',
      'S1',
      'SARJANA',
      'DIPLOMA IVISTRATA I',
      'DIPLOMA IVISTRATAI',
    ],
  },
  {
    id: 'STRATA II',
    label: 'Strata II (S2)',
    jp: '修士（S2）',
    aliases: ['STRATA II (S2)', 'S2', 'MAGISTER'],
  },
  {
    id: 'STRATA III',
    label: 'Strata III (S3)',
    jp: '博士（S3）',
    aliases: ['STRATA III (S3)', 'S3', 'DOKTOR'],
  },
];

const ID_LOOKUP = new Map<string, string>();
const JP_LOOKUP = new Map<string, string>();

for (const opt of KK_EDUCATION_OPTIONS) {
  const canon = opt.id.toUpperCase();
  ID_LOOKUP.set(canon, opt.id);
  JP_LOOKUP.set(opt.jp, opt.id);
  for (const alias of opt.aliases ?? []) {
    ID_LOOKUP.set(alias.toUpperCase(), opt.id);
  }
}

/** Normalize OCR / legacy education text to canonical KK `id`. */
export function normalizeEducationId(raw: string): string {
  if (!raw?.trim()) return '';
  const upper = raw.trim().toUpperCase().replace(/\s+/g, ' ');

  const direct = ID_LOOKUP.get(upper);
  if (direct) return direct;

  const compact = upper.replace(/[^A-Z0-9/]/g, '');
  for (const [key, id] of ID_LOOKUP) {
    if (key.replace(/[^A-Z0-9/]/g, '') === compact) return id;
  }

  if (upper.includes('TIDAK') && upper.includes('SEKOLAH')) return 'TIDAK/BELUM SEKOLAH';
  if (upper.includes('BELUM') && upper.includes('SEKOLAH') && !upper.includes('TAMAT')) {
    return 'TIDAK/BELUM SEKOLAH';
  }
  if (upper.includes('BELUM TAMAT') && upper.includes('SD')) return 'BELUM TAMAT SD/SEDERAJAT';
  if (upper.includes('TAMAT') && upper.includes('SD')) return 'TAMAT SD/SEDERAJAT';
  if (upper.includes('SLTP') || upper.includes('SMP')) return 'SLTP/SEDERAJAT';
  if (upper.includes('SLTA') || upper.includes('SMA') || upper.includes('SMK')) return 'SLTA/SEDERAJAT';
  if (upper.includes('DIPLOMA I') || upper.includes('DIPLOMA II')) return 'DIPLOMA I/II';
  if (upper.includes('AKADEMI') || upper.includes('DIPLOMA III')) return 'AKADEMI/DIPLOMA III';
  if (upper.includes('DIPLOMA IV') || upper.includes('STRATA I') || upper === 'S1' || upper.includes('S1/')) {
    return 'DIPLOMA IV/STRATA I';
  }
  if (upper.includes('STRATA II') || upper === 'S2') return 'STRATA II';
  if (upper.includes('STRATA III') || upper === 'S3') return 'STRATA III';

  return raw.trim();
}

export function educationIdToJp(id: string): string {
  const canon = normalizeEducationId(id);
  const opt = KK_EDUCATION_OPTIONS.find((o) => o.id === canon);
  if (opt) return opt.jp;
  // Legacy JP passthrough
  if (JP_LOOKUP.has(id.trim())) return id.trim();
  return id;
}

export function educationJpToId(jp: string): string {
  if (!jp?.trim()) return '';
  const direct = JP_LOOKUP.get(jp.trim());
  if (direct) return direct;

  const upper = jp.trim();
  for (const opt of KK_EDUCATION_OPTIONS) {
    if (opt.jp === upper) return opt.id;
  }

  // Legacy JP labels
  if (upper === '未就学') return 'TIDAK/BELUM SEKOLAH';
  if (upper === '学歴なし') return 'TIDAK/BELUM SEKOLAH';
  if (upper === '短大') return 'DIPLOMA I/II';
  if (upper === '専門学校') return 'AKADEMI/DIPLOMA III';
  if (upper === '大学') return 'DIPLOMA IV/STRATA I';
  if (upper === '大学院') return 'STRATA II';

  return jp.trim();
}
