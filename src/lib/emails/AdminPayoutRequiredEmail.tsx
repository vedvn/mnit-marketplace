import { Section, Text, Hr, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

const alertBox = {
  backgroundColor: '#fff7ed',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #ffedd5',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#ea580c',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
};

export default function AdminPayoutRequiredEmail({
  sellerName,
  productTitle,
  amount,
  payoutDetails,
  adminUrl,
}: {
  sellerName: string;
  productTitle: string;
  amount: number;
  payoutDetails: string;
  adminUrl: string;
}) {
  return (
    <EmailLayout previewText={`Payout Alert: ₹${amount} due for ${sellerName}`}>
      <Section style={body}>
        <Text style={heading}>🚨 Payout Action Required</Text>
        <Text style={paragraph}>
          A buyer has confirmed the receipt of <strong>&quot;{productTitle}&quot;</strong>. You are now required to disburse the funds to the seller.
        </Text>
        
        <Section style={alertBox}>
          <Text style={{ ...paragraph, fontSize: '13px', margin: '0 0 8px 0' }}>
            <strong>Seller:</strong> {sellerName}
          </Text>
          <Text style={{ ...paragraph, fontSize: '13px', margin: '0 0 8px 0' }}>
            <strong>Payout Amount:</strong> ₹{amount}
          </Text>
          <Text style={{ ...paragraph, fontSize: '13px', margin: 0 }}>
            <strong>Payout Method:</strong> {payoutDetails}
          </Text>
        </Section>

        <Section style={btnContainer}>
          <Button style={button} href={adminUrl}>
            Open Admin Dashboard
          </Button>
        </Section>

        <Text style={{ ...paragraph, fontSize: '12px', color: '#6b7280' }}>
          Steps to complete:
          <br/>1. Open your UPI/Banking app.
          <br/>2. Send ₹{amount} to the details above.
          <br/>3. Mark the transaction as &quot;COMPLETED&quot; in the admin panel.
        </Text>

        <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            Internal notification for MNIT Marketplace Administrators.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
