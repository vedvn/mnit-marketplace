import { Section, Text } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

export default function ListingDeletedEmail({ 
  name,
  itemTitle,
  reason = "Violation of marketplace listing policies (e.g. prohibited items, misleading description, or duplicate listing)."
}: { 
  name: string;
  itemTitle: string;
  reason?: string;
}) {
  return (
    <EmailLayout previewText="Notification: Your listing has been removed">
      <Section style={body}>
        <Text style={{ ...heading, color: '#dc2626' }}>Listing Permanently Deleted</Text>
        <Text style={paragraph}>
          Hi {name}, we are writing to inform you that your listing **"{itemTitle}"** has been permanently 
          deleted from the MNIT Marketplace by our moderation team.
        </Text>
        
        <Section style={{ borderLeft: '3px solid #dc2626', paddingLeft: '16px', margin: '24px 0' }}>
          <Text style={{ ...paragraph, fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em' }}>Reason for Deletion:</Text>
          <Text style={{ ...paragraph, margin: '0', color: '#4b5563' }}>&quot;{reason}&quot;</Text>
        </Section>

        <Text style={paragraph}>
          Unlike a standard removal, this item has been purged from our active database and cannot be 
          re-activated or edited.
        </Text>

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            If you have questions regarding this action or wish to appeal, please reply directly to this email. 
            Repeated violations of our listing policies may lead to a temporary or permanent account suspension.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
