'use client';

import { useState, useEffect } from 'react';
import { getPendingProducts, approveProduct, rejectProduct } from '@/lib/employee-actions';
import { Loader2, CheckCircle2, XCircle, ShieldAlert, Image as ImageIcon } from 'lucide-react';

export default function ClientEmployee() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const data = await getPendingProducts();
    setProducts(data);
    setLoading(false);
  }

  async function handleApprove(id: string) {
    setActionLoading(id);
    await approveProduct(id);
    await fetchProducts();
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    await rejectProduct(id);
    await fetchProducts();
    setActionLoading(null);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-10">
        <ShieldAlert className="w-10 h-10 text-accent" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Employee Verification Desk</h1>
          <p className="text-foreground/70 text-sm sm:text-base">Review and approve listings to ensure marketplace safety.</p>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="p-10 text-center glass-card rounded-2xl border border-black/5 text-foreground/60">
          No items currently pending review. Great job!
        </div>
      ) : (
        <div className="space-y-8">
          {products.map(product => (
            <div key={product.id} className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-black/5 shadow-xl flex flex-col lg:flex-row gap-8">
              
              {/* Images Comparison */}
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

              {/* Info & Actions */}
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
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
                     <p><span className="text-foreground/40">Pickup:</span> {product.pickup_address}</p>
                  </div>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button 
                    onClick={() => handleReject(product.id)}
                    disabled={actionLoading === product.id}
                    className="flex-1 py-3 sm:py-4 rounded-xl glass-card text-red-500 text-xs sm:text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 border border-red-500/10"
                  >
                    {actionLoading === product.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <><XCircle className="w-4 h-4 sm:w-5 sm:h-5"/> Reject Listing</>}
                  </button>
                  <button 
                    onClick={() => handleApprove(product.id)}
                    disabled={actionLoading === product.id}
                    className="flex-1 py-3 sm:py-4 rounded-xl bg-emerald-500 text-white text-xs sm:text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    {actionLoading === product.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5"/> Approve & List</>}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
