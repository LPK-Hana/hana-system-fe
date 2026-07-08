/** Data dummy LPK Gada Wirya Karsa — hanya dipakai saat DEMO_MODE=1 */

import { generateDemoStudents } from './generate-students';

import { DEMO_STUDENT_USERNAME } from '@/lib/nim';

export { DEMO_STUDENT_USERNAME };

export const demoSuperAdmin = {
  super_admin_id: 1,
  name: 'Shachou Hana',
  user_name: 'shachou',
  password: 'demo',
  is_active: 1,
};

export const demoKelas = [
  { id_kelas: 1, nama_kelas: 'Kelas N5-A', is_active: 1, created_at: '2026-01-01', created_by: 'admin', edit_at: null, edit_by: null, delete_at: null, delete_by: null },
  { id_kelas: 2, nama_kelas: 'Kelas N4-B', is_active: 1, created_at: '2026-01-01', created_by: 'admin', edit_at: null, edit_by: null, delete_at: null, delete_by: null },
];

const generated = generateDemoStudents(20);

export const demoUsers = [
  { user_id: 1, name: 'Admin Hana', user_name: 'admin', password: 'demo', is_admin: 1, is_active: 1, id_kelas: null, createdt: '2026-01-01', updatedt: '2026-01-01' },
  { user_id: 2, name: 'Admin Demo 2', user_name: 'admin2', password: 'demo', is_admin: 1, is_active: 1, id_kelas: null, createdt: '2026-01-02', updatedt: '2026-01-02' },
  { user_id: 50, name: 'Pak Andi Wijaya', user_name: 'guru', password: 'demo', is_admin: 0, is_guru: 1, is_active: 1, id_kelas: null, createdt: '2026-01-03', updatedt: '2026-01-03' },
  ...generated.users,
];

export const demoBiodata = generated.biodata;
export const demoPendidikan = generated.pendidikan;
export const demoPekerjaan = generated.pekerjaan;
export const demoSertifikat = generated.sertifikat;
export const demoKeluarga = generated.keluarga;
export const demoSubNilai = generated.subNilai;
export const demoKepribadian = generated.kepribadian;
export const demoJobDetails = generated.jobDetails;

function makeBabScores(base: number) {
  const row: Record<string, number | string | null> = { keterangan: 'Baik' };
  for (let i = 1; i <= 50; i++) {
    row[`bab_${i}`] = i <= 10 ? base + (i % 5) : i <= 25 ? base - 2 : null;
  }
  return row;
}

export function buildDemoNilaiRows() {
  const aspects = [
    { id_aspek_nilai: 1, aspek_penilaian: 'kotoba' },
    { id_aspek_nilai: 2, aspek_penilaian: 'bunpou' },
    { id_aspek_nilai: 3, aspek_penilaian: 'choukai' },
    { id_aspek_nilai: 4, aspek_penilaian: 'kaiwa' },
    { id_aspek_nilai: 5, aspek_penilaian: 'kanji' },
  ];
  const students = demoUsers.filter((u) => u.is_admin === 0 && u.is_active === 1 && !('is_guru' in u && u.is_guru === 1));
  const rows: Record<string, unknown>[] = [];
  let id = 1;
  for (const student of students) {
    const bio = demoBiodata.find((b) => b.no_peserta === student.user_name);
    const kelas = demoKelas.find((k) => k.id_kelas === student.id_kelas);
    const sub = demoSubNilai.find((s) => s.user_name === student.user_name);
    const kep = demoKepribadian.find((k) => k.user_name === student.user_name);
    for (const aspect of aspects) {
      const bab = makeBabScores(78 + (id % 8));
      rows.push({
        id_nilai: id++,
        user_name: student.user_name,
        name: bio?.nama_peserta ?? student.name,
        foto: bio?.foto ?? null,
        nama_kelas: kelas?.nama_kelas ?? null,
        id_aspek_nilai: aspect.id_aspek_nilai,
        aspek_penilaian: aspect.aspek_penilaian,
        keterangan: 'Progres baik',
        ...bab,
        nilai_ujian_masuk: sub?.nilai_ujian_masuk ?? null,
        nilai_n4: sub?.nilai_n4 ?? null,
        nilai_n5: sub?.nilai_n5 ?? null,
        catatan_sikap_siswa: sub?.catatan_sikap_siswa ?? null,
        nilai_kedisiplinan: kep?.nilai_kedisiplinan ?? null,
        nilai_kepribadian: kep?.nilai_kepribadian ?? null,
        nilai_komunikasi: kep?.nilai_komunikasi ?? null,
        nilai_kesopanan: kep?.nilai_kesopanan ?? null,
        kontrol_emosi: kep?.kontrol_emosi ?? null,
        nilai_inisiatif: kep?.nilai_inisiatif ?? null,
        nilai_percaya_diri: kep?.nilai_percaya_diri ?? null,
      });
    }
  }
  return rows;
}

export const demoJobs = [
  { id_master_job: 1, job_title: 'Kaigo / Perawat Lansia', deskripsi: 'Fasilitas perawatan lansia — Osaka', tgl_deadline: '2026-12-31', tgl_mansetsu: '2026-06-15', kuota: 10, created_at: '2026-01-10', updated_at: '2026-01-10' },
  { id_master_job: 2, job_title: 'Seizougyou / Manufaktur', deskripsi: 'Pabrik otomotif — Kyoto', tgl_deadline: '2026-11-30', tgl_mansetsu: '2026-05-20', kuota: 15, created_at: '2026-01-12', updated_at: '2026-01-12' },
  { id_master_job: 3, job_title: 'Kensetsugyou / Konstruksi', deskripsi: 'Proyek infrastruktur — Tokyo', tgl_deadline: '2026-10-31', tgl_mansetsu: '2026-04-10', kuota: 8, created_at: '2026-01-15', updated_at: '2026-01-15' },
];

export const demoGuests = [
  { guest_id: 1, name: 'Guest Demo', user_name: 'guest', password: 'demo', is_active: 1 },
];

export function demoShowcaseStudents() {
  const activeStudents = demoUsers.filter((u) => u.is_admin === 0 && u.is_active === 1 && !('is_guru' in u && u.is_guru === 1));
  return activeStudents.map((u, idx) => {
    const bio = demoBiodata.find((b) => b.no_peserta === u.user_name);
    return {
      no_peserta: u.user_name,
      nama_peserta: bio?.nama_peserta ?? u.name,
      nama_katakana: bio?.nama_katakana ?? '',
      link_video: bio?.link_video ?? null,
      skill: bio?.skill ?? [],
      foto: bio?.foto ?? null,
      finish_bab15: idx < 8 ? 1 : 0,
    };
  });
}
