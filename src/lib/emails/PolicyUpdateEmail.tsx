import { Section, Text, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, buttonPrimary } from './components';

export default function PolicyUpdateEmail({ 
  name, 
  policyType,
  updatedDate,
  summaryOfChanges
}: { 
  name: string; 
  policyType: 'Terms & Conditions' | 'Privacy Policy';
  updatedDate: string;
  summaryOfChanges: string;
}) {
  const urlPath = policyType === 'Terms & Conditions' ? 'terms' : 'privacy';

  return (
    <EmailLayout previewText={`Notice of Updates to ${policyType}`}>
      <Section style={body}>
        <Text style={{ ...heading, fontSize: '20px' }}>Policy Update Notice</Text>
        <Text style={paragraph}>
          Hi {name}, we are writing to let you know that we have updated our <strong>{policyType}</strong>. 
          These changes go into effect as of <strong>{updatedDate}</strong>.
        </Text>
        
        <Section style={{ backgroundColor: '#f9fafb', padding: '20px', border: '1px solid #e5e7eb', margin: '24px 0' }}>
          <Text style={{ ...paragraph, fontWeight: 'bold', margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Summary of Changes
          </Text>
          <Text style={{ ...paragraph, margin: '0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
            {summaryOfChanges}
          </Text>
        </Section>

        <Text style={paragraph}>
          We encourage you to read the updated document in full. Continued use of the platform after the effective 
          date constitutes your agreement to these changes.
        </Text>

        <Button 
          href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://mnit-marketplace.in'}/${urlPath}`} 
          style={buttonPrimary}
        >
          Read the Full {policyType} →
        </Button>
      </Section>
    </EmailLayout>
  );
}
