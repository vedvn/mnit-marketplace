'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { encrypt } from './utils/encryption';

export async function confirmReceipt(transactionId: string, productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();

  // Update transaction status
  const { error: txError } = await adminSupabase
    .from('transactions')
    .update({ payout_status: 'SCHEDULED' })
    .eq('id', transactionId)
    .eq('buyer_id', user.id); 

  if (txError) return { error: txError.message };

  // Trigger Admin Notification for Payout
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const internalSecret = process.env.INTERNAL_API_SECRET;

  const { data: txInfo } = await adminSupabase
    .from('transactions')
    .select(`
      amount_paid,
      seller_payout,
      product:products(title),
      seller:users!seller_id(name, upi_id, bank_account_number, bank_ifsc)
    `)
    .eq('id', transactionId)
    .single();

  if (txInfo) {
    const seller = txInfo.seller as any;
    const payoutDetails = seller.upi_id ? `UPI: ${seller.upi_id}` : `Bank: ${seller.bank_account_number} (${seller.bank_ifsc})`;
    
    fetch(`${appUrl}/api/email/payout-required`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': internalSecret || '' },
      body: JSON.stringify({
        sellerName: seller.name,
        productTitle: (txInfo.product as any).title,
        amount: txInfo.seller_payout,
        payoutDetails
      }),
    }).catch(console.error);
  }

  // Update product status to SOLD
  await adminSupabase
    .from('products')
    .update({ status: 'SOLD', sold_at: new Date().toISOString() })
    .eq('id', productId);

  revalidatePath('/profile');
  return { success: true };
}

export async function markProductSold(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Sellers can update their own products directly via RLS, but we enforce seller_id
  const { error } = await supabase
    .from('products')
    .update({ status: 'SOLD', sold_at: new Date().toISOString() })
    .eq('id', productId)
    .eq('seller_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { success: true };
}

export async function raiseDispute(transactionId: string, productId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  if (!reason || reason.length < 10) {
    return { error: 'Please provide a detailed reason (at least 10 characters).' };
  }

  const adminSupabase = createAdminClient();

  // 1. Verify user is part of the transaction
  const { data: tx } = await adminSupabase
    .from('transactions')
    .select('id, buyer_id, seller_id')
    .eq('id', transactionId)
    .single();

  if (!tx || (tx.buyer_id !== user.id && tx.seller_id !== user.id)) {
    return { error: 'You are not authorized to raise a dispute for this transaction.' };
  }

  // 2. Encrypt the reason
  const encryptedReason = encrypt(reason);

  // 3. Insert dispute
  const { error } = await adminSupabase
    .from('disputes')
    .insert({
      transaction_id: transactionId,
      product_id: productId,
      raised_by: user.id,
      reason: encryptedReason,
      status: 'OPEN'
    });

  if (error) {
    console.error('[Dispute Error]:', error);
    return { error: 'Failed to raise dispute. Please try again later.' };
  }

  revalidatePath('/profile');
  return { success: true };
}
