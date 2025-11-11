"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Check if current path is a staff page to hide main site navbar
  const isStaffPage = pathname?.startsWith("/staff")

  if (isStaffPage) {
    // Staff pages have their own layout with StaffHeader
    return <>{children}</>
  }

  // Public pages get the main site header and footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <LayoutContent>{children}</LayoutContent>
}
