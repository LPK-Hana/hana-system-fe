import { demoQuery, demoQueryOne } from '@/lib/demo/db';
import {
  DEMO_STUDENT_USERNAME,
  buildDemoNilaiRows,
  demoShowcaseStudents,
} from '@/lib/demo/seed';
import { cvRevisionFromApiRecord } from '@/lib/cv-revision';
import { clearKkDemo, hasKkDemo, loadKkDemo, saveKkDemo } from '@/lib/kk-demo-storage';

type ApiResult = { status: number; message?: string; data?: unknown; token?: string };

function getClientUserName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_user_name') || '';
}

function sameBiodataId(a: unknown, b: unknown): boolean {
  return Number(a) === Number(b);
}

async function loadCvByNoPeserta(noPeserta: string) {
  const biodata = await demoQueryOne<Record<string, unknown>>(
    `SELECT b.*,
      im.tinggi_badan, im.berat_badan,
      im.mata_kiri, im.status_mata_kiri,
      im.mata_kanan, im.status_mata_kanan,
      im.merokok, im.frequensi_merokok,
      im.berkacamata, im.butawarna,
      im.golongan_darah,
      im.tato, im.riwayat_patah_tulang
     FROM tbl_biodata b
     LEFT JOIN tbl_info_medis im ON im.id_biodata = b.id_biodata
     WHERE b.no_peserta = $1 LIMIT 1`,
    [noPeserta],
  );
  if (!biodata) return null;

  const id = biodata.id_biodata;
  const [pendidikan, pekerjaan, sertifikat, keluarga] = await Promise.all([
    demoQuery(`SELECT * FROM tbl_riwayat_pendidikan WHERE id_biodata = $1 ORDER BY id_riwayat_pendidikan`, [id]),
    demoQuery(`SELECT * FROM tbl_riwayat_pekerjaan WHERE id_biodata = $1 ORDER BY id_riwayat_pekerjaan`, [id]),
    demoQuery(`SELECT * FROM tbl_riwayat_sertifikat WHERE id_biodata = $1 ORDER BY id_riwayat_sertifikat`, [id]),
    demoQuery(`SELECT * FROM tbl_riwayat_keluarga WHERE id_biodata = $1 ORDER BY id_riwayat_keluarga`, [id]),
  ]);

  return { ...biodata, pendidikan, pekerjaan, sertifikat, keluarga };
}

function ok(data?: unknown, message = 'success'): ApiResult {
  return { status: 200, message, data };
}

function okMutate(message = 'Berhasil (demo)'): ApiResult {
  return { status: 200, message };
}

function routeKey(method: string, url: string): string {
  const path = url.replace(/^\//, '').split('?')[0]!.toLowerCase();
  return `${method.toUpperCase()} ${path}`;
}

function parseUrlParams(url: string): Record<string, string> {
  const q = url.split('?')[1];
  if (!q) return {};
  return Object.fromEntries(new URLSearchParams(q));
}

function resolveUserName(
  url: string,
  params?: Record<string, unknown>,
): string {
  const fromUrl = parseUrlParams(url).user_name;
  if (fromUrl) return fromUrl;
  if (params?.user_name) return String(params.user_name);
  return getClientUserName();
}

export async function invokeClientApi(
  method: string,
  url: string,
  dataOrParams?: unknown,
  isGet = false,
): Promise<ApiResult> {
  const key = routeKey(method, url);
  const params = (isGet ? dataOrParams : undefined) as Record<string, unknown> | undefined;
  const body = (!isGet ? dataOrParams : undefined) as Record<string, unknown> | undefined;
  const userName = resolveUserName(url, params);

  switch (key) {
    case 'GET guest/list-student': {
      const data = demoShowcaseStudents().map((item) => ({
        ...item,
        skill: Array.isArray(item.skill) ? item.skill : [],
      }));
      return ok(data, 'Berhasil mengambil data siswa');
    }

    case 'GET guest/list-resume': {
      const noPeserta = String(params?.no_peserta ?? '');
      if (!noPeserta) return { status: 400, message: 'no_peserta is required' };
      const biodata = await loadCvByNoPeserta(noPeserta);
      if (!biodata) return ok(null, 'CV belum tersedia');
      const u = await demoQueryOne<{ id_kelas?: number }>(
        `SELECT id_kelas FROM master_user WHERE user_name = $1 LIMIT 1`,
        [noPeserta],
      );
      const kelas = u?.id_kelas
        ? await demoQueryOne<{ nama_kelas: string }>(
            `SELECT nama_kelas FROM tbl_kelas WHERE id_kelas = $1`,
            [u.id_kelas],
          )
        : null;
      return ok({ ...biodata, nama_kelas: kelas?.nama_kelas ?? null });
    }

    case 'GET guest/list-qualification': {
      const noPeserta = String(params?.no_peserta ?? '');
      const row = await demoQueryOne<{ link_video: string | null; skill: string[] }>(
        `SELECT link_video, skill FROM tbl_biodata WHERE no_peserta = $1`,
        [noPeserta],
      );
      return ok(
        row
          ? { link_video: row.link_video, skill: Array.isArray(row.skill) ? row.skill : [] }
          : { link_video: null, skill: [] },
        'Berhasil mengambil data kualifikasi',
      );
    }

    case 'GET guest/list': {
      const isActive = params?.is_active != null ? Number(params.is_active) : 1;
      const rows = await demoQuery(
        `SELECT guest_id, name, user_name, is_active FROM tbl_master_guest WHERE is_active = $1`,
        [isActive],
      );
      return ok(rows);
    }

    case 'GET resume/list': {
      const biodatas = await demoQuery<Record<string, unknown>>(
        `SELECT b.*,
          im.tinggi_badan, im.berat_badan,
          im.mata_kiri, im.status_mata_kiri,
          im.mata_kanan, im.status_mata_kanan,
          im.merokok, im.frequensi_merokok,
          im.berkacamata, im.butawarna,
          im.golongan_darah,
          im.tato, im.riwayat_patah_tulang
         FROM tbl_biodata b
         INNER JOIN master_user mu ON mu.user_name = b.no_peserta AND mu.is_active = 1 AND mu.is_admin = 0
         LEFT JOIN tbl_info_medis im ON im.id_biodata = b.id_biodata
         ORDER BY b.id_biodata`,
      );
      const biodataIds = biodatas.map((b) => b.id_biodata);
      const [pendidikanAll, pekerjaanAll, sertifikatAll, keluargaAll] = await Promise.all([
        demoQuery(`SELECT * FROM tbl_riwayat_pendidikan WHERE id_biodata IN (${biodataIds.map((_, i) => `$${i + 1}`).join(',')})`, biodataIds),
        demoQuery(`SELECT * FROM tbl_riwayat_pekerjaan WHERE id_biodata IN (${biodataIds.map((_, i) => `$${i + 1}`).join(',')})`, biodataIds),
        demoQuery(`SELECT * FROM tbl_riwayat_sertifikat WHERE id_biodata IN (${biodataIds.map((_, i) => `$${i + 1}`).join(',')})`, biodataIds),
        demoQuery(`SELECT * FROM tbl_riwayat_keluarga WHERE id_biodata IN (${biodataIds.map((_, i) => `$${i + 1}`).join(',')})`, biodataIds),
      ]);
      const results = biodatas.map((bio) => {
        const item = {
          ...bio,
          pendidikan: (pendidikanAll as Record<string, unknown>[]).filter((p) =>
            sameBiodataId(p.id_biodata, bio.id_biodata),
          ),
          pekerjaan: (pekerjaanAll as Record<string, unknown>[]).filter((p) =>
            sameBiodataId(p.id_biodata, bio.id_biodata),
          ),
          sertifikat: (sertifikatAll as Record<string, unknown>[]).filter((s) =>
            sameBiodataId(s.id_biodata, bio.id_biodata),
          ),
          keluarga: (keluargaAll as Record<string, unknown>[]).filter((k) =>
            sameBiodataId(k.id_biodata, bio.id_biodata),
          ),
        };
        return { ...item, cv_revision: cvRevisionFromApiRecord(item) };
      });
      return ok(results);
    }

    case 'GET resume/list-user': {
      const userName = getClientUserName();
      if (userName.toUpperCase() === DEMO_STUDENT_USERNAME) {
        return ok(null);
      }
      const biodata = await loadCvByNoPeserta(userName);
      return ok(biodata);
    }

    case 'GET user/list':
    case 'GET user/list-active':
    case 'GET user/list-inactive': {
      const sql =
        key === 'GET user/list-active'
          ? `SELECT user_id, name, user_name, is_admin, is_active, id_kelas FROM master_user mu WHERE mu.is_active = 1 ORDER BY mu.user_name`
          : key === 'GET user/list-inactive'
            ? `SELECT user_id, name, user_name, is_admin, is_active, id_kelas FROM master_user mu WHERE mu.is_active = 0`
            : `SELECT user_id, name, user_name, is_admin, is_active, id_kelas, nama_kelas FROM master_user mu ORDER BY mu.user_id`;
      return ok(await demoQuery(sql));
    }

    case 'GET user/list-unverif-user': {
      return ok(
        await demoQuery(
          `SELECT name, user_name, nama_kelas FROM master_user mu WHERE mu.is_admin = 0 and mu.is_active = 1 AND mu.user_name NOT IN (SELECT no_peserta FROM tbl_biodata)`,
        ),
      );
    }

    case 'GET kelas/list':
      return ok(await demoQuery(`SELECT * FROM tbl_kelas`));

    case 'GET job/list':
      return ok(await demoQuery(`SELECT * FROM tbl_master_job ORDER BY id_master_job DESC`));

    case 'GET job/list-assign-user':
      return ok(await demoQuery(`SELECT * FROM tbl_job_details jd`));

    case 'GET job/last-edit':
      return ok(await demoQuery(`SELECT user_name, last_edit FROM tbl_job_details`));

    case 'GET superadmin/list': {
      const isActive = params?.is_active != null ? Number(params.is_active) : 1;
      return ok(
        await demoQuery(`SELECT user_id, name, user_name, is_active FROM master_user WHERE is_admin = 1 AND is_active = $1`, [
          isActive,
        ]),
      );
    }

    case 'GET nilai-pembelajaran/list':
    case 'GET nilai-pembelajaran/get-all':
      return ok(buildDemoNilaiRows());

    case 'GET nilai-pembelajaran/list-certificate': {
      return ok(
        await demoQuery(
          `SELECT user_name, name, foto, nama_kelas, nilai_n4, nilai_n5 FROM tbl_biodata b WHERE u.is_active = 1 and u.is_admin = 0`,
        ),
      );
    }

    case 'GET input-kk/get-kk-id': {
      const data = loadKkDemo(userName, 'id');
      return ok(data);
    }

    case 'GET input-kk/get-kk-jp': {
      const data = loadKkDemo(userName, 'jp');
      return ok(data);
    }

    case 'GET input-kk/check-kk':
      return ok(hasKkDemo(userName));

    case 'POST input-kk/create-kk-id': {
      if (body) saveKkDemo(userName, 'id', body);
      return { status: 201, message: 'Berhasil menyimpan KK (ID)' };
    }

    case 'POST input-kk/create-kk-jp': {
      if (body) saveKkDemo(userName, 'jp', body);
      return { status: 201, message: 'Berhasil menyimpan KK (JP)' };
    }

    case 'PUT input-kk/update-kk-id': {
      if (body) saveKkDemo(userName, 'id', body);
      return okMutate('Berhasil memperbarui KK (ID)');
    }

    case 'PUT input-kk/update-kk-jp': {
      if (body) saveKkDemo(userName, 'jp', body);
      return okMutate('Berhasil memperbarui KK (JP)');
    }

    case 'GET server-time':
      return ok({ iso: new Date().toISOString() });

    default:
      if (method.toUpperCase() === 'GET') {
        return ok([]);
      }
      return okMutate();
  }
}
