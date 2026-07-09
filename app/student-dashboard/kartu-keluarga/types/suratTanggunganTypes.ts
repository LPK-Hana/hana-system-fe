export interface StDependent {
  relationship: string;
  relationshipJp: string;
  name: string;
  nameJp: string;
  nameKatakana: string;
  dob: string;
}

export interface StApplicant {
  name: string;
  nameJp: string;
  nameKatakana: string;
  gender: string;
  genderJp: string;
  dob: string;
  nik: string;
  ktpIssueDate: string;
  ktpIssueDateJp: string;
  domisili: string;
  domisiliJp: string;
  domisiliKatakana: string;
  nationality: string;
  nationalityJp: string;
}

export interface SuratTanggunganFormData {
  /** Indeks anggota KK yang berangkat ke Jepang */
  applicantMemberIndex: number | null;
  applicant: StApplicant;
  dependents: StDependent[];
  /** Kota/kab untuk baris tanda tangan (Indo) */
  locationId: string;
  /** Kota/kab katakana (Jepang) */
  locationJp: string;
  /** Tanggal surat format DD-MM-YYYY (Indo: di atas Pemohon) */
  signDateId: string;
  signDateYear: string;
  signDateMonth: string;
  signDateDay: string;
  /** Nama desa untuk 「〇〇村　御中」 */
  villageNameJp: string;
}

export function defaultSignDateId(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear());
  return `${d}-${m}-${y}`;
}

export function parseSignDateId(value: string): { day: string; month: string; year: string } {
  const parts = value.trim().split('-');
  if (parts.length === 3) {
    return { day: parts[0], month: parts[1], year: parts[2] };
  }
  return { day: '', month: '', year: '' };
}

export const emptyStDependent = (): StDependent => ({
  relationship: '',
  relationshipJp: '',
  name: '',
  nameJp: '',
  nameKatakana: '',
  dob: '',
});

export const emptyStApplicant = (): StApplicant => ({
  name: '',
  nameJp: '',
  nameKatakana: '',
  gender: '',
  genderJp: '',
  dob: '',
  nik: '',
  ktpIssueDate: '',
  ktpIssueDateJp: '',
  domisili: '',
  domisiliJp: '',
  domisiliKatakana: '',
  nationality: 'Indonesia',
  nationalityJp: 'インドネシア',
});

const todaySign = defaultSignDateId();
const todayParts = parseSignDateId(todaySign);

export const initialSuratTanggunganData: SuratTanggunganFormData = {
  applicantMemberIndex: null,
  applicant: emptyStApplicant(),
  dependents: [],
  locationId: '',
  locationJp: '',
  signDateId: todaySign,
  signDateYear: todayParts.year,
  signDateMonth: todayParts.month,
  signDateDay: todayParts.day,
  villageNameJp: '',
};
