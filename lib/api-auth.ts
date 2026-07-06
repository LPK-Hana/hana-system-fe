import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken, type JwtPayload } from '@/lib/jwt';
import { getSessionRoleFromPayload } from '@/lib/jwt-edge';
import { parseDemoToken } from '@/lib/demo-token';
import { resolveDemoMode } from '@/lib/demo-mode';

export type AuthResult =
  | { ok: true; auth: JwtPayload }
  | { ok: false; response: NextResponse };

export async function getAuth(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  let token = cookieStore.get('auth_token')?.value;

  if (!token) {
    const { headers } = await import('next/headers');
    const hdrs = await headers();
    const authHeader = hdrs.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  if (resolveDemoMode() && token.startsWith('demo.')) {
    return parseDemoToken(token);
  }

  return verifyToken(token);
}

export function isAdmin(auth: JwtPayload): boolean {
  return auth.is_admin === 1 && !auth.guest_id && !auth.super_admin_id && auth.is_guru !== 1;
}

export function isGuru(auth: JwtPayload): boolean {
  return auth.is_guru === 1 && !auth.guest_id && !auth.super_admin_id;
}

export function isSuperAdmin(auth: JwtPayload): boolean {
  return !!auth.super_admin_id;
}

/** Admin biasa atau Shachou — akses modul administrasi. */
export function hasAdminPrivileges(auth: JwtPayload): boolean {
  return isAdmin(auth) || isSuperAdmin(auth);
}

export function isStaff(auth: JwtPayload): boolean {
  return isAdmin(auth) || isGuru(auth) || isSuperAdmin(auth);
}

export function isGuest(auth: JwtPayload): boolean {
  return !!auth.guest_id;
}

export function getSessionRole(auth: JwtPayload) {
  return getSessionRoleFromPayload(auth);
}

export async function requireAuth(): Promise<AuthResult> {
  const auth = await getAuth();
  if (!auth) {
    return { ok: false, response: NextResponse.json({ status: 401, message: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true, auth };
}

export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireAuth();
  if (!result.ok) return result;
  if (!hasAdminPrivileges(result.auth)) {
    return { ok: false, response: NextResponse.json({ status: 403, message: 'Admin only' }, { status: 403 }) };
  }
  return result;
}

export async function requireStaff(): Promise<AuthResult> {
  const result = await requireAuth();
  if (!result.ok) return result;
  if (!isStaff(result.auth)) {
    return { ok: false, response: NextResponse.json({ status: 403, message: 'Staff only' }, { status: 403 }) };
  }
  return result;
}

export async function requireSuperAdmin(): Promise<AuthResult> {
  const result = await requireAuth();
  if (!result.ok) return result;
  if (!isSuperAdmin(result.auth)) {
    return { ok: false, response: NextResponse.json({ status: 403, message: 'Shachou only' }, { status: 403 }) };
  }
  return result;
}

export async function requireGuestOrAdmin(): Promise<AuthResult> {
  const result = await requireAuth();
  if (!result.ok) return result;
  if (isGuest(result.auth) || hasAdminPrivileges(result.auth)) {
    return result;
  }
  return { ok: false, response: NextResponse.json({ status: 403, message: 'Forbidden' }, { status: 403 }) };
}

export function denyUnlessOwnerOrAdmin(auth: JwtPayload, noPeserta: string): NextResponse | null {
  if (isStaff(auth)) return null;
  const owner = (auth.user_name || '').toUpperCase();
  if (owner && owner === noPeserta.toUpperCase()) return null;
  return NextResponse.json({ status: 403, message: 'Forbidden' }, { status: 403 });
}
