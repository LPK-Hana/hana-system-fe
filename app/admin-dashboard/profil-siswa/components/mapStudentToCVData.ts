import { CVData } from '../../../student-dashboard/cv-form/types';
import { StudentEditData } from './StudentEditModal';

const mapNegara = (v: string) => ({ Indonesia: 'インドネシア' }[v] || v);
const mapAgama = (v: string) =>
  ({
    Islam: 'イスラム教',
    Kristen: 'キリスト教',
    Katolik: 'カトリック教',
    Hindu: 'ヒンドゥー教',
    Buddha: '仏教',
  }[v] || v);
const mapLulus = (v: unknown): string => {
  if (v === 1 || String(v) === '1' || v === 'Lulus') return '合格';
  if (v === 0 || String(v) === '0' || v === 'Tidak Lulus') return '不合格';
  return String(v ?? '-');
};

export function mapStudentToCVData(student: StudentEditData): CVData {
  return {
    meta: {
      tanggal_pembuatan_cv: new Date().toISOString(),
      foto: typeof student.foto === 'string' ? student.foto : (student.foto as { src?: string })?.src || '',
    },
    dokumen: { ktp: '', kk: '', akte_kelahiran: '', ijazah_terakhir: '' },
    informasi_dasar: {
      nik: student.nik || '-',
      no_peserta: student.no_peserta || '-',
      nama_lengkap: student.nama_lengkap || '-',
      nama_katakana: student.nama_katakana || '-',
      yobisho: student.nama_panggilan || '-',
      umur: student.umur || '-',
      jenis_kelamin: student.jenis_kelamin || '-',
      kewarganegaraan: mapNegara(student.kewarganegaraan || '-'),
      tanggal_lahir: student.tanggal_lahir || '-',
      golongan_darah: student.golongan_darah || '-',
      agama: mapAgama(student.agama || '-'),
      status_pernikahan: student.status_pernikahan || '-',
      alamat_lengkap: student.alamat || '-',
      kode_pos: student.kode_pos || '-',
      nomor_telepon: student.telepon || '-',
      email: student.email || '-',
    },
    fisik_kesehatan: {
      tinggi_badan: student.tinggi_badan || '-',
      berat_badan: student.berat_badan || '-',
      visus_mata_kiri: student.mata_kiri || '-',
      kondisi_mata_kiri: student.kondisi_mata_kiri || 'Normal',
      visus_mata_kanan: student.mata_kanan || '-',
      kondisi_mata_kanan: student.kondisi_mata_kanan || 'Normal',
      berkacamata: student.berkacamata || '-',
      tato:
        student.tato === 'Tidak Ada'
          ? '無し'
          : student.tato === 'Ada'
            ? '有り'
            : student.tato === 'Ya'
              ? '有り'
              : student.tato === 'Tidak'
                ? '無し'
                : student.tato || '-',
      merokok: student.merokok || '-',
      jumlah_rokok: student.frequensi_merokok || '-',
      buta_warna: student.buta_warna || '-',
      riwayat_patah_tulang:
        student.patah_tulang === 'Tidak Ada'
          ? '無し'
          : student.patah_tulang === 'Ada'
            ? '有り'
            : student.patah_tulang === 'Ya'
              ? '有り'
              : student.patah_tulang === 'Tidak'
                ? '無し'
                : student.patah_tulang || '-',
      hobi: student.hobi || '-',
    },
    pendidikan: (student.pendidikan || []).map((p, idx) => ({
      id: String(idx + 1),
      tahun_masuk: p.tahun_masuk || '-',
      bulan_masuk: p.bulan_masuk || '-',
      tahun_lulus: p.tahun_lulus || '-',
      bulan_lulus: p.bulan_lulus || '-',
      nama_sekolah: p.nama_sekolah || '-',
      tingkat_pendidikan: p.tingkat_pendidikan || '-',
      jurusan: p.jurusan || '-',
    })),
    pekerjaan: (student.pekerjaan || []).map((pj, idx) => ({
      id: String(idx + 1),
      tahun_mulai: pj.tahun_mulai || '-',
      bulan_mulai: pj.bulan_mulai || '-',
      tahun_selesai: pj.tahun_selesai || '-',
      bulan_selesai: pj.bulan_selesai || '-',
      nama_perusahaan: pj.nama_perusahaan || '-',
      status_pekerjaan: pj.status_pekerjaan || '-',
      posisi_pekerjaan: pj.posisi_pekerjaan || '-',
    })),
    sertifikat:
      student.sertifikat && student.sertifikat.length > 0
        ? student.sertifikat.map((s, idx) => ({
            id: String(idx + 1),
            tahun_diperoleh: s.tahun_diperoleh || '-',
            bulan_diperoleh: s.bulan_diperoleh || '-',
            nama_sertifikat: s.nama_sertifikat || '-',
            status_kelulusan: mapLulus(s.status_kelulusan ?? '-'),
            keterangan_skor: s.score || '-',
            foto_sertifikat: '',
          }))
        : (student.sertifikat_dimiliki || []).map((cert, idx) => ({
            id: String(idx + 1),
            tahun_diperoleh: '-',
            bulan_diperoleh: '-',
            nama_sertifikat: cert,
            status_kelulusan: '合格',
            keterangan_skor: '-',
            foto_sertifikat: '',
          })),
    keluarga: (student.keluarga || []).map((k, idx) => ({
      id: String(idx + 1),
      hubungan: k.hubungan || '-',
      nama_anggota: k.nama || '-',
      umur: k.umur ? String(k.umur) : '-',
      pekerjaan: k.status_pekerjaan || '-',
    })),
  };
}
