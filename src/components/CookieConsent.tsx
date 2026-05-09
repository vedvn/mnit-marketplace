'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Cookie, X, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has already made a PERSISTENT choice (Accept All)
    const persistentConsent = localStorage.getItem('mnit_cookie_consent');
    // Check if user has already made a SESSION-ONLY choice (Essential Only)
    const sessionConsent = sessionStorage.getItem('mnit_cookie_session_consent');
    
    if (!persistentConsent && !sessionConsent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('mnit_cookie_consent', 'accepted_all');
    setIsVisible(false);
    window.dispatchEvent(new Event('cookie-consent-given'));
  };

  const handleAcceptNecessary = () => {
    // Save to sessionStorage only - will ask again when browser/tab is closed and reopened
    sessionStorage.setItem('mnit_cookie_session_consent', 'accepted_necessary');
    setIsVisible(false);
  };

  if (pathname.startsWith('/admin') || pathname.startsWith('/employee')) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 z-9999 sm:w-[360px] pointer-events-auto"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-black/10 shadow-2xl rounded-[32px] p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-bold text-lg tracking-tight">Cookies?</h3>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-foreground/20 hover:text-foreground/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-foreground/60 leading-relaxed font-medium">
              We use internal analytics to improve your experience. No third-party tracking or ads.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleAcceptAll}
                className="w-full py-3.5 bg-foreground text-background rounded-2xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Allow All
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAcceptNecessary}
                  className="py-3 px-4 rounded-2xl bg-foreground/5 text-foreground/50 text-[10px] font-bold hover:bg-foreground/10 hover:text-foreground transition-all"
                >
                  Essential Only
                </button>
                <Link
                  href="/privacy"
                  className="py-3 px-4 rounded-2xl bg-foreground/5 text-foreground/50 text-[10px] font-bold text-center hover:bg-foreground/10 hover:text-foreground transition-all"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 justify-center opacity-20">
              <Shield className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Hub</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
