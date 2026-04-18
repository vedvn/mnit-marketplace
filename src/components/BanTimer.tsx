'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BanTimer({ expiry }: { expiry: string }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const expiryDate = new Date(expiry).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryDate - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft('EXPIRED');
        // Automatically refresh or redirect to clear the ban in middleware
        router.refresh();
        window.location.href = '/market';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(' : '));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiry, router]);

  if (timeLeft === 'EXPIRED') {
    return (
      <div className="mt-8 text-emerald-500 font-bold animate-pulse">
        Restoring access... please wait.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
        Access Restored In
      </div>
      <div className="text-3xl font-black font-mono tracking-tighter text-foreground tabular-nums bg-foreground/5 py-4 px-8 rounded-2xl bento-border shadow-inner">
        {timeLeft || '-- : -- : --'}
      </div>
    </div>
  );
}
