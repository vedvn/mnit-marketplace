import { Resend } from 'resend';
import { ReactElement } from 'react';

// Create a Resend instance.
// Ensure RESEND_API_KEY is available during build/runtime.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  try {
    const fromAddress = 'MNIT Marketplace <noreply@mnitmarketplace.store>';
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      replyTo: 'mnitmarketplace@gmail.com',
      react,
    });

    if (error) {
      console.error(`[Resend] FAILED to send email to ${to}:`, error);
      
      // Check for common onboarding error
      if (error.name === 'validation_error' || error.message?.includes('onboarding')) {
        console.warn('⚠️  [Resend Warning] You are likely in Onboarding mode. You can ONLY send emails to the email address associated with your Resend account (the owner/developer email). To send to all users, you must verify a custom domain in the Resend dashboard.');
      }
      
      return { success: false, error };
    }

    console.log(`[Resend] SUCCESS: Sent "${subject}" to ${to}`);
    return { success: true, data };
  } catch (err) {
    console.error('[Resend] Unexpected Error:', err);
    return { success: false, error: err };
  }
}
