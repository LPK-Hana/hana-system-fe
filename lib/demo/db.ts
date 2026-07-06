import {
  buildDemoNilaiRows,
  demoBiodata,
  demoGuests,
  demoJobDetails,
  demoJobs,
  demoKelas,
  demoKeluarga,
  demoPekerjaan,
  demoPendidikan,
  demoSertifikat,
  demoShowcaseStudents,
  demoSuperAdmin,
  demoUsers,
} from './seed';

let nextId = 1000;

function norm(sql: string) {
  return sql.replace(/\s+/g, ' ').trim().toLowerCase();
}

function kelasName(id: number | null | undefined) {
  if (!id) return '';
  return demoKelas.find((k) => k.id_kelas === id)?.nama_kelas ?? '';
}

function mapUserRow(u: Record<string, unknown>): Record<string, unknown> & { nama_kelas: string } {
  return {
    ...u,
    nama_kelas: kelasName(u.id_kelas as number | null | undefined),
  };
}

function biodataWithRelations(bio: (typeof demoBiodata)[0]) {
  const id = bio.id_biodata;
  return {
    ...bio,
    pendidikan: demoPendidikan.filter((p) => p.id_biodata === id),
    pekerjaan: demoPekerjaan.filter((p) => p.id_biodata === id),
    sertifikat: demoSertifikat.filter((s) => s.id_biodata === id),
    keluarga: demoKeluarga.filter((k) => k.id_biodata === id),
  };
}

export async function demoQuery<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
  const sql = norm(text);

  if (sql.startsWith('update ') || sql.startsWith('insert ') || sql.startsWith('delete ')) {
    if (sql.includes('returning')) {
      if (sql.includes('id_master_job')) return [{ id_master_job: ++nextId }] as T[];
      if (sql.includes('id_biodata')) return [{ id_biodata: ++nextId }] as T[];
      if (sql.includes('id_kelas')) return [{ id_kelas: params[params.length - 1] }] as T[];
    }
    return [] as T[];
  }

  if (sql.includes('from tbl_master_super_admin') && sql.includes('where user_name = $1')) {
    const row = demoSuperAdmin.user_name === params[0] ? demoSuperAdmin : null;
    return row ? ([row] as T[]) : [];
  }

  if (sql.includes('from master_user') && sql.includes('where user_name = $1') && sql.includes('limit 1')) {
    const row = demoUsers.find((u) => u.user_name === params[0]);
    return row ? ([row] as T[]) : [];
  }

  if (sql.includes('from master_user') && sql.includes('where user_id = $1')) {
    const row = demoUsers.find((u) => u.user_id === Number(params[0]));
    return row ? ([row] as T[]) : [];
  }

  if (sql.includes('from master_user mu') && sql.includes('order by mu.user_id')) {
    return demoUsers.map((u) => {
      const m = mapUserRow(u as Record<string, unknown>);
      return {
        user_id: m.user_id,
        name: m.name,
        user_name: m.user_name,
        is_admin: m.is_admin,
        is_active: m.is_active,
        id_kelas: m.id_kelas,
        nama_kelas: m.nama_kelas,
      };
    }) as T[];
  }

  if (sql.includes('from master_user mu') && sql.includes('where mu.is_active = 1') && sql.includes('order by mu.user_name')) {
    return demoUsers
      .filter((u) => u.is_active === 1)
      .map((u) => ({
        user_id: u.user_id,
        name: u.name,
        user_name: u.user_name,
        is_admin: u.is_admin,
        is_active: u.is_active,
        id_kelas: u.id_kelas,
        kelas: kelasName(u.id_kelas as number | null | undefined) || null,
      })) as T[];
  }

  if (sql.includes('from master_user mu') && sql.includes('where mu.is_active = 0')) {
    return demoUsers
      .filter((u) => u.is_active === 0)
      .map((u) => ({
        user_id: u.user_id,
        name: u.name,
        user_name: u.user_name,
        is_admin: u.is_admin,
        is_active: u.is_active,
        id_kelas: u.id_kelas,
        kelas: null,
      })) as T[];
  }

  if (sql.includes('where mu.is_admin = 0 and mu.is_active = 1') && sql.includes('not in (select no_peserta from tbl_biodata')) {
    const withBio = new Set(demoBiodata.map((b) => b.no_peserta));
    return demoUsers
      .filter((u) => u.is_admin === 0 && u.is_active === 1 && !withBio.has(u.user_name))
      .map((u) => ({
        name: u.name,
        user_name: u.user_name,
        nama_kelas: kelasName(u.id_kelas as number | null | undefined),
      })) as T[];
  }

  if (sql.includes('from master_user') && sql.includes('where is_admin = 1')) {
    let admins = demoUsers.filter((u) => u.is_admin === 1);
    if (sql.includes('and is_active = $1') && params.length) {
      admins = admins.filter((u) => u.is_active === Number(params[0]));
    }
    return admins.map((u) => ({
      user_id: u.user_id,
      name: u.name,
      user_name: u.user_name,
      is_active: u.is_active,
      createdt: u.createdt,
      updatedt: u.updatedt,
    })) as T[];
  }

  if (sql.includes('from tbl_kelas')) {
    return demoKelas as T[];
  }

  if (sql.includes('from tbl_master_job') && sql.includes('order by id_master_job desc')) {
    return demoJobs as T[];
  }

  if (sql.includes('from tbl_job_details jd')) {
    return demoJobDetails as T[];
  }

  if (sql.includes('from tbl_job_details') && sql.includes('last_edit')) {
    return demoJobDetails.map((d) => ({
      user_name: d.user_name,
      last_edit: 3,
    })) as T[];
  }

  if (sql.includes('from tbl_nilai n')) {
    return buildDemoNilaiRows() as T[];
  }

  if (sql.includes('finish_bab15')) {
    return demoShowcaseStudents() as T[];
  }

  if (sql.includes('from tbl_biodata b') && sql.includes('where u.is_active = 1 and u.is_admin = 0')) {
    return demoBiodata.map((bio) => {
      const u = demoUsers.find((x) => x.user_name === bio.no_peserta);
      const kelas = demoKelas.find((k) => k.id_kelas === u?.id_kelas);
      const sub = buildDemoNilaiRows().find((r) => r.user_name === bio.no_peserta);
      return {
        user_name: bio.no_peserta,
        name: bio.nama_peserta,
        foto: bio.foto,
        nama_kelas: kelas?.nama_kelas ?? null,
        nilai_n4: sub?.nilai_n4 ?? null,
        nilai_n5: sub?.nilai_n5 ?? null,
      };
    }) as T[];
  }

  if (sql.includes('from tbl_biodata b') && sql.includes('inner join master_user mu')) {
    return demoBiodata.map((b) => biodataWithRelations(b)) as T[];
  }

  if (sql.includes('from tbl_biodata b') && sql.includes('where b.no_peserta = $1')) {
    const bio = demoBiodata.find((b) => b.no_peserta === params[0]);
    return bio ? ([bio] as T[]) : [];
  }

  if (sql.includes('from tbl_biodata') && sql.includes('where no_peserta = $1')) {
    const bio = demoBiodata.find((b) => b.no_peserta === params[0]);
    return bio ? ([bio] as T[]) : [];
  }

  if (sql.includes('from tbl_riwayat_pendidikan')) {
    const id = Number(params[0]);
    if (sql.includes(' in (')) {
      return demoPendidikan.filter((p) => params.includes(p.id_biodata)) as T[];
    }
    return demoPendidikan.filter((p) => p.id_biodata === id) as T[];
  }

  if (sql.includes('from tbl_riwayat_pekerjaan')) {
    const id = Number(params[0]);
    if (sql.includes(' in (')) {
      return demoPekerjaan.filter((p) => params.includes(p.id_biodata)) as T[];
    }
    return demoPekerjaan.filter((p) => p.id_biodata === id) as T[];
  }

  if (sql.includes('from tbl_riwayat_sertifikat')) {
    const id = Number(params[0]);
    if (sql.includes(' in (')) {
      return demoSertifikat.filter((p) => params.includes(p.id_biodata)) as T[];
    }
    return demoSertifikat.filter((p) => p.id_biodata === id) as T[];
  }

  if (sql.includes('from tbl_riwayat_keluarga')) {
    const id = Number(params[0]);
    if (sql.includes(' in (')) {
      return demoKeluarga.filter((p) => params.includes(p.id_biodata)) as T[];
    }
    return demoKeluarga.filter((k) => k.id_biodata === id) as T[];
  }

  if (sql.includes('from tbl_master_kk_id') || sql.includes('from tbl_master_kk_jp')) {
    return [] as T[];
  }

  if (sql.includes('from tbl_kk_details')) {
    return [] as T[];
  }

  if (sql.includes('count(*)') && sql.includes('tbl_master_kk')) {
    return [{ cnt: 0 }] as T[];
  }

  if (sql.includes('from tbl_master_guest') || sql.includes('from master_guest')) {
    const userName = params[0];
    if (sql.includes('where user_name = $1')) {
      const row = demoGuests.find((g) => g.user_name === userName);
      return row ? ([row] as T[]) : [];
    }
    return demoGuests as T[];
  }

  if (sql.includes('select id_biodata from tbl_biodata')) {
    const bio = demoBiodata.find((b) => b.no_peserta === params[0]);
    return bio ? ([{ id_biodata: bio.id_biodata }] as T[]) : [];
  }

  return [] as T[];
}

export async function demoQueryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await demoQuery<T>(text, params);
  return rows[0] ?? null;
}

export const demoPool = {
  query: async (text: string, params?: unknown[]) => ({
    rows: await demoQuery(text, params ?? []),
  }),
  connect: async () => {
    const client = {
      query: async (text: string, params?: unknown[]) => {
        const t = norm(text);
        if (t === 'begin' || t === 'commit' || t === 'rollback') return { rows: [] };
        return { rows: await demoQuery(text, params ?? []) };
      },
      release: () => undefined,
    };
    return client;
  },
};
