import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout, body, heading, paragraph } from './components';

interface SignupOtpEmailProps {
  name?: string;
  otp: string;
}

export default function SignupOtpEmail({ name = 'Student', otp }: SignupOtpEmailProps) {
  return (
    <EmailLayout previewText="Verify your MNIT Marketplace account">
      <Section style={body}>
        <Text style={heading}>Welcome, {name}!</Text>
        <Text style={paragraph}>
          Thank you for registering on MNIT Marketplace. To complete your registration and verify your email address, please use the following one-time password (OTP):
        </Text>
        <Section style={{ backgroundColor: '#f3f4f6', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
          <Text style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '8px', margin: '0', color: '#c0392b' }}>
            {otp}
          </Text>
        </Section>
        <Text style={paragraph}>
          This code will expire in a few minutes. If you did not sign up for an account, you can safely ignore this email.
        </Text>
      </Section>
    </EmailLayout>
  );
}
