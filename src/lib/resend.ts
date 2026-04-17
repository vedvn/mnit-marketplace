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
    const { data, error } = await resend.emails.send({
      from: 'MNIT Marketplace <onboarding@resend.dev>', // Verified domain or resend default for testing
      to,
      subject,
      replyTo: 'mnitmarketplace@gmail.com',
      react, // Pass the React element directly for compilation
    });

    if (error) {
      console.error('[Resend Helper] Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[Resend Helper] Unexpected error:', err);
    return { success: false, error: err };
  }
}
