import { useState, useMemo } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminFooter from "@/components/admin/AdminFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import DashboardStats from "@/components/admin/DashboardStats";
import BookingsManager from "@/components/admin/BookingsManager";
import RoomsManager from "@/components/admin/RoomsManager";
import { rooms } from "@/data/rooms";
import { useCurrency } from "@/context/CurrencyContext";
import { LayoutDashboard, CalendarCheck, Building2 } from "lucide-react";

type Booking = {
  id: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  status: "pending" | "confirmed" | "cancelled";
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { formatPrice } = useCurrency();

  const stats = useMemo(() => {
    const activeBookingsCount = sampleBookings.filter((b) => b.status === "confirmed").length;
    const availableRoomsCount = rooms.filter((r) => r.available).length;
    const totalRevenue = sampleBookings.reduce((sum, b) => sum + b.amountUsd, 0);
    const occupancyRate = Math.round((activeBookingsCount / rooms.length) * 100);

    return {
      activeBookings: activeBookingsCount,
      availableRooms: availableRoomsCount,
      totalRevenue,
      occupancyRate,
    };
  }, []);

  const recentBookings = useMemo(
    () =>
      [...sampleBookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminNavbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your hotel operations, bookings, and room inventory
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStats
              activeBookings={stats.activeBookings}
              availableRooms={stats.availableRooms}
              totalRevenue={stats.totalRevenue}
              occupancyRate={stats.occupancyRate}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{booking.guestName}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.roomName}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {booking.checkIn} → {booking.checkOut}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPrice(booking.amountUsd)}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="w-full p-4 text-left rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">View All Bookings</div>
                        <div className="text-sm text-muted-foreground">
                          Manage and filter bookings
                        </div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("rooms")}
                    className="w-full p-4 text-left rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Building2 className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-medium">Manage Rooms</div>
                        <div className="text-sm text-muted-foreground">
                          Add, edit, or update room inventory
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsManager />
          </TabsContent>

          <TabsContent value="rooms">
            <RoomsManager />
          </TabsContent>
        </Tabs>
      </main>

      <AdminFooter />
    </div>
  );
}
