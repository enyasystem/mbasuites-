"use client"

import { motion } from "framer-motion"
import { Calendar, User } from "lucide-react"

interface Booking {
  id: number
  guest_name: string
  guest_email: string
  room_name: string
  room_type: string
  check_in: string
  check_out: string
  status: string
  payment_status: string
  total_amount: number
  currency: string
}

export function RecentBookings({ bookings }: { bookings: Booking[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-foreground">Recent Bookings</h2>
        <a href="/staff/reservations" className="text-sm font-medium text-primary hover:underline">
          View All
        </a>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No bookings yet</div>
        ) : (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-foreground">{booking.room_name}</div>
                    <div className="text-sm text-muted-foreground">{booking.room_type}</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{booking.guest_name}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(booking.check_in).toLocaleDateString()} -{" "}
                    {new Date(booking.check_out).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-foreground">
                    {booking.currency === "USD"
                      ? `$${booking.total_amount}`
                      : `₦${booking.total_amount.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
