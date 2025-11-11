"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useState } from "react"

export function ReservationsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const statusOptions = [
    { value: "", label: "All Bookings" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set("status", status)
    } else {
      params.delete("status")
    }
    router.push(`/staff/reservations?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    router.push(`/staff/reservations?${params.toString()}`)
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                (searchParams.get("status") || "") === option.value
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background text-foreground hover:bg-accent"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by guest or room..."
              className="h-10 w-full rounded-lg border bg-background pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  )
}
