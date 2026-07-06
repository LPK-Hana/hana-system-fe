export const ADMIN_HUB_PATH = '/admin-dashboard/dashboard';

export const ADMIN_ALLOWED_PATH_PREFIXES = [
  '/admin-dashboard/dashboard',
  '/admin-dashboard/profil-siswa',
  '/admin-dashboard/add-account',
  '/admin-dashboard/job-management',
  '/admin-dashboard/student-account-management',
  '/admin-dashboard/kartu-keluarga',
  '/admin-dashboard/pemberkasan',
] as const;

export const GURU_ALLOWED_PATH_PREFIXES = [
  '/guru-dashboard',
  '/admin-dashboard/progress-belajar',
] as const;

export const SHACHOU_ALLOWED_PATH_PREFIXES = [
  '/super-admin',
  '/admin-dashboard',
  '/guru-dashboard',
] as const;

export const ADMIN_MENU_ITEMS = [
  { href: '/admin-dashboard/profil-siswa', label: 'Profil Siswa' },
  { href: '/admin-dashboard/add-account', label: 'Buat Akun Siswa' },
  { href: '/admin-dashboard/job-management', label: 'Job Management' },
  { href: '/admin-dashboard/student-account-management', label: 'Student Account Management' },
  { href: '/admin-dashboard/pemberkasan', label: 'Pemberkasan Dokumen' },
] as const;

export const GURU_MENU_ITEMS = [
  { href: '/admin-dashboard/progress-belajar', label: 'Progress Belajar' },
] as const;

export function pathMatchesPrefixes(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAdminAllowedPath(pathname: string): boolean {
  return pathMatchesPrefixes(pathname, ADMIN_ALLOWED_PATH_PREFIXES);
}

export function isGuruAllowedAdminPath(pathname: string): boolean {
  return pathMatchesPrefixes(pathname, GURU_ALLOWED_PATH_PREFIXES);
}

export function isShachouAllowedPath(pathname: string): boolean {
  return pathMatchesPrefixes(pathname, SHACHOU_ALLOWED_PATH_PREFIXES);
}
