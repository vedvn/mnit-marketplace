import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/resend';
import ListingRejectedEmail from '@/lib/emails/ListingRejectedEmail';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-internal-secret');
    if (secret !== process.env.INTERNAL_API_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, productTitle, reason } = await request.json();
    if (!email || !name || !productTitle || !reason) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: `Update Required: Your listing "${productTitle}"`,
      react: ListingRejectedEmail({ name, productTitle, reason }),
    });

    if (!result.success) {
      return Response.json({ error: 'Failed to send' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
