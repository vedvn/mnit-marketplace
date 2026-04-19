import { Section, Text, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, buttonPrimary, disclaimerBox, disclaimerText } from './components';

export default function ListingApprovedEmail({ 
  name, 
  productTitle, 
  productId 
}: { 
  name: string; 
  productTitle: string; 
  productId: string;
}) {
  return (
    <EmailLayout previewText="Your listing is now live!">
      <Section style={body}>
        <Text style={heading}>Listing Approved</Text>
        <Text style={paragraph}>
          Hi {name}, good news: your listing for <strong>&quot;{productTitle}&quot;</strong> has been
          reviewed and approved by our moderation team.
        </Text>
        <Text style={paragraph}>
          It is now live on the marketplace and visible to other students.
        </Text>
        <Button 
          href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://mnitmarketplace.store'}/market/${productId}`} 
          style={buttonPrimary}
        >
          View Listing →
        </Button>
      </Section>
    </EmailLayout>
  );
}
