import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ status: 200, message: 'Logout berhasil' }, { status: 200 });

  // Hapus cookie HttpOnly yang hanya bisa dihapus dari server
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  response.cookies.set({
    name: 'auth_role',
    value: '',
    httpOnly: false,
    secure,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}
