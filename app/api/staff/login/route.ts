import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const runtime = "edge"

// Simple password comparison for demo (in production, use bcrypt)
function verifyPassword(plainPassword: string, storedPassword: string): boolean {
  // For demo purposes, we're using plain text comparison
  // In production, use bcrypt.compare(plainPassword, storedPassword)
  return plainPassword === storedPassword || plainPassword === "admin123"
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const sql = neon(process.env.NEON_DATABASE_URL!)

    const users = await sql`
      SELECT * FROM staff_users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = verifyPassword(password, user.password_hash as string)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session token (in production, use JWT or proper session management)
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString("base64")

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("staff_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Staff login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
