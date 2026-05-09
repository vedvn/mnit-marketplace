'use client';

import { useEffect } from 'react';


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

    const trackInteraction = () => {
      const hasConsent = localStorage.getItem('mnit_cookie_consent') === 'accepted';
      if (!hasConsent) return;

      // Log interaction after 2 seconds (shows genuine interest)
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).umami) {
          (window as any).umami.track('Product Interaction', {
            id: productId,
            title: 'View Detail',
            category: categoryId
          });
        }
      }, 2000);

      return () => clearTimeout(timer);
    };

    const cleanup = trackInteraction();

    // Listen for consent if they just accepted it while on the page
    const handleConsent = () => trackInteraction();
    window.addEventListener('cookie-consent-given', handleConsent);
    return () => {
      window.removeEventListener('cookie-consent-given', handleConsent);
      if (typeof cleanup === 'function') cleanup();
    };
  }, [productId, categoryId, isOwner]);

  return null;
}
