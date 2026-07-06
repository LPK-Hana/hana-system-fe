import { stableHash } from '@/lib/nilai-revision';

type CvRevisionInput = {
  biodata: Record<string, unknown>;
  pendidikan: unknown[];
  pekerjaan: unknown[];
  sertifikat: unknown[];
  keluarga: unknown[];
  info_medis: Record<string, unknown>;
};

export function cvDataRevision(input: CvRevisionInput): string {
  return stableHash(input);
}

export function cvRevisionFromApiRecord(record: Record<string, unknown>): string {
  const {
    pendidikan,
    pekerjaan,
    sertifikat,
    keluarga,
    tinggi_badan,
    berat_badan,
    mata_kiri,
    status_mata_kiri,
    mata_kanan,
    status_mata_kanan,
    merokok,
    frequensi_merokok,
    berkacamata,
    butawarna,
    golongan_darah,
    tato,
    riwayat_patah_tulang,
    ...biodata
  } = record;

  return cvDataRevision({
    biodata,
    pendidikan: (pendidikan as unknown[]) ?? [],
    pekerjaan: (pekerjaan as unknown[]) ?? [],
    sertifikat: (sertifikat as unknown[]) ?? [],
    keluarga: (keluarga as unknown[]) ?? [],
    info_medis: {
      tinggi_badan: tinggi_badan ?? null,
      berat_badan: berat_badan ?? null,
      mata_kiri: mata_kiri ?? null,
      status_mata_kiri: status_mata_kiri ?? null,
      mata_kanan: mata_kanan ?? null,
      status_mata_kanan: status_mata_kanan ?? null,
      merokok: merokok ?? null,
      frequensi_merokok: frequensi_merokok ?? null,
      berkacamata: berkacamata ?? null,
      butawarna: butawarna ?? null,
      golongan_darah: golongan_darah ?? null,
      tato: tato ?? null,
      riwayat_patah_tulang: riwayat_patah_tulang ?? null,
    },
  });
}
