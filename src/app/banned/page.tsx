import { ShieldBan, Clock, AlertTriangle } from 'lucide-react';
import { signOut } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase/server';
import BanTimer from '@/components/BanTimer';
import { redirect } from 'next/navigation';

export default async function BannedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('is_banned, banned_until')
    .eq('id', user.id)
    .single();

  // If not banned, they shouldn't be here
  if (!profile?.is_banned) redirect('/market');

  const isPermanent = !profile.banned_until;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className={`absolute inset-0 ${isPermanent ? 'bg-red-500/5' : 'bg-amber-500/5'} pointer-events-none`} />
      
      <div className="max-w-md w-full relative z-10 flex flex-col items-center text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${isPermanent ? 'bg-red-500/10 animate-pulse' : 'bg-amber-500/10'}`}>
          {isPermanent ? <ShieldBan className="w-12 h-12 text-red-500" /> : <Clock className="w-12 h-12 text-amber-500" />}
        </div>
        
        <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mb-4 ${isPermanent ? 'text-red-500' : 'text-amber-600'}`}>
          {isPermanent ? 'ACCOUNT BANNED' : 'ACCOUNT SUSPENDED'}
        </h1>

        <div className="space-y-6 mb-12">
          <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
            {isPermanent 
              ? "Your account has been permanently restricted from accessing the MNIT Marketplace due to severe violations of our Terms of Service."
              : "Your account has been temporarily suspended for a policy violation. Access to buying and selling features is currently restricted."
            }
          </p>

          {profile.banned_until && (
            <BanTimer expiry={profile.banned_until} />
          )}

          {isPermanent && (
            <p className="text-foreground/50 text-xs uppercase font-bold tracking-widest">
              This action is final and cannot be appealed.
            </p>
          )}
        </div>

        <form action={signOut} className="w-full">
          <button type="submit" className="w-full py-4 rounded-xl bg-foreground/5 border border-black/5 hover:bg-foreground hover:text-white transition-all font-bold text-foreground hover:shadow-xl">
            Logout
          </button>
        </form>

        <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/30">
          <AlertTriangle className="w-3 h-3" /> Strict Policy Enforcement
        </div>
      </div>
    </div>
  );
}
