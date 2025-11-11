"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, MoreVertical, Check, X, Eye } from "lucide-react"
import { ReservationDetailsModal } from "./reservation-details-modal"

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

export function ReservationsTable({ bookings }: { bookings: Booking[] }) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null)

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "failed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("[v0] Error updating booking:", error)
    }
  }

  return (
    <>
      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Guest</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Room</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Check In</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Check Out</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-foreground">#{booking.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{booking.guest_name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {booking.guest_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{booking.room_name}</div>
                        <div className="text-xs text-muted-foreground">{booking.room_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        {new Date(booking.check_in).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        {new Date(booking.check_out).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}
                      >
                        {booking.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {booking.currency === "USD"
                          ? `$${booking.total_amount}`
                          : `₦${booking.total_amount.toLocaleString()}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === booking.id ? null : booking.id)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {actionMenuOpen === booking.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-card shadow-lg">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                            {booking.status === "pending" && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 transition-colors hover:bg-accent"
                              >
                                <Check className="h-4 w-4" />
                                Confirm
                              </button>
                            )}
                            {booking.status !== "cancelled" && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-accent"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <ReservationDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </>
  )
}
