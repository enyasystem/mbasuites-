import { requireStaffAuth } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { StaffHeader } from "@/components/staff-header"
import { ReservationsTable } from "@/components/reservations-table"
import { ReservationsFilters } from "@/components/reservations-filters"

export const runtime = "edge"

interface Booking {
  id: number
  guest_name: string
  guest_email: string
  guest_phone: string
  room_name: string
  room_type: string
  check_in: string
  check_out: string
  guests: number
  total_nights: number
  status: string
  payment_status: string
  total_amount: number
  currency: string
  created_at: string
}

async function getAllBookings(searchParams: { status?: string; search?: string }): Promise<Booking[]> {
  const sql = neon(process.env.NEON_DATABASE_URL!)

  let query = sql`
    SELECT 
      b.*,
      r.name as room_name,
      r.type as room_type
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE 1=1
  `

  if (searchParams.status) {
    query = sql`
      SELECT 
        b.*,
        r.name as room_name,
        r.type as room_type
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.status = ${searchParams.status}
    `
  }

  if (searchParams.search) {
    const search = `%${searchParams.search}%`
    query = sql`
      SELECT 
        b.*,
        r.name as room_name,
        r.type as room_type
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE 
        b.guest_name ILIKE ${search}
        OR b.guest_email ILIKE ${search}
        OR r.name ILIKE ${search}
    `
  }

  const bookings = await query

  return bookings as Booking[]
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  await requireStaffAuth()
  const bookings = await getAllBookings(await searchParams)

  return (
    <div className="min-h-screen bg-background">
      <StaffHeader user={null} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-4xl font-bold text-foreground">Reservations</h1>
          <p className="text-lg text-muted-foreground">Manage all hotel bookings and reservations</p>
        </div>

        <ReservationsFilters />

        <div className="mt-6">
          <ReservationsTable bookings={bookings} />
        </div>
      </div>
    </div>
  )
}
