import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)

    const booking = await sql`
      SELECT 
        b.*,
        r.name as room_name,
        r.type as room_type,
        r.images as room_images
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ${params.id}
    `

    if (booking.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ booking: booking[0] })
  } catch (error) {
    console.error("[v0] Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { payment_status, payment_reference, status } = body

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const booking = await sql`
      UPDATE bookings 
      SET 
        payment_status = COALESCE(${payment_status}, payment_status),
        payment_reference = COALESCE(${payment_reference}, payment_reference),
        status = COALESCE(${status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (booking.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ booking: booking[0] })
  } catch (error) {
    console.error("[v0] Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
