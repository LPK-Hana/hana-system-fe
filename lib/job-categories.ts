export type JobCategory = {
  id: string;
  romaji: string;
  kanji: string;
  titleId: string;
  description: string;
  emoji: string;
};

export const JOB_CATEGORIES: JobCategory[] = [
  { id: 'kaigo', romaji: 'Kaigo', kanji: '介護', titleId: 'Perawat Lansia', description: 'Sektor medis & panti jompo.', emoji: '🧑‍⚕️' },
  { id: 'seizou', romaji: 'Seizougyou', kanji: '製造業', titleId: 'Manufaktur', description: 'Produksi pabrik modern.', emoji: '🏭' },
  { id: 'gyogyou', romaji: 'Gyogyou', kanji: '漁業', titleId: 'Perikanan', description: 'Sektor agrikultur laut.', emoji: '🎣' },
  { id: 'nougyou', romaji: 'Nougyou', kanji: '農業', titleId: 'Pertanian', description: 'Budidaya tanaman & panen.', emoji: '🌾' },
  { id: 'chikusan', romaji: 'Chikusangyou', kanji: '畜産業', titleId: 'Peternakan', description: 'Peternakan sapi, babi & ayam.', emoji: '🐄' },
  { id: 'kensetsu', romaji: 'Kensetsugyou', kanji: '建設業', titleId: 'Konstruksi', description: 'Pembangunan infrastruktur.', emoji: '🏗️' },
  { id: 'inshoku', romaji: 'Inshokuryouhin', kanji: '飲食料品製造業', titleId: 'Pengolahan Makanan', description: 'Industri pangan higienis.', emoji: '🍱' },
  { id: 'shukuhaku', romaji: 'Shukuhakugyou', kanji: '宿泊業', titleId: 'Perhotelan', description: 'Layanan akomodasi turis.', emoji: '🏨' },
  { id: 'cleaning', romaji: 'Biru Kuriiningu', kanji: 'ビルクリーニング', titleId: 'Building Cleaning', description: 'Manajemen kebersihan.', emoji: '🧹' },
];

export const PROGRAM_TYPES = [
  {
    value: 'ginou_jisshu',
    label: 'Ginou Jisshu',
    sub: '技能実習 — Program magang teknis di Jepang',
    kanji: '技能実習',
  },
  {
    value: 'tokutei_ginou',
    label: 'Tokutei Ginou',
    sub: '特定技能 — Program keterampilan khusus (SSW)',
    kanji: '特定技能',
  },
] as const;

export type ProgramType = (typeof PROGRAM_TYPES)[number]['value'];

export const MAX_JOB_PEMINATAN = 3;

const LEGACY_PROGRAM_LABELS: Record<string, string> = {
  magang: 'Ginou Jisshu',
  tg: 'Tokutei Ginou',
  ginou_jisshu: 'Ginou Jisshu',
  tokutei_ginou: 'Tokutei Ginou',
};

export function getProgramTypeLabel(value: string | null | undefined): string {
  if (!value?.trim()) return '-';
  return LEGACY_PROGRAM_LABELS[value] ?? value;
}

export function getJobCategoryById(id: string): JobCategory | undefined {
  return JOB_CATEGORIES.find((j) => j.id === id);
}

export function formatJobCategoryIds(ids: string[]): string {
  return ids
    .map((id) => getJobCategoryById(id)?.titleId)
    .filter(Boolean)
    .join(', ');
}

export function parseJobCategoryIds(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
