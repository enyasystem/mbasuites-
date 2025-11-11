import { sql } from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"
import { NextResponse } from "next/server"
import { convertCurrency, type Currency } from "@/lib/currency"

export const runtime = "edge"

// GET /api/rooms/:id - Get room details
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const roomId = Number.parseInt(id)

    if (isNaN(roomId)) {
      return NextResponse.json(errorResponse("Invalid room ID", "INVALID_ID"), { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const currency = (searchParams.get("currency") || "USD") as Currency

    const rooms = await sql`SELECT * FROM rooms WHERE id = ${roomId}`

    if (rooms.length === 0) {
      return NextResponse.json(errorResponse("Room not found", "NOT_FOUND"), { status: 404 })
    }

    const room = rooms[0]

    // Convert price to requested currency
    const roomWithConvertedPrice = {
      ...room,
      price: convertCurrency(room.price_usd, "USD", currency),
      price_currency: currency,
      price_usd: room.price_usd,
      price_ngn: room.price_ngn,
    }

    return NextResponse.json(successResponse(roomWithConvertedPrice))
  } catch (error) {
    console.error("[v0] Error fetching room:", error)
    return NextResponse.json(errorResponse("Failed to fetch room", "FETCH_ERROR"), { status: 500 })
  }
}

// PUT /api/rooms/:id - Update room (staff only)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const roomId = Number.parseInt(id)

    if (isNaN(roomId)) {
      return NextResponse.json(errorResponse("Invalid room ID", "INVALID_ID"), { status: 400 })
    }

    const body = await request.json()

    const room = await sql`
      UPDATE rooms SET
        name = COALESCE(${body.name}, name),
        type = COALESCE(${body.type}, type),
        description = COALESCE(${body.description}, description),
        price_usd = COALESCE(${body.price_usd}, price_usd),
        price_ngn = COALESCE(${body.price_ngn}, price_ngn),
        max_guests = COALESCE(${body.max_guests}, max_guests),
        beds = COALESCE(${body.beds}, beds),
        bathrooms = COALESCE(${body.bathrooms}, bathrooms),
        size_sqm = COALESCE(${body.size_sqm}, size_sqm),
        amenities = COALESCE(${body.amenities ? JSON.stringify(body.amenities) : null}, amenities),
        images = COALESCE(${body.images ? JSON.stringify(body.images) : null}, images),
        available = COALESCE(${body.available}, available),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${roomId}
      RETURNING *
    `

    if (room.length === 0) {
      return NextResponse.json(errorResponse("Room not found", "NOT_FOUND"), { status: 404 })
    }

    return NextResponse.json(successResponse(room[0]))
  } catch (error) {
    console.error("[v0] Error updating room:", error)
    return NextResponse.json(errorResponse("Failed to update room", "UPDATE_ERROR"), { status: 500 })
  }
}

// DELETE /api/rooms/:id - Delete room (staff only)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const roomId = Number.parseInt(id)

    if (isNaN(roomId)) {
      return NextResponse.json(errorResponse("Invalid room ID", "INVALID_ID"), { status: 400 })
    }

    // Soft delete by marking as unavailable
    const room = await sql`
      UPDATE rooms SET available = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${roomId}
      RETURNING *
    `

    if (room.length === 0) {
      return NextResponse.json(errorResponse("Room not found", "NOT_FOUND"), { status: 404 })
    }

    return NextResponse.json(successResponse({ message: "Room deleted successfully" }))
  } catch (error) {
    console.error("[v0] Error deleting room:", error)
    return NextResponse.json(errorResponse("Failed to delete room", "DELETE_ERROR"), { status: 500 })
  }
}
