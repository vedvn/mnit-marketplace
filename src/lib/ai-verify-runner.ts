/**
 * AI Verify Runner
 *
 * Contains the core orchestration logic for AI product verification.
 * Called from market-actions.ts via Next.js `after()`, so it runs
 * in-process after the server action response is sent — no HTTP hop needed.
 *
 * Also re-exported by the /api/ai/verify-product route for direct HTTP access
 * if ever needed (e.g., retrying a failed verification from the admin panel).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { verifyProductWithAI } from '@/lib/ai-verifier';
import { triggerListingAutoApprovedEmail, triggerAdminProductAlertEmail } from '@/lib/email-service';
import { revalidatePath } from 'next/cache';
import { logSecurityEvent } from '@/lib/admin-janitor';

export async function runAIVerificationForProduct(productId: string): Promise<void> {
  const adminSupabase = createAdminClient();

  // 1. Fetch product + seller details
  const { data: product, error: fetchError } = await adminSupabase
    .from('products')
    .select('id, title, description, condition, images, live_photo_url, seller:users(name, email)')
    .eq('id', productId)
    .single();

  if (fetchError || !product) {
    console.error('[AIVerify] Product not found:', productId, fetchError);
    return;
  }

  const seller = product.seller as any;
  const sellerEmail: string = seller?.email ?? '';
  const sellerName: string = seller?.name ?? 'Seller';

  // 2. Resolve image URLs
  const publicImageUrl: string =
    Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '';

  let verificationPhotoUrl: string | null = null;
  if (product.live_photo_url && !product.live_photo_url.startsWith('http')) {
    const { data: signedData } = await adminSupabase.storage
      .from('verification-photos')
      .createSignedUrl(product.live_photo_url, 120); // 2-minute window for AI to fetch
    verificationPhotoUrl = signedData?.signedUrl ?? null;
  } else if (product.live_photo_url) {
    verificationPhotoUrl = product.live_photo_url;
  }

  // 3. Run AI verification
  console.log(`[AIVerify] Starting analysis for "${product.title}" (${productId})`);

  const verdict = await verifyProductWithAI({
    publicImageUrl,
    verificationPhotoUrl,
    title: product.title,
    description: product.description ?? '',
    condition: product.condition ?? 'GOOD',
  });

  console.log(`[AIVerify] Verdict for ${productId}:`, JSON.stringify(verdict));

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin`;

  // 4a. CLEAN → auto-approve
  if (verdict.isClean && verdict.confidence !== 'low') {
    const { error: updateError } = await adminSupabase
      .from('products')
      .update({ status: 'AVAILABLE' })
      .eq('id', productId);

    if (updateError) {
      console.error('[AIVerify] Failed to auto-approve product:', updateError);
      // Fall through to send admin alert so it doesn't go unnoticed
    } else {
      // Delete verification photo (data minimization — same as manual approveProduct)
      if (product.live_photo_url && !product.live_photo_url.startsWith('http')) {
        try {
          await adminSupabase.storage
            .from('verification-photos')
            .remove([product.live_photo_url]);
          await adminSupabase
            .from('products')
            .update({ live_photo_url: null })
            .eq('id', productId);
        } catch (purgeErr) {
          console.warn('[AIVerify] Non-fatal: Failed to purge verification photo:', purgeErr);
        }
      }

      // Email seller
      if (sellerEmail) {
        await triggerListingAutoApprovedEmail(sellerEmail, sellerName, product.title, productId);
      }

      await logSecurityEvent('AUTO_APPROVE_PRODUCT', {
        productId,
        title: product.title,
        aiConfidence: verdict.confidence,
        aiSummary: verdict.summary,
        method: 'AI_VISION',
      });

      revalidatePath('/market');
      revalidatePath('/employee');
      revalidatePath('/profile');

      console.log(`[AIVerify] ✅ Auto-approved: "${product.title}" (${productId})`);
      return;
    }
  }

  // 4b. FLAGGED (or low confidence or DB update failed) → keep PENDING_REVIEW, alert admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await triggerAdminProductAlertEmail({
      adminEmail,
      productId,
      productTitle: product.title,
      sellerName,
      sellerEmail,
      aiSummary: verdict.summary,
      aiFlags: verdict.flags,
      aiConfidence: verdict.confidence,
      adminUrl,
    });
  }

  await logSecurityEvent('AI_FLAGGED_PRODUCT', {
    productId,
    title: product.title,
    aiConfidence: verdict.confidence,
    aiFlags: verdict.flags,
    aiSummary: verdict.summary,
  });

  console.log(`[AIVerify] ⚠️ Flagged for manual review: "${product.title}" (${productId})`);
}
