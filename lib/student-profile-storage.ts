import type { CVData } from '@/app/student-dashboard/cv-form/types';
import { defaultCVData } from '@/app/student-dashboard/cv-form/defaults';
import { getAuthToken } from '@/lib/auth';

/** Snapshot profil siswa di browser; backend nanti menggantikan sumber data ini. */
export type StoredStudentProfile = {
  cv: CVData;
  /** Nomor NIM resmi (dari admin/backend). */
  jms_id: string;
  kelas: string;
  updatedAt: string;
};

const STORAGE_VERSION = 'hana_student_profile_v1';

function storageKey(): string {
  if (typeof window === 'undefined') return STORAGE_VERSION;
  const token = getAuthToken();
  const suffix = token ? token.slice(-32) : 'local';
  return `${STORAGE_VERSION}_${suffix}`;
}

export function mergeCVData(incoming: Partial<CVData> | null | undefined): CVData {
  if (!incoming) return { ...defaultCVData };
  return {
    ...defaultCVData,
    ...incoming,
    meta: { ...defaultCVData.meta, ...incoming.meta },
    dokumen: { ...defaultCVData.dokumen, ...incoming.dokumen },
    informasi_dasar: { ...defaultCVData.informasi_dasar, ...incoming.informasi_dasar },
    fisik_kesehatan: { ...defaultCVData.fisik_kesehatan, ...incoming.fisik_kesehatan },
    pendidikan: Array.isArray(incoming.pendidikan) ? incoming.pendidikan : defaultCVData.pendidikan,
    pekerjaan: Array.isArray(incoming.pekerjaan) ? incoming.pekerjaan : defaultCVData.pekerjaan,
    sertifikat: Array.isArray(incoming.sertifikat) ? incoming.sertifikat : defaultCVData.sertifikat,
    keluarga: (Array.isArray(incoming.keluarga) ? incoming.keluarga : defaultCVData.keluarga).map(
      (row) => ({
        ...row,
        umur: typeof row.umur === 'string' ? row.umur : '',
      }),
    ),
  };
}

export function loadStudentProfile(): StoredStudentProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredStudentProfile>;
    if (!parsed.cv || typeof parsed.cv !== 'object') return null;
    return {
      cv: mergeCVData(parsed.cv),
      jms_id: typeof parsed.jms_id === 'string' ? parsed.jms_id : '',
      kelas: typeof parsed.kelas === 'string' ? parsed.kelas : '',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveStudentProfileCv(cv: CVData): void {
  if (typeof window === 'undefined') return;
  const prev = loadStudentProfile();
  const next: StoredStudentProfile = {
    cv: mergeCVData(cv),
    jms_id: prev?.jms_id ?? '',
    kelas: prev?.kelas ?? '',
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(storageKey(), JSON.stringify(next));
}
