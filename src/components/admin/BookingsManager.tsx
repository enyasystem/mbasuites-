import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "@/hooks/use-toast";
import { Search, CalendarX, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type Booking = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  roomName: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  amount: number;
  currency: string;
  createdAt: string;
  notes: string | null;
};

type SupabaseBookingRow = {
  id: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string | null;
  room_id?: string;
  check_in_date?: string;
  check_out_date?: string;
  status?: BookingStatus;
  total_amount?: number;
  currency?: string;
  created_at?: string;
  notes?: string | null;
  rooms?: {
    title?: string;
    location_id?: string | null;
  } | null;
};

export default function BookingsManager({ allowedLocationIds }: { allowedLocationIds?: string[] }) {
  const { formatPrice } = useCurrency();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "all">("all");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [sortBy, setSortBy] = React.useState<keyof Booking | null>("createdAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  // Fetch bookings from database
  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      console.debug('BookingsManager: fetching bookings');
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          guest_name,
          guest_email,
          guest_phone,
          room_id,
          check_in_date,
          check_out_date,
          status,
          total_amount,
          currency,
          created_at,
          notes,
          rooms (
            title,
            location_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((b: SupabaseBookingRow) => ({
        id: b.id,
        guestName: b.guest_name || 'Guest',
        guestEmail: b.guest_email || '',
        guestPhone: b.guest_phone || null,
        roomName: b.rooms?.title || 'Unknown Room',
        roomId: b.room_id || '',
        checkIn: b.check_in_date || '',
        checkOut: b.check_out_date || '',
        status: (b.status as BookingStatus) || 'pending',
        amount: b.total_amount || 0,
        currency: b.currency || 'NGN',
        createdAt: b.created_at || '',
        notes: b.notes || null,
        _locationId: b.rooms?.location_id || null,
      }));

      if (allowedLocationIds && allowedLocationIds.length > 0) {
        return mapped.filter((m) => !m._locationId || allowedLocationIds.includes(m._locationId as string));
      }

      return mapped;
    },
    // Prevent refetch when the component remounts (e.g. when switching tabs)
    // and when window focus changes — avoid unexpected DB requests on tab switch.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  
  // Mount/unmount tracing for debugging tab switches
  React.useEffect(() => {
    console.log("BookingsManager: mounted");
    return () => console.log("BookingsManager: unmounted");
  }, []);
  

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });

  const filtered = React.useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (fromDate && new Date(b.checkIn) < new Date(fromDate)) return false;
      if (toDate && new Date(b.checkOut) > new Date(toDate)) return false;
      return true;
    });
  }, [bookings, searchTerm, statusFilter, fromDate, toDate]);

  const sorted = React.useMemo(() => {
    if (!sortBy) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortBy] as unknown;
      const bv = b[sortBy] as unknown;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
      }
      return 0;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const toggleSort = (key: keyof Booking) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  function handleCancel(id: string) {
    updateStatusMutation.mutate(
      { id, status: "cancelled" },
      {
        onSuccess: () => {
          toast({ title: "Booking cancelled", description: "The booking has been cancelled." });
          setEditOpen(false);
        },
        onError: (error) => {
          toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
        },
      }
    );
  }

  function handleConfirm(id: string) {
    updateStatusMutation.mutate(
      { id, status: "confirmed" },
      {
        onSuccess: () => {
          toast({ title: "Booking confirmed", description: "The booking has been confirmed." });
          setEditOpen(false);
        },
        onError: (error) => {
          toast({ title: "Error", description: "Failed to confirm booking.", variant: "destructive" });
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Card className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Bookings Management</h2>
          <p className="text-muted-foreground">
            View, filter, and manage all hotel bookings ({bookings.length} total)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { console.log("BookingsManager: manual refresh"); refetch(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name, email, room, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select onValueChange={(v: string) => setStatusFilter(v as BookingStatus | "all")} value={statusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
        </Select>
        <Input
          type="date"
          placeholder="From date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Input
          type="date"
          placeholder="To date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Button
          variant="outline"
          onClick={() => {
            setFromDate("");
            setToDate("");
            setStatusFilter("all");
            setSearchTerm("");
          }}
        >
          Clear
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarX className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" || fromDate || toDate
              ? "Try adjusting your filters to find what you're looking for"
              : "No bookings have been made yet"}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => toggleSort("id")} className="cursor-pointer">
                    Booking ID
                  </TableHead>
                  <TableHead onClick={() => toggleSort("guestName")} className="cursor-pointer">
                    Guest
                  </TableHead>
                  <TableHead onClick={() => toggleSort("roomName")} className="cursor-pointer">
                    Room
                  </TableHead>
                  <TableHead onClick={() => toggleSort("checkIn")} className="cursor-pointer">
                    Check-in
                  </TableHead>
                  <TableHead onClick={() => toggleSort("checkOut")} className="cursor-pointer">
                    Check-out
                  </TableHead>
                  <TableHead onClick={() => toggleSort("amount")} className="cursor-pointer">
                    Amount
                  </TableHead>
                  <TableHead onClick={() => toggleSort("status")} className="cursor-pointer">
                    Status
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium font-mono text-xs">
                      {b.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{b.guestName}</div>
                        <div className="text-xs text-muted-foreground">{b.guestEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{b.roomName}</TableCell>
                    <TableCell>{b.checkIn}</TableCell>
                    <TableCell>{b.checkOut}</TableCell>
                    <TableCell className="font-semibold">
                      {b.currency === 'NGN' ? '₦' : b.currency === 'USD' ? '$' : b.currency}
                      {b.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : b.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : b.status === "completed"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {b.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog
                          open={selected?.id === b.id && editOpen}
                          onOpenChange={(o) => {
                            if (!o) {
                              setSelected(null);
                              setEditOpen(false);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelected(b);
                                setEditOpen(true);
                              }}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>Booking {b.id.slice(0, 8).toUpperCase()}</DialogTitle>
                            <DialogDescription>
                              <div className="space-y-3 pt-4">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Guest:</span>
                                  <span className="font-medium">{b.guestName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Email:</span>
                                  <span className="font-medium">{b.guestEmail}</span>
                                </div>
                                {b.guestPhone && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="font-medium">{b.guestPhone}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Room:</span>
                                  <span className="font-medium">{b.roomName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Check-in:</span>
                                  <span className="font-medium">{b.checkIn}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Check-out:</span>
                                  <span className="font-medium">{b.checkOut}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Amount:</span>
                                  <span className="font-medium">
                                    {b.currency === 'NGN' ? '₦' : b.currency === 'USD' ? '$' : b.currency}
                                    {b.amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status:</span>
                                  <span className="font-medium capitalize">{b.status}</span>
                                </div>
                                {b.notes && (
                                  <div className="pt-2 border-t">
                                    <span className="text-muted-foreground block mb-1">Notes:</span>
                                    <span className="text-sm">{b.notes}</span>
                                  </div>
                                )}
                              </div>
                            </DialogDescription>
                            <DialogFooter className="flex gap-2">
                              {b.status === "pending" && (
                                <Button 
                                  onClick={() => handleConfirm(b.id)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Confirm
                                </Button>
                              )}
                              {b.status !== "cancelled" && b.status !== "completed" && (
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleCancel(b.id)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Cancel Booking
                                </Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
