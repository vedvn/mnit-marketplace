import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import AdminSubjectRequestEmail from '@/lib/emails/AdminSubjectRequestEmail';

export async function POST(request: NextRequest) {
  try {
    // Verify the user is logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subjectName, branch, semester, additionalNote } = await request.json();

    if (!subjectName?.trim() || !branch?.trim() || semester === undefined || semester === null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (subjectName.trim().length < 2) {
      return Response.json({ error: 'Subject name too short' }, { status: 400 });
    }

    // Get the requester's profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const requesterName = profile?.name || 'Unknown Student';
    const requesterEmail = user.email || 'No email';
    const adminEmail = process.env.ADMIN_EMAIL || 'mnitmarketplace@gmail.com';

    const result = await sendEmail({
      to: adminEmail,
      subject: `📚 Subject Request: "${subjectName.trim()}" — ${branch}, Sem ${semester}`,
      react: AdminSubjectRequestEmail({
        requesterName,
        requesterEmail,
        subjectName: subjectName.trim(),
        branch,
        semester,
        additionalNote: additionalNote?.trim() || undefined,
      }),
    });

    if (!result.success) {
      console.error('[SubjectRequest] Failed to send email:', result.error);
      return Response.json({ error: 'Failed to send request' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[SubjectRequest] Error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
