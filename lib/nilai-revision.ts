import { createHash } from 'crypto';

export const MATERI_ASPECTS = ['kotoba', 'bunpou', 'choukai', 'kaiwa', 'kanji'] as const;
export type MateriAspect = (typeof MATERI_ASPECTS)[number];
export type NilaiSaveScope = 'exams' | 'kepribadian' | MateriAspect;

export const ASPECT_TO_ID: Record<MateriAspect, number> = {
  kotoba: 1,
  bunpou: 2,
  choukai: 3,
  kaiwa: 4,
  kanji: 5,
};

export function stableHash(input: unknown): string {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

export function aspectRevisionFromRow(row: Record<string, unknown> | null | undefined): string {
  const bab = Array.from({ length: 50 }, (_, i) => row?.[`bab_${i + 1}`] ?? null);
  return stableHash({ bab, keterangan: row?.keterangan ?? null });
}

export function subNilaiRevision(row: Record<string, unknown> | null | undefined): string {
  return stableHash({
    nilai_ujian_masuk: row?.nilai_ujian_masuk ?? null,
    nilai_n4: row?.nilai_n4 ?? null,
    nilai_n5: row?.nilai_n5 ?? null,
    catatan_sikap_siswa: row?.catatan_sikap_siswa ?? null,
  });
}

export function kepribadianRevisionFromRow(row: Record<string, unknown> | null | undefined): string {
  return stableHash({
    nilai_kedisiplinan: row?.nilai_kedisiplinan ?? null,
    nilai_kepribadian: row?.nilai_kepribadian ?? null,
    nilai_komunikasi: row?.nilai_komunikasi ?? null,
    nilai_kesopanan: row?.nilai_kesopanan ?? null,
    kontrol_emosi: row?.kontrol_emosi ?? null,
    nilai_inisiatif: row?.nilai_inisiatif ?? null,
    nilai_percaya_diri: row?.nilai_percaya_diri ?? null,
  });
}

export type NilaiRevisions = {
  aspects: Partial<Record<MateriAspect, string>>;
  sub_nilai: string;
  kepribadian: string;
};

export function emptyNilaiRevisions(): NilaiRevisions {
  return {
    aspects: {},
    sub_nilai: subNilaiRevision(null),
    kepribadian: kepribadianRevisionFromRow(null),
  };
}
