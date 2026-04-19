import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/admin';
import PolicyUpdateEmail from '@/lib/emails/PolicyUpdateEmail';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-internal-secret');
    if (secret !== process.env.INTERNAL_API_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { policyType, updatedDate, summaryOfChanges } = await request.json();
    if (!policyType || !updatedDate || !summaryOfChanges) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Initialize Admin Supabase Client to bypass RLS and fetch all user emails
    const supabase = createAdminClient();
    
    // Fetch all active (non-banned) users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('email, name')
      .eq('is_banned', false);

    if (fetchError) {
      console.error('[Broadcast API] Error fetching users:', fetchError);
      return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return Response.json({ success: true, message: 'No users to notify' });
    }

    // Send emails in batches to avoid overwhelming Resend API
    // Resend allows arrays of up to 50 emails per API call, but we want 
    // personalized names. So we use the Batch API.
    const BATCH_SIZE = 100;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      
      const emailBatch = batch.map(user => ({
        from: 'MNIT Marketplace <noreply@mnitmarketplace.store>',
        to: user.email,
        replyTo: 'mnitmarketplace@gmail.com',
        subject: `Notice of Updates to ${policyType}`,
        react: PolicyUpdateEmail({
          name: user.name || 'User',
          policyType,
          updatedDate,
          summaryOfChanges
        })
      }));

      try {
        const { resend } = await import('@/lib/resend');
        // @ts-ignore - resend.batch object exists but types might be outdated
        const { data, error } = await resend.batch.send(emailBatch);
        
        if (error) {
          console.error(`[Broadcast API] Batch error:`, error);
          failCount += batch.length;
        } else {
          successCount += batch.length;
        }
      } catch (batchErr) {
        console.error(`[Broadcast API] Batch runtime error:`, batchErr);
        failCount += batch.length;
      }
    }

    return Response.json({ 
      success: true, 
      sent: successCount, 
      failed: failCount 
    });
  } catch (err) {
    console.error('[Broadcast API] Fatal error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
