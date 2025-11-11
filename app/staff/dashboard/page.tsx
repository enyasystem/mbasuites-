import { requireStaffAuth, getStaffUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { RecentBookings } from "@/components/recent-bookings"
import Link from "next/link"
import { Calendar, Users, DollarSign, Home } from "lucide-react"

export const runtime = "edge"

interface Stats {
  total_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  total_revenue_usd: number
  total_revenue_ngn: number
  occupied_rooms: number
  available_rooms: number
}

async function getDashboardStats(): Promise<Stats> {
  const sql = neon(process.env.NEON_DATABASE_URL!)

  const bookingStats = await sql`
    SELECT 
      COUNT(*) as total_bookings,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
      COALESCE(SUM(total_amount) FILTER (WHERE currency = 'USD' AND payment_status = 'paid'), 0) as total_revenue_usd,
      COALESCE(SUM(total_amount) FILTER (WHERE currency = 'NGN' AND payment_status = 'paid'), 0) as total_revenue_ngn
    FROM bookings
  `

  const roomStats = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE available = true) as available_rooms,
      COUNT(*) FILTER (WHERE available = false) as occupied_rooms
    FROM rooms
  `

  return {
    ...bookingStats[0],
    ...roomStats[0],
  } as Stats
}

async function getRecentBookings() {
  const sql = neon(process.env.NEON_DATABASE_URL!)

  return await sql`
    SELECT 
      b.*,
      r.name as room_name,
      r.type as room_type
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    ORDER BY b.created_at DESC
    LIMIT 10
  `
}

export default async function StaffDashboard() {
  await requireStaffAuth()
  const user = await getStaffUser()
  const stats = await getDashboardStats()
  const recentBookings = await getRecentBookings()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-lg text-muted-foreground">Welcome back, {user?.email}</p>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-foreground">{stats.total_bookings}</div>
          <div className="text-sm text-muted-foreground">Total Bookings</div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-foreground">{stats.confirmed_bookings}</div>
          <div className="text-sm text-muted-foreground">Confirmed Bookings</div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-foreground">
            ${Number(stats.total_revenue_usd).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Revenue (USD)</div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Home className="h-6 w-6" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-foreground">{stats.available_rooms}</div>
          <div className="text-sm text-muted-foreground">Available Rooms</div>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookings bookings={recentBookings} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/staff/reservations"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">View All Reservations</span>
              </Link>
              <Link
                href="/staff/rooms"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Home className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">Manage Rooms</span>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted p-6">
            <h3 className="mb-2 font-semibold text-foreground">Revenue Summary</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Total USD</div>
                <div className="font-serif text-2xl font-bold text-foreground">
                  ${Number(stats.total_revenue_usd).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total NGN</div>
                <div className="font-serif text-2xl font-bold text-foreground">
                  ₦{Number(stats.total_revenue_ngn).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
