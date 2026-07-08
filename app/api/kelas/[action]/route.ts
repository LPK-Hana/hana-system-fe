import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

async function getAuthRole() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const auth = await getAuthRole();
    if (!auth) return NextResponse.json({ status: 401, message: 'Unauthorized' }, { status: 401 });

    if (action === 'list') {
      const data = await query<any>(
        `SELECT id_kelas, nama_kelas, is_active, created_at, created_by, edit_at, edit_by, delete_at, delete_by 
         FROM tbl_kelas 
         ORDER BY id_kelas`
      );
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const auth = await getAuthRole();
    if (!auth || auth.is_admin !== 1) return NextResponse.json({ status: 403, message: 'Admin only' }, { status: 403 });

    const body = await request.json().catch(() => ({}));

    if (action === 'create') {
      const { nama_kelas } = body;
      if (!nama_kelas) return NextResponse.json({ status: 400, message: 'nama_kelas required' }, { status: 400 });
      
      await queryOne(
        `INSERT INTO tbl_kelas (nama_kelas, created_by) VALUES ($1, $2)`, 
        [nama_kelas, auth.user_name || null]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil buat kelas' }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const auth = await getAuthRole();
    if (!auth || auth.is_admin !== 1) return NextResponse.json({ status: 403, message: 'Admin only' }, { status: 403 });

    const body = await request.json().catch(() => ({}));

    if (action === 'update') {
      const { id_kelas, nama_kelas } = body;
      if (!id_kelas || !nama_kelas) {
        return NextResponse.json({ status: 400, message: 'id_kelas and nama_kelas required' }, { status: 400 });
      }

      await queryOne(
        `UPDATE tbl_kelas 
         SET nama_kelas = $1, edit_at = CURRENT_TIMESTAMP, edit_by = $2 
         WHERE id_kelas = $3 AND is_active = 1`, 
        [nama_kelas, auth.user_name || null, id_kelas]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil update' }, { status: 200 });
    }

    if (action === 'delete') {
      const { id_kelas } = body;
      if (!id_kelas) {
        return NextResponse.json({ status: 400, message: 'id_kelas required' }, { status: 400 });
      }

      await queryOne(
        `UPDATE tbl_kelas 
         SET is_active = 0, delete_at = CURRENT_TIMESTAMP, delete_by = $1 
         WHERE id_kelas = $2 AND is_active = 1`, 
        [auth.user_name || null, id_kelas]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil hapus/nonaktifkan' }, { status: 200 });
    }

    if (action === 'activate') {
      const { id_kelas } = body;
      if (!id_kelas) {
        return NextResponse.json({ status: 400, message: 'id_kelas required' }, { status: 400 });
      }

      await queryOne(
        `UPDATE tbl_kelas 
         SET is_active = 1, edit_at = CURRENT_TIMESTAMP, edit_by = $1 
         WHERE id_kelas = $2 AND is_active = 0`, 
        [auth.user_name || null, id_kelas]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil aktivasi' }, { status: 200 });
    }

    if (action === 'hard-delete') {
      const { id_kelas } = body;
      if (!id_kelas || Number(id_kelas) <= 0) {
        return NextResponse.json({ status: 400, message: 'id_kelas tidak valid' }, { status: 400 });
      }

      const exists = await queryOne<{ id_kelas: number }>(
        `SELECT id_kelas FROM tbl_kelas WHERE id_kelas = $1`,
        [id_kelas],
      );
      if (!exists) {
        return NextResponse.json({ status: 500, message: 'kelas tidak ditemukan' }, { status: 500 });
      }

      const deleted = await queryOne<{ id_kelas: number }>(
        `DELETE FROM tbl_kelas WHERE id_kelas = $1 RETURNING id_kelas`,
        [id_kelas],
      );
      if (!deleted) {
        return NextResponse.json({ status: 500, message: 'gagal menghapus kelas permanen' }, { status: 500 });
      }

      return NextResponse.json({ status: 200, message: 'Kelas berhasil dihapus permanen' }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}
