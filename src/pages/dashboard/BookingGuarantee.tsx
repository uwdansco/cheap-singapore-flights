import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

const BookingGuarantee = () => {
  const { toast } = useToast();
  const { planType, isActive, currentPeriodEnd } = useSubscription();
  const [userStatement, setUserStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [claim, setClaim] = useState<any>(null);

  useEffect(() => {
    fetchClaim();
  }, []);

  const fetchClaim = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('booking_guarantee_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setClaim(data);
    } catch (error) {
      console.error('Error fetching claim:', error);
    }
  };

  const handleSubmitClaim = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('submit-guarantee-claim', {
        body: { userStatement },
      });

      if (error) throw error;

      toast({
        title: 'Claim Submitted',
        description: 'Your booking guarantee claim has been submitted for review.',
      });

      setClaim(data.claim);
      setUserStatement('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (planType !== 'annual') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Booking Guarantee
            </CardTitle>
            <CardDescription>
              Available only with Annual Plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upgrade to the Annual Plan to get our Booking Guarantee. If you don't book a flight using our service within your subscription year, you'll receive a full refund.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade to Annual Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!claim) return null;

    switch (claim.claim_status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending Review</Badge>;
      case 'approved':
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'refunded':
        return <Badge><CheckCircle className="h-3 w-3 mr-1" /> Refunded</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Booking Guarantee
              </CardTitle>
              <CardDescription>
                Full refund if you don't book a flight within your subscription year
              </CardDescription>
            </div>
            {claim && getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Your guarantee is active!</strong> If you don't use our service to book a flight by {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : 'the end of your subscription'}, you can request a full refund of $39.99.
            </AlertDescription>
          </Alert>

          <div className="prose prose-sm">
            <h3>How it works:</h3>
            <ol>
              <li>Keep your annual subscription active for the full year</li>
              <li>If you don't book a flight using our price alerts, submit a claim</li>
              <li>We'll review your claim and issue a full refund within 14 business days</li>
            </ol>
          </div>

          {!claim && (
            <div className="space-y-4">
              <h3 className="font-semibold">Request Your Refund</h3>
              <Textarea
                placeholder="Optional: Tell us about your experience (e.g., 'I didn't find any deals that worked for my travel dates')"
                value={userStatement}
                onChange={(e) => setUserStatement(e.target.value)}
                rows={4}
              />
              <Button
                onClick={handleSubmitClaim}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? 'Submitting...' : 'Submit Refund Claim'}
              </Button>
            </div>
          )}

          {claim && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Your Claim</h3>
              <div className="space-y-2">
                <p><strong>Status:</strong> {getStatusBadge()}</p>
                <p><strong>Submitted:</strong> {new Date(claim.created_at).toLocaleDateString()}</p>
                {claim.user_statement && (
                  <p><strong>Your message:</strong> {claim.user_statement}</p>
                )}
                {claim.admin_notes && (
                  <Alert>
                    <AlertDescription>
                      <strong>Admin Notes:</strong> {claim.admin_notes}
                    </AlertDescription>
                  </Alert>
                )}
                {claim.refund_issued_at && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Refund of ${(claim.refund_amount_cents / 100).toFixed(2)} was processed on {new Date(claim.refund_issued_at).toLocaleDateString()}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingGuarantee;
