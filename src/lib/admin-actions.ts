'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from './utils/encryption';
import { triggerAccountBannedEmail, triggerAccountUnbannedEmail, triggerListingDeletedEmail } from './email-service';
import { runSystemJanitor, logSecurityEvent } from './admin-janitor';

// Helper to double-check rights for Admins
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

// Helper for Staff (Admins or Employees)
async function verifyStaffClearance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase.from('users').select('is_admin, is_employee').eq('id', user.id).single();
  if (!profile) return false;

  // token is usually for admin panel entry, but employees might not have it.
  // We'll trust the DB flag for employees, and token for super admins if needed.
  // To keep it simple and consistent with current admin flow:
  return profile.is_admin === true || profile.is_employee === true;
}

export async function getAdminDashboardData() {
  const cleared = await verifyStaffClearance();
  if (!cleared) return { error: 'Unauthorized' };

  // Trigger automated janitor on dashboard access (Self-healing TTL)
  runSystemJanitor().catch(console.error);

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // 1. Get all sellers (any user who has listed a product)
  const { data: rawProducts } = await supabase
    .from('products')
    .select('seller_id')
    .not('seller_id', 'is', null);

  const sellerIds = Array.from(new Set(rawProducts?.map(p => p.seller_id) || []));

  // 1b. Get all Users for segmentation
  const { data: allUsers } = await adminSupabase.from('users').select('*').order('created_at', { ascending: false });

  // 1c. Get all Products for global oversight
  const { data: allProducts } = await adminSupabase
    .from('products')
    .select('*, seller:users!seller_id(name, email)')
    .order('created_at', { ascending: false });

  // Flatten nested seller arrays for easier frontend consumption
  const flattenedProducts = (allProducts || []).map(p => ({
    ...p,
    seller: Array.isArray(p.seller) ? p.seller[0] : p.seller
  }));

  // 2. Get financial data (transactions)
  const { data: transactions } = await adminSupabase
    .from('transactions')
    .select(`
      *,
      product:products(title, category_id, categories:categories(name)),
      buyer:users!buyer_id(name, email, phone_number),
      seller:users!seller_id(name, email, phone_number, bank_account_number, bank_ifsc, upi_id)
    `)
    .order('created_at', { ascending: false });

  // 3. Aggregate 
  const totalAmountCollected = transactions?.reduce((sum, tx) => sum + Number(tx.amount_paid), 0) || 0;
  const totalPlatformFees = transactions?.reduce((sum, tx) => sum + Number(tx.platform_fee), 0) || 0;

  // 4. Listing Stats by Category
  const { data: categoryStats } = await adminSupabase
    .from('products')
    .select('category_id, status');
  
  // 5. Current settings
  const { data: settings } = await adminSupabase.from('admin_settings').select('*').single();

  // 6. Categories
  const { data: categories } = await adminSupabase.from('categories').select('*').order('name');

  // 7. Analytics Rankings
  const { data: topProducts } = await adminSupabase
    .from('v_product_performance')
    .select('*')
    .limit(10);

  const { data: topPages } = await adminSupabase
    .from('v_page_traffic')
    .select('*')
    .limit(10);

  return {
    success: true,
    sellers: allUsers?.filter(u => sellerIds.includes(u.id)) || [],
    allUsers: allUsers || [],
    allProducts: flattenedProducts,
    transactions: transactions || [],
    categoryStats: categoryStats || [],
    feePercent: settings?.platform_fee_percent ?? 5,
    isMaintenanceMode: settings?.is_maintenance_mode ?? false,
    isBuyingDisabled: settings?.is_buying_disabled ?? false,
    isHolidayMode: settings?.is_holiday_mode ?? false,
    holidayMessage: settings?.holiday_message ?? 'MNIT Marketplace is closed for the holiday break. See you soon!',
    categories: categories || [],
    totals: {
      amountCollected: totalAmountCollected,
      platformFees: totalPlatformFees
    },
    analytics: {
      topProducts: topProducts || [],
      topPages: topPages || []
    }
  };
}

export async function adminDeleteProduct(productId: string, reason: string = "Violation of marketplace policy") {
  const cleared = await verifyAdminClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();
  
  // Get seller info before deleting for notification
  const { data: product } = await adminSupabase
    .from('products')
    .select('title, seller:users!seller_id(name, email)')
    .eq('id', productId)
    .single();

  if (!product) return { error: 'Product not found' };

  const { error } = await adminSupabase.from('products').delete().eq('id', productId);
  if (error) return { error: error.message };

  // Notify Seller
  const seller = Array.isArray(product?.seller) ? product.seller[0] : (product?.seller as any);
  
  if (seller?.email) {
    await triggerListingDeletedEmail(seller.email, seller.name, product.title, reason);
  }

  // Log deletion
  await logSecurityEvent('DELETE_PRODUCT', { productId, title: product.title, reason });

  revalidatePath('/admin');
  return { success: true };
}

export async function getDisputeData() {
  const cleared = await verifyStaffClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();
  const { data: disputes } = await adminSupabase
    .from('disputes')
    .select(`
      *,
      transaction:transactions(*, buyer:users!buyer_id(name, email, phone_number), seller:users!seller_id(name, email, phone_number)),
      product:products(title, price),
      raised_by_user:users!raised_by(name, email)
    `)
    .order('created_at', { ascending: false });

  if (!disputes) return [];

  // Decrypt reasons for staff
  const decryptedDisputes = disputes.map(d => ({
    ...d,
    reason: decrypt(d.reason)
  }));

  return decryptedDisputes;
}

export async function adminResolveDispute(disputeId: string, status: 'RESOLVED' | 'REJECTED', resolution: string) {
  const cleared = await verifyStaffClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('disputes')
    .update({ 
      status, 
      resolution,
      updated_at: new Date().toISOString()
    })
    .eq('id', disputeId);

  if (error) return { error: error.message };

  // Log resolution
  await logSecurityEvent('RESOLVE_DISPUTE', { disputeId, status, resolution });

  revalidatePath('/admin');
  return { success: true };
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

  const adminSupabase = createAdminClient();
  
  let bannedUntil = null;
  if (durationDays !== null) {
    const date = new Date();
    date.setDate(date.getDate() + durationDays);
    bannedUntil = date.toISOString();
  }

  const { error: banError } = await adminSupabase
    .from('users')
    .update({ 
      is_banned: true,
      banned_until: bannedUntil
    })
    .eq('id', userId);
    
  if (banError) {
    console.error('[AdminBan] Error updating user:', banError);
    return { error: banError.message };
  }

  // 1. Permanently delete all AVAILABLE products
  await adminSupabase.from('products').delete().eq('seller_id', userId).eq('status', 'AVAILABLE');

  // 2. Clear out any pending transactions where this user is buyer or seller
  await adminSupabase.from('transactions').delete().eq('buyer_id', userId).eq('payment_status', 'PENDING');
  await adminSupabase.from('transactions').delete().eq('seller_id', userId).eq('payment_status', 'PENDING');

  const { data: user } = await adminSupabase.from('users').select('email, name').eq('id', userId).single();
  if (user?.email) {
    await triggerAccountBannedEmail(
      user.email, 
      user.name, 
      durationDays === null ? `Permanent Ban: ${reason}` : `Temporary Ban (${durationDays} days): ${reason}`,
      bannedUntil
    );
  }

  // Log Ban
  await logSecurityEvent('BAN_USER', { userId, durationDays, reason });

  revalidatePath('/admin');
  return { success: true };
}

export async function adminUnbanUser(userId: string) {
  const cleared = await verifyAdminClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from('users')
    .update({ 
      is_banned: false,
      banned_until: null
    })
    .eq('id', userId);

  if (error) return { error: error.message };

  // Trigger Unban Email
  const { data: user } = await adminSupabase.from('users').select('email, name').eq('id', userId).single();
  if (user?.email) {
    await triggerAccountUnbannedEmail(user.email, user.name);
  }

  // Log Unban
  await logSecurityEvent('UNBAN_USER', { userId });

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

export async function adminUpdatePayoutStatus(transactionId: string, status: 'PENDING' | 'SCHEDULED' | 'COMPLETED') {
  const cleared = await verifyAdminClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('transactions')
    .update({ payout_status: status })
    .eq('id', transactionId);

  if (error) return { error: error.message };

  // Trigger Seller Notification if COMPLETED
  if (status === 'COMPLETED') {
    const { data: txInfo } = await adminSupabase
      .from('transactions')
      .select(`
        seller_payout,
        product:products(title),
        seller:users!seller_id(name, email)
      `)
      .eq('id', transactionId)
      .single();

    if (txInfo) {
      const seller = txInfo.seller as any;
      const { triggerPayoutCompletedEmail } = await import('./email-service');
      
      triggerPayoutCompletedEmail(
        seller.email,
        seller.name,
        (txInfo.product as any).title,
        txInfo.seller_payout
      ).catch(console.error);
    }
  }

  revalidatePath('/admin');
  return { success: true };
}
export async function adminUpdateGlobalSettings(updates: { 
  platform_fee_percent?: number, 
  is_maintenance_mode?: boolean, 
  is_buying_disabled?: boolean,
  is_holiday_mode?: boolean,
  holiday_message?: string
}) {
  const cleared = await verifyStaffClearance();
  if (!cleared) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('admin_settings')
    .update(updates)
    .not('id', 'is', null); // Update all rows (there should only be one)

  if (error) return { error: error.message };

  revalidatePath('/admin');
  revalidatePath('/market');
  revalidatePath('/');
  revalidatePath('/holiday');
  return { success: true };
}
