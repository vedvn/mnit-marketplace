'use server';

import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';

export type AnalyticsEventType = 'PAGE_VIEW' | 'PRODUCT_INTERACTION';

/**
 * Log an analytics event to the database.
 * This is designed to be called from both client and server components.
 */
export async function logAnalyticsEvent(
  type: AnalyticsEventType,
  path: string,
  productId?: string,
  categoryId?: string,
  metadata: any = {}
) {
  try {
    // Use admin client for logging to bypass RLS restrictions if necessary
    // (though our policy allows anyone to insert, service role is safer for background logs)
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('site_analytics').insert({
      event_type: type,
      path: path,
      product_id: productId || null,
      category_id: categoryId || null,
      metadata: metadata || {}
    });

    if (error) {
      console.error('[Analytics] Failed to log event:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Analytics] Critical failure:', err);
    return { success: false, error: 'Internal logging error' };
  }
}
