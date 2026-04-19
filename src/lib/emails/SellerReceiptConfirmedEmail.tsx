import { Section, Text, Hr, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

const infoBox = {
  backgroundColor: '#f0fdf4',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #dcfce7',
};

const valueLabel = {
  fontSize: '11px',
  fontWeight: '900',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: '#059669',
  marginBottom: '4px',
};

const valueText = {
  fontSize: '18px',
  fontWeight: '800',
  color: '#064e3b',
  margin: 0,
};

export default function SellerReceiptConfirmedEmail({
  sellerName,
  buyerName,
  productTitle,
  payoutAmount,
}: {
  sellerName: string;
  buyerName: string;
  productTitle: string;
  payoutAmount: number;
}) {
  return (
    <EmailLayout previewText={`Handover Confirmed: ${buyerName} received "${productTitle}"`}>
      <Section style={body}>
        <Text style={heading}>🤝 Handover Verified!</Text>
        <Text style={paragraph}>
          Hi {sellerName}, great news! <strong>{buyerName}</strong> has definitively confirmed receipt of <strong>&quot;{productTitle}&quot;</strong> on campus.
        </Text>
        
        <Text style={paragraph}>
          Your institutional payout has now been liquid-smoothly scheduled for processing by our finance desk. 
        </Text>

        <Section style={infoBox}>
          <Text style={valueLabel}>Scheduled Payout</Text>
          <Text style={valueText}>₹{payoutAmount.toFixed(2)}</Text>
        </Section>

        <Text style={{ ...paragraph, marginTop: '24px' }}>
          Our administrator will professionally verify the transaction and release the funds to your registered account shortly. You will receive another high-fidelity notification once the transfer is high-performance and complete.
        </Text>

        <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            Thank you for coordinating a safe and verified campus exchange. If you believe there has been an institutional error, please contact the MNIT Marketplace moderation desk immediately.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
