'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia('(pointer: fine)').matches) {
      setIsMobile(false);
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      // Check if clicking a clickable block
      const isClickable = 
        window.getComputedStyle(target).cursor === 'pointer' || 
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') !== null ||
        target.closest('button') !== null;
        
      setIsHovering(isClickable);
    };

    if (!isMobile) {
      window.addEventListener('mousemove', updateMousePosition);
      return () => window.removeEventListener('mousemove', updateMousePosition);
    }
  }, [isMobile]);

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
      
      {/* Primary Dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-primary-600 rounded-full pointer-events-none z-99999"
        animate={{
          x: mousePosition.x - 6, // center it
          y: mousePosition.y - 6,
          scale: isHovering ? 0 : 1, // disappear when hovering
        }}
        transition={{
          type: "tween",
          ease: "linear",
          duration: 0.05
        }}
      />

      {/* Trailing Ring / Hover Expand */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-primary-600 rounded-full pointer-events-none z-99998 mix-blend-difference"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 2.5 : 1,
          backgroundColor: isHovering ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0)',
          borderColor: isHovering ? 'rgba(220, 38, 38, 0.5)' : 'rgba(220, 38, 38, 0.3)',
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      />
    </>
  );
}
