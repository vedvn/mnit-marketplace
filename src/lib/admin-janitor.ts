'use server';

import { createAdminClient } from './supabase/admin';

/**
 * The Janitor pulls the trigger on the database cleanup function.
 * This handles TTL for camera sessions and clears abandoned transactions.
 */
export async function runSystemJanitor() {
  try {
    const supabase = createAdminClient();
    
    // Call the PostgreSQL function we created in the migration
    const { error } = await supabase.rpc('cleanup_expired_data');
    
    if (error) {
      console.error('[Janitor] Error running cleanup:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, timestamp: new Date().toISOString() };
  } catch (err) {
    console.error('[Janitor] Critical Failure:', err);
    return { success: false, error: 'Janitor failed to start' };
  }
}

/**
 * Log a sensitive system event to the audit log for security tracing.
 */
export async function logSecurityEvent(action: string, details: any = {}, targetId?: string) {
  try {
    const supabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('system_audit_logs').insert({
      actor_id: user?.id || null,
      action,
      target_id: targetId,
      details
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record security event:', err);
  }
}
