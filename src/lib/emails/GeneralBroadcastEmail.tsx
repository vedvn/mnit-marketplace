import { Section, Text, Button, Hr } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, buttonPrimary, disclaimerBox, disclaimerText } from './components';

export default function GeneralBroadcastEmail({ 
  name, 
  messageHeading,
  messageBody,
  buttonText = "Visit MNIT Marketplace",
  buttonUrl = "https://mnitmarketplace.store/market"
}: { 
  name: string; 
  messageHeading: string;
  messageBody: string;
  buttonText?: string;
  buttonUrl?: string;
}) {
  return (
    <EmailLayout previewText={messageHeading}>
      <Section style={body}>
        <Text style={{ ...heading, fontSize: '20px' }}>{messageHeading}</Text>
        
        <Text style={paragraph}>
          Hi {name},
        </Text>

        <Text style={{ ...paragraph, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
          {messageBody}
        </Text>

        <Section style={{ marginTop: '32px', marginBottom: '32px' }}>
          <Button 
            href={buttonUrl}
            style={buttonPrimary}
          >
            {buttonText} →
          </Button>
        </Section>

        <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            You are receiving this official broadcast because you have an active account on the institutional MNIT Marketplace. 
            Thank you for being a part of our campus community!
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}
