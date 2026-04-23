'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logAnalyticsEvent } from '@/lib/analytics-actions';

/**
 * Headless component that tracks page views automatically.
 * It listens to pathname and searchParams changes.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const track = () => {
      // 1. Strict Exclusions: Don't track internal management pages
      if (pathname.startsWith('/admin') || pathname.startsWith('/employee')) return;

      // 2. Compliance Check: Check for consent
      if (typeof window === 'undefined' || !localStorage.getItem('mnit_cookie_consent')) return;

      const fullPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      const timer = setTimeout(() => {
        logAnalyticsEvent('PAGE_VIEW', fullPath);
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    };

    let cleanup = track();

    // Also listen for the consent event if they just clicked it
    const handleConsent = () => {
      if (cleanup) cleanup();
      cleanup = track();
    };

    window.addEventListener('cookie-consent-given', handleConsent);
    
    return () => {
      window.removeEventListener('cookie-consent-given', handleConsent);
      if (cleanup) cleanup();
    };
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}
