import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import PayoutCompletedEmail from '@/lib/emails/PayoutCompletedEmail';

export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get('x-internal-secret');
    if (internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, productTitle, amount } = await request.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const { data, error } = await resend.emails.send({
      from: 'MNIT Marketplace <payouts@mnit.market>',
      to: [email],
      subject: `Payout Disbursed: ₹${amount} for your sale!`,
      react: PayoutCompletedEmail({ 
        sellerName: name, 
        productTitle, 
        amount 
      }),
    });

    if (error) {
      console.error('[Email PayoutCompleted] Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('[Email PayoutCompleted] Internal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
