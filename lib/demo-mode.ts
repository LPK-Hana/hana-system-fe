function isExplicitDemoOff(): boolean {
  return process.env.DEMO_MODE === '0' || process.env.NEXT_PUBLIC_DEMO_MODE === '0';
}

function isExplicitDemoOn(): boolean {
  return process.env.DEMO_MODE === '1' || process.env.NEXT_PUBLIC_DEMO_MODE === '1';
}

/** Database Postgres dikonfigurasi (bukan mockup FE saja). */
export function hasDatabaseConfigured(): boolean {
  const host = process.env.DB_HOST_POSTGRES?.trim();
  const user = process.env.DB_USER_POSTGRES?.trim();
  return Boolean(host && user);
}

/** Aktifkan demo: env eksplisit, atau otomatis bila belum ada koneksi DB. */
export function resolveDemoMode(): boolean {
  if (isExplicitDemoOff()) return false;
  if (isExplicitDemoOn()) return true;
  return !hasDatabaseConfigured();
}

export function isDemoMode(): boolean {
  return resolveDemoMode();
}

/** Client — nilai di-bake lewat next.config `env` saat build. */
export function isDemoModeClient(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === '1';
}
