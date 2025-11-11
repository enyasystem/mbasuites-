import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { RoomDetails } from "@/components/room-details"
import { BookingForm } from "@/components/booking-form"
import { Breadcrumb } from "@/components/breadcrumb"
import { StickyBookingCTA } from "@/components/sticky-booking-cta"

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

async function getRoom(id: string): Promise<Room | null> {
  try {
    const roomId = Number.parseInt(id, 10)
    if (isNaN(roomId)) {
      return null
    }

    const rooms = await db`SELECT * FROM rooms WHERE id = ${roomId} AND available = true`
    return (rooms[0] as Room) || null
  } catch (error) {
    console.error("[v0] Error fetching room:", error)
    return null
  }
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoom(id)

  if (!room) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <Breadcrumb items={[{ label: "Rooms", href: "/rooms" }, { label: room.name }]} />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RoomDetails room={room} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm room={room} />
            </div>
          </div>
        </div>
      </div>
      <StickyBookingCTA room={room} />
    </div>
  )
}
