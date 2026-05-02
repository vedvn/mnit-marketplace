import { Section, Text, Hr, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

const alertBox = {
  backgroundColor: '#fef2f2',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #fecaca',
  marginBottom: '24px',
};

const flagItem = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#b91c1c',
  margin: '0 0 6px 0',
};

const infoRow = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 8px 0',
};

const infoLabel = {
  fontWeight: '700' as const,
  color: '#111827',
};

const summaryBox = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  marginBottom: '24px',
};

const confidenceBadge = (confidence: 'high' | 'medium' | 'low') => ({
  display: 'inline-block' as const,
  padding: '2px 10px',
  borderRadius: '99px',
  fontSize: '11px',
  fontWeight: '700' as const,
  letterSpacing: '0.05em',
  backgroundColor:
    confidence === 'high' ? '#fef3c7' : confidence === 'medium' ? '#ffedd5' : '#fee2e2',
  color:
    confidence === 'high' ? '#92400e' : confidence === 'medium' ? '#c2410c' : '#991b1b',
});

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '16px',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  letterSpacing: '0.05em',
};

export default function AdminProductAlertEmail({
  productId,
  productTitle,
  sellerName,
  sellerEmail,
  aiSummary,
  aiFlags,
  aiConfidence,
  adminUrl,
}: {
  productId: string;
  productTitle: string;
  sellerName: string;
  sellerEmail: string;
  aiSummary: string;
  aiFlags: string[];
  aiConfidence: 'high' | 'medium' | 'low';
  adminUrl: string;
}) {
  return (
    <EmailLayout previewText={`⚠️ AI Flagged: "${productTitle}" needs your review`}>
      <Section style={body}>
        <Text style={heading}>⚠️ Listing Needs Review</Text>
        <Text style={paragraph}>
          Our AI verification system flagged a new product listing. It has been held in{' '}
          <strong>Pending Review</strong> and requires your manual decision.
        </Text>

        {/* Product Details */}
        <Section style={summaryBox}>
          <Text style={{ ...infoRow, margin: '0 0 6px 0' }}>
            <span style={infoLabel}>Product: </span>&quot;{productTitle}&quot;
          </Text>
          <Text style={{ ...infoRow, margin: '0 0 6px 0' }}>
            <span style={infoLabel}>Seller: </span>{sellerName} ({sellerEmail})
          </Text>
          <Text style={{ ...infoRow, margin: '0 0 6px 0' }}>
            <span style={infoLabel}>Product ID: </span>
            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{productId}</span>
          </Text>
          <Text style={{ ...infoRow, margin: 0 }}>
            <span style={infoLabel}>AI Confidence: </span>
            <span style={confidenceBadge(aiConfidence)}>
              {aiConfidence.toUpperCase()}
            </span>
          </Text>
        </Section>

        {/* AI Analysis Summary */}
        <Text style={{ ...paragraph, fontWeight: '700', margin: '0 0 8px 0' }}>
          🤖 AI Analysis
        </Text>
        <Section style={{ ...summaryBox, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <Text style={{ ...infoRow, margin: 0, fontStyle: 'italic' }}>{aiSummary}</Text>
        </Section>

        {/* Flags */}
        {aiFlags.length > 0 && (
          <>
            <Text style={{ ...paragraph, fontWeight: '700', margin: '0 0 8px 0' }}>
              🚩 Issues Found ({aiFlags.length})
            </Text>
            <Section style={alertBox}>
              {aiFlags.map((flag, i) => (
                <Text key={i} style={flagItem}>
                  • {flag}
                </Text>
              ))}
            </Section>
          </>
        )}

        <Section style={btnContainer}>
          <Button style={button} href={adminUrl}>
            Review in Admin Panel →
          </Button>
        </Section>

        <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            Internal alert for MNIT Marketplace Admin. This product is currently in PENDING_REVIEW.
            You can approve or reject it from the admin panel. Product ID: {productId}
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
