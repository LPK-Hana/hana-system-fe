import { Pool } from 'pg';
import { isDemoMode } from '@/lib/demo-mode';
import { demoPool, demoQuery, demoQueryOne } from '@/lib/demo/db';

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const realPool =
  globalForDb.pool ??
  new Pool({
    host: process.env.DB_HOST_POSTGRES,
    user: process.env.DB_USER_POSTGRES,
    port: Number(process.env.DB_PORT_POSTGRES) || 5432,
    password: process.env.DB_PW_POSTGRES,
    database: process.env.DB_NAME_POSTGRES,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== 'production' && !isDemoMode()) {
  globalForDb.pool = realPool;
}

if (!isDemoMode()) {
  realPool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err.message);
  });
}

export const pool = isDemoMode() ? (demoPool as unknown as Pool) : realPool;

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (isDemoMode()) {
    return demoQuery<T>(text, params);
  }
  const result = await realPool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  if (isDemoMode()) {
    return demoQueryOne<T>(text, params);
  }
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export default pool;
