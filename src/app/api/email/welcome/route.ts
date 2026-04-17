import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/resend';
import WelcomeEmail from '@/lib/emails/WelcomeEmail';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-internal-secret');
    if (secret !== process.env.INTERNAL_API_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name } = await request.json();
    if (!email || !name) {
      return Response.json({ error: 'Missing email or name.' }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: 'Welcome to MNIT Marketplace!',
      react: WelcomeEmail({ name }),
    });

    if (!result.success) {
      return Response.json({ error: 'Failed to send' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
