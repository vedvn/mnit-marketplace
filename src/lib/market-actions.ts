'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRazorpay } from '@/lib/razorpay';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, seller:users(name, email)')
    .eq('status', 'AVAILABLE')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

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

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*');
  return data || [];
}

export async function createProduct(formData: FormData, imageUrls: string[], livePhotoUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const condition = formData.get('condition') as string;
  const pickup_address = formData.get('pickup_address') as string;
  const price = parseFloat(formData.get('price') as string);
  const original_price_raw = formData.get('original_price');
  const original_price = original_price_raw ? parseFloat(original_price_raw as string) : null;
  const category_id = formData.get('category_id') as string;

  const { error } = await supabase.from('products').insert({
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
    status: 'PENDING_REVIEW'
  });

  if (error) return { error: error.message };

  revalidatePath('/market');
  return { success: true };
}

export async function createOrder(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized. Please login.' };

  const product = await getProductById(productId);
  if (!product) return { error: 'Product not found' };
  if (product.status !== 'AVAILABLE') return { error: 'Product is no longer available' };
  if (product.seller_id === user.id) return { error: 'You cannot buy your own product' };

  // Fetch admin settings for platform fee percentage
  const { data: adminSettings } = await supabase.from('admin_settings').select('*').single();
  const platformFeePercent = adminSettings?.platform_fee_percent ?? 5; // default 5%
  const platformFee = parseFloat(((product.price * platformFeePercent) / 100).toFixed(2));
  
  const amountPaidInPaise = Math.round((product.price + platformFee) * 100);

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
      amount_paid: product.price + platformFee,
      platform_fee: platformFee,
      seller_payout: product.price,
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
