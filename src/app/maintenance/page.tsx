import { createAdminClient } from '@/lib/supabase/admin';
import { HardHat } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function MaintenancePage() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from('admin_settings').select('is_maintenance_mode').single();
  
  if (!settings?.is_maintenance_mode) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        {/* Icon / Brand */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-black flex items-center justify-center shadow-2xl shadow-black/20 animate-pulse">
            <HardHat className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black sm:text-5xl">
            System <br /> Improvement
          </h1>
          <p className="text-lg text-foreground/60 font-medium leading-relaxed">
            MNIT Marketplace is currently undergoing scheduled maintenance to improve your trading experience.
            We&apos;ll be back online shortly.
          </p>
        </div>

        <div className="pt-20 text-[10px] font-bold uppercase tracking-widest text-foreground/20">
          MNIT Marketplace &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
