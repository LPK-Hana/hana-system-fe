import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { isDemoMode } from '@/lib/demo-mode';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`login-superadmin:${ip}`, 10, 15 * 60 * 1000)) {
      return rateLimitResponse();
    }

    const body = await request.json();
    const { user_name, user_password } = body;

    if (!user_name || !user_password) {
      return NextResponse.json(
        { status: 400, message: 'Login data cannot be empty' },
        { status: 400 }
      );
    }

    const sa = await queryOne<{
      super_admin_id: number;
      name: string;
      user_name: string;
      password: string;
      is_active: number;
    }>(
      `SELECT super_admin_id, name, user_name, password, is_active
       FROM tbl_master_super_admin
       WHERE user_name = $1
       LIMIT 1`,
      [user_name]
    );

    if (!sa) {
      console.log('[API][auth][login-superadmin] super admin not found:', user_name);
      return NextResponse.json(
        { status: 400, message: 'username atau password tidak valid' },
        { status: 400 }
      );
    }

    if (sa.is_active !== 1) {
      return NextResponse.json(
        { status: 400, message: 'akun tidak aktif' },
        { status: 400 }
      );
    }

    const isPasswordValid = isDemoMode()
      ? user_password === 'demo'
      : await bcrypt.compare(user_password, sa.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { status: 400, message: 'username atau password tidak valid' },
        { status: 400 }
      );
    }

    const token = signToken({
      super_admin_id: sa.super_admin_id,
      user_name: sa.user_name,
      is_admin: 1,
    });

    const responseBody = {
      status: 200,
      message: 'Login Super Admin berhasil',
      token: token,
      credentials: {
        super_admin_id: sa.super_admin_id,
        name: sa.name,
        user_name: sa.user_name,
        is_active: sa.is_active,
      },
    };

    const response = NextResponse.json(responseBody, { status: 200 });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    response.cookies.set({
      name: 'auth_role',
      value: 'superadmin',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('[API][auth][login-superadmin] error:', error.message);
    return NextResponse.json(
      { status: 400, message: 'Format data tidak valid' },
      { status: 400 }
    );
  }
}
