import type { RiwayatPekerjaan } from './types';

export function isPekerjaanRowEmpty(item: RiwayatPekerjaan): boolean {
  return (
    !item.nama_perusahaan.trim() &&
    !item.posisi_pekerjaan.trim() &&
    !item.status_pekerjaan &&
    !item.bulan_mulai &&
    !item.tahun_mulai &&
    !item.bulan_selesai &&
    !item.tahun_selesai
  );
}

export function filterFilledPekerjaan(items: RiwayatPekerjaan[]): RiwayatPekerjaan[] {
  return items.filter((item) => !isPekerjaanRowEmpty(item));
}
