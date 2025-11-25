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
import { Search, CalendarX } from "lucide-react";

type BookingStatus = "pending" | "confirmed" | "cancelled";

type Booking = {
  id: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  amountUsd: number;
  createdAt: string;
};

const sampleBookings: Booking[] = [
  {
    id: "BKG-1001",
    guestName: "Amina Olu",
    roomName: "Executive Suite",
    checkIn: "2025-12-08",
    checkOut: "2025-12-12",
    status: "confirmed",
    amountUsd: 1396,
    createdAt: "2025-11-01",
  },
  {
    id: "BKG-1002",
    guestName: "John Doe",
    roomName: "Standard Double Room",
    checkIn: "2025-11-25",
    checkOut: "2025-11-27",
    status: "pending",
    amountUsd: 258,
    createdAt: "2025-11-20",
  },
  {
    id: "BKG-1003",
    guestName: "Mary Smith",
    roomName: "Deluxe King Room",
    checkIn: "2026-01-05",
    checkOut: "2026-01-09",
    status: "confirmed",
    amountUsd: 756,
    createdAt: "2025-10-11",
  },
  {
    id: "BKG-1004",
    guestName: "Peter Obi",
    roomName: "Standard Single Room",
    checkIn: "2025-12-20",
    checkOut: "2025-12-22",
    status: "cancelled",
    amountUsd: 178,
    createdAt: "2025-11-02",
  },
];

export default function BookingsManager() {
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = React.useState<Booking[]>(sampleBookings);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "all">("all");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [sortBy, setSortBy] = React.useState<keyof Booking | null>("createdAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = React.useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const av: any = a[sortBy];
      const bv: any = b[sortBy];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
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
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b))
    );
    toast({ title: "Booking cancelled", description: "The booking has been cancelled." });
  }

  function handleConfirm(id: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "confirmed" as BookingStatus } : b))
    );
    toast({ title: "Booking confirmed", description: "The booking has been confirmed." });
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
      <div>
        <h2 className="text-2xl font-bold mb-2">Bookings Management</h2>
        <p className="text-muted-foreground">
          View, filter, and manage all hotel bookings
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name, room, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select onValueChange={(v) => setStatusFilter(v as any)} value={statusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
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
                  <TableHead onClick={() => toggleSort("amountUsd")} className="cursor-pointer">
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
                    <TableCell className="font-medium">{b.id}</TableCell>
                    <TableCell>{b.guestName}</TableCell>
                    <TableCell>{b.roomName}</TableCell>
                    <TableCell>{b.checkIn}</TableCell>
                    <TableCell>{b.checkOut}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(b.amountUsd)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : b.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
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
                            <DialogTitle>Booking {b.id}</DialogTitle>
                            <DialogDescription>
                              <div className="space-y-3 pt-4">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Guest:</span>
                                  <span className="font-medium">{b.guestName}</span>
                                </div>
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
                                  <span className="font-medium">{formatPrice(b.amountUsd)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status:</span>
                                  <span className="font-medium capitalize">{b.status}</span>
                                </div>
                              </div>
                            </DialogDescription>
                            <DialogFooter className="flex gap-2">
                              {b.status === "pending" && (
                                <Button onClick={() => handleConfirm(b.id)}>Confirm</Button>
                              )}
                              {b.status !== "cancelled" && (
                                <Button variant="destructive" onClick={() => handleCancel(b.id)}>
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
