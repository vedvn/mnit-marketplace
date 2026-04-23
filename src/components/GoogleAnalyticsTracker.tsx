'use client';

import { useState, useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function GoogleAnalyticsTracker({ gaId }: { gaId: string }) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Initial check
    const consent = localStorage.getItem('mnit_cookie_consent');
    if (consent === 'accepted') setHasConsent(true);

    // Listen for changes
    const handleConsent = () => setHasConsent(true);
    window.addEventListener('cookie-consent-given', handleConsent);
    return () => window.removeEventListener('cookie-consent-given', handleConsent);
  }, []);

  if (!hasConsent) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
