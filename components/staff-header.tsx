"use client"

import Link from "next/link"
import { LogOut, Menu, X, Home, Calendar } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"

export function StaffHeader({ user }: { user: { email?: string } | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch("/api/staff/logout", { method: "POST" })
    window.location.href = "/staff"
  }

  const navigation = user
    ? [
        { name: "Dashboard", href: "/staff/dashboard", icon: Home },
        { name: "Reservations", href: "/staff/reservations", icon: Calendar },
        { name: "Rooms", href: "/staff/rooms", icon: Home },
      ]
    : []

  const logoHref = user ? "/staff/dashboard" : "/staff"

  return (
    <header className="border-b bg-card">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href={logoHref} className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="font-serif text-xl font-bold text-primary-foreground">L</span>
          </div>
          <div>
            <span className="font-serif text-xl font-bold text-foreground">Staff Portal</span>
          </div>
        </Link>

        {user && (
          <div className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden items-center gap-3 md:flex">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to Home
            </Link>
          )}
        </div>
      </nav>

      {user && mobileMenuOpen && (
        <div className="border-t bg-card md:hidden">
          <div className="container mx-auto space-y-2 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium ${
                    isActive ? "bg-accent text-primary" : "text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg border px-4 py-2 font-medium text-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
