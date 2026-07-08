import type { JishuseiPage1Data } from './types';

/** Data contoh dari template PDF Jishusei */
export const getDummyJishuseiPage1 = (): Omit<JishuseiPage1Data, 'id'> => ({
  dateCreated: '2026-05-07T00:00:00.000Z',
  romajiName: 'ABDUL MUHSI FAUZI',
  kanjiName: 'アブドゥル・ムフシ・ファウジ',
  gender: 'male',
  birthDate: '2004-02-01T00:00:00.000Z',
  age: '22',
  nationality: 'INDONESIA',
  motherTongueJa: 'インドネシア語',
  motherTongueId: 'Bahasa Indonesia',
  address: 'PASIR HUNI RT/RW 013/002 DES. CIDADAP KEC. CAMPAKA. KAB. CIANJUR JAWA BARAT',
  educations: [
    {
      startDate: '2019-06-01T00:00:00.000Z',
      endDate: '2022-05-01T00:00:00.000Z',
      schoolName: 'SMKN 1 CAMPAKA',
    },
  ],
  workHistories: [
    {
      startDate: '2023-05-01T00:00:00.000Z',
      endDate: '2025-05-01T00:00:00.000Z',
      isCurrent: false,
      company: 'PT. SHOPEE EXPRES INDONESIA',
      jobType: '物流',
    },
    {
      startDate: '2025-06-01T00:00:00.000Z',
      endDate: null,
      isCurrent: true,
      company: 'PT CITRA MANDIRI LESTARI INDONESIA',
      jobType: '牛豚食肉処理加工業',
    },
  ],
  relatedSkillJobJa: '牛豚食肉処理加工業',
  relatedSkillJobId: 'Pengolahan Daging sapi dan babi',
  relatedSkillDurationMonths: '10',
  japanVisitExperience: 'no',
});
