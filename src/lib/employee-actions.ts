'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { logSecurityEvent } from './admin-janitor';

// Helper to verify that the user is an employee or admin
async function verifyStaffClearance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, is_employee')
    .eq('id', user.id)
    .single();
    
  return profile?.is_admin === true || profile?.is_employee === true;
}

export async function getPendingProducts() {
  if (!await verifyStaffClearance()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, seller:users(name, email)')
    .eq('status', 'PENDING_REVIEW')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  // 1. Compliance Fix: Generate Signed URLs for Private Verification Photos
  // Privacy Policy Section 03 Compliance
  const productsWithSignedUrls = await Promise.all(data.map(async (product) => {
    if (product.live_photo_url && !product.live_photo_url.startsWith('http')) {
      // It's a storage path in the private bucket
      const { data: signedData } = await supabase.storage
        .from('verification-photos')
        .createSignedUrl(product.live_photo_url, 60); // 60s expiry
      
      return { ...product, live_photo_url: signedData?.signedUrl || product.live_photo_url };
    }
    return product;
  }));

  return productsWithSignedUrls;
}

export async function approveProduct(productId: string) {
  if (!await verifyStaffClearance()) return { error: 'Unauthorized' };
  
  const supabase = await createClient();
  
  // 1. Get product and seller details before updating
  const { data: product } = await supabase
    .from('products')
    .select('title, live_photo_url, seller:users(email, name)')
    .eq('id', productId)
    .single();

  const { error } = await supabase
    .from('products')
    .update({ status: 'AVAILABLE' })
    .eq('id', productId);
    
  if (error) return { error: error.message };

  // 1a. Storage Optimization: Delete private verification photo after approval
  // Data Minimization Compliance
  if (product?.live_photo_url) {
    try {
      const adminSupabase = createAdminClient();
      // Delete from private bucket
      const { error: storageError } = await adminSupabase.storage
        .from('verification-photos')
        .remove([product.live_photo_url]);
      
      if (!storageError) {
        // Clear reference in DB since file is gone
        await adminSupabase.from('products').update({ live_photo_url: null }).eq('id', productId);
      } else {
        console.error('Failed to purge verification photo:', storageError);
      }
    } catch (purgeErr) {
      console.error('Error during verification photo purge:', purgeErr);
    }
  }

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

  // Log approval
  await logSecurityEvent('APPROVE_PRODUCT', { productId, title: product?.title });

  revalidatePath('/employee');
  revalidatePath('/market');
  return { success: true };
}

export async function rejectProduct(productId: string, reason: string = 'Violates community guidelines') {
  if (!await verifyStaffClearance()) return { error: 'Unauthorized' };

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
  if (!await verifyStaffClearance()) return { error: 'Unauthorized' };

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
