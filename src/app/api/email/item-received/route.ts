import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import ItemReceivedEmail from '@/lib/emails/ItemReceivedEmail';

export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get('x-internal-secret');
    if (internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, productTitle, sellerName } = await request.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile`;

    const { data, error } = await resend.emails.send({
      from: 'MNIT Marketplace <noreply@mnit.market>',
      to: [email],
      subject: `Received "${productTitle}" yet? - MNIT Marketplace`,
      react: ItemReceivedEmail({ 
        buyerName: name, 
        productTitle, 
        sellerName, 
        confirmUrl 
      }),
    });

    if (error) {
      console.error('[Email ItemReceived] Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('[Email ItemReceived] Internal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
