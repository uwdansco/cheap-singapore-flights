import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface WelcomeEmailProps {
  name: string;
  email: string;
  recentDeal?: {
    destination: string;
    price: number;
    dates: string;
  };
  unsubscribeUrl: string;
}

export const WelcomeEmail = ({
  name,
  email,
  recentDeal,
  unsubscribeUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Cheap Atlanta Flights! ✈️</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={h1}>✈️ Cheap Atlanta Flights</Heading>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h2}>Welcome aboard, {name || 'Traveler'}! 🎉</Heading>
          <Text style={paragraph}>
            Your subscription is now active! You're all set to receive the best flight deals from Atlanta.
          </Text>

          <Section style={highlightBox}>
            <Heading style={h3}>What to Expect:</Heading>
            <Text style={bulletPoint}>✈️ Daily monitoring of 50+ destinations worldwide</Text>
            <Text style={bulletPoint}>⚡ Instant alerts when prices drop</Text>
            <Text style={bulletPoint}>💰 Exclusive deals sent straight to your inbox</Text>
            <Text style={bulletPoint}>📅 Flexible travel dates to maximize savings</Text>
          </Section>

          {recentDeal && (
            <>
              <Heading style={h3}>Check Out This Recent Deal:</Heading>
              <Section style={dealBox}>
                <Text style={dealDestination}>{recentDeal.destination}</Text>
                <Text style={dealPrice}>${recentDeal.price}</Text>
                <Text style={dealDetails}>roundtrip</Text>
                <Text style={dealDates}>{recentDeal.dates}</Text>
              </Section>
              <Text style={paragraph}>
                Deals like this will be sent to you as soon as we find them!
              </Text>
            </>
          )}

          <Text style={paragraph}>
            We search for the best prices daily, so you don't have to. Just sit back, relax, and wait for the perfect deal to land in your inbox.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://cheapatlantaflights.com/deals">
              Browse Current Deals
            </Button>
          </Section>

          <Section style={socialSection}>
            <Text style={paragraph}>
              Follow us for travel tips and inspiration:
            </Text>
            <Text style={socialLinks}>
              <Link href="#" style={socialLink}>Twitter</Link> • 
              <Link href="#" style={socialLink}> Facebook</Link> • 
              <Link href="#" style={socialLink}> Instagram</Link>
            </Text>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Happy travels!
          </Text>
          <Text style={footerText}>
            The Cheap Atlanta Flights Team
          </Text>
          <Text style={footerText}>
            <Link href={unsubscribeUrl} style={footerLink}>
              Unsubscribe
            </Link> • 
            <Link href="mailto:support@cheapatlantaflights.com" style={footerLink}>
              {' '}Contact Us
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

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

const h3 = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 12px',
};

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '16px 0',
};

const highlightBox = {
  backgroundColor: '#f0f9ff',
  borderLeft: '4px solid #0066CC',
  padding: '20px',
  margin: '24px 0',
};

const bulletPoint = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '0',
};

const dealBox = {
  backgroundColor: '#fff5f0',
  borderLeft: '4px solid #FF6B35',
  padding: '24px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const dealDestination = {
  color: '#333333',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const dealPrice = {
  color: '#FF6B35',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '8px 0',
};

const dealDetails = {
  color: '#737373',
  fontSize: '14px',
  margin: '0',
};

const dealDates = {
  color: '#525252',
  fontSize: '16px',
  margin: '8px 0 0',
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

const socialSection = {
  marginTop: '32px',
  textAlign: 'center' as const,
};

const socialLinks = {
  fontSize: '16px',
  margin: '8px 0',
};

const socialLink = {
  color: '#0066CC',
  textDecoration: 'none',
  padding: '0 8px',
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
  padding: '0 4px',
};
