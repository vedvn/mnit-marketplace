'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('mnit_cookie_consent');
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mnit_cookie_consent', 'accepted');
    setIsVisible(false);
    // Dispatch a custom event so the AnalyticsTracker knows it can start
    window.dispatchEvent(new Event('cookie-consent-given'));
  };

  if (!isVisible || pathname.startsWith('/admin') || pathname.startsWith('/employee')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-100 animate-in slide-in-from-bottom-full duration-500 pointer-events-auto">
      <div className="glass-card border-t border-black/5 px-6 py-4 sm:py-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Cookie className="w-4 h-4 text-primary-600 shrink-0" />
            <p className="text-[11px] sm:text-xs font-medium text-foreground/70">
              We use internal analytics to improve the campus marketplace. No third-party tracking.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/80 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-3 h-3" /> Got it
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
