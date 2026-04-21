'use client';

import { useEffect, useRef, useState } from 'react';

export default function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Skip entirely on touch/mobile — no cursor to track, wasted GPU paint
  const [isMouse, setIsMouse] = useState(false);

  useEffect(() => {
    // hover:hover + pointer:fine = desktop/laptop with a mouse/trackpad
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setIsMouse(hasHover);
    if (!hasHover) return; // bail out on mobile — no listeners, no compositor layers

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // RAF throttle: cap at 60fps, eliminates excessive main-thread scripting
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
          containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // On mobile: render nothing — zero DOM nodes, zero GPU cost
  if (!isMouse) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[-1] pointer-events-none bg-background overflow-hidden"
      style={{
        ['--mouse-x' as any]: '-9999px',
        ['--mouse-y' as any]: '-9999px',
      }}
    >
      {/* Ultra-subtle blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Cursor highlight grid — CSS vars, zero JS re-renders */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: `radial-gradient(280px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
          WebkitMaskImage: `radial-gradient(280px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
        }}
      />

      {/* Orb: 500px + blur-3xl (~3× cheaper than 800px + blur-120px) */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none will-change-transform"
        style={{
          left: 0,
          top: 0,
          transform: 'translate3d(calc(var(--mouse-x) - 50%), calc(var(--mouse-y) - 50%), 0)',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
