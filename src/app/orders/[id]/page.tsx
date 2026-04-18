import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { CheckCircle2, Phone, MapPin, IndianRupee, PackageCheck, UserCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View the secure transaction status and handover details for your MNIT Marketplace purchase.',
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch transaction — only the buyer can see this
  const { data: tx, error } = await supabase
    .from('transactions')
    .select(`
      *,
      product:products(title, images, pickup_address, condition),
      seller:users!seller_id(name, phone_number, email),
      buyer:users!buyer_id(name, phone_number)
    `)
    .eq('id', id)
    .eq('buyer_id', user.id) // Security: only the buyer can view
    .single();

  if (error || !tx) notFound();

  // Only show seller details if payment is confirmed
  if (tx.payment_status !== 'SUCCESS') redirect('/market');

  const seller = tx.seller as any;
  const buyer = tx.buyer as any;
  const product = tx.product as any;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-2xl mx-auto">
      {/* Success Banner */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-4xl display-title uppercase font-bold mb-3">Order Confirmed!</h1>
        <p className="text-foreground/60 max-w-xs leading-relaxed">
          Your payment was successful. Contact the seller to arrange pickup.
        </p>
      </div>

      {/* Product Summary */}
      <div className="glass-card bento-border overflow-hidden mb-6">
        <div className="flex gap-4 p-6 bento-border-b">
          <div className="w-20 h-20 bg-foreground/5 rounded-xl overflow-hidden shrink-0">
            {product?.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PackageCheck className="w-6 h-6 text-foreground/20" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-xl display-title uppercase mb-1 line-clamp-1">{product?.title}</h2>
            <div className="flex items-center gap-1 text-xs text-foreground/50 font-bold uppercase tracking-widest">
              <MapPin className="w-3 h-3" /> {product?.pickup_address}
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="p-6 space-y-3 bento-border-b">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">Item price</span>
            <span className="font-bold">₹{Number(tx.seller_payout).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">Platform fee</span>
            <span className="font-bold text-foreground/50">₹{Number(tx.platform_fee).toLocaleString()}</span>
          </div>
          {tx.payment_method && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">Paid via</span>
              <span className="font-bold capitalize">{tx.payment_method}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-lg border-t border-black/5 pt-3">
            <span>Total Paid</span>
            <span className="text-emerald-600">₹{Number(tx.amount_paid).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Seller Details — REVEALED HERE */}
      <div className="glass-card bento-border overflow-hidden mb-6">
        <div className="p-5 flex items-center gap-2 bento-border-b bg-emerald-500/5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Seller Contact</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 text-white flex items-center justify-center font-bold text-xl uppercase rounded-sm shrink-0">
              {seller?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg display-title uppercase">{seller?.name}</p>
              <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Verified MNIT Student</p>
            </div>
          </div>

          <a
            href={`tel:+91${seller?.phone_number}`}
            className="flex items-center gap-3 px-5 py-4 bg-foreground/5 bento-border hover:bg-emerald-50 hover:border-emerald-200 transition-colors group"
          >
            <Phone className="w-5 h-5 text-foreground/40 group-hover:text-emerald-600 transition-colors" />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/40 block mb-0.5">Call / WhatsApp</span>
              <span className="font-bold text-lg">+91 {seller?.phone_number}</span>
            </div>
          </a>

          <p className="text-xs text-foreground/50 leading-relaxed">
            Contact the seller to arrange a safe pickup at the listed location. Both parties must confirm when the item is received.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/profile"
          className="flex items-center justify-center gap-2 py-4 bg-foreground/5 font-bold text-xs uppercase tracking-widest hover:bg-foreground/10 transition-colors bento-border text-center"
        >
          View My Orders
        </Link>
        <Link
          href="/market"
          className="flex items-center justify-center gap-2 py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
