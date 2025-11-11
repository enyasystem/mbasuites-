import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("staff_token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Decode token to get user ID
    const decoded = Buffer.from(token.value, "base64").toString()
    const userId = decoded.split(":")[0]

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const users = await sql`
      SELECT id, email, name, role FROM staff_users WHERE id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error("[v0] Error fetching staff user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
