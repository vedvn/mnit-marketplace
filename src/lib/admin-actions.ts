'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Helper to double-check rights
async function verifyAdminClearance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_auth')?.value;
  const isTokenValid = token === process.env.ADMIN_PANEL_PASSWORD;

  return profile?.is_admin === true && isTokenValid;
}

export async function getAdminDashboardData() {
  const cleared = await verifyAdminClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const supabase = await createClient();

  // 1. Get all sellers (any user who has listed a product)
  const { data: rawProducts } = await supabase
    .from('products')
    .select('seller_id')
    .not('seller_id', 'is', null);

  const sellerIds = Array.from(new Set(rawProducts?.map(p => p.seller_id) || []));

  let sellers = [];
  if (sellerIds.length > 0) {
    const { data: sellersData } = await supabase
      .from('users')
      .select('*')
      .in('id', sellerIds);
    sellers = sellersData || [];
  }

  // 2. Get financial data (transactions)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. Aggregate 
  const totalAmountCollected = transactions?.reduce((sum, tx) => sum + Number(tx.amount_paid), 0) || 0;
  const totalPlatformFees = transactions?.reduce((sum, tx) => sum + Number(tx.platform_fee), 0) || 0;

  // 4. Current fee setting
  const { data: settings } = await adminSupabase.from('admin_settings').select('platform_fee_percent').single();

  // 5. Categories
  const { data: categories } = await adminSupabase.from('categories').select('*').order('name');

  return {
    success: true,
    sellers,
    transactions: transactions || [],
    feePercent: settings?.platform_fee_percent ?? 5,
    categories: categories || [],
    totals: {
      amountCollected: totalAmountCollected,
      platformFees: totalPlatformFees
    }
  };
}

export async function adminCreateCategory(name: string) {
  const cleared = await verifyAdminClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('categories').insert({ name: name.trim() });
  if (error) return { error: error.message };

  revalidatePath('/admin');
  return { success: true };
}

export async function adminDeleteCategory(id: string) {
  const cleared = await verifyAdminClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('categories').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin');
  return { success: true };
}

export async function adminBanUser(userId: string, durationDays: number | null, reason: string = 'Violated marketplace rules') {
  const cleared = await verifyAdminClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const supabase = await createClient();
  
  let bannedUntil = null;
  if (durationDays !== null) {
    const date = new Date();
    date.setDate(date.getDate() + durationDays);
    bannedUntil = date.toISOString();
  }

  const { error } = await supabase
    .from('users')
    .update({ 
      is_banned: true,
      banned_until: bannedUntil
    })
    .eq('id', userId);
    
  if (error) return { error: error.message };

  await supabase.from('products').update({ status: 'REMOVED' }).eq('seller_id', userId).eq('status', 'AVAILABLE');

  const { data: user } = await supabase.from('users').select('email, name').eq('id', userId).single();
  if (user?.email) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/account-banned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        reason: durationDays === null ? `Permanent Ban: ${reason}` : `Temporary Ban (${durationDays} days): ${reason}`,
      }),
    }).catch(console.error);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function adminUnbanUser(userId: string) {
  const cleared = await verifyAdminClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('users')
    .update({ 
      is_banned: false,
      banned_until: null
    })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin');
  return { success: true };
}

export async function adminDeleteTransaction(transactionId: string) {
  const cleared = await verifyAdminClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);

  if (error) return { error: error.message };

  revalidatePath('/admin');
  return { success: true };
}
