import type { CVData } from './types';

export const defaultCVData: CVData = {
  meta: {
    tanggal_pembuatan_cv: new Date().toISOString().split('T')[0],
    foto: '',
  },
  dokumen: {
    ktp: '',
    kk: '',
    akte_kelahiran: '',
    ijazah_terakhir: '',
  },

  informasi_dasar: {
    nik: '',
    no_peserta: '',
    nama_lengkap: '',
    nama_katakana: '',
    yobisho: '',
    umur: '',
    jenis_kelamin: '',
    kewarganegaraan: 'インドネシア',
    tanggal_lahir: '',
    golongan_darah: '',
    agama: '',
    status_pernikahan: '',
    alamat_lengkap: '',
    kode_pos: '',
    nomor_telepon: '',
    email: '',
  },
  fisik_kesehatan: {
    tinggi_badan: '',
    berat_badan: '',
    visus_mata_kiri: '',
    kondisi_mata_kiri: '',
    visus_mata_kanan: '',
    kondisi_mata_kanan: '',
    berkacamata: '',
    tato: '',
    merokok: '',
    jumlah_rokok: '',
    buta_warna: '',
    riwayat_patah_tulang: '',
    hobi: '',
  },
  pendidikan: [],
  pekerjaan: [],
  sertifikat: [],
  keluarga: [],
};

export const BULAN_OPTIONS = [
  { value: '1', label: 'Januari' },  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },    { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },      { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },     { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },{ value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },{ value: '12', label: 'Desember' },
];

export const TAHUN_OPTIONS = Array.from({ length: 50 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});
