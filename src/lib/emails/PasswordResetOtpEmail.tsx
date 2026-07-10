import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout, body, heading, paragraph } from './components';

interface PasswordResetOtpEmailProps {
  otp: string;
}

export default function PasswordResetOtpEmail({ otp }: PasswordResetOtpEmailProps) {
  return (
    <EmailLayout previewText="Reset your MNIT Marketplace password">
      <Section style={body}>
        <Text style={heading}>Password Reset Request</Text>
        <Text style={paragraph}>
          We received a request to reset your password for your MNIT Marketplace account. Please use the following one-time password (OTP) to reset it:
        </Text>
        <Section style={{ backgroundColor: '#f3f4f6', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
          <Text style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '8px', margin: '0', color: '#c0392b' }}>
            {otp}
          </Text>
        </Section>
        <Text style={paragraph}>
          This code will expire in a few minutes. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.
        </Text>
      </Section>
    </EmailLayout>
  );
}
