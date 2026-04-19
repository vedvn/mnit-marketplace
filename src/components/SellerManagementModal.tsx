'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Tag,
  Settings,
  Trash2,
  CheckCircle2,
  Share2,
  Eye,
  ExternalLink,
  MapPin,
  Clock,
  ShieldAlert,
  ShoppingBag
} from 'lucide-react';
import { markProductSold } from '@/lib/profile-actions';
import { deleteProduct } from '@/lib/market-actions';
import ShareButton from './ShareButton';
import DisputeForm from './DisputeForm';
import { CAMPUS_SAFE_ZONES } from '@/lib/constants/locations';

interface SellerManagementModalProps {
  product: any;
}

export default function SellerManagementModal({ product }: SellerManagementModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleMarkSold = async () => {
    setLoadingAction('sold');
    await markProductSold(product.id);
    setLoadingAction(null);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this listing? This action cannot be undone.')) return;
    setLoadingAction('delete');
    await deleteProduct(product.id);
    setLoadingAction(null);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 text-center py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest transition-all border border-black/5 flex items-center justify-center gap-2"
      >
        <Settings className="w-3.5 h-3.5" /> Manage
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 italic-none">
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
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] bg-white shadow-2xl flex flex-col md:flex-row border border-black/5"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 transition-colors z-110 bg-white/80 backdrop-blur-sm shadow-sm"
              >
                <X className="w-5 h-5 text-foreground/40" />
              </button>

              {/* Sidebar / Left Side (Stats & Visual) */}
              <div className="w-full md:w-80 bg-foreground/0.02 border-r border-black/5 flex flex-col">
                <div className="aspect-square w-full bg-foreground/5 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-foreground/10" /></div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-4 flex items-center gap-2">
                      Listing Status
                    </p>
                    <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest w-fit border ${product.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' :
                        product.status === 'SOLD' ? 'bg-primary-500/10 text-primary-600 border-primary-500/10' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/10'
                      }`}>
                      {product.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-black/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-1 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Interactions
                      </p>
                      <p className="text-xl font-black">{product.interactions_count || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Area (Details & Actions) */}
              <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 mb-2">Seller Dashboard</p>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-8 leading-none">
                  Listing Management
                </h2>

                <div className="space-y-8">
                  {/* Detailed Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center"><Tag className="w-5 h-5 text-foreground/40" /></div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 leading-none mb-1">Price Point</p>
                          <p className="font-bold text-lg text-primary-600">₹{product.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center"><MapPin className="w-5 h-5 text-foreground/40" /></div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 leading-none mb-1">Pickup Location</p>
                          <p className="font-bold text-sm">{CAMPUS_SAFE_ZONES.find(z => z.id === product.pickup_address.toLowerCase())?.name || product.pickup_address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center"><Clock className="w-5 h-5 text-foreground/40" /></div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 leading-none mb-1">Listed On</p>
                          <p className="font-bold text-sm tracking-tight">{new Date(product.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Hub */}
                  <div className="pt-8 border-t border-black/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-6">Management Actions</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                      {/* Shares professionally disabled for management clarity as requested */}

                      {product.status === 'AVAILABLE' && (
                        <button
                          onClick={handleMarkSold}
                          disabled={loadingAction === 'sold'}
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark as Sold
                        </button>
                      )}

                      {(product.status === 'AVAILABLE' || product.status === 'PENDING_REVIEW') && (
                        <button
                          onClick={handleDelete}
                          disabled={loadingAction === 'delete'}
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-200 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          End Listing
                        </button>
                      )}

                      <DisputeForm 
                        productId={product.id}
                        productTitle={product.title}
                        transactionId={product.sale_tx?.[0]?.id}
                        triggerLabel="Report Issue"
                        triggerClassName="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                      />
                    </div>
                  </div>

                  {/* Privacy Warning */}
                  <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                    <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-800 leading-relaxed font-medium uppercase tracking-tight">
                      Listing Management Protocol: Deleting a listing is permanent. Marking as sold will notify any associated admins for payout verification once the buyer confirms receipt.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
