import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Tag, Plus, ShoppingBag, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { confirmReceipt } from '@/lib/profile-actions';
import DisputeForm from '@/components/DisputeForm';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: userProfile } = await supabase.from('users').select('*').eq('id', user.id).single();
  const { data: products } = await supabase
    .from('products')
    .select('*, sale_tx:transactions(id, amount_paid, buyer:users!buyer_id(name, email, phone_number))')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  // Use admin client for purchases so SOLD products (hidden by RLS) are still visible to the buyer
  const adminSupabase = createAdminClient();
  const { data: purchases } = await adminSupabase
    .from('transactions')
    .select('*, product:products(id, title, images, price)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 rounded-3xl glass-card mb-10 border border-black/5">
        <div className="w-24 h-24 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center font-bold text-4xl">
          {userProfile?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{userProfile?.name}</h1>
          <div className="flex flex-wrap gap-4 text-foreground/70">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Student</span>
            <span>{user.email}</span>
            {userProfile?.is_employee && <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase">Staff</span>}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Listings</h2>
          <Link href="/sell" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-500 transition-all text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <Plus className="w-4 h-4" /> List New Item
          </Link>
        </div>

        {(!products || products.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-2xl border border-black/5 border-dashed">
            <Tag className="w-10 h-10 text-foreground/30 mb-4" />
            <p className="text-foreground/60 mb-4">You haven't listed any items yet.</p>
            <Link href="/sell" className="text-primary-500 font-medium hover:underline">Start selling now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="group flex flex-col rounded-2xl glass-card overflow-hidden border border-black/5">
                <div className="aspect-4/3 w-full bg-foreground/5 relative overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Tag className="w-6 h-6 text-foreground/20" /></div>}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {p.status.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate mb-1">{p.title}</h3>
                  <p className="text-primary-600 font-bold mb-3">₹{p.price}</p>

                  {/* Buyer details for SOLD products */}
                  {p.status === 'SOLD' && p.sale_tx?.[0]?.buyer && (() => {
                    const buyer = p.sale_tx[0].buyer as any;
                    return (
                      <div className="mb-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1.5">
                        <p className="font-bold text-emerald-600 uppercase tracking-wider text-[10px] mb-2">Buyer Info</p>
                        <p className="font-semibold text-foreground truncate">{buyer.name}</p>
                        <p className="text-foreground/60 truncate">{buyer.email}</p>
                        {buyer.phone_number && <p className="text-foreground/60">📞 {buyer.phone_number}</p>}
                      </div>
                    );
                  })()}

                  <div className="flex gap-2">
                    <Link href={`/market/${p.id}`} className="flex-1 text-center py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-xs font-semibold transition-colors">
                      View
                    </Link>
                    {/* Add action to manage stock if AVAILABLE */}
                    {p.status === 'AVAILABLE' && (
                      <form action={async () => {
                        "use server";
                        const { markProductSold } = await import('@/lib/profile-actions');
                        await markProductSold(p.id);
                      }} className="flex-1 flex">
                        <button type="submit" className="w-full text-center py-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors text-xs font-semibold">
                          Mark Sold
                        </button>
                      </form>
                    )}
                    {/* Add action to Delete if NOT sold */}
                    {(p.status === 'AVAILABLE' || p.status === 'PENDING_REVIEW') && (
                      <form action={async () => {
                        "use server";
                        const { deleteProduct } = await import('@/lib/market-actions');
                        await deleteProduct(p.id);
                      }} className="flex-1 flex">
                        <button type="submit" className="w-full text-center py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs font-semibold cursor-pointer">
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                  
                  {p.status === 'SOLD' && p.sale_tx?.[0] && (
                    <DisputeForm 
                      transactionId={p.sale_tx[0].id} 
                      productId={p.id}
                      productTitle={p.title}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">My Purchases</h2>
        {(!purchases || purchases.length === 0) ? (
          <div className="p-8 text-center glass-card rounded-2xl border border-black/5 text-foreground/60">
            No purchases yet. Start exploring the market!
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map(tx => (
              <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl glass border border-black/5">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-lg bg-foreground/5 overflow-hidden shrink-0">
                    {tx.product?.images?.[0] ? <img src={tx.product.images[0]} className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 m-auto text-foreground/20 mt-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{tx.product?.title || 'Unknown Item'}</h4>
                    <p className="text-xs text-foreground/50">Purchased on {new Date(tx.created_at).toLocaleDateString()}</p>
                    <div className="font-bold text-accent mt-1">₹{tx.amount_paid}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 border-t border-black/5 pt-4 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4">
                  {tx.payout_status === 'PENDING' ? (
                    <form action={async () => {
                      "use server";
                      await confirmReceipt(tx.id, tx.product_id);
                    }}>
                      <button type="submit" className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Confirm Received
                      </button>
                    </form>
                  ) : (
                    <div className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider flex items-center gap-1 opacity-70">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </div>
                  )}
                  {/* Buyer Dispute Option */}
                  <DisputeForm 
                    transactionId={tx.id} 
                    productId={tx.product_id}
                    productTitle={tx.product?.title || 'Unknown Item'} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
