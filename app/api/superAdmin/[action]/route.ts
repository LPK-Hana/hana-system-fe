import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { requireSuperAdmin } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const authResult = await requireSuperAdmin();
    if (!authResult.ok) return authResult.response;
    const auth = authResult.auth;

    const url = new URL(request.url);

    if (action === 'list') {
      const isActiveParam = url.searchParams.get('is_active');
      let sql = `
        SELECT user_id, name, user_name, is_active, 
               COALESCE(createdt::text, '') as createdt, 
               COALESCE(updatedt::text, '') as updatedt
        FROM master_user
        WHERE is_admin = 1
      `;
      const args: any[] = [];
      if (isActiveParam !== null && isActiveParam !== undefined) {
        sql += ` AND is_active = $1`;
        args.push(Number(isActiveParam));
      }
      sql += ` ORDER BY user_id DESC`;

      const data = await query<any>(sql, args);
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
    const authResult = await requireSuperAdmin();
    if (!authResult.ok) return authResult.response;
    const auth = authResult.auth;

    const body = await request.json().catch(() => ({}));

    if (action === 'create') {
      const { name, user_name } = body;
      const password = body.password || body.user_password;
      if (!user_name || !password) {
        return NextResponse.json({ status: 400, message: 'username dan password wajib diisi' }, { status: 400 });
      }

      const existing = await queryOne(`SELECT user_id FROM master_user WHERE user_name = $1`, [user_name]);
      if (existing) {
        return NextResponse.json({ status: 400, message: 'Username sudah terdaftar' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        `INSERT INTO master_user (name, user_name, password, is_admin, is_active) VALUES ($1, $2, $3, 1, 1)`,
        [name || user_name, user_name, hashedPassword]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil membuat Admin' }, { status: 200 });
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
    const authResult = await requireSuperAdmin();
    if (!authResult.ok) return authResult.response;
    const auth = authResult.auth;

    const body = await request.json().catch(() => ({}));
    const userId = body.user_id !== undefined ? body.user_id : body.id_user;

    if (action === 'edit-status') {
      if (userId === undefined) {
        return NextResponse.json({ status: 400, message: 'user_id required' }, { status: 400 });
      }
      await query(
        `UPDATE master_user
         SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
             updatedt = CURRENT_TIME
         WHERE user_id = $1 AND is_admin = 1`,
        [userId]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil update status' }, { status: 200 });
    }

    if (action === 'update-name') {
      const { name } = body;
      const userName = body.user_name || body.userName;
      if (userId === undefined || !name || !userName) {
        return NextResponse.json({ status: 400, message: 'user_id, name, and user_name required' }, { status: 400 });
      }

      const existing = await queryOne(
        `SELECT 1 FROM master_user WHERE user_name = $1 AND user_id != $2 LIMIT 1`,
        [userName, userId]
      );
      if (existing) {
        return NextResponse.json({ status: 400, message: 'Username sudah terdaftar' }, { status: 400 });
      }

      await query(
        `UPDATE master_user 
         SET name = $1, user_name = $2, updatedt = CURRENT_TIME 
         WHERE user_id = $3 AND is_admin = 1`,
        [name, userName, userId]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil update nama' }, { status: 200 });
    }

    if (action === 'update-password') {
      const password = body.password || body.user_password;
      if (userId === undefined || !password) {
        return NextResponse.json({ status: 400, message: 'user_id and password required' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        `UPDATE master_user 
         SET password = $1, updatedt = CURRENT_TIME 
         WHERE user_id = $2 AND is_admin = 1`,
        [hashedPassword, userId]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil update password' }, { status: 200 });
    }

    if (action === 'delete') {
      if (userId === undefined) {
        return NextResponse.json({ status: 400, message: 'user_id required' }, { status: 400 });
      }

      await query(
        `DELETE FROM master_user
         WHERE user_id = $1 AND is_admin = 1`,
        [userId]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil menghapus Admin' }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}
