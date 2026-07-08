import type { JwtPayload } from '@/lib/jwt';

type DemoTokenPayload = {
  role?: string;
  user_name?: string;
  exp?: number;
};

/** Parse token `demo.<base64>` dari login mockup FE. */
export function parseDemoToken(token: string): JwtPayload | null {
  if (!token.startsWith('demo.')) return null;
  try {
    const b64 = token.slice(5);
    const json = JSON.parse(
      typeof Buffer !== 'undefined'
        ? Buffer.from(b64, 'base64').toString('utf8')
        : atob(b64),
    ) as DemoTokenPayload;

    if (json.exp && Date.now() / 1000 > json.exp) return null;

    const user_name = json.user_name || '';
    const base = { user_name };

    switch (json.role) {
      case 'student':
        return { ...base, user_id: 101, is_admin: 0 };
      case 'admin':
        return { ...base, user_id: 1, is_admin: 1 };
      case 'guru':
        return { ...base, user_id: 50, is_admin: 0, is_guru: 1 };
      case 'superadmin':
        return { ...base, super_admin_id: 1, is_admin: 1 };
      case 'guest':
        return { ...base, guest_id: 1, is_admin: 0 };
      default:
        return null;
    }
  } catch {
    return null;
  }
}
