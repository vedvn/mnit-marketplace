import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ClientAdmin from './ClientAdmin';
import PasswordForm from '@/components/PasswordForm';
import { verifyAdminPassword } from '@/lib/panel-actions';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();

  if (!profile || !profile.is_admin) {
    redirect('/'); // Only Admins
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth')?.value;
  const isAuthorized = authCookie === process.env.ADMIN_PANEL_PASSWORD;

  if (!isAuthorized) {
    return <PasswordForm title="Super Admin Control" action={verifyAdminPassword} />;
  }

  // Trigger Janitor on admin visit (cleanup & archiving)
  const { runSystemJanitor } = await import('@/lib/admin-janitor');
  runSystemJanitor(); // Run in background

  return <ClientAdmin />;
}
