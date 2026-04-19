'use client';

import { useState } from 'react';
import { Share2, Check, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  variant?: 'icon' | 'full';
}

export default function ShareButton({ title, text, url, variant = 'icon' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Sharing failed:', err);
          copyFallback();
        }
      }
    } else {
      copyFallback();
    }
  }

  function copyFallback() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setShowToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowToast(false);
    }, 2000);
  }

  if (variant === 'full') {
    return (
      <>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold uppercase tracking-widest transition-all border border-black/5"
        >
          <Share2 className="w-4 h-4" />
          Share Listing
        </button>

        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-100 px-6 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Link Copied to Clipboard
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="p-2.5 rounded-full bg-foreground/5 text-foreground/40 hover:bg-primary-600 hover:text-white transition-all shadow-sm border border-black/5 group"
        title="Share this listing"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <Check className="w-5 h-5 text-emerald-400" />
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="group-hover:scale-110 transition-transform"
            >
              <Share2 className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
            className="absolute bottom-full left-1/2 mb-4 px-4 py-2 bg-black text-white rounded-xl text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl flex items-center gap-2 z-50"
          >
            <Copy className="w-3 h-3 text-emerald-400" />
            Link Copied
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
