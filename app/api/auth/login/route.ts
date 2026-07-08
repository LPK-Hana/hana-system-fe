import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { isDemoMode } from '@/lib/demo-mode';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
      return rateLimitResponse();
    }

    const body = await request.json();
    const { user_name, user_password } = body;

    if (!user_name || !user_password) {
      console.log('[API][auth][login] missing required fields');
      return NextResponse.json(
        { status: 400, message: 'Login data cannot be empty' },
        { status: 400 }
      );
    }

    // Query langsung ke PostgreSQL — sama seperti backend Golang
    const user = await queryOne<{
      user_id: number;
      name: string;
      user_name: string;
      password: string;
      is_admin: number;
      is_active: number;
    }>(
      `SELECT user_id, name, user_name, password, is_admin, is_active
       FROM master_user
       WHERE user_name = $1
       LIMIT 1`,
      [user_name]
    );

    if (!user) {
      console.log('[API][auth][login] user not found:', user_name);
      return NextResponse.json(
        { status: 400, message: 'username atau password tidak valid' },
        { status: 400 }
      );
    }

    if (user.is_active !== 1) {
      return NextResponse.json(
        { status: 400, message: 'akun tidak aktif' },
        { status: 400 }
      );
    }

    const isPasswordValid = isDemoMode()
      ? user_password === 'demo'
      : await bcrypt.compare(user_password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { status: 400, message: 'username atau password tidak valid' },
        { status: 400 }
      );
    }

    const token = signToken({
      user_id: user.user_id,
      user_name: user.user_name,
      is_admin: user.is_admin,
    });

    const responseBody = {
      status: 200,
      message: 'Berhasil login',
      token: token,
      credentials: {
        user_id: user.user_id,
        name: user.name,
        user_name: user.user_name,
        is_admin: user.is_admin,
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
      value: user.is_admin === 1 ? 'admin' : 'student',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('[API][auth][login] error:', error.message);
    return NextResponse.json(
      { status: 400, message: 'Invalid request body' },
      { status: 400 }
    );
  }
}
