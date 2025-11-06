import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Claim {
  id: string;
  user_id: string;
  subscription_year_start: string;
  subscription_year_end: string;
  claim_status: string;
  user_statement: string;
  admin_notes: string;
  refund_amount_cents: number;
  created_at: string;
  user_subscriptions: {
    user_id: string;
  };
}

const GuaranteeClaims = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_guarantee_claims')
        .select('*, user_subscriptions(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessClaim = async (approve: boolean) => {
    if (!selectedClaim) return;

    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke('process-guarantee-refund', {
        body: {
          claimId: selectedClaim.id,
          approve,
          adminNotes,
        },
      });

      if (error) throw error;

      toast({
        title: approve ? 'Claim Approved' : 'Claim Rejected',
        description: approve ? 'Refund has been processed.' : 'Claim has been rejected.',
      });

      setSelectedClaim(null);
      setAdminNotes('');
      fetchClaims();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary">Approved</Badge>;
      case 'refunded':
        return <Badge>Refunded</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Booking Guarantee Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading claims...</p>
          ) : claims.length === 0 ? (
            <p className="text-muted-foreground">No claims submitted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Subscription Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{new Date(claim.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono text-xs">{claim.user_id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      {new Date(claim.subscription_year_start).toLocaleDateString()} - {new Date(claim.subscription_year_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${(claim.refund_amount_cents / 100).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(claim.claim_status)}</TableCell>
                    <TableCell>
                      {claim.claim_status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setAdminNotes(claim.admin_notes || '');
                          }}
                        >
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Guarantee Claim</DialogTitle>
            <DialogDescription>
              Review the claim details and decide whether to approve or reject the refund.
            </DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div>
                <strong>User Statement:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedClaim.user_statement || 'No statement provided'}
                </p>
              </div>
              <div>
                <strong>Subscription Period:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedClaim.subscription_year_start).toLocaleDateString()} - {new Date(selectedClaim.subscription_year_end).toLocaleDateString()}
                </p>
              </div>
              <div>
                <strong>Refund Amount:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(selectedClaim.refund_amount_cents / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Admin Notes:</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this claim..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedClaim(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleProcessClaim(false)}
              disabled={processing}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleProcessClaim(true)}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Approve & Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuaranteeClaims;
