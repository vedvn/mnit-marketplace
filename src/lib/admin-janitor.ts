'use server';

import { createAdminClient } from './supabase/admin';
import { uploadAnalyticsArchive } from './google-drive';

/**
 * The Janitor pulls the trigger on the database cleanup function.
 * This handles TTL for camera sessions and clears abandoned transactions.
 */
export async function runSystemJanitor() {
  try {
    const supabase = createAdminClient();
    
    // 1. Run database-level TTL cleanup (PostgreSQL function)
    const { error: dbError } = await supabase.rpc('cleanup_expired_data');
    if (dbError) console.error('[Janitor] DB Cleanup Error:', dbError);
    
    // 2. Handle Analytics Archiving (data > 30 days)
    const archiveResult = await handleAnalyticsArchiving(supabase);
    
    return { 
      success: true, 
      timestamp: new Date().toISOString(),
      archivedCount: archiveResult?.count || 0,
      status: archiveResult?.status || 'No cleanup needed'
    };
  } catch (err) {
    console.error('[Janitor] Critical Failure:', err);
    return { success: false, error: 'Janitor failed to start' };
  }
}

/**
 * Fetches old analytics, uploads to Drive, and deletes from DB.
 */
async function handleAnalyticsArchiving(supabase: any) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Fetch records older than 30 days
    const { data: oldRecords, error: fetchError } = await supabase
      .from('site_analytics')
      .select('*')
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (fetchError) {
      console.error('[Janitor] Failed to fetch old analytics:', fetchError);
      return { count: 0, status: 'Database error while fetching' };
    }

    if (!oldRecords || oldRecords.length === 0) {
      console.log('[Janitor] No old analytics to archive.');
      return { count: 0, status: 'All data is fresh (< 30 days old)' };
    }

    console.log(`[Janitor] Archiving ${oldRecords.length} analytics records to Google Drive...`);

    // Upload to Drive
    const filename = `analytics_archive_${new Date().toISOString().split('T')[0]}.csv`;
    const archiveResult = await uploadAnalyticsArchive(oldRecords, filename);

    if (archiveResult.success) {
      // DELETE from Supabase only if archive was successful
      const { error: deleteError } = await supabase
        .from('site_analytics')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (deleteError) {
        console.error('[Janitor] Failed to prune analytics after archiving:', deleteError);
        return { count: oldRecords.length, status: 'Archived to Drive, but failed to prune from DB' };
      } else {
        console.log(`[Janitor] Successfully archived and pruned ${oldRecords.length} records.`);
        return { count: oldRecords.length, status: 'Archive and pruning successful' };
      }
    } else {
      console.error('[Janitor] Analytics archiving FAILED. Pruning aborted.');
      return { count: 0, status: `Drive Upload Failed: ${archiveResult.error || 'Unknown error'}` };
    }
  } catch (err: any) {
    console.error('[Janitor] Analytics handling crashed:', err);
    return { count: 0, status: `Crash: ${err.message}` };
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
