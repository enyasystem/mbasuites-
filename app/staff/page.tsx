import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { StaffLoginForm } from "@/components/staff-login-form"

export default async function StaffLoginPage() {
  const cookieStore = await cookies()
  const staffToken = cookieStore.get("staff_token")

  // If already logged in, redirect to dashboard
  if (staffToken) {
    redirect("/staff/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <StaffLoginForm />
    </div>
  )
}
