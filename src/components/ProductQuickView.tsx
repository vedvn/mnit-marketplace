'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Tag,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { CAMPUS_SAFE_ZONES } from '@/lib/constants/locations';
import CheckoutButton from '@/app/market/[id]/CheckoutButton';
import Link from 'next/link';
import ShareButton from './ShareButton';

interface ProductQuickViewProps {
  product: any;
  isLoggedIn: boolean;
}

export default function ProductQuickView({ product, isLoggedIn }: ProductQuickViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-black/5 text-foreground/40 hover:text-primary-600 hover:scale-110 transition-all shadow-sm z-10"
        title="Quick View"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto sm:overflow-hidden rounded-[32px] bg-white shadow-2xl flex flex-col md:flex-row border border-black/5 animate-in fade-in duration-500"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 transition-all z-110 bg-white shadow-sm border border-black/5"
              >
                <X className="w-5 h-5 text-foreground/40" />
              </button>

              {/* Image Side - Sticky on MD+ */}
              <div className="md:w-1/2 bg-foreground/5 relative overflow-hidden md:sticky md:top-0 h-fit bento-border-b md:bento-border-r md:bento-border-b-0">
                <div className="aspect-square w-full">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag className="w-10 h-10 text-foreground/10" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 px-3 py-1 bg-white text-foreground text-[10px] font-bold uppercase tracking-wider bento-border shadow-sm">
                    {product.condition.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Info Side - Scrollable */}
              <div className="md:w-1/2 p-8 sm:p-10 md:overflow-y-auto custom-scrollbar">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-xl font-black uppercase tracking-tight leading-tight line-clamp-2">{product.title}</h1>
                  <div className="shrink-0">
                    <ShareButton 
                       title={product.title}
                       text={`Check out this ${product.title} on MNIT Marketplace!`}
                       url={`/market/${product.id}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="text-lg font-black text-primary-600">₹{product.price}</div>
                  <div className="px-1.5 py-0.5 bg-primary-500/5 text-primary-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-primary-500/10">
                    {product.category?.name || 'Category'}
                  </div>
                </div>

                <div className="space-y-3 mb-8 p-4 bg-foreground/2 rounded-2xl border border-black/5">
                  <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-foreground/50">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-primary-600" />
                    Pickup: {CAMPUS_SAFE_ZONES.find(z => z.id === product.pickup_address.toLowerCase())?.name || product.pickup_address}
                  </div>
                  <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-foreground/50">
                    <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                    Verified MNIT Listing
                  </div>
                </div>

                <div className="mb-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                  <p className="text-[10px] uppercase font-black tracking-widest text-blue-600 mb-2">Description Preview</p>
                  <p className="text-sm text-foreground/70 leading-relaxed line-clamp-6">{product.description}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <CheckoutButton
                    productId={product.id}
                    price={product.price}
                    isLoggedIn={isLoggedIn}
                    productTitle={product.title}
                    variant="compact"
                  />
                  <Link
                    href={`/market/${product.id}`}
                    className="w-full py-4 rounded-xl border-2 border-black/5 hover:border-primary-600 hover:text-primary-600 transition-all text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group"
                  >
                    View Full Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
