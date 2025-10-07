import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Plane } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DealsManager from '@/components/admin/DealsManager';
import SubscribersManager from '@/components/admin/SubscribersManager';
import DestinationsManager from '@/components/admin/DestinationsManager';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Plane className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="deals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          </TabsList>

          <TabsContent value="deals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Deals</CardTitle>
                <CardDescription>Create and manage travel deals to send to subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <DealsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Destinations</CardTitle>
                <CardDescription>Add and edit travel destinations</CardDescription>
              </CardHeader>
              <CardContent>
                <DestinationsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Subscribers</CardTitle>
                <CardDescription>View and manage email subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <SubscribersManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
