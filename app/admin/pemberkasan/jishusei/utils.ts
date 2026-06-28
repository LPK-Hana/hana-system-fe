import type { Gender, JishuseiPage1Data, YesNo } from './types';
import { emptyEducation, emptyJishuseiPage1, emptyWorkHistory } from './types';

const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDateCreated = (value: string | null): string => {
  const d = parseDate(value);
  if (!d) return '';
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
};

export const formatBirthDate = (value: string | null, age: string): string => {
  const d = parseDate(value);
  if (!d) return '';
  const agePart = age ? `（${age} 歳）` : '';
  return `${d.getFullYear()} 年${d.getMonth() + 1} 月${d.getDate()} 日${agePart}`;
};

export const formatMonthYear = (value: string | null): string => {
  const d = parseDate(value);
  if (!d) return '';
  return `${d.getFullYear()} 年${d.getMonth() + 1} 月`;
};

export const formatPeriod = (
  start: string | null,
  end: string | null,
  isCurrent = false
): string => {
  const startStr = formatMonthYear(start);
  if (!startStr) return '';
  if (isCurrent) return `${startStr} ～ 現在まで`;
  const endStr = formatMonthYear(end);
  if (!endStr) return startStr;
  return `${startStr}～${endStr}`;
};

export const formatWorkCompany = (company: string, jobType: string): string => {
  const c = company.trim();
  const j = jobType.trim();
  if (!c) return '';
  if (!j) return c;
  return `${c}     （${j}）`;
};

export const formatGenderJa = (gender: Gender): string => {
  if (gender === 'male') return '■男 ・ ☐女';
  return '☐男 ・ ■女';
};

export const formatJapanVisitJa = (value: YesNo): string => {
  const yes = value === 'yes';
  const no = value === 'no';
  const m = (on: boolean) => (on ? '■' : '☐');
  return `${m(yes)} 有（  ～  ※在留資格：${m(false)}技能実習・${m(false)}技能実習以外）・          ${m(no)}無`;
};

export const formatSkillDuration = (months: string, jobJa: string, jobId: string): string => {
  const m = months.trim();
  const jaLine = jobJa.trim();
  const idLine = jobId.trim();
  const durationJa = m ? `${m} ヶ月` : '';
  const durationId = m ? `${m} Bulan` : '';
  return [jaLine, durationJa, idLine, durationId].filter(Boolean).join('\n');
};

export const serializeJishuseiEntry = (entry: JishuseiPage1Data): JishuseiPage1Data => ({ ...entry });

export const deserializeJishuseiEntry = (raw: unknown): JishuseiPage1Data | null => {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as JishuseiPage1Data;
  if (!data.id) return null;
  return {
    ...emptyFallback(),
    ...data,
    educations: data.educations?.length ? data.educations : emptyFallback().educations,
    workHistories: data.workHistories?.length ? data.workHistories : emptyFallback().workHistories,
  };
};

const emptyFallback = () => ({
  ...emptyJishuseiPage1(),
  educations: [emptyEducation()],
  workHistories: [emptyWorkHistory(), emptyWorkHistory()],
});

export const STORAGE_KEY = 'jishusei_data';

export const loadAllEntries = (): JishuseiPage1Data[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as JishuseiPage1Data[];
  } catch {
    return [];
  }
};

export const saveAllEntries = (entries: JishuseiPage1Data[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getEntryById = (id: number): JishuseiPage1Data | null => {
  return loadAllEntries().find((e) => e.id === id) ?? null;
};
