import { Body, Button, Container, Head, Heading, Hr, Html, Section, Text, Preview } from '@react-email/components';
import * as React from 'react';

// Common base styles
export const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

export const container = {
  margin: '0 auto',
  padding: '0',
  maxWidth: '560px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
};

export const header = {
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  padding: '24px 40px',
};

export const logoText = {
  fontSize: '18px',
  fontWeight: '900',
  letterSpacing: '-0.02em',
  color: '#000000',
  margin: '0',
};

export const logoAccent = {
  backgroundColor: '#c0392b',
  color: '#ffffff',
  padding: '2px 6px',
  marginRight: '6px',
  display: 'inline-block',
};

export const body = { padding: '40px' };

export const heading = {
  fontSize: '28px',
  fontWeight: '900',
  color: '#000000',
  letterSpacing: '-0.03em',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
};

export const paragraph = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#374151',
  margin: '0 0 24px 0',
};

export const buttonPrimary = {
  backgroundColor: '#c0392b',
  color: '#ffffff',
  padding: '14px 32px',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  textDecoration: 'none',
  display: 'inline-block',
  border: 'none',
  borderRadius: '0',
};

export const disclaimerBox = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  marginTop: '32px',
};

export const disclaimerText = { ...paragraph, margin: '0', fontSize: '12px', color: '#6b7280' };

export const footer = {
  padding: '24px 40px',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
};

export const footerText = {
  fontSize: '11px',
  color: '#9ca3af',
  margin: '0',
  lineHeight: '1.6',
};

export const EmailLayout = ({ children, previewText }: { children: React.ReactNode, previewText: string }) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>
            <span style={logoAccent}>MNIT</span>MARKETPLACE
          </Text>
        </Section>
        {children}
        <Section style={footer}>
          <Text style={footerText}>
            MNIT Marketplace · Malaviya National Institute of Technology, Jaipur
            <br />
            This is an automated message. Please do not reply directly to this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);
