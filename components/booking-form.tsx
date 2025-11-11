"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Room {
  id: number
  name: string
  price_usd: number
  price_ngn: number
  max_guests: number
}

export function BookingForm({ room }: { room: Room }) {
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights : 0
  }

  const nights = calculateNights()
  const pricePerNight = currency === "USD" ? room.price_usd : room.price_ngn
  const totalAmount = nights * pricePerNight

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: room.id,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          total_nights: nights,
          total_amount: totalAmount,
          currency,
          special_requests: specialRequests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking")
      }

      // Redirect to payment
      window.location.href = `/booking/${data.booking.id}/payment`
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-6 shadow-lg"
    >
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">From</div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-foreground">
                {currency === "USD" ? `$${room.price_usd}` : `₦${room.price_ngn.toLocaleString()}`}
              </span>
              <span className="text-sm text-muted-foreground">/ night</span>
            </div>
          </div>

          <div className="flex gap-2 rounded-lg border p-1">
            <button
              onClick={() => setCurrency("USD")}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                currency === "USD"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency("NGN")}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                currency === "NGN"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              NGN
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4" />
              Check In
            </label>
            <input
              type="date"
              required
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="h-11 w-full rounded-lg border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4" />
              Check Out
            </label>
            <input
              type="date"
              required
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="h-11 w-full rounded-lg border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4" />
            Number of Guests
          </label>
          <input
            type="number"
            required
            min="1"
            max={room.max_guests}
            value={guests}
            onChange={(e) => setGuests(Number.parseInt(e.target.value))}
            className="h-11 w-full rounded-lg border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">Maximum {room.max_guests} guests</p>
        </div>

        {nights > 0 && (
          <div className="rounded-lg border bg-muted p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">
                {currency === "USD" ? `$${pricePerNight}` : `₦${pricePerNight.toLocaleString()}`} × {nights}{" "}
                {nights === 1 ? "night" : "nights"}
              </span>
              <span className="font-medium text-foreground">
                {currency === "USD" ? `$${totalAmount}` : `₦${totalAmount.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-serif text-xl font-bold text-primary">
                {currency === "USD" ? `$${totalAmount}` : `₦${totalAmount.toLocaleString()}`}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full Name</label>
          <input
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="John Doe"
            className="h-11 w-full rounded-lg border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            required
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="john@example.com"
            className="h-11 w-full rounded-lg border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Phone Number</label>
          <input
            type="tel"
            required
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="+234 800 123 4567"
            className="h-11 w-full rounded-lg border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Special Requests (Optional)</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special requirements?"
            rows={3}
            className="w-full rounded-lg border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <Button
          type="submit"
          disabled={loading || nights === 0}
          className="h-12 w-full rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue to Payment"
          )}
        </Button>
      </form>
    </motion.div>
  )
}
