import { redirect } from 'next/navigation';
import { GURU_HOME_PATH } from '@/lib/roles';

export default function GuruDashboardPage() {
  redirect(GURU_HOME_PATH);
}
