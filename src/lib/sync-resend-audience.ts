import { createAdminClient } from '@/lib/supabase/admin';
import { resend } from '@/lib/resend';

export async function syncExistingUsersToResend() {
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!audienceId) {
    console.error('RESEND_AUDIENCE_ID not configured in .env.local');
    return { success: false, error: 'Missing audienceId' };
  }

  const supabase = createAdminClient();

  console.log('--- Institutional Audience Sync Initiated ---');

  // 1. Fetch all active users
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('email, name')
    .eq('is_banned', false);

  if (fetchError || !users) {
    console.error('Error fetching users:', fetchError);
    return { success: false, error: fetchError };
  }

  console.log(`Discovered ${users.length} active students for synchronization.`);

  let successCount = 0;
  let failCount = 0;
  let alreadyExistsCount = 0;

  // 2. Synchronize in serialized batches to respect rate limits
  for (const user of users) {
    try {
      // @ts-ignore - resend.contacts exists
      await resend.contacts.create({
        email: user.email,
        firstName: (user.name || 'Student').split(' ')[0],
        lastName: (user.name || '').split(' ').slice(1).join(' ') || '',
        unsubscribed: false,
        audienceId: audienceId,
      });
      successCount++;
      if (successCount % 10 === 0) console.log(`Processed ${successCount} contacts...`);
    } catch (err: any) {
      if (err.message?.includes('already exists') || err.statusCode === 409) {
        alreadyExistsCount++;
      } else {
        console.error(`Failed to sync ${user.email}:`, err.message);
        failCount++;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('--- Sync Completed ---');
  console.log(`Newly Synchronized: ${successCount}`);
  console.log(`Already In Audience: ${alreadyExistsCount}`);
  console.log(`Failed: ${failCount}`);

  return { success: true, newlySynced: successCount, alreadyInAudience: alreadyExistsCount, failed: failCount };
}
