import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout, body, heading, paragraph } from './components';

interface MagicLinkOtpEmailProps {
  otp: string;
}

export default function MagicLinkOtpEmail({ otp }: MagicLinkOtpEmailProps) {
  return (
    <EmailLayout previewText="Your MNIT Marketplace login code">
      <Section style={body}>
        <Text style={heading}>Your Login Code</Text>
        <Text style={paragraph}>
          You requested a secure login code for MNIT Marketplace. Please use the following one-time password (OTP) to sign in:
        </Text>
        <Section style={{ backgroundColor: '#f3f4f6', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
          <Text style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '8px', margin: '0', color: '#c0392b' }}>
            {otp}
          </Text>
        </Section>
        <Text style={paragraph}>
          This code will expire in a few minutes. If you did not request to sign in, you can safely ignore this email.
        </Text>
      </Section>
    </EmailLayout>
  );
}
