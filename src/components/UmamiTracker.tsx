'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

/**
 * Umami Analytics Tracker.
 * Conditionally loads only if the user has given consent.
 */
export default function UmamiTracker() {
  const [hasConsent, setHasConsent] = useState(false);
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';

  useEffect(() => {
    // 1. Initial check
    const consent = localStorage.getItem('mnit_cookie_consent');
    if (consent === 'accepted_all') {
      setHasConsent(true);
    }

    // 2. Listen for real-time consent event from CookieConsent component
    const handleConsent = () => setHasConsent(true);
    window.addEventListener('cookie-consent-given', handleConsent);
    
    return () => window.removeEventListener('cookie-consent-given', handleConsent);
  }, []);

  if (!websiteId || !hasConsent) return null;

  return (
    <Script
      async
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
