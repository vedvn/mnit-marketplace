import { Section, Text } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

interface OtpEmailProps {
  otp: string;
  type: 'signup' | 'reset';
  name?: string;
}

export default function OtpEmail({ otp, type, name }: OtpEmailProps) {
  const firstName = name?.split(' ')[0] || 'Student';
  const isSignup = type === 'signup';

  return (
    <EmailLayout previewText={isSignup ? `Your MNIT Marketplace verification code: ${otp}` : `Your password reset code: ${otp}`}>
      <Section style={body}>
        <Text style={heading}>{isSignup ? 'Verify Your Account' : 'Reset Your Password'}</Text>
        <Text style={paragraph}>
          Hey {firstName}, {isSignup
            ? 'use the code below to verify your MNIT Marketplace account.'
            : 'use the code below to reset your password.'}
        </Text>

        {/* OTP Box */}
        <Section style={{
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
          padding: '24px',
          textAlign: 'center' as const,
          margin: '0 0 24px 0',
        }}>
          <Text style={{
            fontSize: '40px',
            fontWeight: '900',
            letterSpacing: '0.3em',
            color: '#000000',
            margin: '0',
            fontFamily: 'monospace',
          }}>
            {otp}
          </Text>
          <Text style={{ fontSize: '11px', color: '#6b7280', margin: '8px 0 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
            This code expires in 10 minutes
          </Text>
        </Section>

        <Text style={paragraph}>
          If you did not request this, you can safely ignore this email. Your account will not be affected.
        </Text>

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            For security, never share this code with anyone. MNIT Marketplace staff will never ask for your OTP.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
