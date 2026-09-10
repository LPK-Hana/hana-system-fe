import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`login-guest:${ip}`, 10, 15 * 60 * 1000)) {
      return rateLimitResponse();
    }

    const body = await request.json();
    const { user_name, user_password } = body;

    if (!user_name || !user_password) {
      console.log('[API][auth][login-guest] missing required fields');
      return NextResponse.json(
        { status: 400, message: 'Login data cannot be empty' },
        { status: 400 }
      );
    }

    const guest = await queryOne<{
      guest_id: number;
      name: string;
      user_name: string;
      password: string;
      is_active: number;
    }>(
      `SELECT guest_id, name, user_name, password, is_active
       FROM tbl_master_guest
       WHERE user_name = $1
       LIMIT 1`,
      [user_name]
    );

    if (!guest) {
      console.log('[API][auth][login-guest] guest not found:', user_name);
      return NextResponse.json(
        { status: 400, message: 'username atau password tidak valid' },
        { status: 400 }
      );
    }

    if (guest.is_active !== 1) {
      return NextResponse.json(
        { status: 400, message: 'akun tidak aktif' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(user_password, guest.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { status: 400, message: 'username atau password tidak valid' },
        { status: 400 }
      );
    }

    const token = signToken({
      guest_id: guest.guest_id,
      user_name: guest.user_name,
      is_admin: 0,
    });

    const responseBody = {
      status: 200,
      message: 'Berhasil login',
      token: token,
      credentials: {
        guest_id: guest.guest_id,
        name: guest.name,
        user_name: guest.user_name,
        is_admin: 0,
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
      value: 'guest',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('[API][auth][login-guest] error:', error.message);
    return NextResponse.json(
      { status: 400, message: 'Invalid request body' },
      { status: 400 }
    );
  }
}
