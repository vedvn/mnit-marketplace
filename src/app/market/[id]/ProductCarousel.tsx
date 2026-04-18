'use client';

import { Tag } from 'lucide-react';

interface ProductCarouselProps {
  images: string[];
  title: string;
  condition: string;
}

export default function ProductCarousel({ images, title, condition }: ProductCarouselProps) {
  return (
    <div className="flex flex-col bg-foreground/5 bento-border-b md:bento-border-b-0 md:bento-border-r relative">
      <div className="relative group w-full aspect-square overflow-hidden">
        {/* Scroll Container */}
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-none no-scrollbar scroll-smooth" 
          id="image-carousel"
        >
          {images?.map((img: string, i: number) => (
            <div key={i} className="flex-none w-full h-full snap-center relative">
              <img 
                src={img} 
                alt={`${title} - ${i + 1}`} 
                className="w-full h-full object-cover select-none"
                draggable="false"
              />
              {/* Position Indicator */}
              <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[9px] font-bold uppercase tracking-widest border border-white/10">
                {i + 1} / {images.length}
              </div>
            </div>
          ))}
          {(!images || images.length === 0) && (
            <div className="w-full h-full flex flex-col items-center justify-center text-foreground/30">
              <Tag className="w-16 h-16 mb-4" />
              <span className="mono-subtitle">No images provided</span>
            </div>
          )}
        </div>

        {/* Tap/Slide Hint for Mobile */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full border border-white/5 pointer-events-none sm:hidden">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>

        <div className="absolute top-4 left-4 px-3 py-1 bg-white text-foreground text-xs font-bold uppercase tracking-widest bento-border z-10 shadow-sm">
          {condition.replace('_', ' ')}
        </div>
      </div>
      
      {/* Snap Dots Navigation */}
      {images?.length > 1 && (
        <div className="p-4 flex gap-2 overflow-x-auto items-center justify-center bg-white bento-border-t">
          {images.map((_: any, i: number) => (
            <button 
              key={i} 
              onClick={() => {
                const el = document.getElementById('image-carousel');
                if (el) el.scrollTo({ left: el.offsetWidth * i, behavior: 'smooth' });
              }}
              className="w-1.5 h-1.5 rounded-full bg-foreground/20 hover:bg-primary-600 transition-colors cursor-pointer"
              title={`View image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
