import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, Bed, DollarSign, TrendingUp } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

type DashboardStatsProps = {
  activeBookings: number;
  availableRooms: number;
  totalRevenue: number;
  occupancyRate: number;
  isLoading?: boolean;
};

export default function DashboardStats({
  activeBookings,
  availableRooms,
  totalRevenue,
  occupancyRate,
  isLoading = false,
}: DashboardStatsProps) {
  const { formatPrice, formatLocalPrice } = useCurrency();

  const stats = [
    {
      label: "Active Bookings",
      value: activeBookings,
      icon: CalendarCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Available Rooms",
      value: availableRooms,
      icon: Bed,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Total Revenue",
      // Booking totals are stored in local currency (not USD), so format without conversion
      value: formatLocalPrice(totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
