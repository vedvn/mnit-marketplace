import { Section, Text, Hr } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

const infoRow = {
  margin: '0 0 12px 0',
  padding: '12px 16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  borderLeft: '4px solid #4f46e5',
};

const label = {
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#6b7280',
  margin: '0 0 2px 0',
};

const value = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#111827',
  margin: '0',
};

export default function ItemSoldEmail({
  sellerName,
  buyerName,
  buyerPhone,
  buyerEmail,
  productTitle,
  amount,
  platformFee,
  payout,
}: {
  sellerName: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  productTitle: string;
  amount: number;
  platformFee: number;
  payout: number;
}) {
  return (
    <EmailLayout previewText={`Your item "${productTitle}" has been sold!`}>
      <Section style={body}>
        <Text style={heading}>🎉 Your Item Sold!</Text>
        <Text style={paragraph}>
          Hi {sellerName}, great news! Your listing <strong>&quot;{productTitle}&quot;</strong> has
          been purchased. Here are the buyer&apos;s contact details so you can coordinate the handover:
        </Text>

        <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

        <Text style={{ ...paragraph, fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5', marginBottom: '12px' }}>
          Buyer Details
        </Text>

        <Section style={infoRow}>
          <Text style={label}>Full Name</Text>
          <Text style={value}>{buyerName}</Text>
        </Section>
        <Section style={infoRow}>
          <Text style={label}>Phone Number</Text>
          <Text style={value}>{buyerPhone || 'Not provided'}</Text>
        </Section>
        <Section style={infoRow}>
          <Text style={label}>Email</Text>
          <Text style={value}>{buyerEmail}</Text>
        </Section>

        <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

        <Text style={{ ...paragraph, fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5', marginBottom: '12px' }}>
          Payout Breakdown
        </Text>
        <Section style={infoRow}>
          <Text style={label}>Item Price Paid</Text>
          <Text style={value}>₹{amount}</Text>
        </Section>
        <Section style={infoRow}>
          <Text style={label}>Platform Fee Deducted</Text>
          <Text style={value}>₹{platformFee}</Text>
        </Section>
        <Section style={{ ...infoRow, borderLeftColor: '#10b981', backgroundColor: '#f0fdf4' }}>
          <Text style={label}>Your Payout</Text>
          <Text style={{ ...value, color: '#059669' }}>₹{payout}</Text>
        </Section>

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            The buyer will confirm receipt once they physically receive the item. Your payout of ₹{payout} will be released immediately after their confirmation.
            Please coordinate the meeting at the agreed pickup location. If you have any issues, contact the MNIT Marketplace team immediately.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
