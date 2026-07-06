export type Gender = 'male' | 'female';
export type YesNo = 'yes' | 'no';

export interface EducationEntry {
  startDate: string | null;
  endDate: string | null;
  schoolName: string;
}

export interface WorkHistoryEntry {
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  company: string;
  jobType: string;
}

export interface JishuseiPage1Data {
  id: number;
  dateCreated: string | null;
  romajiName: string;
  kanjiName: string;
  gender: Gender;
  birthDate: string | null;
  age: string;
  nationality: string;
  motherTongueJa: string;
  motherTongueId: string;
  address: string;
  educations: EducationEntry[];
  workHistories: WorkHistoryEntry[];
  relatedSkillJobJa: string;
  relatedSkillJobId: string;
  relatedSkillDurationMonths: string;
  japanVisitExperience: YesNo;
}

export const emptyEducation = (): EducationEntry => ({
  startDate: null,
  endDate: null,
  schoolName: '',
});

export const emptyWorkHistory = (): WorkHistoryEntry => ({
  startDate: null,
  endDate: null,
  isCurrent: false,
  company: '',
  jobType: '',
});

export const emptyJishuseiPage1 = (): Omit<JishuseiPage1Data, 'id'> => ({
  dateCreated: null,
  romajiName: '',
  kanjiName: '',
  gender: 'male',
  birthDate: null,
  age: '',
  nationality: 'INDONESIA',
  motherTongueJa: 'インドネシア語',
  motherTongueId: 'Bahasa Indonesia',
  address: '',
  educations: [emptyEducation()],
  workHistories: [emptyWorkHistory(), emptyWorkHistory()],
  relatedSkillJobJa: '',
  relatedSkillJobId: '',
  relatedSkillDurationMonths: '',
  japanVisitExperience: 'no',
});
