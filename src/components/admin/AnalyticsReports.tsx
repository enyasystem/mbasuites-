import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/context/CurrencyContext";
import { useLocations } from "@/hooks/useLocations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, DollarSign, Calendar, Users, Download, RefreshCw } from "lucide-react";
import { format, subDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  avg_booking_value: number;
  total_nights: number;
}

interface OccupancyStats {
  total_rooms: number;
  occupied_room_nights: number;
  total_room_nights: number;
  occupancy_rate: number;
}

interface RevenueByRoomType {
  room_type: string;
  booking_count: number;
  total_revenue: number;
  avg_revenue: number;
}

interface DailyTrend {
  booking_date: string;
  booking_count: number;
  revenue: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))'];

export default function AnalyticsReports() {
  const [dateRange, setDateRange] = useState("30");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [occupancyStats, setOccupancyStats] = useState<OccupancyStats | null>(null);
  const [revenueByType, setRevenueByType] = useState<RevenueByRoomType[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  
  const { formatPrice } = useCurrency();
  const { locations } = useLocations();

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const locationId = selectedLocation === "all" ? null : selectedLocation;

      // Fetch all stats in parallel
      const [statsRes, occupancyRes, revenueRes, trendsRes] = await Promise.all([
        supabase.rpc('get_booking_stats', {
          p_start_date: startDate,
          p_end_date: endDate,
          p_location_id: locationId
        }),
        supabase.rpc('get_occupancy_stats', {
          p_start_date: format(new Date(), 'yyyy-MM-dd'),
          p_end_date: format(subDays(new Date(), -30), 'yyyy-MM-dd'),
          p_location_id: locationId
        }),
        supabase.rpc('get_revenue_by_room_type', {
          p_start_date: startDate,
          p_end_date: endDate,
          p_location_id: locationId
        }),
        supabase.rpc('get_daily_booking_trends', {
          p_start_date: startDate,
          p_end_date: endDate,
          p_location_id: locationId
        })
      ]);

      if (statsRes.data && statsRes.data.length > 0) {
        setBookingStats(statsRes.data[0]);
      }
      if (occupancyRes.data && occupancyRes.data.length > 0) {
        setOccupancyStats(occupancyRes.data[0]);
      }
      if (revenueRes.data) {
        setRevenueByType(revenueRes.data);
      }
      if (trendsRes.data) {
        setDailyTrends(trendsRes.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, selectedLocation]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const statusData = bookingStats ? [
    { name: 'Confirmed', value: bookingStats.confirmed_bookings, color: 'hsl(142, 76%, 36%)' },
    { name: 'Pending', value: bookingStats.pending_bookings, color: 'hsl(48, 96%, 53%)' },
    { name: 'Cancelled', value: bookingStats.cancelled_bookings, color: 'hsl(0, 84%, 60%)' },
    { name: 'Completed', value: bookingStats.completed_bookings, color: 'hsl(var(--primary))' },
  ].filter(item => item.value > 0) : [];

  const exportReport = () => {
    const reportData = {
      dateRange: `Last ${dateRange} days`,
      location: selectedLocation === "all" ? "All Locations" : locations.find(l => l.id === selectedLocation)?.name,
      bookingStats,
      occupancyStats,
      revenueByType,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Period:</span>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Location:</span>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{bookingStats?.total_bookings || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(bookingStats?.total_revenue || 0)}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                  <p className="text-2xl font-bold">{occupancyStats?.occupancy_rate || 0}%</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Booking Value</p>
                  <p className="text-2xl font-bold">{formatPrice(bookingStats?.avg_booking_value || 0)}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : dailyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="booking_date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  formatter={(value: number) => formatPrice(value)}
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Booking Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Revenue by Room Type */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Revenue by Room Type</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : revenueByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByType}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="room_type" className="text-xs capitalize" />
                <YAxis className="text-xs" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'total_revenue' ? formatPrice(value) : value,
                    name === 'total_revenue' ? 'Revenue' : 'Bookings'
                  ]}
                />
                <Bar dataKey="total_revenue" fill="hsl(var(--primary))" name="Revenue" />
                <Bar dataKey="booking_count" fill="hsl(var(--accent))" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
