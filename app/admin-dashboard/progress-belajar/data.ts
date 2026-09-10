export type ScoreValue = number | string | null;

export type AspectScores = Record<string, ScoreValue>;

export type NilaiRevisions = {
  aspects: Partial<Record<'kotoba' | 'bunpou' | 'choukai' | 'kaiwa' | 'kanji', string>>;
  sub_nilai: string;
  kepribadian: string;
};

export type ProgressRow = {
  id: number;
  no_peserta: string;
  nama_lengkap: string;
  kelas: string;
  ujian_n5: string;
  ujian_n4: string;
  keterangan: string; // Global or fallback
  keterangans: Record<string, string>;
  progress_percentages: Record<string, number>;
  revisions: NilaiRevisions;

  kotoba: AspectScores;
  bunpou: AspectScores;
  choukai: AspectScores;
  kaiwa: AspectScores;
  kanji: AspectScores;
  kepribadian: AspectScores;

  // Additional fields for exam
  // Additional fields for exam
  ujian_masuk: ScoreValue;
  ujian_n5_score: ScoreValue;
  ujian_n4_score: ScoreValue;

  foto?: string | null;
};

export type AspectKey = 'kotoba' | 'bunpou' | 'choukai' | 'kaiwa' | 'kanji' | 'kepribadian';

export type ColumnDef = {
  key: string;
  label: string;
  nLevel: 5 | 4;
};

// Helper to generate sequences
const genBabs = (prefix: string, start: number, end: number, nLevel: 5 | 4): ColumnDef[] => {
  const cols: ColumnDef[] = [];
  for (let i = start; i <= end; i++) {
    cols.push({ key: `${prefix}_${i}`, label: `Bab ${i}`, nLevel });
  }
  return cols;
};


export const aspectsConfig: Record<AspectKey, { label: string; columns: ColumnDef[] }> = {
  kotoba: {
    label: '言葉 (Kosakata)',
    columns: [
      ...genBabs('kotoba', 1, 25, 5),
      ...genBabs('kotoba', 26, 50, 4),
    ]
  },
  bunpou: {
    label: '文法 (Tata Bahasa)',
    columns: [
      ...genBabs('bunpou', 1, 25, 5),
      ...genBabs('bunpou', 26, 50, 4),
    ]
  },
  choukai: {
    label: '聴解 (Mendengar)',
    columns: [
      ...genBabs('choukai', 1, 25, 5),
      ...genBabs('choukai', 26, 50, 4),
    ]
  },
  kaiwa: {
    label: '会話 (Percakapan)',
    columns: [
      ...genBabs('kaiwa', 1, 25, 5),
      ...genBabs('kaiwa', 26, 50, 4),
    ]
  },
  kanji: {
    label: '漢字 (kanji)',
    columns: [
      ...genBabs('kanji', 1, 25, 5),
      ...genBabs('kanji', 26, 50, 4),
    ]
  },
  kepribadian: {
    label: '性格 (Sikap)',
    columns: [
      { key: 'kedisiplinan', label: 'Kedisiplinan', nLevel: 5 },
      { key: 'kepribadian_diri', label: 'Kepribadian', nLevel: 5 },
      { key: 'cara_komunikasi', label: 'Cara Komunikasi', nLevel: 5 },
      { key: 'kesopanan', label: 'Kesopanan', nLevel: 5 },
      { key: 'kontrol_emosi', label: 'Kontrol Emosi', nLevel: 5 },
      { key: 'inisiatif', label: 'Inisiatif', nLevel: 5 },
      { key: 'percaya_diri', label: 'Percaya Diri', nLevel: 5 },
    ]
  }
};

import { emptyNilaiRevisions } from '@/lib/nilai-revision';

export function mapApiUserToProgressRow(userModel: any, index: number): ProgressRow {
  const student: Partial<ProgressRow> = {
    id: index + 1,
    no_peserta: userModel.user_name || '-',
    nama_lengkap: userModel.name || '-',
    kelas: userModel.nama_kelas || '-',
    keterangan: userModel.catatan_sikap_siswa || '-',
    ujian_masuk: userModel.nilai_ujian_masuk ?? '-',
    ujian_n5_score: userModel.nilai_n5 ?? '-',
    ujian_n4_score: userModel.nilai_n4 ?? '-',
    revisions: userModel.revisions ?? emptyNilaiRevisions(),
  };

  if (student.ujian_n5_score === '-') {
    student.ujian_n5 = 'Belum';
  } else if (Number(student.ujian_n5_score) >= 85) {
    student.ujian_n5 = 'Lulus';
  } else {
    student.ujian_n5 = 'Remedial';
  }

  if (student.ujian_n4_score === '-') {
    student.ujian_n4 = 'Belum';
  } else if (Number(student.ujian_n4_score) >= 90) {
    student.ujian_n4 = 'Lulus';
  } else {
    student.ujian_n4 = 'Remedial';
  }

  student.progress_percentages = {};
  student.keterangans = {};

  (Object.keys(aspectsConfig) as AspectKey[]).forEach((aspect) => {
    const aspectModel = userModel[aspect];
    const scores: Record<string, ScoreValue> = {};
    const cols = aspectsConfig[aspect].columns;

    if (aspect === 'kepribadian') {
      const kep = userModel.kepribadian || {};
      scores.kedisiplinan = kep.kedisiplinan ?? '-';
      scores.kepribadian_diri = kep.kepribadian_diri ?? '-';
      scores.cara_komunikasi = kep.cara_komunikasi ?? '-';
      scores.kesopanan = kep.kesopanan ?? '-';
      scores.kontrol_emosi = kep.kontrol_emosi ?? '-';
      scores.inisiatif = kep.inisiatif ?? '-';
      scores.percaya_diri = kep.percaya_diri ?? '-';

      student.kepribadian = scores;
      student.keterangans!.kepribadian = userModel.catatan_sikap_siswa || '-';

      let filled = 0;
      Object.values(scores).forEach((v) => { if (v && v !== '-') filled++; });
      student.progress_percentages!.kepribadian = Math.ceil((filled / 7) * 100);
    } else {
      let totalPassedCols = 0;
      let totalValidCols = 0;

      cols.forEach((col, idx) => {
        totalValidCols++;
        let val = null;
        if (aspectModel) {
          val = aspectModel[`bab_${idx + 1}`];
        }
        scores[col.key] = val ?? '-';

        if (val !== null && val !== undefined && val !== '-' && val !== '' && Number(val) >= 75) {
          totalPassedCols++;
        }
      });

      student[aspect] = scores;
      student.keterangans![aspect] = aspectModel?.keterangan || '-';
      student.progress_percentages![aspect] =
        totalValidCols === 0 ? 0 : Math.ceil((totalPassedCols / totalValidCols) * 100);
    }
  });

  return student as ProgressRow;
}
