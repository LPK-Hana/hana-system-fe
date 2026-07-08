import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo-mode';
import { signToken } from '@/lib/jwt';
import { DEMO_STUDENT_USERNAME } from '@/lib/demo/seed';

export type DemoRole = 'student' | 'admin' | 'superadmin' | 'guest' | 'guru';

const DEMO_PROFILES: Record<
  DemoRole,
  {
    tokenPayload: Record<string, unknown>;
    cookieRole: string;
    credentials: Record<string, unknown>;
    displayName: string;
    userName: string;
    authRole: string | number;
    redirect: string;
  }
> = {
  student: {
    tokenPayload: { user_id: 101, user_name: DEMO_STUDENT_USERNAME, is_admin: 0 },
    cookieRole: 'student',
    credentials: { user_id: 101, name: 'Budi Santoso', user_name: DEMO_STUDENT_USERNAME, is_admin: 0 },
    displayName: 'Budi Santoso',
    userName: DEMO_STUDENT_USERNAME,
    authRole: 'student',
    redirect: '/student-dashboard',
  },
  admin: {
    tokenPayload: { user_id: 1, user_name: 'admin', is_admin: 1 },
    cookieRole: 'admin',
    credentials: { user_id: 1, name: 'Admin Hana', user_name: 'admin', is_admin: 1 },
    displayName: 'Admin Hana',
    userName: 'admin',
    authRole: 'admin',
    redirect: '/admin-dashboard/dashboard',
  },
  superadmin: {
    tokenPayload: { super_admin_id: 1, user_name: 'shachou', is_admin: 1 },
    cookieRole: 'superadmin',
    credentials: {
      super_admin_id: 1,
      name: 'Shachou Hana',
      user_name: 'shachou',
      is_active: 1,
    },
    displayName: 'Shachou Hana',
    userName: 'shachou',
    authRole: 'superadmin',
    redirect: '/super-admin',
  },
  guru: {
    tokenPayload: { user_id: 50, user_name: 'guru', is_admin: 0, is_guru: 1 },
    cookieRole: 'guru',
    credentials: { user_id: 50, name: 'Pak Andi Wijaya', user_name: 'guru', is_guru: 1 },
    displayName: 'Pak Andi Wijaya',
    userName: 'guru',
    authRole: 'guru',
    redirect: '/guru-dashboard',
  },
  guest: {
    tokenPayload: { guest_id: 1, user_name: 'guest', is_admin: 0 },
    cookieRole: 'guest',
    credentials: { guest_id: 1, name: 'Guest Showcase', user_name: 'guest' },
    displayName: 'Guest Showcase',
    userName: 'guest',
    authRole: 'guest',
    redirect: '/cust-page',
  },
};

export async function POST(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json({ status: 403, message: 'Demo mode tidak aktif' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const role = body.role as DemoRole;

    if (!role || !DEMO_PROFILES[role]) {
      return NextResponse.json({ status: 400, message: 'Role demo tidak valid' }, { status: 400 });
    }

    const profile = DEMO_PROFILES[role];
    const token = signToken(profile.tokenPayload);

    const responseBody = {
      status: 200,
      message: `Demo ${role} berhasil`,
      token,
      credentials: profile.credentials,
      redirect: profile.redirect,
      role: profile.authRole,
      displayName: profile.displayName,
      userName: profile.userName,
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
      value: profile.cookieRole,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal masuk demo';
    return NextResponse.json({ status: 500, message }, { status: 500 });
  }
}
