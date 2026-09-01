import { redirect } from 'next/navigation';
import { getServerSessionRole } from '@/lib/server-session';
import { GURU_HOME_PATH } from '@/lib/roles';

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
            ? GURU_HOME_PATH
            : '/super-admin',
    );
  }

  return <>{children}</>;
}
