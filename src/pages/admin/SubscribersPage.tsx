import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Trash2, Ban } from "lucide-react";

export default function SubscribersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["subscribers", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("subscribers")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    },
  });

  const deactivateSubscriber = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subscribers")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      toast({ title: "Success", description: "Subscriber deactivated" });
    },
  });

  const deleteSubscriber = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subscribers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      toast({ title: "Success", description: "Subscriber deleted" });
    },
  });

  const exportToCSV = () => {
    if (!subscribers?.data) return;

    const csvData = subscribers.data.map(sub => ({
      Email: sub.email,
      Name: sub.name || "",
      Status: sub.is_active ? "Active" : "Inactive",
      Verified: sub.is_verified ? "Yes" : "No",
      "Signed Up": new Date(sub.created_at).toLocaleDateString(),
    }));

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map(row => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const totalPages = Math.ceil((subscribers?.count || 0) / itemsPerPage);
  const paginatedData = subscribers?.data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Subscribers Management</h1>
        <p className="text-muted-foreground">Manage your email subscribers</p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-muted-foreground">
        Total: {subscribers?.count || 0} subscribers
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Signed Up</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No subscribers found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData?.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                      {subscriber.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subscriber.is_verified ? "default" : "outline"}>
                      {subscriber.is_verified ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(subscriber.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deactivateSubscriber.mutate(subscriber.id)}
                        disabled={!subscriber.is_active}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this subscriber?")) {
                            deleteSubscriber.mutate(subscriber.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
