'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        // Set CSS variables for high-performance hardware accelerated movement
        // This avoids React state updates and component re-renders
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[-1] pointer-events-none bg-background overflow-hidden"
      style={{
        // Initialize variables to hide them off-screen initially
        ['--mouse-x' as any]: '-1000px',
        ['--mouse-y' as any]: '-1000px',
      }}
    >
      {/* Base Ultra-Subtle Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Cursor Highlight Grid - Uses CSS Variables for zero-lag masking */}
      <div 
        className="absolute inset-0 opacity-[0.12]" 
        style={{
          backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
          WebkitMaskImage: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), black, transparent)`
        }}
      />

      {/* Primary Terracotta Subtle Glow - Hardware Accelerated via translate3d */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-30 pointer-events-none will-change-transform"
        style={{
          left: 0,
          top: 0,
          transform: 'translate3d(calc(var(--mouse-x) - 50%), calc(var(--mouse-y) - 50%), 0)',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0) 70%)',
        }}
      />
    </div>
  );
}
