import { Section, Text, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, buttonPrimary, disclaimerBox, disclaimerText } from './components';

export default function ListingAutoApprovedEmail({ 
  name, 
  productTitle, 
  productId 
}: { 
  name: string; 
  productTitle: string; 
  productId: string;
}) {
  return (
    <EmailLayout previewText="Your listing passed AI verification and is now live! ✅">
      <Section style={body}>
        <Text style={heading}>🤖 Auto-Verified & Live!</Text>
        <Text style={paragraph}>
          Hi {name}, great news — your listing for <strong>&quot;{productTitle}&quot;</strong> was
          instantly verified by our AI moderation system and is now <strong>live on the marketplace</strong>.
        </Text>
        <Text style={paragraph}>
          Our system confirmed that your live verification photo matched the item photos, 
          so there was no need to wait in the manual review queue.
        </Text>
        <Button 
          href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://mnitmarketplace.store'}/market/${productId}`} 
          style={buttonPrimary}
        >
          View Your Live Listing →
        </Button>
        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            Our team may still conduct spot-checks on auto-approved listings.
            Any listings found to violate our policies will be removed and may result
            in account action. Please ensure all listings are accurate and honest.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
