export interface RelationshipOption {
  id: string;
  labelId: string;
  jp: string;
  /** Jika true, user harus mengetik hubungan sendiri */
  custom?: boolean;
}

export const KK_RELATIONSHIP_OPTIONS: RelationshipOption[] = [
  { id: 'KEPALA KELUARGA', labelId: 'Kepala Keluarga', jp: '世帯主' },
  { id: 'SUAMI', labelId: 'Suami', jp: '夫' },
  { id: 'ISTRI', labelId: 'Isteri', jp: '妻' },
  { id: 'ANAK', labelId: 'Anak', jp: '子' },
  { id: 'MENANTU', labelId: 'Menantu', jp: '婿・嫁' },
  { id: 'CUCU', labelId: 'Cucu', jp: '孫' },
  { id: 'ORANG TUA', labelId: 'Orang Tua', jp: '父母' },
  { id: 'MERTUA', labelId: 'Mertua', jp: '義父母' },
  { id: 'FAMILI LAIN', labelId: 'Famili Lain', jp: 'その他の親族' },
  { id: 'LAINNYA', labelId: 'Lainnya', jp: 'その他', custom: true },
];

const KNOWN_IDS = new Set(KK_RELATIONSHIP_OPTIONS.filter((o) => !o.custom).map((o) => o.id));

function normKey(val: string): string {
  return val.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function findRelationshipOption(val: string): RelationshipOption | undefined {
  const key = normKey(val);
  if (!key) return undefined;
  return KK_RELATIONSHIP_OPTIONS.find((o) => normKey(o.id) === key || normKey(o.labelId) === key);
}

export function relationshipJpFromId(id: string, customText?: string): string {
  const opt = findRelationshipOption(id);
  if (!opt) return customText?.trim() || id;
  if (opt.custom) return customText?.trim() || opt.jp;
  return opt.jp;
}

/** Nilai dropdown: id opsi standar, atau 'LAINNYA' jika teks bebas */
export function relationshipDropdownValue(val: string): string {
  const trimmed = val.trim();
  if (!trimmed) return '';
  const opt = findRelationshipOption(trimmed);
  if (opt && !opt.custom) return opt.id;
  return 'LAINNYA';
}

export function isCustomRelationshipValue(val: string): boolean {
  if (!val.trim()) return false;
  return relationshipDropdownValue(val) === 'LAINNYA';
}

export function relationshipCustomText(val: string): string {
  if (!isCustomRelationshipValue(val)) return '';
  const opt = findRelationshipOption(val);
  if (opt && !opt.custom) return '';
  return val.trim();
}

export function relationshipDisplayId(val: string): string {
  const opt = findRelationshipOption(val);
  if (opt && !opt.custom) return opt.labelId;
  if (isCustomRelationshipValue(val)) return val.trim();
  return val.trim();
}

export function relationshipDisplayJp(val: string, jpVal?: string): string {
  if (jpVal?.trim()) return jpVal.trim();
  const opt = findRelationshipOption(val);
  if (opt) {
    if (opt.custom) return val.trim() || opt.jp;
    return opt.jp;
  }
  return val.trim();
}

export function relationshipIdFromJp(jp: string): string | undefined {
  const trimmed = jp.trim();
  const opt = KK_RELATIONSHIP_OPTIONS.find((o) => o.jp === trimmed);
  if (!opt) return undefined;
  return opt.id;
}

export function normalizeRelationshipId(val: string): string {
  const opt = findRelationshipOption(val);
  if (opt && !opt.custom) return opt.id;
  return val.trim().toUpperCase();
}
