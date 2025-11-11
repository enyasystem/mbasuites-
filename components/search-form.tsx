"use client"

import { useState } from "react"
import { CalendarIcon, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SearchForm() {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)

  const handleSearch = () => {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
    })
    window.location.href = `#rooms?${params.toString()}`
  }

  return (
    <div className="mx-auto max-w-6xl rounded-2xl border bg-card p-6 shadow-lg">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarIcon className="h-4 w-4" />
            Check In
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-12 w-full rounded-lg border bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarIcon className="h-4 w-4" />
            Check Out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-12 w-full rounded-lg border bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4" />
            Guests
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={guests}
            onChange={(e) => setGuests(Number.parseInt(e.target.value))}
            className="h-12 w-full rounded-lg border bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleSearch}
            className="h-12 w-full rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Search Rooms
          </Button>
        </div>
      </div>
    </div>
  )
}
