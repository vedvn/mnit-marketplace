import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Desk',
  description: 'MNIT Marketplace employee dashboard for listing moderation and dispute resolution.',
};
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ClientEmployee from './ClientEmployee';
import PasswordForm from '@/components/PasswordForm';
import { verifyEmployeePassword } from '@/lib/panel-actions';

export default async function EmployeePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('users').select('is_employee, is_admin').eq('id', user.id).single();

  if (!profile || (!profile.is_employee && !profile.is_admin)) {
    redirect('/'); // Only Employees or Admins
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get('employee_auth')?.value;
  const isAuthorized = authCookie === process.env.EMPLOYEE_PANEL_PASSWORD;

  if (!isAuthorized) {
    return <PasswordForm title="Employee Central" action={verifyEmployeePassword} />;
  }

  return <ClientEmployee />;
}
