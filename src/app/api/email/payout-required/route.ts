import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import AdminPayoutRequiredEmail from '@/lib/emails/AdminPayoutRequiredEmail';

export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get('x-internal-secret');
    if (internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sellerName, productTitle, amount, payoutDetails } = await request.json();
    
    const adminEmail = process.env.RESEND_FROM_EMAIL || 'mnitmarketplace@gmail.com';
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin`;

    const { data, error } = await resend.emails.send({
      from: 'MNIT System <alerts@mnit.market>',
      to: [adminEmail],
      subject: `🚨 Payout Required: ₹${amount} for ${sellerName}`,
      react: AdminPayoutRequiredEmail({ 
        sellerName, 
        productTitle, 
        amount, 
        payoutDetails, 
        adminUrl 
      }),
    });

    if (error) {
      console.error('[Email PayoutRequired] Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('[Email PayoutRequired] Internal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
