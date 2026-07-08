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
  signDateYear: string;
  signDateMonth: string;
  signDateDay: string;
  /** Nama desa untuk 「〇〇村　御中」 */
  villageNameJp: string;
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

export const initialSuratTanggunganData: SuratTanggunganFormData = {
  applicantMemberIndex: null,
  applicant: emptyStApplicant(),
  dependents: Array.from({ length: 3 }, emptyStDependent),
  locationId: '',
  locationJp: '',
  signDateYear: '',
  signDateMonth: '',
  signDateDay: '',
  villageNameJp: '',
};
