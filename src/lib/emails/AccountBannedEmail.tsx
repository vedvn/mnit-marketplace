import { Section, Text } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

export default function AccountBannedEmail({ 
  name, 
  reason,
  until
}: { 
  name: string; 
  reason: string;
  until?: string | null;
}) {
  const isPermanent = !until;
  const expiryDate = until ? new Date(until).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;
  return (
    <EmailLayout previewText="Urgent: Your account has been suspended">
      <Section style={body}>
        <Text style={{ ...heading, color: '#dc2626' }}>Account Suspended</Text>
        <Text style={paragraph}>
          Hi {name}, following a review of your account activities, your access to the MNIT Marketplace 
          has been suspended.
        </Text>
        
        <Section style={{ borderLeft: '3px solid #dc2626', paddingLeft: '16px', margin: '24px 0' }}>
          <Text style={{ ...paragraph, fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em' }}>Reason for Suspension:</Text>
          <Text style={{ ...paragraph, margin: '0', color: '#4b5563' }}>&quot;{reason}&quot;</Text>
        </Section>

        <Text style={paragraph}>
          This decision means you can no longer buy, sell, or communicate with other users on the platform. All 
          active listings have been removed.
        </Text>

        <Section style={{ margin: '24px 0', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
          <Text style={{ ...paragraph, margin: '0', fontWeight: 'bold', color: '#dc2626' }}>
            Status: {isPermanent ? 'Permanently Suspended' : `Suspended until ${expiryDate}`}
          </Text>
        </Section>

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            If you believe this action was taken in error or if your account was compromised, you may submit 
            an appeal by replying directly to this email. Our moderation team will review your case.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
