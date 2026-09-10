export interface MetaData {
  tanggal_pembuatan_cv: string;
  foto: string; // base64 data URL
}

export interface DokumenPendukung {
  ktp: string;
  kk: string;
  akte_kelahiran: string;
  ijazah_terakhir: string;
}


export interface InformasiDasar {
  nik: string;
  no_peserta: string;
  nama_lengkap: string;
  nama_katakana: string;
  yobisho: string;        // 呼称 / nama panggilan
  umur: string;
  jenis_kelamin: string;
  kewarganegaraan: string;
  tanggal_lahir: string;
  golongan_darah: string;
  agama: string;
  status_pernikahan: string;
  alamat_lengkap: string;
  kode_pos: string;
  nomor_telepon: string;
  email: string;
}

export interface FisikKesehatan {
  tinggi_badan: string;
  berat_badan: string;
  visus_mata_kiri: string;
  kondisi_mata_kiri: string;
  visus_mata_kanan: string;
  kondisi_mata_kanan: string;
  berkacamata: string;
  tato: string;
  merokok: string;
  jumlah_rokok: string;
  buta_warna: string;
  riwayat_patah_tulang: string;
  hobi: string;
}

export interface RiwayatPendidikan {
  id: string;
  tahun_masuk: string;
  bulan_masuk: string;
  tahun_lulus: string;
  bulan_lulus: string;
  nama_sekolah: string;
  tingkat_pendidikan: string;
  jurusan: string;
}

export interface RiwayatPekerjaan {
  id: string;
  tahun_mulai: string;
  bulan_mulai: string;
  tahun_selesai: string;
  bulan_selesai: string;
  nama_perusahaan: string;
  status_pekerjaan: string;
  posisi_pekerjaan: string;
}

export interface Sertifikat {
  id: string;
  tahun_diperoleh: string;
  bulan_diperoleh: string;
  nama_sertifikat: string;
  status_kelulusan: string;
  keterangan_skor: string;
  foto_sertifikat: string;
}

export interface AnggotaKeluarga {
  id: string;
  hubungan: string;
  nama_anggota: string;
  /** Usia anggota keluarga (tahun). */
  umur: string;
  pekerjaan: string;
}

export interface CVData {
  meta: MetaData;
  dokumen: DokumenPendukung;
  informasi_dasar: InformasiDasar;
  fisik_kesehatan: FisikKesehatan;
  pendidikan: RiwayatPendidikan[];
  pekerjaan: RiwayatPekerjaan[];
  sertifikat: Sertifikat[];
  keluarga: AnggotaKeluarga[];
}
