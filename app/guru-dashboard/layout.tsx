import { redirect } from 'next/navigation';
import { getServerSessionRole } from '@/lib/server-session';

export default async function GuruDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getServerSessionRole();

  if (!role) {
    redirect('/');
  }

  if (role !== 'guru') {
    redirect(
      role === 'admin'
        ? '/admin-dashboard/dashboard'
        : role === 'superadmin'
          ? '/super-admin'
          : role === 'guest'
            ? '/cust-page'
            : '/student-dashboard',
    );
  }

  return <>{children}</>;
}
