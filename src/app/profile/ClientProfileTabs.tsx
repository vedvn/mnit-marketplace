'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  ShoppingBag,
  AlertTriangle,
  Plus,
  CheckCircle2,
  MapPin,
  Search,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import SellerManagementModal from '@/components/SellerManagementModal';
import DisputeViewModal from '@/components/DisputeViewModal';
import { CAMPUS_SAFE_ZONES } from '@/lib/constants/locations';
import { confirmReceipt } from '@/lib/profile-actions';
import DisputeForm from '@/components/DisputeForm';

interface ClientProfileTabsProps {
  products: any[];
  purchases: any[];
  userDisputes: any[];
  userId: string;
}

type TabType = 'listings' | 'purchases' | 'reports';

export default function ClientProfileTabs({ products, purchases, userDisputes, userId }: ClientProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('listings');

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: Tag, count: products.length },
    { id: 'purchases', label: 'My Purchases', icon: ShoppingBag, count: purchases.length },
    { id: 'reports', label: 'Support & Reports', icon: AlertTriangle, count: userDisputes.length },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-foreground/0.03 bento-border rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${isActive ? 'text-primary-600' : 'text-foreground/40 hover:text-foreground/60'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white shadow-sm bento-border rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-primary-600' : 'text-foreground/30'}`} />
              <span className="relative z-10">{tab.label}</span>
              <span className={`relative z-10 px-1.5 py-0.5 rounded-full text-[8px] font-black ${isActive ? 'bg-primary-500/10 text-primary-600' : 'bg-foreground/5 text-foreground/30'
                }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-[400px]"
        >
          {/* LISTINGS TAB */}
          {activeTab === 'listings' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tight">Active Listings</h2>
                <Link href="/sell" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20">
                  <Plus className="w-4 h-4" /> New Listing
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-[32px] border border-black/5 border-dashed">
                  <Tag className="w-12 h-12 text-foreground/10 mb-6" />
                  <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest mb-6">No items listed yet</p>
                  <Link href="/sell" className="text-primary-600 font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-2">
                    Open Your Campus Store <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div key={p.id} className="group flex flex-col rounded-[32px] glass-card overflow-hidden border border-black/5 hover:border-black/10 transition-colors">
                      <div className="aspect-4/3 w-full bg-foreground/5 relative overflow-hidden">
                        {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Tag className="w-8 h-8 text-foreground/5" /></div>}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <div className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest w-fit">
                            {p.status.replace('_', ' ')}
                          </div>
                          {p.status === 'SOLD' && p.sale_tx?.[0]?.payout_status && (
                            <div className={`px-2 py-1 rounded-lg backdrop-blur-md text-[9px] font-black uppercase tracking-widest w-fit border ${p.sale_tx[0].payout_status === 'COMPLETED' ? 'bg-emerald-500/80 text-white border-emerald-400/50' :
                                p.sale_tx[0].payout_status === 'SCHEDULED' ? 'bg-blue-600/80 text-white border-blue-400/50' :
                                  'bg-zinc-800/80 text-zinc-300 border-zinc-700/50'
                              }`}>
                              Payout: {p.sale_tx[0].payout_status}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg uppercase tracking-tight truncate mb-1">{p.title}</h3>
                        <p className="text-primary-600 font-black text-xl mb-6">₹{p.price}</p>

                        <div className="flex gap-2.5">
                          <Link href={`/market/${p.id}`} className="flex-1 text-center py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest transition-all">
                            View
                          </Link>
                          <SellerManagementModal product={p} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PURCHASES TAB */}
          {activeTab === 'purchases' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <h2 className="text-2xl font-black uppercase tracking-tight">Purchase History</h2>

              {purchases.length === 0 ? (
                <div className="p-24 text-center glass-card rounded-[32px] border border-black/5 text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                  Market discovery results: zero purchases.
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map(tx => (
                    <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-[32px] glass-card border border-black/5">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="w-20 h-20 rounded-2xl bg-foreground/5 overflow-hidden shrink-0 border border-black/5">
                          {tx.product?.images?.[0] ? <img src={tx.product.images[0]} className="w-full h-full object-cover" /> : <ShoppingBag className="w-8 h-8 m-auto text-foreground/10 mt-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-1">MNIT Transaction Record</p>
                          <h4 className="font-bold text-lg uppercase tracking-tight truncate">{tx.product?.title || 'Unknown Item'}</h4>
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="font-black text-primary-600 text-lg">₹{tx.amount_paid}</div>
                            <div className="flex items-center gap-1.5 text-[9px] text-foreground/40 font-black uppercase tracking-[0.2em] bg-foreground/0.03 px-3 py-1 rounded-full border border-black/5">
                              <MapPin className="w-3.5 h-3.5 text-primary-600" />
                              {CAMPUS_SAFE_ZONES.find(z => z.id === tx.product?.pickup_address?.toLowerCase())?.name || tx.product?.pickup_address}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-black/5 pt-6 sm:pt-0">
                        {tx.payout_status === 'PENDING' ? (
                          <button
                            onClick={async () => {
                              if (confirm('Confirm you have received this item? This releases payout to the seller.')) {
                                await confirmReceipt(tx.id, tx.product_id);
                              }
                            }}
                            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Received
                          </button>
                        ) : (
                          <div className="px-6 py-3 text-[10px] text-emerald-500 uppercase font-black tracking-[0.2em] flex items-center gap-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <CheckCircle2 className="w-4 h-4" /> Handover Complete
                          </div>
                        )}
                        <DisputeForm
                          transactionId={tx.id}
                          productId={tx.product_id}
                          productTitle={tx.product?.title || 'Unknown Item'}
                          triggerClassName="p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-red-500" /> Support Activity
              </h2>

              {userDisputes.length === 0 ? (
                <div className="p-24 text-center glass-card rounded-[32px] border border-black/5 border-dashed text-foreground/30 font-bold text-[10px] uppercase tracking-[0.2em]">
                  No active support tickets found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userDisputes.map(dispute => (
                    <div key={dispute.id} className="glass-card p-8 rounded-[40px] border border-black/5 flex flex-col gap-6 relative overflow-hidden transition hover:border-black/10">
                      <div className={`absolute top-0 right-0 w-1.5 h-full ${dispute.status === 'OPEN' ? 'bg-red-500' : 'bg-emerald-500'}`} />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full ${dispute.status === 'OPEN' ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'
                            }`}>
                            Ticket: {dispute.status}
                          </span>
                          <span className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-primary-500/10 text-primary-600 border border-primary-500/10">
                            {dispute.category || 'General'}
                          </span>
                        </div>
                        <p className="text-[9px] text-foreground/30 uppercase font-black tracking-widest">Filed {new Date(dispute.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/5 border border-black/5">
                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-black/5">
                          {dispute.product?.images?.[0] ? <img src={dispute.product.images[0]} className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 m-auto text-foreground/10 mt-3" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase font-black text-foreground/30 leading-none mb-1.5">Subject Item</p>
                          <p className="font-bold text-sm uppercase tracking-tight truncate">{dispute.product?.title || 'Account Report'}</p>
                        </div>
                      </div>

                      <DisputeViewModal dispute={dispute} role={dispute.role as any} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
