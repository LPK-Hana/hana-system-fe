import { jwtVerify } from 'jose';
import type { JwtPayload } from './jwt';
import { resolveDemoMode } from './demo-mode';
import { parseDemoToken } from './demo-token';

const DEMO_JWT_FALLBACK = 'hana-mockup-demo-jwt-secret';

export function getJwtSecretEdge(): string | null {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (resolveDemoMode()) return DEMO_JWT_FALLBACK;
  return null;
}

export async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  if (resolveDemoMode() && token.startsWith('demo.')) {
    return parseDemoToken(token);
  }
  const secret = getJwtSecretEdge();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function getSessionRoleFromPayload(auth: JwtPayload): 'admin' | 'student' | 'guest' | 'superadmin' | 'guru' {
  if (auth.super_admin_id) return 'superadmin';
  if (auth.guest_id) return 'guest';
  if (auth.is_guru === 1) return 'guru';
  if (auth.is_admin === 1) return 'admin';
  return 'student';
}
