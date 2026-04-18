import Link from "next/link";
import { LogIn, UserCircle, LogOut } from "lucide-react";
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/lib/auth-actions';

import MobileNav from "./MobileNav";

export default async function NavBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let dbUser = null;
  if (user) {
    const { data } = await supabase.from('users').select('is_admin, is_employee').eq('id', user.id).single();
    dbUser = data;
  }

  return (
    <header className="fixed top-0 inset-x-0 h-16 z-50 bg-background bento-border-b">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-lg sm:text-xl display-title tracking-tight flex items-center gap-1.5 sm:gap-2">
          <span className="bg-primary-600 text-white px-1.5 sm:px-2 py-0.5 rounded-sm">MNIT</span>
          <span className="text-foreground hidden sm:inline">MARKETPLACE</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-bold text-xs uppercase tracking-widest text-foreground/70">
          <Link href="/market" className="hover:text-primary-600 transition-colors">Market</Link>
          <Link href="/about" className="hover:text-primary-600 transition-colors">How it Works</Link>
          
          {user && (
            <Link href="/profile" className="hover:text-primary-600 transition-colors text-primary-600">
              Profile & Listings
            </Link>
          )}

          {dbUser?.is_employee && (
             <Link href="/employee" className="hover:text-accent transition-colors text-accent">
               Desk
             </Link>
          )}
        </nav>

        {/* Auth Buttons (Desktop) & Mobile Menu */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <form action={signOut}>
                <button 
                  type="submit"
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-none bg-foreground/5 text-foreground font-bold hover:bg-foreground hover:text-background transition-all text-[10px] sm:text-xs uppercase tracking-widest bento-border"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </form>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-none bg-primary-600 text-white font-bold hover:bg-primary-900 transition-all text-[10px] sm:text-xs uppercase tracking-widest"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Student Login</span>
              </Link>
            )}
          </div>
          
          <MobileNav user={user} dbUser={dbUser} />
        </div>
      </div>
    </header>
  );
}
