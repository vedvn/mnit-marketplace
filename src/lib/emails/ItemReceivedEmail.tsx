import { Section, Text, Hr, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
};

const infoBox = {
  backgroundColor: '#f8f9fa',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #e5e7eb',
};

export default function ItemReceivedEmail({
  buyerName,
  productTitle,
  sellerName,
  confirmUrl,
}: {
  buyerName: string;
  productTitle: string;
  sellerName: string;
  confirmUrl: string;
}) {
  return (
    <EmailLayout previewText={`Have you received "${productTitle}" yet?`}>
      <Section style={body}>
        <Text style={heading}>🤝 Meet the Seller & Confirm</Text>
        <Text style={paragraph}>
          Hi {buyerName}, you recently purchased <strong>&quot;{productTitle}&quot;</strong> from {sellerName}.
        </Text>
        
        <Text style={paragraph}>
          Once you have physically met the seller on campus and verified that the item is in the expected condition, please click the button below to confirm receipt.
        </Text>

        <Section style={btnContainer}>
          <Button style={button} href={confirmUrl}>
            Confirm I Received Item
          </Button>
        </Section>

        <Section style={infoBox}>
          <Text style={{ ...paragraph, fontWeight: '700', marginBottom: '8px' }}>
            Why confirm receipt?
          </Text>
          <Text style={{ ...paragraph, fontSize: '13px', color: '#4b5563', margin: 0 }}>
            Confirming receipt releases the funds to the seller. Only do this <strong>after</strong> you have the item in your hands. If there is any issue with the item, please contact us before confirming.
          </Text>
        </Section>

        <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            You can also confirm receipt at any time by visiting your profile on MNIT Marketplace. 
            Thank you for being a part of our campus community!
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
