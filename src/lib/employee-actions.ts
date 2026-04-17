'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPendingProducts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Security check: ensure user is employee or admin
  const { data: profile } = await supabase.from('users').select('is_employee, is_admin').eq('id', user.id).single();
  if (!profile || (!profile.is_employee && !profile.is_admin)) return [];

  const { data } = await supabase
    .from('products')
    .select('*, seller:users(name, email)')
    .eq('status', 'PENDING_REVIEW')
    .order('created_at', { ascending: false });

  return data || [];
}

export async function approveProduct(productId: string) {
  const supabase = await createClient();
  
  // 1. Get product and seller details before updating
  const { data: product } = await supabase
    .from('products')
    .select('title, seller:users(email, name)')
    .eq('id', productId)
    .single();

  const { error } = await supabase
    .from('products')
    .update({ status: 'AVAILABLE' })
    .eq('id', productId);
    
  if (error) return { error: error.message };

  // 2. Fire approval email asynchronously (don't await so UI doesn't block)
  // Safely extract string values as Supabase typings can infer array/unknown for joins
  const seller = product?.seller as any;
  if (seller?.email) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/listing-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
      },
      body: JSON.stringify({
        email: seller.email,
        name: seller.name,
        productTitle: product?.title,
        productId,
      }),
    }).catch(console.error);
  }

  revalidatePath('/employee');
  revalidatePath('/market');
  return { success: true };
}

export async function rejectProduct(productId: string, reason: string = 'Violates community guidelines') {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('title, seller:users(email, name)')
    .eq('id', productId)
    .single();

  const { error } = await supabase
    .from('products')
    .update({ status: 'REMOVED' })
    .eq('id', productId);
    
  if (error) return { error: error.message };

  const seller = product?.seller as any;
  if (seller?.email) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/listing-rejected`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
      },
      body: JSON.stringify({
        email: seller.email,
        name: seller.name,
        productTitle: product?.title,
        reason,
      }),
    }).catch(console.error);
  }

  revalidatePath('/employee');
  return { success: true };
}

export async function banUser(userId: string, reason: string = 'Fraudulent activity or scam attempts') {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', userId)
    .single();

  const { error } = await supabase
    .from('users')
    .update({ is_banned: true })
    .eq('id', userId);
    
  if (error) return { error: error.message };

  // Also remove all their active listings
  await supabase.from('products').update({ status: 'REMOVED' }).eq('seller_id', userId).eq('status', 'AVAILABLE');

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
        reason,
      }),
    }).catch(console.error);
  }

  revalidatePath('/employee');
  return { success: true };
}
