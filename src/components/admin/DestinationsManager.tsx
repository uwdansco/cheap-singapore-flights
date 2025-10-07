import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DestinationsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    city_name: '',
    country: '',
    airport_code: '',
    priority: '1',
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('priority');
      if (error) throw error;
      return data;
    },
  });

  const createDestination = useMutation({
    mutationFn: async (newDest: typeof formData) => {
      const { error } = await supabase.from('destinations').insert([{
        ...newDest,
        priority: parseInt(newDest.priority),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      toast({ title: 'Success', description: 'Destination created successfully' });
      setFormData({
        city_name: '',
        country: '',
        airport_code: '',
        priority: '1',
      });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDestination.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city_name">City Name</Label>
            <Input
              id="city_name"
              value={formData.city_name}
              onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="airport_code">Airport Code</Label>
            <Input
              id="airport_code"
              value={formData.airport_code}
              onChange={(e) => setFormData({ ...formData, airport_code: e.target.value.toUpperCase() })}
              maxLength={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority (1-50)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="50"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={createDestination.isPending}>
          {createDestination.isPending ? 'Creating...' : 'Create Destination'}
        </Button>
      </form>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Airport Code</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations?.map((dest) => (
              <TableRow key={dest.id}>
                <TableCell>{dest.city_name}</TableCell>
                <TableCell>{dest.country}</TableCell>
                <TableCell>{dest.airport_code}</TableCell>
                <TableCell>{dest.priority}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DestinationsManager;
