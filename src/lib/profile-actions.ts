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
    .update({ 
      payout_status: 'SCHEDULED',
      buyer_confirmed_at: new Date().toISOString() 
    })
    .eq('id', transactionId)
    .eq('buyer_id', user.id); 

  if (txError) return { error: txError.message };

  // Trigger Admin Notification for Payout
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const internalSecret = process.env.INTERNAL_API_SECRET;

  // FETCH FROM user_financials (Hardened Privacy fix)
  const { data: txInfo } = await adminSupabase
    .from('transactions')
    .select(`
      amount_paid,
      seller_payout,
      product:products(title),
      seller:users!seller_id(name),
      financials:user_financials!seller_id(upi_id, bank_account_number, bank_ifsc)
    `)
    .eq('id', transactionId)
    .single();

  if (txInfo) {
    const seller = txInfo.seller as any;
    const financials = txInfo.financials as any;
    const payoutDetails = financials?.upi_id ? `UPI: ${financials.upi_id}` : `Bank: ${financials.bank_account_number} (${financials.bank_ifsc})`;
    
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

/**
 * Compliance Section 06 / DPDP Act: 30-day "Right to be Forgotten" request handler.
 * Flags the account for permanent removal by the janitor service.
 */
export async function requestAccountDeletion() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('users')
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return { error: error.message };

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

export async function raiseDispute(
  transactionId: string | null, 
  productId: string | null, 
  reason: string,
  category?: string,
  preferredResolution?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  if (!reason || reason.length < 10) {
    return { error: 'Please provide a detailed reason (at least 10 characters).' };
  }

  const adminSupabase = createAdminClient();

  // 1. If transaction ID is provided, verify user is part of it
  if (transactionId) {
    const { data: tx } = await adminSupabase
      .from('transactions')
      .select('id, buyer_id, seller_id')
      .eq('id', transactionId)
      .single();

    if (!tx || (tx.buyer_id !== user.id && tx.seller_id !== user.id)) {
      return { error: 'You are not authorized to raise a dispute for this transaction.' };
    }
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
      category,
      preferred_resolution: preferredResolution,
      status: 'OPEN'
    });

  if (error) {
    console.error('[Dispute Error]:', error);
    return { error: 'Failed to raise dispute. Please try again later.' };
  }

  revalidatePath('/profile');
  return { success: true };
}

/**
 * Updates public profile fields in the users table.
 */
export async function updateUserProfile(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' };

  const { error } = await supabase
    .from('users')
    .update({ name })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { success: true };
}

/**
 * Updates sensitive PII in the user_financials table.
 */
export async function updateUserFinancials(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const phone = formData.get('phone_number') as string;
  const upiId = formData.get('upi_id') as string;
  const bankAccount = formData.get('bank_account_number') as string;
  const bankIfsc = formData.get('bank_ifsc') as string;

  // Basic Validations
  if (phone && !/^[6-9]\d{9}$/.test(phone)) return { error: 'Invalid 10-digit phone number.' };
  if (bankIfsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankIfsc.toUpperCase())) return { error: 'Invalid IFSC code.' };

  const { error } = await supabase
    .from('user_financials')
    .upsert({
      id: user.id,
      phone_number: phone || null,
      upi_id: upiId || null,
      bank_account_number: bankAccount || null,
      bank_ifsc: bankIfsc?.toUpperCase() || null,
      updated_at: new Date().toISOString()
    });

  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { success: true };
}
