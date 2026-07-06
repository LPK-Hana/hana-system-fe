import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSessionRole } from '@/lib/server-session';
import {
  ADMIN_HUB_PATH,
  isAdminAllowedPath,
  isGuruAllowedAdminPath,
  isShachouAllowedPath,
} from '@/lib/roles';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getServerSessionRole();
  const pathname = (await headers()).get('x-pathname') ?? '';

  if (!role) {
    redirect('/');
  }

  if (role === 'superadmin') {
    if (isShachouAllowedPath(pathname) && pathname.startsWith('/admin-dashboard')) {
      return <>{children}</>;
    }
    redirect('/super-admin');
  }

  if (role === 'guru') {
    if (isGuruAllowedAdminPath(pathname)) {
      return <>{children}</>;
    }
    redirect('/guru-dashboard');
  }

  if (role === 'admin') {
    if (!isAdminAllowedPath(pathname)) {
      redirect(ADMIN_HUB_PATH);
    }
    return <>{children}</>;
  }

  redirect(role === 'guest' ? '/cust-page' : '/student-dashboard');
}
