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
import ClientProfileTabs from './ClientProfileTabs';

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

      <ClientProfileTabs 
        products={products || []} 
        purchases={purchases || []} 
        userDisputes={userDisputes}
        userId={user.id}
      />

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
