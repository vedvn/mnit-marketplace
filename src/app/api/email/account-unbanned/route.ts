import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/resend';
import AccountUnbannedEmail from '@/lib/emails/AccountUnbannedEmail';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-internal-secret');
    if (secret !== process.env.INTERNAL_API_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name } = await request.json();
    if (!email || !name) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: 'Welcome Back! Your Access has been Restored',
      react: AccountUnbannedEmail({ name }),
    });

    if (!result.success) {
      return Response.json({ error: 'Failed to send' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
