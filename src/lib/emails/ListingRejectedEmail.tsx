import { Section, Text, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, buttonPrimary, disclaimerBox, disclaimerText } from './components';

export default function ListingRejectedEmail({ 
  name, 
  productTitle, 
  reason 
}: { 
  name: string; 
  productTitle: string; 
  reason: string;
}) {
  return (
    <EmailLayout previewText="Update required for your listing.">
      <Section style={body}>
        <Text style={{ ...heading, color: '#c0392b' }}>Listing Rejected</Text>
        <Text style={paragraph}>
          Hi {name}, your listing for <strong>&quot;{productTitle}&quot;</strong> could not be approved 
          at this time.
        </Text>
        
        <Section style={{ borderLeft: '3px solid #c0392b', paddingLeft: '16px', margin: '20px 0' }}>
          <Text style={{ ...paragraph, fontWeight: 'bold', margin: '0 0 8px 0' }}>Moderator Note:</Text>
          <Text style={{ ...paragraph, margin: '0', color: '#4b5563' }}>&quot;{reason}&quot;</Text>
        </Section>

        <Text style={paragraph}>
          You can update your listing based on this feedback from your dashboard and resubmit it 
          for review.
        </Text>

        <Button 
          href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://mnitmarketplace.store'}/profile`} 
          style={buttonPrimary}
        >
          Go to Dashboard →
        </Button>
      </Section>
    </EmailLayout>
  );
}
