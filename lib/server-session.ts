import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getSessionRoleFromPayload } from '@/lib/jwt-edge';
import { resolveDemoMode } from '@/lib/demo-mode';

export type AppRole = 'admin' | 'student' | 'guest' | 'superadmin' | 'guru';

const VALID_ROLES: AppRole[] = ['admin', 'student', 'guest', 'superadmin', 'guru'];

/** Role sesi untuk Server Component / layout — selaras dengan middleware demo. */
export async function getServerSessionRole(): Promise<AppRole | null> {
  const cookieStore = await cookies();

  if (resolveDemoMode()) {
    const role = cookieStore.get('auth_role')?.value;
    if (role && VALID_ROLES.includes(role as AppRole)) {
      return role as AppRole;
    }
    return null;
  }

  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  const auth = verifyToken(token);
  if (!auth) return null;

  return getSessionRoleFromPayload(auth);
}
