import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface VerificationEmailProps {
  verificationUrl: string;
  email: string;
  unsubscribeUrl: string;
}

export const VerificationEmail = ({
  verificationUrl,
  email,
  unsubscribeUrl,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your subscription to Cheap Atlanta Flights</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={h1}>✈️ Cheap Atlanta Flights</Heading>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h2}>Welcome to Cheap Atlanta Flights!</Heading>
          <Text style={paragraph}>
            Thanks for subscribing! We're excited to help you find the best flight deals from Atlanta.
          </Text>
          <Text style={paragraph}>
            Click the button below to confirm your email address and start receiving daily deal alerts:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Verify Email Address
            </Button>
          </Section>

          <Text style={paragraph}>
            Or copy and paste this URL into your browser:
          </Text>
          <Text style={link}>
            <Link href={verificationUrl} style={linkText}>
              {verificationUrl}
            </Link>
          </Text>

          <Text style={smallText}>
            This link will expire in 24 hours. If you didn't subscribe to Cheap Atlanta Flights,
            you can safely ignore this email.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Cheap Atlanta Flights - Your source for the best flight deals from ATL
          </Text>
          <Text style={footerText}>
            <Link href={unsubscribeUrl} style={footerLink}>
              Unsubscribe
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default VerificationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  backgroundColor: '#0066CC',
  padding: '24px 0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const content = {
  padding: '0 48px',
};

const h2 = {
  color: '#333333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '32px 0 16px',
};

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '16px 0',
};

const buttonContainer = {
  padding: '27px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#FF6B35',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const link = {
  color: '#0066CC',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const linkText = {
  color: '#0066CC',
  fontSize: '14px',
  textDecoration: 'underline',
};

const smallText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0',
};

const footer = {
  backgroundColor: '#f6f9fc',
  padding: '24px 48px',
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
};

const footerLink = {
  color: '#0066CC',
  textDecoration: 'underline',
};
