import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Eye, Landmark, Clock, CheckCircle, XCircle } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

type BankPaymentRequest = {
  id: string;
  booking_id: string | null;
  guest_name: string;
  guest_email: string;
  amount: number;
  currency: string;
  payment_reference: string | null;
  proof_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

export default function BankPaymentRequestsManager() {
  const [requests, setRequests] = useState<BankPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BankPaymentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("bank_payment_requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bank_payment_requests" },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("bank_payment_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching bank payment requests:", error);
      toast.error("Failed to load payment requests");
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (status: "confirmed" | "rejected") => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("bank_payment_requests")
        .update({
          status,
          admin_notes: adminNotes || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // If confirmed and has booking_id, update the booking status
      if (status === "confirmed" && selectedRequest.booking_id) {
        await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", selectedRequest.booking_id);
      }

      toast.success(
        status === "confirmed"
          ? "Payment confirmed successfully"
          : "Payment request rejected"
      );
      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    } catch (error) {
      console.error("Error updating payment request:", error);
      toast.error("Failed to update payment request");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6" />
            Bank Payment Requests
          </h2>
          <p className="text-muted-foreground">
            Review and confirm direct bank transfer payments
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <CardDescription>
            Guests who selected bank transfer will appear here for confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bank payment requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.guest_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.guest_email}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(request.amount)}
                      </TableCell>
                      <TableCell>
                        {request.payment_reference || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminNotes(request.admin_notes || "");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Payment Request</DialogTitle>
            <DialogDescription>
              Verify the bank transfer and update the payment status
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Guest Name</p>
                  <p className="font-medium">{selectedRequest.guest_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRequest.guest_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-lg">
                    {formatPrice(selectedRequest.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="font-medium">
                    {selectedRequest.payment_reference || "Not provided"}
                  </p>
                </div>
              </div>

              {selectedRequest.proof_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Payment Proof
                  </p>
                  <a
                    href={selectedRequest.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View uploaded proof
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Admin Notes (optional)
                </p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this payment..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current Status:</span>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => updateRequestStatus("rejected")}
                  disabled={processing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => updateRequestStatus("confirmed")}
                  disabled={processing}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Payment
                </Button>
              </>
            )}
            {selectedRequest?.status !== "pending" && (
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
