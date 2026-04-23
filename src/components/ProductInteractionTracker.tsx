'use client';

import { useEffect } from 'react';
import { logAnalyticsEvent } from '@/lib/analytics-actions';

export default function ProductInteractionTracker({ 
  productId, 
  categoryId,
  isOwner 
}: { 
  productId: string; 
  categoryId: string;
  isOwner: boolean;
}) {
  useEffect(() => {
    // Only track if NOT the owner and HAS consent
    if (isOwner || typeof window === 'undefined') return;

    const trackInteraction = async () => {
      const hasConsent = localStorage.getItem('mnit_cookie_consent');
      if (!hasConsent) return;

      // Log interaction after 2 seconds (shows genuine interest)
      const timer = setTimeout(async () => {
        await logAnalyticsEvent(
          'PRODUCT_INTERACTION', 
          `/market/${productId}`, 
          productId, 
          categoryId, 
          { source: 'PRODUCT_DETAIL_CLIENT' }
        );
      }, 2000);

      return () => clearTimeout(timer);
    };

    trackInteraction();

    // Listen for consent if they just accepted it while on the page
    const handleConsent = () => trackInteraction();
    window.addEventListener('cookie-consent-given', handleConsent);
    return () => window.removeEventListener('cookie-consent-given', handleConsent);
  }, [productId, categoryId, isOwner]);

  return null;
}
