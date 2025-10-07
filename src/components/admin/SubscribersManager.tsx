import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const SubscribersManager = () => {
  const { data: subscribers } = useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subscribed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers?.map((subscriber) => (
            <TableRow key={subscriber.id}>
              <TableCell>{subscriber.email}</TableCell>
              <TableCell>{subscriber.name || '-'}</TableCell>
              <TableCell>
                <Badge variant={subscriber.is_active ? 'default' : 'secondary'}>
                  {subscriber.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{new Date(subscriber.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubscribersManager;
