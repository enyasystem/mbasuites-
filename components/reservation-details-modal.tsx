"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, User, Mail, Phone, Calendar, Home, CreditCard } from "lucide-react"

interface Booking {
  id: number
  guest_name: string
  guest_email: string
  guest_phone: string
  room_name: string
  room_type: string
  check_in: string
  check_out: string
  guests: number
  total_nights: number
  status: string
  payment_status: string
  total_amount: number
  currency: string
  created_at: string
}

export function ReservationDetailsModal({
  booking,
  onClose,
}: {
  booking: Booking
  onClose: () => void
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl rounded-2xl border bg-card shadow-xl"
        >
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Booking Details</h2>
              <p className="text-sm text-muted-foreground">Booking ID: #{booking.id}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                  <Home className="h-5 w-5" />
                  Room Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Name</span>
                    <span className="font-medium text-foreground">{booking.room_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Type</span>
                    <span className="font-medium text-foreground">{booking.room_type}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                  <User className="h-5 w-5" />
                  Guest Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium text-foreground">{booking.guest_name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium text-foreground">{booking.guest_email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium text-foreground">{booking.guest_phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                  <Calendar className="h-5 w-5" />
                  Stay Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check In</span>
                    <span className="font-medium text-foreground">{formatDate(booking.check_in)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check Out</span>
                    <span className="font-medium text-foreground">{formatDate(booking.check_out)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Nights</span>
                    <span className="font-medium text-foreground">{booking.total_nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Guests</span>
                    <span className="font-medium text-foreground">{booking.guests}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-foreground capitalize">{booking.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="font-medium text-foreground capitalize">{booking.payment_status}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-foreground">Total Amount</span>
                    <span className="font-serif text-xl font-bold text-primary">
                      {booking.currency === "USD"
                        ? `$${booking.total_amount}`
                        : `₦${booking.total_amount.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Booking created: {new Date(booking.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex gap-3 border-t p-6">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border bg-background px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-accent"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
