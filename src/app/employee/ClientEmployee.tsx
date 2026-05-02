'use client';

import { useState, useEffect } from 'react';
import { getPendingProducts, approveProduct, rejectProduct, triggerAIReview } from '@/lib/employee-actions';
import { getDisputeData, adminResolveDispute } from '@/lib/admin-actions';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Image as ImageIcon,
  AlertTriangle,
  ShieldCheck,
  ShoppingBag,
  Clock,
  User,
  MapPin,
  Bot
} from 'lucide-react';
import { CAMPUS_SAFE_ZONES } from '@/lib/constants/locations';
import { findBlacklistedKeyword } from '@/lib/constants/blacklist';

export default function ClientEmployee() {
  const [products, setProducts] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'verification' | 'disputes' | 'sales'>('verification');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeTab === 'verification') {
      fetchProducts();
    } else if (activeTab === 'disputes') {
      fetchDisputes();
    } else {
      fetchSales();
    }
  }, [activeTab]);

  async function fetchProducts() {
    setLoading(true);
    const data = await getPendingProducts();
    setProducts(data);
    setLoading(false);
  }

  async function fetchDisputes() {
    setLoading(true);
    const data = await getDisputeData();
    if (data && !('error' in data)) {
      setDisputes(data);
    }
    setLoading(false);
  }

  async function fetchSales() {
    setLoading(true);
    // Explicitly import to avoid missing reference issues
    const { getAdminDashboardData } = await import('@/lib/admin-actions');
    const data = await getAdminDashboardData();
    if (data && !('error' in data)) {
      setSales(data.transactions || []);
    }
    setLoading(false);
  }

  async function handleResolveDispute(id: string, status: 'RESOLVED' | 'REJECTED', resolution: string) {
    if (!resolution) return;
    setActionLoading(id);
    await adminResolveDispute(id, status, resolution);
    await fetchDisputes();
    setActionLoading(null);
  }

  async function handleApprove(id: string) {
    setActionLoading(id);
    await approveProduct(id);
    await fetchProducts();
    setActionLoading(null);
  }

  async function handleReject(id: string, reason: string) {
    setActionLoading(id);
    setRejectingId(null);
    await rejectProduct(id, reason || 'Violates community guidelines');
    await fetchProducts();
    setActionLoading(null);
  }

  async function handleAIReview(id: string) {
    setActionLoading(`ai-${id}`);
    const result = await triggerAIReview(id);
    if (result?.error) alert(`AI Review failed: ${result.error}`);
    await fetchProducts();
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-10 h-10 text-accent" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Employee Hub</h1>
            <p className="text-foreground/70 text-sm sm:text-base">Review listings and moderate community disputes.</p>
          </div>
        </div>

        <div className="flex bg-foreground/5 p-1 rounded-2xl border border-black/5 self-start">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'verification' ? 'bg-white text-primary-600 shadow-xl' : 'text-foreground/40 hover:text-foreground'}`}
          >
            Verification
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'disputes' ? 'bg-white text-red-600 shadow-xl' : 'text-foreground/40 hover:text-foreground'}`}
          >
            Raised Tickets
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'sales' ? 'bg-white text-emerald-600 shadow-xl' : 'text-foreground/40 hover:text-foreground'}`}
          >
            Market Sales
          </button>
        </div>
      </div>

      {activeTab === 'verification' ? (
        <>
          {products.length === 0 ? (
            <div className="p-10 text-center glass-card rounded-2xl border border-black/5 text-foreground/60">
              No items currently pending review. Great job!
            </div>
          ) : (
            <div className="space-y-8">
              {products.map(product => {
                const blacklistHit = findBlacklistedKeyword(product.title) || findBlacklistedKeyword(product.description || '');
                return (
                <div key={product.id} className={`glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col lg:flex-row gap-8 border shadow-xl ${blacklistHit ? 'border-amber-400/40 bg-amber-500/5' : 'border-black/5'}`}>
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-1/2">
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Public Image</span>
                      <div className="aspect-square rounded-xl overflow-hidden glass border border-black/10 bg-foreground/5">
                        {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-foreground/20" /></div>}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Live Verification</span>
                      <div className="aspect-square rounded-xl overflow-hidden glass border-2 border-amber-500/50 relative">
                        {product.live_photo_url ? <img src={product.live_photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-amber-500/50">Missing Live Photo</div>}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="mb-6">
                      {blacklistHit && (
                        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg w-fit">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Suspicious &mdash; keyword: &ldquo;{blacklistHit}&rdquo;</span>
                        </div>
                      )}
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">{product.title}</h3>
                      <p className="text-primary-500 font-black text-lg sm:text-xl mb-4">₹{product.price}</p>
                      <p className="text-foreground/70 text-xs sm:text-sm whitespace-pre-line bg-foreground/5 p-4 rounded-xl border border-black/5 leading-relaxed">{product.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs sm:text-sm">
                      <div>
                        <span className="block text-foreground/50 text-[10px] font-bold mb-1 uppercase tracking-wider">Seller</span>
                        <p className="font-medium">{product.seller?.name}</p>
                        <p className="text-foreground/50">{product.seller?.email}</p>
                      </div>
                      <div>
                        <span className="block text-foreground/50 text-[10px] font-bold mb-1 uppercase tracking-wider">Details</span>
                        <p><span className="text-foreground/40">Condition:</span> {product.condition}</p>
                        <p><span className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Pickup:</span> {CAMPUS_SAFE_ZONES.find(z => z.id === product.pickup_address.toLowerCase())?.name || product.pickup_address.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                      {rejectingId === product.id ? (
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Rejection Reason</p>
                          <textarea
                            autoFocus
                            rows={3}
                            placeholder="e.g. Live photo does not match product images. Please re-list with a clear verification photo."
                            value={rejectReasons[product.id] || ''}
                            onChange={e => setRejectReasons(r => ({ ...r, [product.id]: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-white border border-red-500/20 outline-none focus:border-red-500 text-xs resize-none text-foreground"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setRejectingId(null)}
                              className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground border border-black/10 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReject(product.id, rejectReasons[product.id])}
                              disabled={actionLoading === product.id}
                              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                              {actionLoading === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Confirm Reject</>}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <button
                            id={`ai-review-${product.id}`}
                            onClick={() => handleAIReview(product.id)}
                            disabled={!!actionLoading}
                            className="w-full py-3 rounded-xl bg-violet-500/10 text-violet-600 text-xs font-bold hover:bg-violet-500/20 transition-colors flex items-center justify-center gap-2 border border-violet-500/20"
                          >
                            {actionLoading === `ai-${product.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bot className="w-4 h-4" /> Run AI Review</>}
                          </button>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                              onClick={() => setRejectingId(product.id)}
                              disabled={!!actionLoading}
                              className="flex-1 py-3 sm:py-4 rounded-xl glass-card text-red-500 text-xs sm:text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 border border-red-500/10"
                            >
                              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Reject Listing
                            </button>
                            <button
                              onClick={() => handleApprove(product.id)}
                              disabled={!!actionLoading}
                              className="flex-1 py-3 sm:py-4 rounded-xl bg-emerald-500 text-white text-xs sm:text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                              {actionLoading === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> Approve & List</>}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </>
      ) : activeTab === 'disputes' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Community Disputes
            </h2>
            <button
              onClick={fetchDisputes}
              className="px-3 py-1.5 rounded-lg bg-foreground/5 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-colors"
            >
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {disputes.map((d) => (
              <div key={d.id} className="glass-card p-6 rounded-2xl border border-black/5 bento-border">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full ${d.status === 'OPEN' ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            {d.status}
                          </span>
                          {d.category && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full bg-primary-500/10 text-primary-600 border border-primary-500/10">
                              {d.category}
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full bg-foreground/10 text-foreground/60">
                            {d.raised_by === d.transaction?.buyer_id ? 'Buyer' : 'Seller'} Reported
                          </span>
                        </div>
                        <h3 className="font-bold text-lg">{d.product?.title || 'General Account Report'}</h3>
                        <p className="text-xs text-foreground/50">Reported by {d.raised_by_user?.name} ({d.raised_by_user?.email})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-foreground/30">Target Outcome</p>
                        <p className="font-bold text-primary-600">{d.preferred_resolution || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-foreground/5 border border-black/5">
                      <p className="text-[10px] uppercase font-bold text-foreground/40 mb-2 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Security Decrypted Reason
                      </p>
                      <p className="text-sm leading-relaxed text-foreground/80 italic">"{d.reason}"</p>
                    </div>

                    {d.resolution && (
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-800 text-sm italic">
                        <span className="font-bold uppercase tracking-widest text-[9px] block mb-1">Moderator Resolution:</span>
                        {d.resolution}
                      </div>
                    )}
                  </div>

                  {d.status === 'OPEN' && (
                    <div className="lg:w-80 space-y-4 pt-4 lg:pt-0 lg:border-l lg:pl-8 border-black/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Resolve Ticket</h4>
                      <textarea
                        id={`resolution-${d.id}`}
                        placeholder="Explain your resolution..."
                        className="w-full p-3 rounded-xl bg-foreground/5 border border-black/5 outline-none focus:border-emerald-500 text-xs resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const res = (document.getElementById(`resolution-${d.id}`) as HTMLTextAreaElement).value;
                            handleResolveDispute(d.id, 'REJECTED', res);
                          }}
                          disabled={actionLoading === d.id}
                          className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            const res = (document.getElementById(`resolution-${d.id}`) as HTMLTextAreaElement).value;
                            handleResolveDispute(d.id, 'RESOLVED', res);
                          }}
                          disabled={actionLoading === d.id}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                        >
                          {actionLoading === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Resolve'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {disputes.length === 0 && (
              <div className="p-12 text-center glass-card rounded-2xl border border-black/5 text-foreground/50">
                No active disputes.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Global Market Sales
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Latest successful transactions</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sales.map((tx) => (
              <div key={tx.id} className="glass-card p-6 rounded-2xl border border-black/5 bento-border flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Order ID: {tx.id.slice(0, 8)}</span>
                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full ${tx.payment_status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {tx.payment_status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg truncate">{tx.product?.title || 'Unknown Item'}</h3>
                  <p className="text-emerald-600 font-bold">₹{tx.amount_paid}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-2 w-full border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-8">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-foreground/40 mb-2 flex items-center gap-1.5"><User className="w-3 h-3" /> Buyer</p>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">{tx.buyer?.name}</p>
                      <p className="text-xs text-foreground/60">{tx.buyer?.email}</p>
                      <p className="text-xs text-foreground/60">{tx.buyer?.phone_number || 'No phone provided'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-foreground/40 mb-2 flex items-center gap-1.5"><ShoppingBag className="w-3 h-3" /> Seller</p>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">{tx.seller?.name}</p>
                      <p className="text-xs text-foreground/60">{tx.seller?.email}</p>
                      <p className="text-xs text-foreground/60">{tx.seller?.phone_number || 'No phone provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[140px] border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-8">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-foreground/30 mb-1">Payout Status</p>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                      tx.payout_status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 
                      tx.payout_status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-600' : 
                      'bg-zinc-100 text-zinc-500'
                    }`}>
                      {tx.payout_status}
                    </span>
                  </div>
                  {tx.buyer_confirmed_at && (
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-foreground/30 mb-0.5">Confirmed At</p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/60">
                        <Clock className="w-3 h-3" />
                        {new Date(tx.buyer_confirmed_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="p-12 text-center glass-card rounded-2xl border border-black/5 text-foreground/50 italic">
                No sales recorded yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
