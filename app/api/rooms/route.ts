import { sql } from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"
import { NextResponse } from "next/server"
import { convertCurrency, type Currency } from "@/lib/currency"
import type { CreateRoomInput } from "@/lib/validation"

export const runtime = "edge"

// GET /api/rooms - List rooms with filters and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const currency = (searchParams.get("currency") || "USD") as Currency
    const checkIn = searchParams.get("check_in")
    const checkOut = searchParams.get("check_out")
    const guests = searchParams.get("guests") ? Number.parseInt(searchParams.get("guests")!) : undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)
    const offset = (page - 1) * limit

    console.log("[v0] Fetching rooms with filters:", { currency, checkIn, checkOut, guests, page, limit })

    // Build query with availability check
    let query = `
      SELECT r.* FROM rooms r
      WHERE r.available = true
    `
    const params: any[] = []

    // Filter by guest capacity
    if (guests) {
      query += ` AND r.max_guests >= $${params.length + 1}`
      params.push(guests)
    }

    // Check availability for date range
    if (checkIn && checkOut) {
      query += `
        AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.room_id = r.id
          AND b.status != 'cancelled'
          AND (
            (b.check_in <= $${params.length + 1} AND b.check_out > $${params.length + 1})
            OR (b.check_in < $${params.length + 2} AND b.check_out >= $${params.length + 2})
            OR (b.check_in >= $${params.length + 1} AND b.check_out <= $${params.length + 2})
          )
        )
      `
      params.push(checkIn, checkOut)
    }

    query += ` ORDER BY r.price_usd ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const rooms = await sql(query, params)

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as count FROM rooms WHERE available = true`
    const total = Number(countResult[0].count)

    // Convert prices to requested currency
    const roomsWithConvertedPrices = rooms.map((room: any) => ({
      ...room,
      price: convertCurrency(room.price_usd, "USD", currency),
      price_currency: currency,
      price_usd: room.price_usd,
      price_ngn: room.price_ngn,
    }))

    return NextResponse.json(
      successResponse(roomsWithConvertedPrices, {
        page,
        limit,
        total,
      }),
    )
  } catch (error) {
    console.error("[v0] Error fetching rooms:", error)
    return NextResponse.json(errorResponse("Failed to fetch rooms", "FETCH_ERROR"), { status: 500 })
  }
}

// POST /api/rooms - Create new room (staff only)
export async function POST(request: Request) {
  try {
    // TODO: Add auth middleware to verify staff token
    const body: CreateRoomInput = await request.json()

    // Validate required fields
    if (!body.name || !body.type || !body.price_usd || !body.price_ngn) {
      return NextResponse.json(errorResponse("Missing required fields", "VALIDATION_ERROR"), { status: 400 })
    }

    const room = await sql`
      INSERT INTO rooms (
        name, type, description, price_usd, price_ngn,
        max_guests, beds, bathrooms, size_sqm, amenities, images, available
      ) VALUES (
        ${body.name}, ${body.type}, ${body.description}, ${body.price_usd}, ${body.price_ngn},
        ${body.max_guests}, ${body.beds}, ${body.bathrooms}, ${body.size_sqm},
        ${JSON.stringify(body.amenities)}, ${JSON.stringify(body.images)}, true
      )
      RETURNING *
    `

    return NextResponse.json(successResponse(room[0]), { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating room:", error)
    return NextResponse.json(errorResponse("Failed to create room", "CREATE_ERROR"), { status: 500 })
  }
}
