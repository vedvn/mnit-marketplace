import { Section, Text, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

export default function AccountUnbannedEmail({ 
  name 
}: { 
  name: string;
}) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

  return (
    <EmailLayout previewText="Great news: Your account access has been restored">
      <Section style={body}>
        <Text style={{ ...heading, color: '#10b981' }}>Welcome Back!</Text>
        <Text style={paragraph}>
          Hi {name}, we are pleased to inform you that your access to the MNIT Marketplace 
          has been fully restored.
        </Text>
        
        <Text style={paragraph}>
          Our moderation team has completed the review of your account, or the temporary suspension period 
          has concluded. You can now resume buying, selling, and communicating with other students on the platform.
        </Text>

        <Section style={{ margin: '32px 0', textAlign: 'center' as const }}>
          <Button
            href={loginUrl}
            style={{
              backgroundColor: '#10b981',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
              textDecoration: 'none',
              textAlign: 'center' as const,
              display: 'inline-block',
              padding: '12px 24px',
            }}
          >
            Access Marketplace
          </Button>
        </Section>

        <Text style={paragraph}>
          Please ensure that you continue to follow our community guidelines and Terms of Service 
          to maintain a safe and trust-based environment for everyone at MNIT.
        </Text>

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            If you have any questions regarding your account status or our policies, please feel free 
            to reply to this email.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
