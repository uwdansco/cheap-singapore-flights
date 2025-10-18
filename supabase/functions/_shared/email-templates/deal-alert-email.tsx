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
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface DealAlertEmailProps {
  destination: {
    city_name: string;
    country: string;
    airport_code: string;
  };
  price: number;
  currency: string;
  outbound_date: string;
  return_date: string;
  booking_link: string;
  unsubscribeUrl: string;
}

export const DealAlertEmail = ({
  destination,
  price,
  currency,
  outbound_date,
  return_date,
  booking_link,
  unsubscribeUrl,
}: DealAlertEmailProps) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Html>
      <Head />
      <Preview>🎯 Deal Alert: Atlanta to {destination.city_name} from ${price.toString()}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>✈️ Cheap Atlanta Flights</Heading>
            <Text style={dealBadge}>🎯 DEAL ALERT</Text>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Img
              src={`https://source.unsplash.com/800x400/?${destination.city_name},travel,city`}
              alt={destination.city_name}
              style={heroImage}
            />
          </Section>

          {/* Deal Details */}
          <Section style={content}>
            <Heading style={destinationHeading}>
              Atlanta → {destination.city_name}
            </Heading>
            <Text style={countryText}>
              {destination.country} ({destination.airport_code})
            </Text>

            <Section style={priceBox}>
              <Text style={priceLabel}>ROUNDTRIP FROM</Text>
              <Text style={priceAmount}>${price}</Text>
              <Text style={priceCurrency}>{currency}</Text>
            </Section>

            <Section style={detailsBox}>
              <Section style={detailRow}>
                <Text style={detailLabel}>✈️ Departure</Text>
                <Text style={detailValue}>{formatDate(outbound_date)}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>🏠 Return</Text>
                <Text style={detailValue}>{formatDate(return_date)}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>📍 From</Text>
                <Text style={detailValue}>Atlanta (ATL)</Text>
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={booking_link}>
                Book This Deal Now
              </Button>
            </Section>

            <Section style={infoBox}>
              <Heading style={infoHeading}>Why This Is a Great Deal:</Heading>
              <Text style={infoBullet}>
                ✓ Significantly below average pricing for this route
              </Text>
              <Text style={infoBullet}>
                ✓ Flexible travel dates available
              </Text>
              <Text style={infoBullet}>
                ✓ Limited availability - book soon!
              </Text>
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⚡ <strong>Act Fast!</strong> Flight prices change frequently and this deal may not last long.
              </Text>
            </Section>

            <Text style={tipsText}>
              <strong>Pro Tip:</strong> Clear your browser cookies before booking, and consider using
              incognito mode to potentially see better prices.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you subscribed to Cheap Atlanta Flights deal alerts.
            </Text>
            <Text style={footerText}>
              Happy travels from the Cheap Atlanta Flights Team! ✈️
            </Text>
            <Text style={footerLinks}>
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link> • 
              <Link href="https://cheapatlantaflights.com/deals" style={footerLink}>
                {' '}Browse All Deals
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
};

export default DealAlertEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#0066CC',
  padding: '24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  padding: '0',
};

const dealBadge = {
  backgroundColor: '#FF6B35',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '6px 16px',
  borderRadius: '20px',
  margin: '0',
};

const heroSection = {
  padding: '0',
};

const heroImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const content = {
  padding: '32px 48px',
};

const destinationHeading = {
  color: '#333333',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const countryText = {
  color: '#737373',
  fontSize: '18px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const priceBox = {
  backgroundColor: '#fff5f0',
  borderRadius: '12px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '2px solid #FF6B35',
};

const priceLabel = {
  color: '#737373',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  letterSpacing: '1px',
};

const priceAmount = {
  color: '#FF6B35',
  fontSize: '48px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '1',
};

const priceCurrency = {
  color: '#525252',
  fontSize: '16px',
  margin: '4px 0 0',
};

const detailsBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const detailLabel = {
  color: '#525252',
  fontSize: '16px',
  margin: '0',
};

const detailValue = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const buttonContainer = {
  padding: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#FF6B35',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 48px',
  boxShadow: '0 4px 6px rgba(255, 107, 53, 0.2)',
};

const infoBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoHeading = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const infoBullet = {
  color: '#525252',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const warningBox = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fbbf24',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#92400e',
  fontSize: '15px',
  margin: '0',
  textAlign: 'center' as const,
};

const tipsText = {
  color: '#525252',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0',
  fontStyle: 'italic',
};

const footer = {
  backgroundColor: '#f6f9fc',
  padding: '32px 48px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const footerLinks = {
  fontSize: '14px',
  margin: '16px 0 0',
};

const footerLink = {
  color: '#0066CC',
  textDecoration: 'underline',
  padding: '0 4px',
};
