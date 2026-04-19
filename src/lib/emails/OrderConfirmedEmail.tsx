import { Section, Text, Hr, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

const orderBox = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  margin: '24px 0',
};

const label = {
  fontSize: '10px',
  fontWeight: '900',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: '#64748b',
  marginBottom: '4px',
};

const value = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0 0 16px 0',
};

const buttonStyle = {
  backgroundColor: '#4f46e5',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  width: '100%',
};

export default function OrderConfirmedEmail({
  buyerName,
  productTitle,
  sellerName,
  sellerPhone,
  amount,
  orderId,
}: {
  buyerName: string;
  productTitle: string;
  sellerName: string;
  sellerPhone: string;
  amount: number;
  orderId: string;
}) {
  return (
    <EmailLayout previewText={`Order Confirmed: You just purchased "${productTitle}"`}>
      <Section style={body}>
        <Text style={heading}>🎉 Order Confirmed!</Text>
        <Text style={paragraph}>
          Hi {buyerName}, your purchase of <strong>&quot;{productTitle}&quot;</strong> is high-performance and complete! 
        </Text>
        
        <Section style={orderBox}>
          <Text style={label}>Order ID</Text>
          <Text style={value}>{orderId}</Text>

          <Text style={label}>Item</Text>
          <Text style={value}>{productTitle}</Text>

          <Text style={label}>Amount Paid</Text>
          <Text style={value}>₹{amount.toFixed(2)}</Text>

          <Text style={label}>Seller</Text>
          <Text style={value}>{sellerName} ({sellerPhone})</Text>
        </Section>

        <Text style={{ ...paragraph, fontWeight: '700' }}>Next Steps for Campus Handover:</Text>
        <Text style={paragraph}>
          1. 📱 <strong>Contact the Seller</strong>: Reach out to {sellerName} at {sellerPhone} to liquid-smoothly coordinate your meeting.<br/>
          2. 🛡️ <strong>Safety First</strong>: Only meet in designated **Campus Safe-Zones** (Central Park, Hostel Gates, etc.) between 7 AM and 9 PM.<br/>
          3. ✅ <strong>Confirm Receipt</strong>: Once you have the item, please definitively confirm receipt in your profile to release the funds.
        </Text>

        <Section style={{ marginTop: '32px' }}>
          <Button style={buttonStyle} href={`${process.env.NEXT_PUBLIC_APP_URL}/profile`}>
            Manage My Orders →
          </Button>
        </Section>

        <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            Thank you for choosing the institutional MNIT Marketplace. If you have any issues with this transaction, our moderation desk is professionally ready to assist.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
