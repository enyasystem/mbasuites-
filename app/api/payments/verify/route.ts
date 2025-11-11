import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reference, booking_id } = body

    if (!reference || !booking_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      console.error("[v0] PAYSTACK_SECRET_KEY not configured")
      return NextResponse.json({ error: "Payment system not configured" }, { status: 500 })
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    })

    const verifyData = await verifyResponse.json()

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Update booking status
    const sql = neon(process.env.NEON_DATABASE_URL!)

    await sql`
      UPDATE bookings 
      SET 
        payment_status = 'paid',
        payment_reference = ${reference},
        status = 'confirmed',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${booking_id}
    `

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    })
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
