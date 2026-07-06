import { redirect } from 'next/navigation';
import { getServerSessionRole } from '@/lib/server-session';

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getServerSessionRole();

  if (!role) {
    redirect('/');
  }

  if (role !== 'student') {
    redirect(
      role === 'admin'
        ? '/admin-dashboard/dashboard'
        : role === 'guest'
          ? '/cust-page'
          : role === 'guru'
            ? '/guru-dashboard'
            : '/super-admin',
    );
  }

  return <>{children}</>;
}
