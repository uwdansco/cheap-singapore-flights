import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Plane, BarChart3 } from "lucide-react";

export default function DashboardOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Get total subscribers
      const { count: totalSubscribers } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true });

      // Get active subscribers
      const { count: activeSubscribers } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("is_verified", true);

      // Get subscribers from last week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekSubscribers } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      // Get total deals sent
      const { count: totalDeals } = await supabase
        .from("deals")
        .select("*", { count: "exact", head: true })
        .eq("sent_to_subscribers", true);

      // Get sent emails count
      const { count: sentEmails } = await supabase
        .from("sent_emails")
        .select("*", { count: "exact", head: true });

      return {
        totalSubscribers: totalSubscribers || 0,
        activeSubscribers: activeSubscribers || 0,
        weekSubscribers: weekSubscribers || 0,
        totalDeals: totalDeals || 0,
        sentEmails: sentEmails || 0,
      };
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data: recentSubscribers } = await supabase
        .from("subscribers")
        .select("email, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      return recentSubscribers || [];
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeSubscribers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.weekSubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">New subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Sent</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDeals || 0}</div>
            <p className="text-xs text-muted-foreground">Total deals distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sentEmails || 0}</div>
            <p className="text-xs text-muted-foreground">Campaign emails</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity?.map((subscriber, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{subscriber.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(subscriber.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
