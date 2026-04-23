import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import OtpEmail from '@/lib/emails/OtpEmail';

/**
 * Supabase Auth Hook — Send Email
 * 
 * Configure this in Supabase Dashboard:
 * Auth → Hooks → "Send Email" hook
 * Set the URL to: https://mnitmarketplace.store/api/auth/send-email
 * 
 * Supabase will POST here instead of sending emails itself.
 * This gives us full control to send via Resend with our branded template.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the request is genuinely from Supabase using the hook secret
    const hookSecret = process.env.SUPABASE_AUTH_HOOK_SECRET;
    if (hookSecret) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || authHeader !== `Bearer ${hookSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();
    const { user, email_data } = body;

    const email = user?.email;
    const name = user?.user_metadata?.full_name;
    const token = email_data?.token; // The actual OTP from Supabase
    const emailType = email_data?.email_action_type; // 'signup', 'recovery', 'magiclink', etc.

    if (!email || !token) {
      return NextResponse.json({ error: 'Missing email or token' }, { status: 400 });
    }

    let subject = 'MNIT Marketplace — Verification Code';
    let type: 'signup' | 'reset' = 'signup';

    if (emailType === 'recovery') {
      subject = 'Reset your MNIT Marketplace password';
      type = 'reset';
    } else if (emailType === 'signup' || emailType === 'email_change') {
      subject = 'Your MNIT Marketplace verification code';
      type = 'signup';
    }

    const result = await sendEmail({
      to: email,
      subject,
      react: OtpEmail({ otp: token, type, name }),
    });

    if (!result.success) {
      console.error('[AuthHook] Failed to send email via Resend:', result.error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    console.log(`[AuthHook] Successfully sent ${emailType} email to ${email}`);
    // Supabase requires a JSON response with Content-Type header
    return NextResponse.json({}, { status: 200 });

  } catch (err) {
    console.error('[AuthHook] Crash:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
