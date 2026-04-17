import { ShieldBan, Home } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/lib/auth-actions';

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
      <div className="max-w-md w-full relative z-10 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-8 animate-pulse">
          <ShieldBan className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tight mb-4 text-red-500">ACCOUNT BANNED</h1>
        <p className="text-foreground/80 mb-8 leading-relaxed">
          Your account has been permanently restricted from accessing the MNIT Marketplace due to severe violations of our Terms of Service (e.g. fraudulent listings, ghosting handovers, or scamming). 
        </p>
        <p className="text-foreground/50 text-sm mb-12">
          This action is final and cannot be appealed.
        </p>

        <form action={signOut} className="w-full">
          <button type="submit" className="w-full py-4 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors font-bold text-gray-800">
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
