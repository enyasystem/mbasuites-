import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function requireStaffAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get("staff_token")

  if (!token) {
    redirect("/staff")
  }

  return token
}

export async function getStaffUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("staff_token")

    if (!token) {
      return null
    }

    // Decode token to get user info
    const decoded = Buffer.from(token.value, "base64").toString()
    const [userId, email] = decoded.split(":")

    return { id: userId, email }
  } catch (error) {
    return null
  }
}
