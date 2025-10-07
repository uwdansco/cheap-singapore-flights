import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, Filter } from "lucide-react";

export default function DealsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState({
    destination_id: "",
    price: "",
    outbound_date: "",
    return_date: "",
    booking_link: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("is_active", true)
        .order("city_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: deals, isLoading } = useQuery({
    queryKey: ["deals", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("deals")
        .select("*, destinations(city_name, country, airport_code)")
        .order("created_at", { ascending: false });

      if (filterStatus === "sent") {
        query = query.eq("sent_to_subscribers", true);
      } else if (filterStatus === "unsent") {
        query = query.eq("sent_to_subscribers", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createDeal = useMutation({
    mutationFn: async (newDeal: typeof formData) => {
      const { error } = await supabase.from("deals").insert([{
        ...newDeal,
        price: parseFloat(newDeal.price),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast({ title: "Success", description: "Deal created successfully" });
      resetForm();
    },
  });

  const sendDeal = useMutation({
    mutationFn: async (dealId: string) => {
      const { data, error } = await supabase.functions.invoke("send-deal", {
        body: { dealId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast({ title: "Success", description: "Deal sent to all subscribers!" });
    },
  });

  const resetForm = () => {
    setFormData({
      destination_id: "",
      price: "",
      outbound_date: "",
      return_date: "",
      booking_link: "",
    });
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeal.mutate(formData);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Deals Management</h1>
        <p className="text-muted-foreground">Create and send flight deals to subscribers</p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-4 mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Manual Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destination</Label>
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
                  <Label>Price (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outbound Date</Label>
                  <Input
                    type="date"
                    value={formData.outbound_date}
                    onChange={(e) => setFormData({ ...formData, outbound_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Input
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Booking Link</Label>
                  <Input
                    type="url"
                    value={formData.booking_link}
                    onChange={(e) => setFormData({ ...formData, booking_link: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createDeal.isPending}>
                {createDeal.isPending ? "Creating..." : "Create Deal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Deals</SelectItem>
            <SelectItem value="sent">Sent Only</SelectItem>
            <SelectItem value="unsent">Unsent Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-muted-foreground">
        Total: {deals?.length || 0} deals
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destination</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Travel Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : deals?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No deals found. Create your first deal!
                </TableCell>
              </TableRow>
            ) : (
              deals?.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">
                    {deal.destinations?.city_name}, {deal.destinations?.country}
                    <div className="text-xs text-muted-foreground">
                      {deal.destinations?.airport_code}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    ${deal.price}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(deal.outbound_date).toLocaleDateString()}
                      <span className="text-muted-foreground"> → </span>
                      {new Date(deal.return_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={deal.sent_to_subscribers ? "default" : "secondary"}>
                      {deal.sent_to_subscribers ? "Sent" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {deal.sent_at ? new Date(deal.sent_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
