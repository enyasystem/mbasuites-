import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      room_id,
      guest_name,
      guest_email,
      guest_phone,
      check_in,
      check_out,
      guests,
      total_nights,
      total_amount,
      currency,
      special_requests,
    } = body

    // Validate required fields
    if (!room_id || !guest_name || !guest_email || !guest_phone || !check_in || !check_out || !guests) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if room is available
    const sql = neon(process.env.NEON_DATABASE_URL!)

    const existingBookings = await sql`
      SELECT id FROM bookings 
      WHERE room_id = ${room_id}
      AND status != 'cancelled'
      AND (
        (check_in <= ${check_in} AND check_out > ${check_in})
        OR (check_in < ${check_out} AND check_out >= ${check_out})
        OR (check_in >= ${check_in} AND check_out <= ${check_out})
      )
    `

    if (existingBookings.length > 0) {
      return NextResponse.json({ error: "Room is not available for selected dates" }, { status: 409 })
    }

    // Create booking
    const booking = await sql`
      INSERT INTO bookings (
        room_id, guest_name, guest_email, guest_phone,
        check_in, check_out, guests, total_nights,
        total_amount, currency, special_requests,
        payment_status, status
      ) VALUES (
        ${room_id}, ${guest_name}, ${guest_email}, ${guest_phone},
        ${check_in}, ${check_out}, ${guests}, ${total_nights},
        ${total_amount}, ${currency}, ${special_requests || null},
        'pending', 'pending'
      )
      RETURNING *
    `

    return NextResponse.json({ booking: booking[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Booking creation error:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
