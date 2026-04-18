import { Section, Text, Hr, Link } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

const infoBox = {
  backgroundColor: '#f0fdf4',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #dcfce7',
};

const amountText = {
  fontSize: '32px',
  fontWeight: '800',
  color: '#16a34a',
  margin: '12px 0',
};

export default function PayoutCompletedEmail({
  sellerName,
  productTitle,
  amount,
}: {
  sellerName: string;
  productTitle: string;
  amount: number;
}) {
  return (
    <EmailLayout previewText={`Funds Disbursed: ₹${amount} for your sale`}>
      <Section style={body}>
        <Text style={heading}>💰 Payout Completed!</Text>
        <Text style={paragraph}>
          Hi {sellerName}, great news! We have processed the payout for your sale of <strong>&quot;{productTitle}&quot;</strong>.
        </Text>
        
        <Section style={infoBox}>
          <Text style={{ ...paragraph, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>
            Amount Disbursed
          </Text>
          <Text style={amountText}>₹{amount}</Text>
          <Text style={{ ...paragraph, fontSize: '13px', margin: 0 }}>
            The funds have been sent to your registered UPI ID / Bank Account. It should reflect in your account shortly.
          </Text>
        </Section>

        <Text style={{ ...paragraph, marginTop: '24px' }}>
          Thank you for choosing MNIT Marketplace for your campus transactions. If you have any questions regarding this payout, please contact our support team.
        </Text>

        <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            This is an automated confirmation of disbursement. 
            Keep this email for your records.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
