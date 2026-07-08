import { getAuthToken } from '@/lib/auth';
import type { ProgramType } from '@/lib/job-categories';

export type StoredPeminatan = {
  programType: ProgramType | '';
  jobCategoryIds: string[];
  updatedAt: string;
};

const STORAGE_VERSION = 'hana_student_peminatan_v2';

function storageKey(): string {
  if (typeof window === 'undefined') return STORAGE_VERSION;
  const token = getAuthToken();
  const suffix = token ? token.slice(-32) : 'local';
  return `${STORAGE_VERSION}_${suffix}`;
}

function normalizePeminatan(raw: unknown): StoredPeminatan | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const programType = typeof obj.programType === 'string' ? obj.programType : '';
  let jobCategoryIds: string[] = [];
  if (Array.isArray(obj.jobCategoryIds)) {
    jobCategoryIds = obj.jobCategoryIds.filter((id): id is string => typeof id === 'string');
  } else if (typeof obj.jobCategoryId === 'string' && obj.jobCategoryId) {
    jobCategoryIds = [obj.jobCategoryId];
  }
  return {
    programType: programType as ProgramType | '',
    jobCategoryIds,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
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
