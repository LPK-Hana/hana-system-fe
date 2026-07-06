import type { CVData } from '@/app/student-dashboard/cv-form/types';
import { defaultCVData } from '@/app/student-dashboard/cv-form/defaults';

/** Template CV dummy untuk demo auto-generate — siswa mulai dari kosong lalu bisa isi manual atau pakai ini. */
export function buildDummyCVTemplate(noPeserta: string, namaLengkap?: string): CVData {
  const base = structuredClone(defaultCVData);
  const name = namaLengkap?.trim() || 'Nama Siswa Demo';

  return {
    ...base,
    meta: {
      ...base.meta,
      tanggal_pembuatan_cv: new Date().toISOString().split('T')[0],
      foto: '',
    },
    informasi_dasar: {
      ...base.informasi_dasar,
      no_peserta: noPeserta.toUpperCase(),
      nik: '3273010101990001',
      nama_lengkap: name,
      nama_katakana: 'デモ・ガダ',
      yobisho: 'デモ',
      umur: '27',
      jenis_kelamin: 'Laki-laki',
      kewarganegaraan: 'インドネシア',
      tanggal_lahir: '1999-01-15',
      golongan_darah: 'O',
      agama: 'イスラム教',
      status_pernikahan: '未婚',
      alamat_lengkap: 'Jl. Contoh No. 10, Bandung, Jawa Barat',
      kode_pos: '40123',
      nomor_telepon: '081234567890',
      email: `${noPeserta.toLowerCase()}@demo.hana.id`,
    },
    fisik_kesehatan: {
      ...base.fisik_kesehatan,
      tinggi_badan: '170',
      berat_badan: '65',
      visus_mata_kiri: '6/6',
      kondisi_mata_kiri: '正常',
      visus_mata_kanan: '6/6',
      kondisi_mata_kanan: '正常',
      berkacamata: 'いいえ',
      tato: 'いいえ',
      merokok: 'いいえ',
      jumlah_rokok: '',
      buta_warna: 'いいえ',
      riwayat_patah_tulang: 'いいえ',
      hobi: '読書・スポーツ',
    },
    pendidikan: [
      {
        id: 'pend-1',
        nama_sekolah: 'SMK Negeri 1 Bandung',
        tingkat_pendidikan: '高等学校',
        jurusan: '機械工学科',
        bulan_masuk: '7',
        tahun_masuk: '2015',
        bulan_lulus: '6',
        tahun_lulus: '2018',
      },
    ],
    pekerjaan: [
      {
        id: 'kerja-1',
        nama_perusahaan: 'PT Maju Bersama',
        posisi_pekerjaan: 'Operator Produksi',
        status_pekerjaan: '完了',
        bulan_mulai: '8',
        tahun_mulai: '2018',
        bulan_selesai: '12',
        tahun_selesai: '2023',
      },
    ],
    sertifikat: [
      {
        id: 'sert-1',
        nama_sertifikat: 'JLPT N5',
        status_kelulusan: '合格',
        keterangan_skor: '95',
        bulan_diperoleh: '12',
        tahun_diperoleh: '2025',
        foto_sertifikat: '',
      },
    ],
    keluarga: [
      { id: 'kel-1', hubungan: '父', nama_anggota: 'Santoso', umur: '55', pekerjaan: '自営業' },
      { id: 'kel-2', hubungan: '母', nama_anggota: 'Sri Rahayu', umur: '52', pekerjaan: '専業主婦' },
    ],
  };
}
