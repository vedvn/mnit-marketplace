import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import GeneralBroadcastEmail from '@/lib/emails/GeneralBroadcastEmail';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-internal-secret');
    if (secret !== process.env.INTERNAL_API_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, messageHeading, messageBody, buttonText, buttonUrl } = await request.json();
    if (!subject || !messageHeading || !messageBody) {
      return Response.json({ error: 'Subject, Heading, and Body are required.' }, { status: 400 });
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

    const { resend } = await import('@/lib/resend');
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!audienceId) {
      return Response.json({ error: 'RESEND_AUDIENCE_ID not configured.' }, { status: 500 });
    }

    // Launch native Resend Broadcast definitively
    // @ts-ignore - broadcasts object exists in SDK but types may lag
    const { data, error } = await resend.broadcasts.create({
      segmentId: audienceId, // Note: Resend has professionally transitioned to 'segmentId'
      from: 'MNIT Marketplace <noreply@mnitmarketplace.store>',
      subject,
      send: true, // Definitively trigger immediate campus-wide delivery
      // We render the first user's personalized email as the template for the broadcast
      react: GeneralBroadcastEmail({
        name: 'Student', // Using a generic personalization for mass broadcast
        messageHeading,
        messageBody,
        buttonText,
        buttonUrl
      })
    });

    if (error) {
      console.error('[Broadcast API] Resend error:', error);
      return Response.json({ error: 'Failed to launch broadcast.' }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      broadcastId: data?.id
    });
  } catch (err) {
    console.error('[Broadcast API] Fatal error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
