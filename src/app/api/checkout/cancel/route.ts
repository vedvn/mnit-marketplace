import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id } = await request.json();
    if (!razorpay_order_id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminSupabase = createAdminClient();

    // Only delete if still PENDING (not if payment somehow succeeded)
    const { error } = await adminSupabase
      .from('transactions')
      .delete()
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('buyer_id', user.id)
      .eq('payment_status', 'PENDING');

    if (error) {
      console.error('[Checkout Cancel] Error:', error);
      return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Checkout Cancel] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
