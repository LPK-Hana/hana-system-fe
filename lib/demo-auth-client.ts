'use client';

import { saveAuthSession } from '@/lib/auth';
import { clearKkDemo } from '@/lib/kk-demo-storage';

import { DEMO_STUDENT_USERNAME } from '@/lib/nim';

export type DemoRole = 'student' | 'admin' | 'superadmin' | 'guest' | 'guru';

const DEMO_PROFILES: Record<
  DemoRole,
  {
    displayName: string;
    userName: string;
    authRole: string;
    redirect: string;
    userId?: number;
    guestId?: number;
    superAdminId?: number;
  }
> = {
  student: {
    displayName: 'Budi Santoso',
    userName: DEMO_STUDENT_USERNAME,
    authRole: 'student',
    redirect: '/student-dashboard',
    userId: 101,
  },
  admin: {
    displayName: 'Admin Hana',
    userName: 'admin',
    authRole: 'admin',
    redirect: '/admin-dashboard/dashboard',
    userId: 1,
  },
  superadmin: {
    displayName: 'Shachou Hana',
    userName: 'shachou',
    authRole: 'superadmin',
    redirect: '/super-admin',
    superAdminId: 1,
  },
  guru: {
    displayName: 'Pak Andi Wijaya',
    userName: 'guru',
    authRole: 'guru',
    redirect: '/guru-dashboard',
    userId: 50,
  },
  guest: {
    displayName: 'Guest Showcase',
    userName: 'guest',
    authRole: 'guest',
    redirect: '/cust-page',
    guestId: 1,
  },
};

/** Login demo murni di browser — tanpa panggilan /api/auth/demo */
export function enterDemoRole(role: DemoRole): { redirect: string } {
  const profile = DEMO_PROFILES[role];
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  const payload = btoa(
    JSON.stringify({
      role: profile.authRole,
      user_name: profile.userName,
      exp,
    }),
  );
  const token = `demo.${payload}`;

  saveAuthSession(token, profile.authRole, profile.userName, {
    userId: profile.userId ?? profile.guestId,
    name: profile.displayName,
  });

  if (role === 'student') {
    clearKkDemo(profile.userName);
  }

  try {
    sessionStorage.setItem('hana_demo_entering', '1');
  } catch {
    /* ignore */
  }

  return { redirect: profile.redirect };
}
