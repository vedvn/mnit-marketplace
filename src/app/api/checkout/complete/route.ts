import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRazorpay } from '@/lib/razorpay';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !productId) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
    }

    // 1. Verify Razorpay signature (HMAC-SHA256)
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Fetch the Razorpay payment to get method used
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const paymentMethod = payment.method || 'unknown';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminSupabase = createAdminClient();

    // 3. Update transaction to SUCCESS + store payment method
    const { data: tx, error: txError } = await adminSupabase
      .from('transactions')
      .update({
        payment_status: 'SUCCESS',
        payment_method: paymentMethod,
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('buyer_id', user.id)
      .select('*, product:products(title, seller_id), seller:users!seller_id(name, phone_number, email)')
      .single();

    if (txError || !tx) {
      console.error('[Checkout] Transaction update error:', txError);
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }

    // 4. Mark product as SOLD
    await adminSupabase
      .from('products')
      .update({ status: 'SOLD', sold_at: new Date().toISOString() })
      .eq('id', productId);

    // 5. Get buyer details for emails
    const { data: buyer } = await adminSupabase
      .from('users')
      .select('name, email, phone_number')
      .eq('id', user.id)
      .single();

    const internalSecret = process.env.INTERNAL_API_SECRET || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    // 6. Orchestrate High-Fidelity Institutional Notifications
    const { 
      triggerOrderConfirmedEmail, 
      triggerItemSoldEmail, 
      triggerItemReceivedReminder 
    } = await import('@/lib/email-service');

    // 6a. Email buyer — order confirmed
    triggerOrderConfirmedEmail(
      buyer?.email || '',
      buyer?.name || 'Student',
      (tx.product as any)?.title,
      (tx.seller as any)?.name,
      (tx.seller as any)?.phone_number,
      tx.amount_paid,
      tx.id
    ).catch(console.error);

    // 6b. Email seller — item sold
    triggerItemSoldEmail(
      (tx.seller as any)?.email,
      (tx.seller as any)?.name,
      (tx.product as any)?.title,
      tx.amount_paid,
      tx.platform_fee,
      tx.seller_payout,
      buyer?.name || 'Student',
      buyer?.phone_number || '',
      buyer?.email || ''
    ).catch(console.error);

    // 6c. Email buyer — receipt instruction reminder
    triggerItemReceivedReminder(
      buyer?.email || '',
      buyer?.name || 'Student',
      (tx.product as any)?.title,
      (tx.seller as any)?.name,
      `${process.env.NEXT_PUBLIC_APP_URL}/profile`
    ).catch(console.error);

    return NextResponse.json({ success: true, transactionId: tx.id });

  } catch (err: any) {
    console.error('[Checkout Complete] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
