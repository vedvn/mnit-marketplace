'use client';

import { useState, useEffect } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { isDeliveryWindowOpen } from '@/lib/utils/time';
import { DELIVERY_WINDOW_START_DISPLAY, DELIVERY_WINDOW_END_DISPLAY } from '@/lib/constants/delivery';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeliveryWindowBanner() {
  const [isWindowOpen, setIsWindowOpen] = useState(true);

  useEffect(() => {
    setIsWindowOpen(isDeliveryWindowOpen());
    const interval = setInterval(() => setIsWindowOpen(isDeliveryWindowOpen()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {!isWindowOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden w-full"
        >
          <div className="bg-amber-500/10 bento-border-b px-6 py-4 sm:px-12 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 leading-none mb-1">P2P Delivery Window Closed</p>
                <p className="text-sm font-bold text-foreground/80">Next institutional handover opens at {DELIVERY_WINDOW_START_DISPLAY}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 bento-border rounded-lg w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Campus Safety Protocol</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
