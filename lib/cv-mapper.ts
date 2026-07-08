import type { CVData } from '@/app/student-dashboard/cv-form/types';
import { buildFileUrl } from '@/lib/file-storage';
import { normalizeHubungan } from '@/lib/cv-hubungan';

const mapNegara = (v: string) => ({ 'Indonesia': 'インドネシア' }[v] || v);
const mapAgama = (v: string) => ({ 'Islam': 'イスラム教', 'Kristen': 'キリスト教', 'Katolik': 'カトリック教', 'Hindu': 'ヒンドゥー教', 'Buddha': '仏教' }[v] || v);
const mapLulus = (v: any) => {
  if (v === 1 || String(v) === '1' || v === 'Lulus') return '合格';
  if (v === 0 || String(v) === '0' || v === 'Tidak Lulus') return '不合格';
  return v;
};

export function mapApiResponseToCVData(api: any): { cv: CVData; namaKelas: string; fotoFallback: string; mcuUrl: string; mcuStatus: string } {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  // Foto: DB mungkin menyimpan .jpg tapi file fisik .jpeg (atau sebaliknya).
  // Buat URL primary; fallback ditangani di NameCard via onError.
  const fotoFilename: string = api.foto ?? '';
  const fotoUrl: string = fotoFilename
    ? fotoFilename.startsWith('http')
      ? fotoFilename
      : `${BASE_URL}/static/foto/${fotoFilename}`
    : '';

  if (process.env.NODE_ENV === 'development') {
    console.log('[cv-mapper] api.foto:', api.foto, '-> fotoUrl:', fotoUrl, '| BASE_URL:', BASE_URL);
  }

  // Fallback URL: tukar ekstensi .jpg ↔ .jpeg jika primary 404
  const fotoFallback: string = fotoUrl
    ? fotoUrl.endsWith('.jpg')
      ? fotoUrl.replace(/\.jpg$/, '.jpeg')
      : fotoUrl.endsWith('.jpeg')
        ? fotoUrl.replace(/\.jpeg$/, '.jpg')
        : ''
    : '';

  const cv: CVData = {
    meta: {
      tanggal_pembuatan_cv: api.tgl_masuk_lpk
        ? new Date(api.tgl_masuk_lpk).toISOString().split('T')[0]!
        : '',
      foto: fotoUrl,
    },
    dokumen: {
      ktp: api.ktp ? buildFileUrl('ktp', api.ktp) : '',
      kk: api.kk ? buildFileUrl('kk', api.kk) : '',
      akte_kelahiran: api.akte_kelahiran ? buildFileUrl('akte_kelahiran', api.akte_kelahiran) : '',
      ijazah_terakhir: api.ijazah ? buildFileUrl('ijazah', api.ijazah) : '',
    },
    informasi_dasar: {
      nik: api.nik ?? '',
      no_peserta: api.no_peserta ?? '',
      nama_lengkap: api.nama_peserta ?? '',
      nama_katakana: api.nama_katakana ?? '',
      yobisho: api.nama_panggilan ?? '',
      umur: api.umur != null ? String(api.umur) : '',
      jenis_kelamin: api.jenis_kelamin ?? '',
      kewarganegaraan: mapNegara(api.negara_asal ?? ''),
      tanggal_lahir: api.tanggal_lahir
        ? new Date(api.tanggal_lahir).toISOString().split('T')[0]!
        : '',
      golongan_darah: api.golongan_darah ?? '',
      agama: mapAgama(api.agama ?? ''),
      status_pernikahan: api.status_pernikahan ?? '',
      alamat_lengkap: api.alamat ?? '',
      kode_pos: api.kode_pos ?? '',
      nomor_telepon: api.nomor_telepon ?? '',
      email: api.email ?? '',
    },
    fisik_kesehatan: {
      tinggi_badan: api.tinggi_badan != null ? String(api.tinggi_badan) : '',
      berat_badan: api.berat_badan != null ? String(api.berat_badan) : '',
      visus_mata_kiri: api.mata_kiri != null ? String(api.mata_kiri) : '',
      kondisi_mata_kiri: api.status_mata_kiri ?? '',
      visus_mata_kanan: api.mata_kanan != null ? String(api.mata_kanan) : '',
      kondisi_mata_kanan: api.status_mata_kanan ?? '',
      berkacamata: api.berkacamata === 1 ? 'Ya' : api.berkacamata === 0 ? 'Tidak' : (api.berkacamata ?? ''),
      tato: api.tato === 1 ? 'Ada' : api.tato === 0 ? 'Tidak Ada' : (api.tato ?? ''),
      merokok: api.merokok === 1 ? 'Ya' : api.merokok === 0 ? 'Tidak' : (api.merokok ?? ''),
      jumlah_rokok: api.frequensi_merokok != null ? String(api.frequensi_merokok) : '',
      buta_warna: api.butawarna === 1 ? 'Buta Warna Total' : api.butawarna === 2 ? 'Buta Warna Parsial' : api.butawarna === 3 ? 'Tidak Buta Warna' : (api.butawarna ?? ''),
      riwayat_patah_tulang: api.riwayat_patah_tulang === 1 ? 'Ada' : api.riwayat_patah_tulang === 0 ? 'Tidak Ada' : (api.riwayat_patah_tulang ?? ''),
      hobi: api.hobi ?? '',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendidikan: (api.pendidikan ?? []).map((p: any, i: number) => ({
      id: String(i),
      tahun_masuk: p.tahun_masuk ?? '',
      bulan_masuk: p.bulan_masuk ?? '',
      tahun_lulus: p.tahun_lulus ?? '',
      bulan_lulus: p.bulan_lulus ?? '',
      nama_sekolah: p.nama_sekolah ?? '',
      tingkat_pendidikan: p.tingkat_pendidikan ?? '',
      jurusan: p.jurusan ?? '',
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pekerjaan: (api.pekerjaan ?? []).map((p: any, i: number) => ({
      id: String(i),
      tahun_mulai: p.tahun_mulai ?? '',
      bulan_mulai: p.bulan_mulai ?? '',
      tahun_selesai: p.tahun_selesai ?? '',
      bulan_selesai: p.bulan_selesai ?? '',
      nama_perusahaan: p.nama_perusahaan ?? '',
      status_pekerjaan: p.status_pekerjaan ?? '',
      posisi_pekerjaan: p.posisi_pekerjaan ?? '',
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sertifikat: (api.sertifikat ?? []).map((s: any, i: number) => ({
      id: String(i),
      tahun_diperoleh: s.tahun_diperoleh ?? '',
      bulan_diperoleh: s.bulan_diperoleh ?? '',
      nama_sertifikat: s.nama_sertifikat ?? '',
      status_kelulusan: mapLulus(s.status_kelulusan ?? ''),
      keterangan_skor: s.score ?? '',
      foto_sertifikat: s.sertifikat
        ? buildFileUrl('sertifikat', s.sertifikat)
        : '',
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keluarga: (api.keluarga ?? []).map((k: any, i: number) => ({
      id: String(i),
      hubungan: normalizeHubungan(k.hubungan ?? ''),
      nama_anggota: k.nama ?? '',
      umur: k.umur != null ? String(k.umur) : '',
      pekerjaan: k.status_pekerjaan ?? '',
    })),
  };

  const mcuUrl = api.hasil_mcu
    ? buildFileUrl('hasil_mcu', api.hasil_mcu)
    : '';

  return { cv, namaKelas: api.nama_kelas ?? '', fotoFallback, mcuUrl, mcuStatus: api.hasil_mcu_admin ?? '' };
}
