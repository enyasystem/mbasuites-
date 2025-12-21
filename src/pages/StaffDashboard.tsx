import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/context/CurrencyContext";
import { useLocations } from "@/hooks/useLocations";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, DollarSign, Building2, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in_date: string;
  check_out_date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_amount: number;
  num_guests: number;
  room: {
    title: string;
    room_number: string;
  } | null;
}

interface StaffLocation {
  id: string;
  name: string;
}

const StaffDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { formatPrice, formatLocalPrice } = useCurrency();
  const { locations: allLocations } = useLocations();
  
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assignedLocations, setAssignedLocations] = useState<StaffLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/staff-login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const checkStaffRole = async () => {
      if (!user) return;

      // Check if user has staff or admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role, location_id")
        .eq("user_id", user.id);

      if (!roles || roles.length === 0) {
        navigate("/");
        return;
      }

      const hasStaffRole = roles.some(r => r.role === "staff" || r.role === "admin");
      if (!hasStaffRole) {
        navigate("/");
        return;
      }

      setIsStaff(true);

      // Get assigned locations
      const locationIds = roles
        .filter(r => r.location_id)
        .map(r => r.location_id);
      
      const isAdmin = roles.some(r => r.role === "admin");
      
      if (isAdmin) {
        // Admins can see all locations
        setAssignedLocations(allLocations.map(l => ({ id: l.id, name: l.name })));
      } else if (locationIds.length > 0) {
        const staffLocations = allLocations
          .filter(l => locationIds.includes(l.id))
          .map(l => ({ id: l.id, name: l.name }));
        setAssignedLocations(staffLocations);
        if (staffLocations.length === 1) {
          setSelectedLocation(staffLocations[0].id);
        }
      }
    };

    checkStaffRole();
  }, [user, allLocations, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isStaff) return;
      
      setIsLoading(true);
      try {
        let query = supabase
          .from("bookings")
          .select(`
            id,
            guest_name,
            guest_email,
            check_in_date,
            check_out_date,
            status,
            total_amount,
            num_guests,
            room:rooms(title, room_number, location_id)
          `)
          .order("check_in_date", { ascending: false })
          .limit(100);

        const { data, error } = await query;

        if (error) throw error;

        // Filter by location if needed (client-side since we need room.location_id)
        let filtered = data || [];
        if (selectedLocation !== "all") {
          filtered = filtered.filter((b: any) => b.room?.location_id === selectedLocation);
        } else if (assignedLocations.length > 0 && assignedLocations.length !== allLocations.length) {
          const locationIds = assignedLocations.map(l => l.id);
          filtered = filtered.filter((b: any) => locationIds.includes(b.room?.location_id));
        }

        setBookings(filtered.map((b: any) => ({
          ...b,
          room: b.room ? { title: b.room.title, room_number: b.room.room_number } : null
        })));
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [isStaff, selectedLocation, assignedLocations, allLocations]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      totalBookings: bookings.length,
      todayCheckins: bookings.filter(b => b.check_in_date === today && b.status !== "cancelled").length,
      todayCheckouts: bookings.filter(b => b.check_out_date === today && b.status === "confirmed").length,
      pendingBookings: bookings.filter(b => b.status === "pending").length,
      revenue: bookings.filter(b => b.status !== "cancelled").reduce((sum, b) => sum + b.total_amount, 0),
    };
  }, [bookings]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500 text-yellow-950"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: "pending" | "confirmed" | "cancelled" | "completed") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus as "pending" | "confirmed" | "cancelled" | "completed" } : b
      ));

      toast({
        title: "Success",
        description: `Booking status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Staff Dashboard</h1>
              <p className="text-muted-foreground">Manage bookings and room operations</p>
            </div>
            
            {assignedLocations.length > 1 && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {assignedLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Check-ins</p>
                  <p className="text-2xl font-bold">{stats.todayCheckins}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Check-outs</p>
                  <p className="text-2xl font-bold">{stats.todayCheckouts}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatLocalPrice(stats.revenue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Manage guest reservations</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
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
                <div className="text-center py-12 text-muted-foreground">
                  No bookings found
                </div>
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
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateBookingStatus(booking.id, value as "pending" | "confirmed" | "cancelled" | "completed")}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
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
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default StaffDashboard;
