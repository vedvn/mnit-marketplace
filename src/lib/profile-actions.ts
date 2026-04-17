'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

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
