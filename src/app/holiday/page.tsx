import { createClient } from '@/lib/supabase/server';
import { Palmtree, Calendar, Mail } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Holiday Break Notice',
  description: 'MNIT Marketplace is currently on a holiday break. Transactions and listings are temporarily suspended. We will return soon!',
};

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default async function HolidayPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('admin_settings').select('holiday_message').single();

  const message = settings?.holiday_message || "MNIT Marketplace is closed for the holiday break. See you soon!";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px] animate-pulse" />

      <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
        {/* Iconic Header */}
        <div className="space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-black/5 mx-auto">
              <Palmtree className="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground italic">
              Holiday <span className="text-emerald-600">Break</span>
            </h1>
            <div className="flex items-center justify-center gap-2 overflow-hidden">
              <div className="h-px w-8 bg-foreground/10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Marketplace Suspended</p>
              <div className="h-px w-8 bg-foreground/10" />
            </div>
          </div>
        </div>

        {/* Custom Message Card */}
        <div className="glass-card p-10 md:p-16 rounded-[40px] border-2 border-black/5 shadow-2xl relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="space-y-8">
            <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground/80 italic">
              "{message}"
            </p>

            <div className="pt-8 border-t border-black/5 flex flex-wrap justify-center gap-10">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2">Status</p>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-700 rounded-full border border-amber-500/10">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Closed for Break</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2">Support</p>
                <div className="flex items-center gap-3">
                  <Link href="https://www.instagram.com/mnitmarketplace/" className="hover:text-emerald-600 transition-colors">
                    <InstagramIcon />
                  </Link>
                  <Link href="mailto:mnitmarketplace@gmail.com" className="hover:text-emerald-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Shortcut */}
        <div className="space-y-4">
          <p className="text-xs text-foreground/40 font-medium tracking-tight">
            Transactions will resume automatically when we return.
          </p>
        </div>
      </div>
    </div>
  );
}
