import type React from "react"
import { StaffHeader } from "@/components/staff-header"
import { getStaffUser } from "@/lib/auth"

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getStaffUser()

  return (
    <div className="min-h-screen bg-background">
      <StaffHeader user={user} />
      <main>{children}</main>
    </div>
  )
}
