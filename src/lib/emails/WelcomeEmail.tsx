import { Section, Text, Button } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, buttonPrimary } from './components';

export default function WelcomeEmail({ name }: { name: string }) {
  const firstName = name.split(' ')[0] || 'User';

  return (
    <EmailLayout previewText="Welcome to MNIT Marketplace!">
      <Section style={body}>
        <Text style={heading}>Welcome Aboard</Text>
        <Text style={paragraph}>
          Hey {firstName}, your account is now verified and active.
        </Text>
        <Text style={paragraph}>
          You have successfully joined the campus marketplace. Start browsing items 
          listed by your peers, or sell something you no longer need.
        </Text>
        <Button href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://mnit-marketplace.in'}/market`} style={buttonPrimary}>
          Browse the Market →
        </Button>
      </Section>
    </EmailLayout>
  );
}
