import jwt from 'jsonwebtoken';
import { resolveDemoMode } from '@/lib/demo-mode';

const DEMO_JWT_FALLBACK = 'hana-mockup-demo-jwt-secret';

export interface JwtPayload {
  user_id?: number;
  guest_id?: number;
  super_admin_id?: number;
  user_name?: string;
  is_admin?: number;
  is_guru?: number;
  exp?: number;
  iat?: number;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (resolveDemoMode()) return DEMO_JWT_FALLBACK;
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Validasi token JWT.
 * Gunakan ini di API Routes (Node.js runtime).
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function signToken(payload: object, expiresIn: string | number = '24h'): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}
