import { JOB_CATEGORIES } from '@/lib/job-categories';
import { toKatakana } from '@/lib/katakana-master';
import { DEMO_STUDENT_USERNAME, buildNim } from '@/lib/nim';

export { DEMO_STUDENT_USERNAME };

const EMOJIS = [
  '👨‍🎓', '👩‍🎓', '🧑‍💼', '👨‍🔧', '👩‍🔬', '🧑‍🌾', '👨‍🍳', '👩‍⚕️', '🧑‍🏭', '👨‍💻',
  '👩‍🎨', '🧑‍✈️', '👨‍🚀', '👩‍🔧', '🧑‍🎤', '👨‍🏫', '👩‍💻', '🧑‍🔬', '👨‍🎨', '👩‍🌾',
];

const FIRST_NAMES = [
  'Budi', 'Siti', 'Rizki', 'Dewi', 'Agus', 'Rina', 'Hendra', 'Maya', 'Fajar', 'Lina',
  'Adi', 'Putri', 'Bambang', 'Kartika', 'Yoga', 'Nadia', 'Eko', 'Sari', 'Doni', 'Wulan',
];

const LAST_NAMES = [
  'Santoso', 'Aminah', 'Pratama', 'Lestari', 'Wijaya', 'Saputra', 'Hidayat', 'Rahayu',
  'Kusuma', 'Permata', 'Nugroho', 'Wibowo', 'Setiawan', 'Anggraini', 'Mahendra', 'Cahya',
  'Gunawan', 'Pertiwi', 'Siregar', 'Utami',
];

const CITIES = [
  'Bandung', 'Jakarta', 'Surabaya', 'Semarang', 'Yogyakarta', 'Medan', 'Makassar', 'Denpasar',
  'Malang', 'Palembang', 'Bogor', 'Bekasi', 'Tangerang', 'Solo', 'Padang', 'Pontianak',
  'Balikpapan', 'Manado', 'Pekanbaru', 'Cirebon',
];

export function generateDemoStudents(count = 20) {
  const users: Array<Record<string, unknown>> = [];
  const biodata: Array<Record<string, unknown>> = [];
  const subNilai: Array<Record<string, unknown>> = [];
  const kepribadian: Array<Record<string, unknown>> = [];
  const jobDetails: Array<Record<string, unknown>> = [];

  for (let i = 0; i < count; i++) {
    const angkatanPart = '01';
    const no = buildNim(angkatanPart, i + 1);
    const name = `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`;
    const kelasId = i % 3 === 0 ? 2 : 1;
    const isActive = i < 18 ? 1 : 0;
    const jobCat1 = JOB_CATEGORIES[i % JOB_CATEGORIES.length];
    const jobCat2 = JOB_CATEGORIES[(i + 1) % JOB_CATEGORIES.length];
    const jobCat3 = JOB_CATEGORIES[(i + 2) % JOB_CATEGORIES.length];
    const jobCats = [jobCat1, jobCat2, jobCat3];

    users.push({
      user_id: 100 + i + 1,
      name,
      user_name: no,
      password: 'demo',
      is_admin: 0,
      is_active: isActive,
      id_kelas: isActive ? kelasId : null,
      createdt: '2026-01-05',
      updatedt: '2026-01-05',
    });

    biodata.push({
      id_biodata: i + 1,
      no_peserta: no,
      nama_peserta: name,
      nik: `327301${String(i + 1).padStart(2, '0')}0199${String(1000 + i)}`,
      tempat_lahir: CITIES[i],
      tanggal_lahir: `1999-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      jenis_kelamin: i % 2 === 0 ? 'Laki-laki' : 'Perempuan',
      agama: 'Islam',
      status_perkawinan: 'Belum Menikah',
      alamat: `Jl. Merdeka No. ${i + 10}, ${CITIES[i]}`,
      foto: EMOJIS[i],
      tinggi_badan: 158 + (i % 15),
      berat_badan: 50 + (i % 20),
      mata_kiri: '6/6',
      status_mata_kiri: 'Normal',
      mata_kanan: '6/6',
      status_mata_kanan: 'Normal',
      merokok: 'Tidak',
      frequensi_merokok: null,
      berkacamata: i % 5 === 0 ? 'Ya' : 'Tidak',
      butawarna: 'Tidak',
      golongan_darah: ['O', 'A', 'B', 'AB'][i % 4],
      tato: 'Tidak',
      riwayat_patah_tulang: 'Tidak',
      nama_kelas: kelasId === 1 ? 'Kelas N5-A' : 'Kelas N4-B',
      nama_katakana: toKatakana(name),
      link_video: 'https://youtu.be/AzbMgEvXFF8?si=kkUKAEOCtsmMBs5T',
      skill: i % 3 === 0 ? ['JFT-Basic A2', 'JLPT N4'] : i % 2 === 0 ? ['JLPT N5'] : ['JLPT N4'],
      bidang_pekerjaan: jobCats.map((j) => j.titleId).join(', '),
      bidang_pekerjaan_ids: jobCats.map((j) => j.id).join(','),
      program_type: i % 2 === 0 ? 'ginou_jisshu' : 'tokutei_ginou',
      hobi: ['Membaca', 'Olahraga', 'Musik', 'Memasak'][i % 4],
      email: `${no.toLowerCase()}@demo.hana.id`,
      nomor_telepon: `0812${String(10000000 + i)}`,
      kode_pos: `${40000 + i}`,
      negara_asal: 'Indonesia',
      tgl_masuk_lpk: '2025-09-01',
      nama_perusahaan: i % 3 === 0 ? 'PT Maju Bersama' : null,
      perkiraan_masuk_jepang: '2027-04-01',
      tgl_keberangkatan: null,
      tanggal_kelulusan: null,
      hasil_mcu: null,
      hasil_mcu_admin: i % 2 === 0 ? 'Sehat' : 'Perlu kontrol',
    });

    if (isActive) {
      subNilai.push({
        user_name: no,
        nilai_ujian_masuk: 75 + (i % 15),
        nilai_n4: 80 + (i % 12),
        nilai_n5: 82 + (i % 10),
        catatan_sikap_siswa: `Siswa aktif, fokus bidang ${jobCat1.titleId}.`,
      });
      kepribadian.push({
        user_name: no,
        nilai_kedisiplinan: 78 + (i % 12),
        nilai_kepribadian: 80 + (i % 10),
        nilai_komunikasi: 76 + (i % 14),
        nilai_kesopanan: 82 + (i % 10),
        kontrol_emosi: 79 + (i % 11),
        nilai_inisiatif: 77 + (i % 13),
        nilai_percaya_diri: 80 + (i % 9),
      });
      jobDetails.push({
        user_name: no,
        nama_peserta: name,
        angkatan: '2026-01',
        id_master_job: i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : null,
        job_title: i % 3 === 0 ? 'Manufacturing Staff' : i % 3 === 1 ? 'Care Worker' : null,
        updated_at: '2026-02-01',
      });
    }
  }

  const pendidikan = biodata.map((b, i) => ({
    id_riwayat_pendidikan: i + 1,
    id_biodata: b.id_biodata,
    nama_sekolah: `SMK Negeri ${(i % 5) + 1} ${CITIES[i]}`,
    tingkat_pendidikan: 'SMA/SMK',
    jurusan: ['Teknik Mesin', 'Teknik Listrik', 'Akuntansi', 'Perhotelan', 'Agribisnis'][i % 5],
    bulan_masuk: '07',
    tahun_masuk: String(2014 + (i % 3)),
    bulan_lulus: '06',
    tahun_lulus: String(2017 + (i % 3)),
  }));

  const pekerjaan = biodata.slice(0, 15).map((b, i) => ({
    id_riwayat_pekerjaan: i + 1,
    id_biodata: b.id_biodata,
    nama_perusahaan: `PT ${LAST_NAMES[i % LAST_NAMES.length]} Jaya`,
    posisi_pekerjaan: ['Operator Produksi', 'Staff Admin', 'Quality Control'][i % 3],
    status_pekerjaan: 'Selesai',
    bulan_mulai: '01',
    tahun_mulai: '2019',
    bulan_selesai: '12',
    tahun_selesai: '2023',
  }));

  const sertifikat = biodata.slice(0, 12).map((b, i) => ({
    id_riwayat_sertifikat: i + 1,
    id_biodata: b.id_biodata,
    nama_sertifikat: i % 2 === 0 ? 'JLPT N5' : 'JLPT N4',
    status_kelulusan: 'Lulus',
    score: String(80 + (i % 15)),
    bulan_diperoleh: '12',
    tahun_diperoleh: '2025',
    sertifikat: null,
  }));

  const keluarga = biodata.flatMap((b, i) => [
    {
      id_riwayat_keluarga: i * 2 + 1,
      id_biodata: b.id_biodata,
      hubungan: 'Ayah',
      nama: LAST_NAMES[i],
      umur: 52 + (i % 8),
      status_pekerjaan: 'Wiraswasta',
    },
    {
      id_riwayat_keluarga: i * 2 + 2,
      id_biodata: b.id_biodata,
      hubungan: 'Ibu',
      nama: `Ibu ${FIRST_NAMES[i]}`,
      umur: 48 + (i % 8),
      status_pekerjaan: 'Ibu Rumah Tangga',
    },
  ]);

  return { users, biodata, subNilai, kepribadian, jobDetails, pendidikan, pekerjaan, sertifikat, keluarga };
}
