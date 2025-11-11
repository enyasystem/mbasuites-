"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CreditCard, ShieldCheck, Calendar, Users, MapPin, Loader2 } from "lucide-react"
import Script from "next/script"

interface Booking {
  id: number
  room_name: string
  room_type: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  guests: number
  total_nights: number
  total_amount: number
  currency: string
  room_images: { url: string; alt: string }[]
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string
        email: string
        amount: number
        currency: string
        ref: string
        onClose: () => void
        callback: (response: { reference: string }) => void
      }) => {
        openIframe: () => void
      }
    }
  }
}

export function PaystackCheckout({ booking }: { booking: Booking }) {
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handlePayment = () => {
    if (!paystackLoaded || !window.PaystackPop) {
      setError("Payment system is loading. Please wait...")
      return
    }

    setProcessing(true)
    setError("")

    const reference = `BK${booking.id}_${Date.now()}`

    // Convert amount to kobo/cents (multiply by 100)
    const amountInMinorUnits = Math.round(booking.total_amount * 100)

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxx", // User needs to add this
      email: booking.guest_email,
      amount: amountInMinorUnits,
      currency: booking.currency,
      ref: reference,
      onClose: () => {
        setProcessing(false)
      },
      callback: async (response) => {
        try {
          // Verify payment with backend
          const verifyResponse = await fetch(`/api/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              booking_id: booking.id,
            }),
          })

          if (verifyResponse.ok) {
            window.location.href = `/booking/${booking.id}/confirmation`
          } else {
            throw new Error("Payment verification failed")
          }
        } catch (err) {
          setError("Payment verification failed. Please contact support.")
          setProcessing(false)
        }
      },
    })

    handler.openIframe()
  }

  const roomImage = booking.room_images?.[0] || { url: "/placeholder.svg?key=payment", alt: booking.room_name }

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        onLoad={() => setPaystackLoaded(true)}
        onError={() => setError("Failed to load payment system")}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-4xl font-bold text-foreground">Complete Your Booking</h1>
          <p className="text-lg text-muted-foreground">Review your details and proceed to payment</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="rounded-2xl border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Booking Details</h2>
                </div>

                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={roomImage.url || "/placeholder.svg"}
                      alt={roomImage.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {booking.room_type}
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-bold text-foreground">{booking.room_name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {booking.total_nights} {booking.total_nights === 1 ? "night" : "nights"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>
                          {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Check In</div>
                    <div className="mt-1 font-semibold text-foreground">{formatDate(booking.check_in)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Check Out</div>
                    <div className="mt-1 font-semibold text-foreground">{formatDate(booking.check_out)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Guest Information</h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-foreground">{booking.guest_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{booking.guest_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium text-foreground">{booking.guest_phone}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Secure Payment</h3>
                </div>
                <p className="text-pretty text-sm text-muted-foreground">
                  Your payment is secured with Paystack. We use industry-standard encryption to protect your
                  information.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-lg">
              <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">Payment Summary</h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {booking.currency === "USD"
                      ? `$${booking.total_amount / booking.total_nights}`
                      : `₦${(booking.total_amount / booking.total_nights).toLocaleString()}`}{" "}
                    × {booking.total_nights} {booking.total_nights === 1 ? "night" : "nights"}
                  </span>
                  <span className="font-medium text-foreground">
                    {booking.currency === "USD"
                      ? `$${booking.total_amount}`
                      : `₦${booking.total_amount.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-4">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-serif text-2xl font-bold text-primary">
                  {booking.currency === "USD"
                    ? `$${booking.total_amount}`
                    : `₦${booking.total_amount.toLocaleString()}`}
                </span>
              </div>

              {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <button
                onClick={handlePayment}
                disabled={processing || !paystackLoaded}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay with Paystack
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Secured by Paystack</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
