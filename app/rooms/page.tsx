import Link from "next/link"
import { db } from "@/lib/db"
import { RoomsClientWrapper } from "@/components/rooms-client-wrapper"

export const runtime = "edge"

interface Room {
  id: number
  name: string
  type: string
  price_usd: number
  price_ngn: number
  description: string
  amenities: string[]
  images: { url: string; alt: string }[]
  max_guests: number
  beds: number
  bathrooms: number
  size_sqm: number
  available: boolean
}

async function getAllRooms(): Promise<Room[]> {
  try {
    console.log("[v0] Fetching rooms from database...")
    const rooms = await db`SELECT * FROM rooms ORDER BY price_usd ASC`
    console.log("[v0] Fetched rooms count:", rooms.length)
    return rooms as Room[]
  } catch (error) {
    console.error("[v0] Error fetching rooms:", error)
    return []
  }
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const rooms = await getAllRooms()

  let filteredRooms = rooms

  const checkIn = params.checkIn ? new Date(params.checkIn as string) : null
  const checkOut = params.checkOut ? new Date(params.checkOut as string) : null
  const adults = params.adults ? Number.parseInt(params.adults as string) : 1
  const children = params.children ? Number.parseInt(params.children as string) : 0
  const numRooms = params.rooms ? Number.parseInt(params.rooms as string) : 1
  const totalGuests = adults + children

  if (params.checkIn || params.checkOut) {
    filteredRooms = filteredRooms.filter((room) => room.max_guests >= totalGuests && room.available)
  }

  let nights = 1
  if (checkIn && checkOut) {
    nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const searchSummary =
    checkIn && checkOut
      ? `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()} • ${totalGuests} guest${totalGuests !== 1 ? "s" : ""} • ${numRooms} room${numRooms !== 1 ? "s" : ""}`
      : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">All Rooms</span>
        </div>

        <div className="mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">All Rooms & Suites</h1>
          {searchSummary && <p className="text-lg text-[#FF6B35] font-medium mb-4">{searchSummary}</p>}
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse our complete collection of luxury accommodations, each designed for maximum comfort and elegance.
          </p>
        </div>

        {params.checkIn && (
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              Showing {filteredRooms.length} available room{filteredRooms.length !== 1 ? "s" : ""} for your dates •{" "}
              {nights} night{nights !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <RoomsClientWrapper rooms={filteredRooms} allRoomsCount={rooms.length} />
      </div>
    </div>
  )
}
