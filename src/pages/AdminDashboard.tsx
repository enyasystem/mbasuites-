import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import DashboardStats from "@/components/admin/DashboardStats";
import BookingsManager from "@/components/admin/BookingsManager";
import RoomsManager from "@/components/admin/RoomsManager";
import CalendarSyncManager from "@/components/admin/CalendarSyncManager";
import AnalyticsReports from "@/components/admin/AnalyticsReports";
import StaffManager from "@/components/admin/StaffManager";
import ActivityLog from "@/components/admin/ActivityLog";
import PaymentSettingsManager from "@/components/admin/PaymentSettingsManager";
import HeroManager from "@/components/admin/HeroManager";
import BankPaymentRequestsManager from "@/components/admin/BankPaymentRequestsManager";
import GuestRegistration from "@/components/admin/GuestRegistration";
import GuestList from "@/components/admin/GuestList";
import PromotionsManager from "@/components/admin/PromotionsManager";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useCurrency } from "@/context/CurrencyContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { CalendarCheck, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type RecentBooking = {
  id: string;
  guest_name: string;
  room_title: string;
  check_in_date: string;
  check_out_date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_amount: number;
  created_at: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { formatPrice, formatLocalPrice } = useCurrency();
  const { isAdmin, isLoading: roleLoading, role } = useRoleCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const hasCheckedRole = useRef(false);

  // Fetch recent bookings from database
  const { data: recentBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-recent-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, guest_name, check_in_date, check_out_date, status, total_amount, created_at, rooms(title)")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return (data || []).map(b => ({
        id: b.id,
        guest_name: b.guest_name,
        room_title: (b.rooms as { title: string } | null)?.title || "Unknown Room",
        check_in_date: b.check_in_date,
        check_out_date: b.check_out_date,
        status: b.status,
        total_amount: b.total_amount,
        created_at: b.created_at,
      })) as RecentBooking[];
    },
    enabled: isAdmin,
  });

  // Fetch dashboard stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      // Request booking stats for all time by passing an early start date.
      const [bookingStats, occupancyStats, roomsData] = await Promise.all([
        supabase.rpc("get_booking_stats", { p_start_date: '1970-01-01' }),
        supabase.rpc("get_occupancy_stats"),
        supabase.from("rooms").select("id").eq("is_available", true),
      ]);

      const bookingData = bookingStats.data?.[0];
      const occupancyData = occupancyStats.data?.[0];
      
      return {
        activeBookings: Number(bookingData?.confirmed_bookings || 0) + Number(bookingData?.pending_bookings || 0),
        availableRooms: roomsData.data?.length || 0,
        totalRevenue: Number(bookingData?.total_revenue || 0),
        occupancyRate: Number(occupancyData?.occupancy_rate || 0),
      };
    },
    enabled: isAdmin,
  });

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) { navigate("/staff-login"); return; }
    // Only redirect guests (explicit "guest" role). Allow both `staff` and `admin` to stay on dashboard.
    if (role === "guest" && !hasCheckedRole.current) {
      hasCheckedRole.current = true;
      navigate("/staff");
    }
  }, [authLoading, roleLoading, user, role, navigate]);

  // Debugging: log current user id and role, and fetch user_roles row for troubleshooting
  useEffect(() => {
    if (authLoading || roleLoading) return;
    console.debug("AdminDashboard debug: userId, role", { userId: user?.id, role });
    if (user?.id) {
      supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .then((res) => console.debug('user_roles query result:', res))
        .catch((err) => console.error('user_roles query error:', err));
    }
  }, [authLoading, roleLoading, user, role]);

  // While auth/role are loading, show skeleton. After loading, allow both `admin` and `staff` through.
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <DashboardStats
              activeBookings={stats?.activeBookings || 0}
              availableRooms={stats?.availableRooms || 0}
              totalRevenue={stats?.totalRevenue || 0}
              occupancyRate={stats?.occupancyRate || 0}
              isLoading={statsLoading}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                  {bookingsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))
                  ) : recentBookings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No bookings yet</p>
                  ) : (
                    recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">{booking.guest_name}</div>
                          <div className="text-sm text-muted-foreground">{booking.room_title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{booking.check_in_date} → {booking.check_out_date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatLocalPrice(booking.total_amount)}</div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                            booking.status === "confirmed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : booking.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : booking.status === "completed" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>{booking.status}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setActiveTab("bookings")} className="w-full p-4 text-left rounded-lg border border-border hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10"><CalendarCheck className="h-5 w-5 text-primary" /></div>
                      <div><div className="font-medium">View All Bookings</div><div className="text-sm text-muted-foreground">Manage and filter bookings</div></div>
                    </div>
                  </button>
                  <button onClick={() => setActiveTab("rooms")} className="w-full p-4 text-left rounded-lg border border-border hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10"><Building2 className="h-5 w-5 text-accent" /></div>
                      <div><div className="font-medium">Manage Rooms</div><div className="text-sm text-muted-foreground">Add, edit, or update room inventory</div></div>
                    </div>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        );
      case "bookings": return <BookingsManager />;
      case "rooms": return <RoomsManager />;
      case "hero": return <HeroManager />;
      case "promotions": return <PromotionsManager />;
      case "sync": return <CalendarSyncManager />;
      case "analytics": return <AnalyticsReports />;
      case "staff": return <StaffManager />;
      case "activity": return <ActivityLog />;
      case "payments": return <BankPaymentRequestsManager />;
      case "guest-registration": return <GuestRegistration />;
      case "guest-registrations": return <GuestList />;
      case "settings": return <PaymentSettingsManager />;
      default: return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <Link to="/" aria-label="Home">
                <img src="/mba_suites_logo.png" alt="MBA Suites" className="h-10 w-auto" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Manage your hotel operations</p>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
