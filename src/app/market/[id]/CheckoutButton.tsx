'use client';

import { useState, useRef } from 'react';
import { createOrder } from '@/lib/market-actions';
import { Loader2, ShieldBan, LogIn, ShieldCheck, IndianRupee } from 'lucide-react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  productId: string;
  price: number;
  isLoggedIn: boolean;
  productTitle: string;
}

export default function CheckoutButton({ productId, price, isLoggedIn, productTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const pendingOrderId = useRef<string | null>(null);
  const router = useRouter();

  const platformFee = 10;
  const total = price + platformFee;

  if (!isLoggedIn) {
    return (
      <div className="w-full">
        <div className="p-6 bg-foreground/5 bento-border-t text-center">
          <p className="text-sm text-foreground/60 mb-5 font-sans leading-relaxed">
            You need to be logged in as a verified MNIT student to purchase items.
          </p>
          <div className="flex flex-col sm:flex-row gap-0">
            <Link
              href="/login"
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
            <Link
              href="/signup"
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-foreground font-bold text-xs uppercase tracking-widest hover:bg-foreground/5 transition-colors bento-border"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function cancelPendingOrder() {
    if (!pendingOrderId.current) return;
    try {
      await fetch('/api/checkout/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ razorpay_order_id: pendingOrderId.current }),
      });
    } catch {
      // Best-effort cleanup, ignore errors
    } finally {
      pendingOrderId.current = null;
    }
  }

  async function handlePayment() {
    setLoading(true);
    setError(null);
    setShowModal(false);

    try {
      const orderData = await createOrder(productId);
      if (orderData.error) { setError(orderData.error); setLoading(false); return; }

      // Store order ID so we can cancel it if the user dismisses
      pendingOrderId.current = orderData.orderId!;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'MNIT Marketplace',
        description: productTitle,
        image: '/favicon.ico',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Payment succeeded — clear the pending ref so we don't cancel it
          pendingOrderId.current = null;
          try {
            const res = await fetch('/api/checkout/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                productId,
              }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              setError(data.error || 'Payment verification failed.');
              setLoading(false);
              return;
            }
            router.push(`/orders/${data.transactionId}`);
          } catch {
            setError('Network error during payment verification.');
            setLoading(false);
          }
        },
        prefill: {},
        theme: { color: '#4f46e5' },
        modal: {
          ondismiss: function () {
            // User closed the Razorpay popup — cancel the pending transaction
            cancelPendingOrder();
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        // Payment gateway rejected — cancel the pending transaction
        cancelPendingOrder();
        setError('Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-black/5">
              <h2 className="text-xl font-bold mb-1">Confirm Purchase</h2>
              <p className="text-foreground/60 text-sm line-clamp-1">{productTitle}</p>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Item price</span>
                <span className="font-bold">₹{price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Platform fee</span>
                <span className="font-bold text-foreground/60">₹{platformFee}</span>
              </div>
              <div className="flex justify-between font-black text-lg border-t border-black/5 pt-3">
                <span>Total</span>
                <span className="text-primary-600">₹{total}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-600 font-bold pt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Secured by Razorpay
              </div>
            </div>
            <div className="flex flex-col sm:flex-row border-t border-black/5">
              <button
                onClick={() => { setShowModal(false); setLoading(false); }}
                className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-foreground/50 hover:bg-foreground/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-2 py-4 bg-primary-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <><IndianRupee className="w-3.5 h-3.5" /> Pay ₹{total}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {error && (
          <div className="p-4 bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2 border border-red-500/20">
            <ShieldBan className="w-4 h-4" />
            {error}
          </div>
        )}
        <button
          onClick={() => { setError(null); setShowModal(true); setLoading(false); }}
          disabled={loading}
          className="w-full h-16 flex items-center justify-center gap-3 bg-primary-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>Buy Now — ₹{total} <span className="opacity-70 ml-1 font-mono text-[10px] tracking-normal">(inc. ₹{platformFee} fee)</span></>
          )}
        </button>
      </div>
    </>
  );
}
