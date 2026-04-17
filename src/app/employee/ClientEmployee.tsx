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
      <div className="flex items-center gap-3 mb-10">
        <ShieldAlert className="w-10 h-10 text-accent" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Verification Desk</h1>
          <p className="text-foreground/70">Review and approve listings to ensure marketplace safety.</p>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="p-10 text-center glass-card rounded-2xl border border-black/5 text-foreground/60">
          No items currently pending review. Great job!
        </div>
      ) : (
        <div className="space-y-8">
          {products.map(product => (
            <div key={product.id} className="glass-card rounded-3xl p-6 border border-black/5 shadow-xl flex flex-col md:flex-row gap-8">
              
              {/* Images Comparison */}
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-1/2">
                <div className="flex-1 space-y-2">
                  <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Public Image</span>
                  <div className="aspect-square rounded-2xl overflow-hidden glass border border-black/10 bg-foreground/5">
                    {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-foreground/20" /></div>}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Live Verification</span>
                  <div className="aspect-square rounded-2xl overflow-hidden glass border-2 border-amber-500/50 relative">
                    {product.live_photo_url ? <img src={product.live_photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-amber-500/50">Missing Live Photo</div>}
                  </div>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
                  <p className="text-primary-500 font-black text-xl mb-4">₹{product.price}</p>
                  <p className="text-foreground/70 text-sm whitespace-pre-line bg-foreground/5 p-4 rounded-xl border border-black/5">{product.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div>
                     <span className="block text-foreground/50 text-xs font-bold mb-1">Seller</span>
                     {product.seller?.name} ({product.seller?.email})
                  </div>
                  <div>
                     <span className="block text-foreground/50 text-xs font-bold mb-1">Details</span>
                     Condition: {product.condition}<br/>
                     Pickup: {product.pickup_address}
                  </div>
                </div>

                <div className="mt-auto flex gap-4">
                  <button 
                    onClick={() => handleReject(product.id)}
                    disabled={actionLoading === product.id}
                    className="flex-1 py-4 rounded-xl glass-card text-red-500 font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 border border-red-500/20"
                  >
                    {actionLoading === product.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <><XCircle className="w-5 h-5"/> Reject</>}
                  </button>
                  <button 
                    onClick={() => handleApprove(product.id)}
                    disabled={actionLoading === product.id}
                    className="flex-1 py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    {actionLoading === product.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <><CheckCircle2 className="w-5 h-5"/> Approve</>}
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
