import { getAuthToken } from '@/lib/auth';
import { isDemoModeClient } from '@/lib/demo-mode';
import ApiPeminatan from '@/app/api/peminatan/api_peminatan';
import type { ProgramType } from '@/lib/job-categories';

export type StoredPeminatan = {
  programType: ProgramType | '';
  jobCategoryIds: string[];
  updatedAt: string;
};

const STORAGE_VERSION = 'raftel_student_peminatan_v2';

function storageKey(): string {
  if (typeof window === 'undefined') return STORAGE_VERSION;
  const token = getAuthToken();
  const suffix = token ? token.slice(-32) : 'local';
  return `${STORAGE_VERSION}_${suffix}`;
}

function normalizePeminatan(raw: unknown): StoredPeminatan | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const programType = typeof obj.programType === 'string'
    ? obj.programType
    : typeof obj.program_type === 'string'
      ? obj.program_type
      : '';
  let jobCategoryIds: string[] = [];
  const ids = obj.jobCategoryIds ?? obj.job_category_ids;
  if (Array.isArray(ids)) {
    jobCategoryIds = ids.filter((id): id is string => typeof id === 'string');
  } else if (typeof obj.jobCategoryId === 'string' && obj.jobCategoryId) {
    jobCategoryIds = [obj.jobCategoryId];
  }
  return {
    programType: programType as ProgramType | '',
    jobCategoryIds,
    updatedAt: typeof obj.updatedAt === 'string'
      ? obj.updatedAt
      : typeof obj.updated_at === 'string'
        ? obj.updated_at
        : new Date().toISOString(),
  };
}

export function loadStudentPeminatan(): StoredPeminatan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return null;
    return normalizePeminatan(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveStudentPeminatan(data: Omit<StoredPeminatan, 'updatedAt'>): void {
  if (typeof window === 'undefined') return;
  const payload: StoredPeminatan = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(storageKey(), JSON.stringify(payload));
}

export async function fetchStudentPeminatan(): Promise<StoredPeminatan | null> {
  if (typeof window !== 'undefined' && isDemoModeClient()) {
    return loadStudentPeminatan();
  }
  try {
    const res = await ApiPeminatan().get();
    if (res?.status === 200 && res.data) {
      const normalized = normalizePeminatan(res.data);
      if (normalized) saveStudentPeminatan(normalized);
      return normalized;
    }
  } catch {
    /* fallback */
  }
  return loadStudentPeminatan();
}

export async function persistStudentPeminatan(
  data: Omit<StoredPeminatan, 'updatedAt'>,
): Promise<{ ok: boolean; message?: string }> {
  saveStudentPeminatan(data);
  if (typeof window !== 'undefined' && isDemoModeClient()) {
    return { ok: true };
  }
  const res = await ApiPeminatan().save({
    program_type: data.programType,
    job_category_ids: data.jobCategoryIds,
  });
  if (res?.status === 200) {
    return { ok: true };
  }
  return { ok: false, message: res?.message || 'Gagal menyimpan peminatan' };
}
