'use client';

import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertTriangle, 
  MapPin, 
  PackageCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ShoppingBag,
  UserCircle2,
  Calendar
} from 'lucide-react';
import { CAMPUS_SAFE_ZONES } from '@/lib/constants/locations';

interface DisputeViewModalProps {
  dispute: any;
  role: 'Buyer' | 'Seller' | 'User';
}

export default function DisputeViewModal({ dispute, role }: DisputeViewModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-700 transition-colors mt-2 text-left w-fit flex items-center gap-1.5 group"
      >
        View Full Details
        <span className="w-4 h-4 rounded-full bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
          <X className="w-2.5 h-2.5 rotate-45" />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] bg-white shadow-2xl flex flex-col border border-black/5"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 transition-colors z-10"
              >
                <X className="w-5 h-5 text-foreground/40" />
              </button>

              <div className="overflow-y-auto p-8 sm:p-12 custom-scrollbar">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full ${
                    dispute.status === 'OPEN' ? 'bg-red-500/10 text-red-600' : 
                    dispute.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-600' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {dispute.status}
                  </div>
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full bg-primary-500/10 text-primary-600 border border-primary-500/10">
                    {dispute.category}
                  </div>
                  <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full ${
                    role === 'Buyer' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'
                  }`}>
                    You as: {role}
                  </div>
                </div>

                <h2 className="text-3xl font-black display-title uppercase tracking-tight mb-8">
                  Support Ticket Record
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  {/* Product Summary Mini */}
                  <div className="p-5 rounded-3xl bg-foreground/5 border border-black/5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden shrink-0 border border-black/5">
                      {dispute.product?.images?.[0] ? (
                        <img src={dispute.product.images[0]} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 m-auto mt-5 text-foreground/20" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-black text-foreground/30 leading-none mb-1">Related Listing</p>
                      <p className="font-bold text-sm truncate">{dispute.product?.title || 'Account Issue'}</p>
                      <p className="text-[10px] text-primary-600 font-black mt-1 uppercase tracking-widest">₹{dispute.product?.price ?? 'N/A'}</p>
                    </div>
                  </div>

                  {/* Date & ID */}
                  <div className="p-5 rounded-3xl bg-foreground/5 border border-black/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-foreground/30" />
                      <div>
                        <p className="text-[10px] uppercase font-black text-foreground/30 leading-none mb-0.5">Filed On</p>
                        <p className="text-xs font-bold">{new Date(dispute.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-foreground/30" />
                      <div>
                        <p className="text-[10px] uppercase font-black text-foreground/30 leading-none mb-0.5">Ticket ID</p>
                        <p className="text-[10px] font-mono font-medium truncate opacity-60">#{dispute.id.slice(0, 12).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Core Content */}
                <div className="space-y-8">
                  <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-4">
                      <AlertTriangle className="w-3.5 h-3.5" /> Your Submitted Statement
                    </h4>
                    <div className="p-8 rounded-[32px] bg-primary-500/5 border border-primary-500/10 relative">
                       <p className="text-lg leading-relaxed text-foreground/80 font-medium italic">
                        "{dispute.reason}"
                       </p>
                    </div>
                  </div>

                  {dispute.resolution && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 mb-4">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Moderator Resolution
                      </h4>
                      <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-base leading-relaxed text-emerald-800 font-medium">
                          {dispute.resolution}
                        </p>
                      </div>
                    </div>
                  )}

                  {!dispute.resolution && (
                    <div className="flex items-center gap-3 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 italic">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <p className="text-sm text-amber-700 font-medium tracking-tight">
                        Our moderators are currently reviewing your ticket. You will receive an email once a resolution is reached.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-10 border-t border-black/5 flex flex-col items-center text-center">
                  <UserCircle2 className="w-8 h-8 text-foreground/10 mb-3" />
                  <p className="text-xs text-foreground/40 leading-relaxed max-w-sm">
                    This ticket is a permanent part of your MNIT Marketplace activity record. For further follow-up, please reference the Ticket ID above.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
