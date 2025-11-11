import { getDb } from "@/lib/db"
import { StaffRoomsClient } from "@/components/staff-rooms-client"

interface Room {
  id: number
  name: string
  type: string
  price_usd: number
  price_ngn: number
  beds: number
  bathrooms: number
  max_guests: number
  available: boolean
}

async function getAllRooms(): Promise<Room[]> {
  const sql = getDb()
  console.log("[v0] Fetching all rooms for staff management...")

  try {
    const rooms = await sql<Room[]>`
      SELECT 
        id, 
        name, 
        type, 
        price_usd, 
        price_ngn, 
        beds, 
        bathrooms, 
        max_guests, 
        available
      FROM rooms
      ORDER BY id ASC
    `
    console.log("[v0] Fetched rooms count:", rooms.length)
    return rooms
  } catch (error) {
    console.error("[v0] Error fetching rooms:", error)
    return []
  }
}

export default async function StaffRoomsPage() {
  const rooms = await getAllRooms()

  return <StaffRoomsClient initialRooms={rooms} />
}
