import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';

const DealsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    destination_id: '',
    price: '',
    outbound_date: '',
    return_date: '',
    booking_link: '',
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .order('city_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: deals } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, destinations(city_name, country)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createDeal = useMutation({
    mutationFn: async (newDeal: typeof formData) => {
      const { error } = await supabase.from('deals').insert([{
        ...newDeal,
        price: parseFloat(newDeal.price),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: 'Success', description: 'Deal created successfully' });
      setFormData({
        destination_id: '',
        price: '',
        outbound_date: '',
        return_date: '',
        booking_link: '',
      });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const sendDeal = useMutation({
    mutationFn: async (dealId: string) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-deal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ dealId }),
      });
      if (!response.ok) throw new Error('Failed to send deal');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: 'Success', description: 'Deal sent to subscribers' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeal.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Select
              value={formData.destination_id}
              onValueChange={(value) => setFormData({ ...formData, destination_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations?.map((dest) => (
                  <SelectItem key={dest.id} value={dest.id}>
                    {dest.city_name}, {dest.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outbound">Outbound Date</Label>
            <Input
              id="outbound"
              type="date"
              value={formData.outbound_date}
              onChange={(e) => setFormData({ ...formData, outbound_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="return">Return Date</Label>
            <Input
              id="return"
              type="date"
              value={formData.return_date}
              onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="booking_link">Booking Link</Label>
            <Input
              id="booking_link"
              type="url"
              value={formData.booking_link}
              onChange={(e) => setFormData({ ...formData, booking_link: e.target.value })}
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={createDeal.isPending}>
          {createDeal.isPending ? 'Creating...' : 'Create Deal'}
        </Button>
      </form>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destination</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals?.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell>
                  {deal.destinations?.city_name}, {deal.destinations?.country}
                </TableCell>
                <TableCell>${deal.price}</TableCell>
                <TableCell>
                  {new Date(deal.outbound_date).toLocaleDateString()} - {new Date(deal.return_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {deal.sent_to_subscribers ? 'Sent' : 'Not sent'}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => sendDeal.mutate(deal.id)}
                    disabled={deal.sent_to_subscribers || sendDeal.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DealsManager;
