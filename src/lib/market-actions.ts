'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRazorpay } from '@/lib/razorpay';
import { revalidatePath, unstable_cache } from 'next/cache';

// Cached public product list — busted by revalidatePath('/market') on approve/reject/sell
export const getProducts = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:users(name, email)')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false });
    if (error) { console.error('Error fetching products:', error); return []; }
    return data;
  },
  ['public-products-list'],
  { revalidate: 60, tags: ['products'] } // 60s ISR + tag-based invalidation
);

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, seller:users(name, email), category:categories(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

// Cached categories list — very rarely changes
export const getCategories = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase.from('categories').select('*');
    return data || [];
  },
  ['public-categories-list'],
  { revalidate: 3600, tags: ['categories'] } // 1 hour — categories change very rarely
);

import { sanitizeText } from './security';
import { CAMPUS_SAFE_ZONES } from './constants/locations';
import { findBlacklistedKeyword } from './constants/blacklist';
import { triggerListingApprovedEmail } from './email-service';

export async function createProduct(formData: FormData, imageUrls: string[], livePhotoUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // 1. Compliance Check: Listing is now permitted 24/7 (Handover protocols still apply to physical meetings)

  // 2. Security Guard: Rate Limiting
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', user.id)
    .gt('created_at', oneHourAgo);

  if ((recentProducts || 0) >= 10) {
    return { error: 'Marketplace cooldown active. Please wait an hour before listing more items.' };
  }

  // 0a. Security Guard: Holiday Mode Check
  const { data: settings } = await supabase.from('admin_settings').select('is_maintenance_mode').single();
  if (settings?.is_maintenance_mode) {
    return { error: 'Marketplace is currently closed for maintenance/holiday break.' };
  }

  const title = sanitizeText(formData.get('title') as string);
  const description = sanitizeText(formData.get('description') as string);
  const condition = formData.get('condition') as string;
  const pickup_address = formData.get('pickup_address') as string;
  
  // 3. Compliance Check: Validated Locations (Terms Section 04)
  const isValidLocation = CAMPUS_SAFE_ZONES.some(zone => zone.id === pickup_address);
  if (!isValidLocation) {
    return { error: 'Invalid handover location. Please select one of the official campus safe-zones.' };
  }

  const price = parseFloat(formData.get('price') as string);
  const original_price_raw = formData.get('original_price');
  const original_price = original_price_raw ? parseFloat(original_price_raw as string) : null;

  // 4. Compliance Check: Price Integrity
  if (original_price && price > original_price) {
    return { error: 'Your selling price cannot be higher than the original market price. Please provide a fair value.' };
  }

  const category_id = formData.get('category_id') as string;

  // 5. Pre-screen: Blacklist keyword check on title + description
  //    POLICY: Keyword hits flag for human review — never auto-reject.
  const blacklistHit =
    findBlacklistedKeyword(title) ||
    findBlacklistedKeyword(description);

  // 6. Insert product — queued for manual review by employee/admin
  const { data: newProduct, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      category_id,
      title,
      description,
      condition,
      pickup_address,
      price,
      original_price,
      images: imageUrls,
      live_photo_url: livePhotoUrl,
      status: 'PENDING_REVIEW',
    })
    .select('id, title')
    .single();

  if (error) return { error: error.message };

  const productId = newProduct.id;

  // 7. Fetch seller info for email notifications
  const { data: sellerProfile } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .single();

  // 8. Blacklist hit → flag for human review
  if (blacklistHit) {
    console.log(`[Review] Blacklist hit on "${blacklistHit}" for product ${productId} — queued for human review.`);
    revalidatePath('/market');
    revalidatePath('/employee');
    return { success: true, status: 'PENDING_REVIEW', flagReason: `Keyword flagged: "${blacklistHit}"` };
  }

  // 9. All listings go to PENDING_REVIEW — manually approved by employee/admin
  console.log(`[Review] Product ${productId} ("${title}") queued for manual review.`);
  revalidatePath('/market');
  revalidatePath('/employee');
  return { success: true, status: 'PENDING_REVIEW' };
}

export async function createOrder(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized. Please login.' };

  // 0. Security Guard: Rate Limiting (Prevent Order Brute-forcing)
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { count: recentOrders } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', user.id)
    .gt('created_at', thirtyMinsAgo);

  if ((recentOrders || 0) >= 3) {
    return { error: 'Too many order attempts. Please wait 30 minutes.' };
  }

  const product = await getProductById(productId);
  if (!product) return { error: 'Product not found' };
  if (product.status !== 'AVAILABLE') return { error: 'Product is no longer available' };
  if (product.seller_id === user.id) return { error: 'You cannot buy your own product' };

  // Fetch admin settings for platforms flags
  const { data: adminSettings } = await supabase.from('admin_settings').select('*').single();
  
  if (adminSettings?.is_buying_disabled) {
    return { error: 'Orders are currently disabled due to technical maintenance. Please check back later.' };
  }

  const platformFeePercent = adminSettings?.platform_fee_percent ?? 5; // default 5%
  
  // Fee is calculated but NOT added to the buyer's cost. It is deducted from the seller's payout.
  const platformFee = parseFloat(((product.price * platformFeePercent) / 100).toFixed(2));
  const sellerPayout = parseFloat((product.price - platformFee).toFixed(2));
  
  const amountPaidInPaise = Math.round(product.price * 100);

  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountPaidInPaise,
      currency: "INR",
      receipt: `rect_${Date.now()}`,
    });

    // Use admin client to bypass RLS — transaction insert is server-side and trusted
    const adminSupabase = createAdminClient();
    const { error: txError } = await adminSupabase.from('transactions').insert({
      product_id: product.id,
      buyer_id: user.id,
      seller_id: product.seller_id,
      amount_paid: product.price,
      platform_fee: platformFee,
      seller_payout: sellerPayout,
      payment_status: 'PENDING',
      payout_status: 'PENDING',
      razorpay_order_id: order.id
    });

    if (txError) throw txError;

    return { 
      success: true, 
      orderId: order.id, 
      amount: amountPaidInPaise, 
    };
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return { error: error.message || 'Failed to create order' };
  }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Allow deleting if PENDING_REVIEW or AVAILABLE
  const { error } = await supabase
    .from('products')
    .update({ status: 'REMOVED' })
    .eq('id', productId)
    .eq('seller_id', user.id)
    .in('status', ['AVAILABLE', 'PENDING_REVIEW']);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { success: true };
}

export async function recordProductInteraction(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Anonymous' };

  // Fetch product to verify owner
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  if (fetchError || !product) return { error: 'Product not found' };

  // Definitive Owner Exclusion Audit
  if (product.seller_id === user.id) {
    return { success: true, message: 'Owner interaction excluded' };
  }

  // Orchestrate hardware-accelerated atomic increment via RPC
  const { error: rpcError } = await supabase.rpc('increment_product_interactions', { p_id: productId });

  if (rpcError) {
    console.error('Interactions Increment Error:', rpcError);
    return { error: rpcError.message };
  }

  return { success: true };
}
