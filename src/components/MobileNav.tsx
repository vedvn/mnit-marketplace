'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth-actions';

export default function MobileNav({ user, dbUser }: { user: any, dbUser: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center xl:ml-0 ml-4">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 text-foreground">
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white bento-border-b shadow-2xl px-6 py-6 flex flex-col gap-6 text-sm font-bold uppercase tracking-widest text-foreground z-50">
          <Link href="/market" onClick={() => setIsOpen(false)} className="hover:text-primary-600 transition-colors">Market</Link>
          <Link href="/notes" onClick={() => setIsOpen(false)} className="hover:text-primary-600 transition-colors">Notes</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-primary-600 transition-colors">How it Works</Link>
          {user && <Link href="/profile" onClick={() => setIsOpen(false)} className="text-primary-600">Profile & Listings</Link>}
          {dbUser?.is_employee && <Link href="/employee" onClick={() => setIsOpen(false)} className="text-accent">Desk</Link>}
          {dbUser?.is_admin && <Link href="/admin" onClick={() => setIsOpen(false)} className="text-amber-500">Admin</Link>}
          
          <div className="pt-4 border-t border-black/5 mt-auto">
            {!user ? (
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-3 bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all text-sm bento-border"
              >
                <LogIn className="w-4 h-4" /> Student Login
              </Link>
            ) : (
              <form action={signOut}>
                <button 
                  type="submit"
                  className="w-full flex items-center gap-2 px-4 py-3 bg-foreground/5 text-foreground font-bold hover:bg-foreground hover:text-white transition-all text-sm bento-border"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
