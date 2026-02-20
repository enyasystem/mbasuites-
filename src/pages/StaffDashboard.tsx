import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/context/CurrencyContext";
import { useLocations } from "@/hooks/useLocations";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import AdminSidebar from "@/components/admin/AdminSidebar";
import GuestRegistration from "@/components/admin/GuestRegistration";
import RoomsManager from "@/components/admin/RoomsManager";
import BookingsManager from "@/components/admin/BookingsManager";
import BankPaymentRequestsManager from "@/components/admin/BankPaymentRequestsManager";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, DollarSign, Building2, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Booking = {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in_date: string;
  check_out_date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_amount: number;
  num_guests: number;
  room: { title: string; room_number: string } | null;
};

export default function StaffDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { formatLocalPrice } = useCurrency();
  const { locations: allLocations } = useLocations();

  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assignedLocations, setAssignedLocations] = useState<{ id: string; name: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isStaff, setIsStaff] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    if (!authLoading && !user) navigate("/staff-login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const checkStaffRole = async () => {
      if (!user) return;
      type RoleRow = { role: string; location_id?: string | null };
      const { data: roles } = await supabase.from<RoleRow>("user_roles").select("role, location_id").eq("user_id", user.id);
      if (!roles || roles.length === 0) return navigate("/");
      const hasStaffRole = roles.some((r) => r.role === "staff" || r.role === "admin");
      if (!hasStaffRole) return navigate("/");
      setIsStaff(true);
      const locationIds = roles.filter((r) => r.location_id).map((r) => r.location_id as string);
      const isAdmin = roles.some((r) => r.role === "admin");
      if (isAdmin) setAssignedLocations(allLocations.map(l => ({ id: l.id, name: l.name })));
      else if (locationIds.length > 0) setAssignedLocations(allLocations.filter(l => locationIds.includes(l.id)).map(l => ({ id: l.id, name: l.name })));
    };
    checkStaffRole();
  }, [user, allLocations, navigate]);

  const fetchBookings = useCallback(async () => {
    if (!isStaff) return;
    setIsLoading(true);
    try {
      type BookingRowRaw = {
        id: string;
        guest_name: string;
        guest_email: string;
        check_in_date: string;
        check_out_date: string;
        status: string;
        total_amount: number;
        num_guests: number;
        room?: { title?: string; room_number?: string; location_id?: string } | null;
      };

      const { data, error } = await supabase
        .from<BookingRowRaw>("bookings")
        .select(`id, guest_name, guest_email, check_in_date, check_out_date, status, total_amount, num_guests, room:rooms(title, room_number, location_id)`)
        .order("check_in_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      let rows: BookingRowRaw[] = (data as BookingRowRaw[]) || [];
      if (selectedLocation !== "all") rows = rows.filter((b) => b.room?.location_id === selectedLocation);
      else if (assignedLocations.length > 0 && assignedLocations.length !== allLocations.length) {
        const ids = assignedLocations.map(l => l.id);
        rows = rows.filter((b) => ids.includes(b.room?.location_id || ""));
      }
      setBookings(rows.map((b) => ({
        id: b.id,
        guest_name: b.guest_name,
        guest_email: b.guest_email,
        check_in_date: b.check_in_date,
        check_out_date: b.check_out_date,
        status: (b.status as Booking["status"]) || "pending",
        total_amount: b.total_amount,
        num_guests: b.num_guests,
        room: b.room ? { title: b.room.title || "", room_number: b.room.room_number || "" } : null,
      })));
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load bookings", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [isStaff, selectedLocation, assignedLocations, allLocations]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      totalBookings: bookings.length,
      todayCheckins: bookings.filter(b => b.check_in_date === today && b.status !== "cancelled").length,
      todayCheckouts: bookings.filter(b => b.check_out_date === today && b.status === "confirmed").length,
      pendingBookings: bookings.filter(b => b.status === "pending").length,
      revenue: bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.total_amount, 0),
    };
  }, [bookings]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending": return <Badge className="bg-yellow-400">Pending</Badge>;
      case "cancelled": return <Badge className="bg-red-500">Cancelled</Badge>;
      case "completed": return <Badge className="bg-blue-500">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const updateBookingStatus = async (id: string, newStatus: Booking["status"]) => {
    try {
      const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      toast({ title: "Success", description: `Booking updated to ${newStatus}` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update booking", variant: "destructive" });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10"><Clock className="h-5 w-5 text-green-500" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Check-ins</p>
                  <p className="text-2xl font-bold">{stats.todayCheckins}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10"><Clock className="h-5 w-5 text-blue-500" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Check-outs</p>
                  <p className="text-2xl font-bold">{stats.todayCheckouts}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10"><AlertCircle className="h-5 w-5 text-yellow-500" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10"><DollarSign className="h-5 w-5 text-accent" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatLocalPrice(stats.revenue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "bookings":
        return <BookingsManager />;
      case "rooms":
        return <RoomsManager />;
      case "guest-registration":
        return <GuestRegistration />;
      case "payments":
        return <BankPaymentRequestsManager />;
      default:
        return null;
    }
  };

  if (authLoading || !isStaff) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hiddenTabs={[
            "hero",
            "guest-registrations",
            "sync",
            "analytics",
            "staff",
            "activity",
            "settings",
          ]}
        />
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold">Staff Dashboard</h1>
                <p className="text-xs text-muted-foreground">Manage bookings and rooms</p>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            {(() => {
              const allowedLocationIds = assignedLocations.map(l => l.id);
              // Pass allowed locations into admin components so staff can only manage their assigned locations
              if (activeTab === "rooms") return <RoomsManager allowedLocationIds={allowedLocationIds} />;
              if (activeTab === "bookings") return <BookingsManager allowedLocationIds={allowedLocationIds} />;
              if (activeTab === "guest-registration") return <GuestRegistration assignedLocationId={assignedLocations.length === 1 ? assignedLocations[0].id : undefined} />;
              if (activeTab === "payments") return <BankPaymentRequestsManager allowedLocationIds={allowedLocationIds} />;
              return renderContent();
            })()}

            {(activeTab === "overview" || activeTab === "bookings") && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Bookings</CardTitle>
                      <CardDescription>Manage guest reservations</CardDescription>
                    </div>
                    {/* previously this reloaded the whole page; now just refetch the bookings data */}
                    <Button variant="outline" size="sm" onClick={fetchBookings}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No bookings found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Guest</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead>Check-out</TableHead>
                          <TableHead>Guests</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{booking.guest_name}</p>
                                <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {booking.room ? (
                                <div>
                                  <p>{booking.room.title}</p>
                                  <p className="text-sm text-muted-foreground">#{booking.room.room_number}</p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>{format(new Date(booking.check_in_date), "MMM d, yyyy")}</TableCell>
                            <TableCell>{format(new Date(booking.check_out_date), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {booking.num_guests}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{formatLocalPrice(booking.total_amount)}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell>
                              <Select value={booking.status} onValueChange={(v) => updateBookingStatus(booking.id, v)}>
                                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
