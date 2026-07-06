import { NextResponse } from 'next/server';
import { query, queryOne, pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { requireStaff, requireAuth } from '@/lib/api-auth';

async function deleteBiodataByNoPeserta(
  client: { query: (text: string, params?: unknown[]) => Promise<unknown> },
  noPeserta: string,
) {
  const biodata = await client.query(
    `SELECT id_biodata FROM tbl_biodata WHERE no_peserta = $1`,
    [noPeserta],
  ) as { rows: Array<{ id_biodata: number }> };

  const idBiodata = biodata.rows[0]?.id_biodata;
  if (!idBiodata) return;

  await client.query(`DELETE FROM tbl_info_medis WHERE id_biodata = $1`, [idBiodata]);
  await client.query(`DELETE FROM tbl_riwayat_pendidikan WHERE id_biodata = $1`, [idBiodata]);
  await client.query(`DELETE FROM tbl_riwayat_pekerjaan WHERE id_biodata = $1`, [idBiodata]);
  await client.query(`DELETE FROM tbl_riwayat_sertifikat WHERE id_biodata = $1`, [idBiodata]);
  await client.query(`DELETE FROM tbl_riwayat_keluarga WHERE id_biodata = $1`, [idBiodata]);
  await client.query(`DELETE FROM tbl_biodata WHERE id_biodata = $1`, [idBiodata]);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const authResult = await requireStaff();
    if (!authResult.ok) return authResult.response;

    if (action === 'list' || action === 'user-list') {
      const users = await query<any>(
        `SELECT mu.user_id, mu.name, mu.user_name, mu.is_admin, mu.is_active, mu.id_kelas, k.nama_kelas
         FROM master_user mu LEFT JOIN tbl_kelas k ON k.id_kelas = mu.id_kelas ORDER BY mu.user_id`
      );
      const formatted = users.map(u => ({
        id_user: u.user_id, name: u.name, user_name: u.user_name,
        is_admin: u.is_admin, is_active: u.is_active, nama_kelas: u.nama_kelas || ''
      }));
      return NextResponse.json({ status: 200, data: formatted }, { status: 200 });
    }

    if (action === 'list-active') {
      const rows = await query<any>(
        `SELECT mu.user_id, mu.name, mu.user_name, mu.is_admin, mu.is_active, mu.id_kelas, k.nama_kelas
         FROM master_user mu
         LEFT JOIN tbl_kelas k ON k.id_kelas = mu.id_kelas AND k.is_active = 1
         WHERE mu.is_active = 1
         ORDER BY mu.user_name`
      );
      const data = rows.map((u) => ({
        user_id: u.user_id,
        name: u.name,
        user_name: u.user_name,
        is_admin: u.is_admin,
        is_active: u.is_active,
        id_kelas: u.id_kelas,
        kelas: u.nama_kelas || null,
      }));
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    if (action === 'list-inactive') {
      await query(`UPDATE master_user SET id_kelas = NULL WHERE is_active = 0 AND id_kelas IS NOT NULL`);

      const rows = await query<any>(
        `SELECT mu.user_id, mu.name, mu.user_name, mu.is_admin, mu.is_active, mu.id_kelas, k.nama_kelas
         FROM master_user mu
         LEFT JOIN tbl_kelas k ON k.id_kelas = mu.id_kelas
         WHERE mu.is_active = 0
         ORDER BY mu.user_name`
      );
      const data = rows.map((u) => ({
        user_id: u.user_id,
        name: u.name,
        user_name: u.user_name,
        is_admin: u.is_admin,
        is_active: u.is_active,
        id_kelas: u.id_kelas,
        kelas: null,
      }));
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    if (action === 'list-unverif-user') {
      const data = await query<any>(
        `SELECT mu.name, mu.user_name, k.nama_kelas
         FROM master_user mu
         LEFT JOIN tbl_kelas k ON k.id_kelas = mu.id_kelas
         WHERE mu.is_admin = 0 AND mu.is_active = 1
           AND mu.user_name NOT IN (SELECT no_peserta FROM tbl_biodata WHERE no_peserta IS NOT NULL)
         ORDER BY mu.name`
      );
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] user GET error:`, error.message);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const authResult = await requireStaff();
    if (!authResult.ok) return authResult.response;

    const body = await request.json().catch(() => ({}));

    if (action === 'create') {
      let { name, user_name, user_password, is_admin } = body;
      if (!user_name || !user_password) return NextResponse.json({ status: 400, message: 'username dan password wajib diisi' }, { status: 400 });
      if (!name) name = user_name;

      const existing = await queryOne(`SELECT user_id FROM master_user WHERE user_name = $1`, [user_name]);
      if (existing) return NextResponse.json({ status: 400, message: 'username has already been taken' }, { status: 400 });

      const hashedPassword = await bcrypt.hash(user_password, 10);
      await queryOne(
        `INSERT INTO master_user (name, user_name, password, is_admin, is_active) VALUES ($1,$2,$3,$4,$5)`,
        [name, user_name, hashedPassword, is_admin ? 1 : 0, 1]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil membuat user' }, { status: 200 });
    }

    if (action === 'create-batch') {
      const users = body.users || [];
      if (users.length === 0) return NextResponse.json({ status: 400, message: 'users tidak boleh kosong' }, { status: 400 });
      if (users.length > 500) return NextResponse.json({ status: 400, message: 'maksimal 500 user per request' }, { status: 400 });

      for (const u of users) {
        if (!u.user_name || !u.user_password) return NextResponse.json({ status: 400, message: 'username dan password wajib' }, { status: 400 });
        const hashedPassword = await bcrypt.hash(u.user_password, 10);
        await queryOne(
          `INSERT INTO master_user (name, user_name, password, is_admin, is_active) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_name) DO NOTHING`,
          [u.name || u.user_name, u.user_name, hashedPassword, u.is_admin ? 1 : 0, 1]
        );
      }
      return NextResponse.json({ status: 200, message: `Berhasil membuat ${users.length} user` }, { status: 200 });
    }

    if (action === 'detail') {
      const { id_user } = body;
      const data = await queryOne(
        `SELECT user_id, name, user_name, is_admin, is_active, id_kelas FROM master_user WHERE user_id = $1`,
        [id_user],
      );
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] user POST error:`, error.message);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const body = await request.json().catch(() => ({}));

    if (action === 'update-pass-self') {
      const authResult = await requireAuth();
      if (!authResult.ok) return authResult.response;
      const { user_password } = body;
      if (!user_password) return NextResponse.json({ status: 400, message: 'password baru wajib diisi' }, { status: 400 });
      const hashedPassword = await bcrypt.hash(user_password, 10);
      await queryOne(`UPDATE master_user SET password = $1 WHERE user_id = $2`, [hashedPassword, authResult.auth.user_id]);
      return NextResponse.json({ status: 200, message: 'Berhasil update password' }, { status: 200 });
    }

    const authResult = await requireStaff();
    if (!authResult.ok) return authResult.response;

    if (action === 'update-pass') {
      const { id_user, user_password } = body;
      if (!id_user) return NextResponse.json({ status: 400, message: 'invalid user ID' }, { status: 400 });
      if (!user_password) return NextResponse.json({ status: 400, message: 'password baru wajib diisi' }, { status: 400 });
      const hashedPassword = await bcrypt.hash(user_password, 10);
      await queryOne(`UPDATE master_user SET password = $1 WHERE user_id = $2`, [hashedPassword, id_user]);
      return NextResponse.json({ status: 200, message: 'Berhasil update password' }, { status: 200 });
    }

    if (action === 'update-name') {
      const { id_user, name } = body;
      if (!id_user || !name) return NextResponse.json({ status: 400, message: 'id dan nama wajib diisi' }, { status: 400 });
      const user = await queryOne<{ user_name: string }>(`SELECT user_name FROM master_user WHERE user_id = $1`, [id_user]);
      await queryOne(`UPDATE master_user SET name = $1 WHERE user_id = $2`, [name, id_user]);
      if (user) await queryOne(`UPDATE tbl_biodata SET nama_peserta = $1 WHERE no_peserta = $2`, [name, user.user_name]);
      return NextResponse.json({ status: 200, message: 'Berhasil update nama' }, { status: 200 });
    }

    if (action === 'delete') {
      const { id_user, is_active } = body;
      if (Number(is_active) === 0) {
        await queryOne(
          `UPDATE master_user SET is_active = $1, id_kelas = NULL WHERE user_id = $2`,
          [is_active, id_user]
        );
      } else {
        await queryOne(`UPDATE master_user SET is_active = $1 WHERE user_id = $2`, [is_active, id_user]);
      }
      return NextResponse.json({ status: 200, message: 'Berhasil update status aktif' }, { status: 200 });
    }

    if (action === 'hard-delete') {
      const { id_user } = body;
      if (!id_user) {
        return NextResponse.json({ status: 400, message: 'id_user wajib diisi' }, { status: 400 });
      }

      const user = await queryOne<{ user_name: string; is_admin: number }>(
        `SELECT user_name, is_admin FROM master_user WHERE user_id = $1`,
        [id_user],
      );
      if (!user) {
        return NextResponse.json({ status: 404, message: 'User tidak ditemukan' }, { status: 404 });
      }
      if (Number(user.is_admin) === 1) {
        return NextResponse.json({ status: 400, message: 'Tidak dapat menghapus akun admin' }, { status: 400 });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await deleteBiodataByNoPeserta(client, user.user_name);
        await client.query(`DELETE FROM tbl_sub_nilai WHERE user_name = $1`, [user.user_name]);
        await client.query(`DELETE FROM master_user WHERE user_id = $1`, [id_user]);
        await client.query('COMMIT');
        return NextResponse.json({ status: 200, message: 'Berhasil menghapus user' }, { status: 200 });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    if (action === 'assign-kelas') {
      const { id_user, id_kelas } = body;
      await queryOne(`UPDATE master_user SET id_kelas = $1 WHERE user_id = $2`, [id_kelas, id_user]);
      return NextResponse.json({ status: 200, message: 'Berhasil assign kelas' }, { status: 200 });
    }

    if (action === 'bulk-assign-kelas') {
      const user_ids: number[] = body.user_ids ?? body.userIds;
      const id_kelas = body.id_kelas ?? null;
      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return NextResponse.json({ status: 400, message: 'user_ids tidak boleh kosong' }, { status: 400 });
      }
      const placeholders = user_ids.map((_: number, i: number) => `$${i + 2}`).join(',');
      await queryOne(
        `UPDATE master_user SET id_kelas = $1 WHERE user_id IN (${placeholders})`,
        [id_kelas, ...user_ids],
      );
      return NextResponse.json({ status: 200, message: 'Berhasil bulk assign kelas' }, { status: 200 });
    }

    if (action === 'kick-kelas') {
      const { id_user } = body;
      await queryOne(`UPDATE master_user SET id_kelas = NULL WHERE user_id = $1`, [id_user]);
      return NextResponse.json({ status: 200, message: 'Berhasil kick kelas' }, { status: 200 });
    }

    if (action === 'change-kelas') {
      const { id_user, id_kelas } = body;
      await queryOne(`UPDATE master_user SET id_kelas = $1 WHERE user_id = $2`, [id_kelas, id_user]);
      return NextResponse.json({ status: 200, message: 'Berhasil ubah kelas' }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] user PUT error:`, error.message);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}
