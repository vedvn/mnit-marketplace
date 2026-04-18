'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Position Motion Values (Bypass React state for smooth 60fps movement)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for the outer ring
  const springConfig = { stiffness: 500, damping: 28, mass: 0.5 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      setIsMobile(false);
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Direct Motion Value updates (very fast)
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      const target = e.target as HTMLElement;
      if (!target) return;

      // Efficient hover check without expensive getComputedStyle
      const isClickable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.classList.contains('cursor-pointer');
        
      if (isClickable !== isHovering) {
        setIsHovering(isClickable);
      }
    };

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isHovering]);

  if (isMobile) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media (pointer: fine) {
          body * {
            cursor: none !important;
          }
        }
      `}} />
      
      {/* Primary Dot - Hardware Accelerated via Framer Motion Value */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-primary-600 rounded-full pointer-events-none z-99999 will-change-transform"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          scale: isHovering ? 0 : 1,
        }}
      />

      {/* Trailing Ring - Smooth Spring Follower */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-primary-600 rounded-full pointer-events-none z-99998 mix-blend-difference will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          scale: isHovering ? 2.5 : 1,
          backgroundColor: isHovering ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0)',
          borderColor: isHovering ? 'rgba(220, 38, 38, 0.5)' : 'rgba(220, 38, 38, 0.3)',
        }}
      />
    </>
  );
}
