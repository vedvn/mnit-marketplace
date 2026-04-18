import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your campus listings, update your payout info, and track your MNIT Marketplace activity.',
};
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Tag, Plus, ShoppingBag, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { confirmReceipt } from '@/lib/profile-actions';
import DisputeForm from '@/components/DisputeForm';
import EditProfileForm from '@/components/EditProfileForm';
import DeleteAccountButton from '@/components/DeleteAccountButton';
import { CAMPUS_SAFE_ZONES } from '@/lib/constants/locations';
import { MapPin } from 'lucide-react';
import { decrypt } from '@/lib/utils/encryption';
import DisputeViewModal from '@/components/DisputeViewModal';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: userProfile } = await supabase.from('users').select('*').eq('id', user.id).single();
  const { data: userFinancials } = await supabase.from('user_financials').select('*').eq('id', user.id).single();
  
  const { data: products } = await supabase
    .from('products')
    .select(`
        *,
        sale_tx:transactions!product_id(id, amount_paid, payout_status, buyer:users!buyer_id(name, email))
      `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  // Use admin client for purchases so SOLD products (hidden by RLS) are still visible to the buyer
  const adminSupabase = createAdminClient();
  const { data: purchases } = await adminSupabase
    .from('transactions')
    .select('*, product:products(id, title, images, price, pickup_address)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  const interactions = [
    ...(purchases?.map(tx => ({
      id: tx.product_id,
      title: tx.product?.title || 'Unknown Item',
      txId: tx.id,
      role: 'buyer' as const
    })) || []),
    ...(products?.filter(p => p.status === 'SOLD').map(p => ({
      id: p.id,
      title: p.title,
      txId: p.sale_tx?.[0]?.id,
      role: 'seller' as const
    })) || [])
  ];

  // Fetch user's disputes
  const { data: rawDisputes } = await adminSupabase
    .from('disputes')
    .select('*, product:products(title, images, price), transaction:transactions(buyer_id, seller_id)')
    .eq('raised_by', user.id)
    .order('created_at', { ascending: false });

  const userDisputes = (rawDisputes || []).map(d => {
    const tx = d.transaction as any;
    let role: 'Buyer' | 'Seller' | 'User' = 'User';
    if (tx?.buyer_id === user.id) role = 'Buyer';
    else if (tx?.seller_id === user.id) role = 'Seller';

    return {
      ...d,
      reason: decrypt(d.reason),
      role
    };
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl glass-card mb-10 border border-black/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center font-bold text-4xl shadow-inner">
            {userProfile?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{userProfile?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-foreground/70">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Student</span>
              <span>{user.email}</span>
              {userProfile?.is_employee && <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase">Staff</span>}
            </div>
            
            <div className="mt-4 flex gap-3 justify-center md:justify-start">
              <EditProfileForm initialData={{
                name: userProfile?.name || '',
                phone_number: userFinancials?.phone_number || '',
                bank_account_number: userFinancials?.bank_account_number || '',
                bank_ifsc: userFinancials?.bank_ifsc || '',
                upi_id: userFinancials?.upi_id || ''
              }} />
              
              <DisputeForm 
                availableItems={interactions} 
                triggerLabel="Help / Report Issue"
                triggerClassName="px-6 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold uppercase tracking-widest transition-all border border-black/5 flex items-center gap-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Bar (Displaying "Old" Details) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in slide-in-from-top-4 duration-500">
        <div className="p-6 rounded-3xl glass-card border border-black/5 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-all">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-black tracking-widest text-foreground/30 mb-1">Mobile Contact</p>
            <p className="text-sm font-bold truncate">{userFinancials?.phone_number ? `+91 ${userFinancials.phone_number}` : 'Not Linked'}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-black/5 flex items-center gap-4 group col-span-1 md:col-span-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-black tracking-widest text-foreground/30 mb-1">Active Payout Method</p>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold truncate">
                {userFinancials?.upi_id ? (
                  <span className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] rounded font-black">UPI</span>
                    {userFinancials.upi_id}
                  </span>
                ) : userFinancials?.bank_account_number ? (
                  <span className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 text-[9px] rounded font-black">BANK</span>
                    {userFinancials.bank_account_number} ({userFinancials.bank_ifsc})
                  </span>
                ) : (
                  <span className="text-foreground/40 italic font-medium">No payout method configured</span>
                )}
              </p>
            </div>
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
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider w-fit">
                        {p.status.replace('_', ' ')}
                      </div>
                      {p.status === 'SOLD' && p.sale_tx?.[0]?.payout_status && (
                        <div className={`px-2 py-1 rounded-md backdrop-blur-md text-[10px] font-black uppercase tracking-widest w-fit border ${
                          p.sale_tx[0].payout_status === 'COMPLETED' ? 'bg-emerald-500/80 text-white border-emerald-400/50' : 
                          p.sale_tx[0].payout_status === 'SCHEDULED' ? 'bg-blue-600/80 text-white border-blue-400/50' : 
                          'bg-zinc-800/80 text-zinc-300 border-zinc-700/50'
                        }`}>
                          Payout: {p.sale_tx[0].payout_status}
                        </div>
                      )}
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
                        {p.sale_tx[0].payout_status && (
                          <p className="mt-2 pt-2 border-t border-emerald-500/10 font-bold text-[10px] uppercase tracking-widest">
                            Payout: {p.sale_tx[0].payout_status}
                          </p>
                        )}
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

      <div className="mb-12">
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
                    <div className="flex flex-wrap items-center gap-3 mt-1 mb-1">
                      <div className="font-bold text-accent text-sm">₹{tx.amount_paid}</div>
                      <div className="flex items-center gap-1 text-[10px] text-foreground/40 font-bold uppercase tracking-widest bg-foreground/5 px-2 py-0.5 rounded border border-black/5">
                        <MapPin className="w-3 h-3 text-primary-600" />
                        {CAMPUS_SAFE_ZONES.find(z => z.id === tx.product?.pickup_address?.toLowerCase())?.name || tx.product?.pickup_address?.replace('_', ' ')}
                      </div>
                    </div>
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

      {/* Raised Tickets Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" /> Raised Support Tickets
        </h2>
        {(!userDisputes || userDisputes.length === 0) ? (
          <div className="p-12 text-center glass-card rounded-2xl border border-black/5 text-foreground/50 italic font-medium">
            You haven't raised any support tickets yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userDisputes.map(dispute => (
              <div key={dispute.id} className="glass-card p-6 rounded-3xl border border-black/5 flex flex-col gap-4 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-1 h-full ${dispute.status === 'OPEN' ? 'bg-red-500' : dispute.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full ${
                        dispute.status === 'OPEN' ? 'bg-red-500/10 text-red-600' : 
                        dispute.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-600' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {dispute.status}
                      </span>
                      {dispute.category && (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full bg-primary-500/10 text-primary-600 border border-primary-500/10">
                          {dispute.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-foreground/40 font-medium">Filed on {new Date(dispute.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-foreground/5 border border-black/5">
                  <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-black/5">
                    {dispute.product?.images?.[0] ? (
                      <img src={dispute.product.images[0]} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 m-auto mt-2.5 text-foreground/20" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-foreground/30 leading-none mb-1">Related Listing</p>
                    <p className="text-sm font-bold truncate">{dispute.product?.title || 'General Account Report'}</p>
                  </div>
                </div>

                <DisputeViewModal dispute={dispute} role={dispute.role as any} />

                {dispute.resolution && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 animate-in slide-in-from-top-2 duration-500">
                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Moderator Resolution
                    </p>
                    <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                      "{dispute.resolution}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone / Data Rights (Compliance Section 06) */}
      <div className="mt-12 pt-8 border-t border-red-500/10">
        <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-bottom-4">
           <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-red-600 flex items-center justify-center md:justify-start gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h2>
              <p className="text-sm text-foreground/60 max-w-lg leading-relaxed">
                As per India's DPDP Act, you have the right to be forgotten. Requesting account deletion will flag your account for permanent removal. This process takes <strong>30 days</strong> and is irreversible once completed.
              </p>
           </div>
           
           {userProfile?.deletion_requested_at ? (
              <div className="px-6 py-4 rounded-2xl bg-white border border-red-200 text-center shadow-sm">
                <p className="text-[10px] uppercase font-black tracking-widest text-red-500 mb-1">Deletion Scheduled</p>
                <p className="text-xs font-bold text-foreground/80">
                  Account will be removed on:<br/>
                  <span className="text-sm text-red-600">
                    {new Date(new Date(userProfile.deletion_requested_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </p>
              </div>
           ) : (
              <DeleteAccountButton />
           )}
        </div>
        
        <div className="mt-8 flex justify-center">
            <form action={async () => {
              "use server";
              const { createClient } = await import('@/lib/supabase/server');
              const { redirect } = await import('next/navigation');
              const supabase = await createClient();
              await supabase.auth.signOut();
              redirect('/login');
            }}>
              <button type="submit" className="text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-red-500 transition-colors">
                Log out of Marketplace
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
