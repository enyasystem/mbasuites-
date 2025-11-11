"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CreditCard, Check, AlertCircle } from "lucide-react"
import { BookingProgress } from "@/components/booking-progress"

interface BookingDetails {
  id: number
  guest_name: string
  guest_email: string
  check_in: string
  check_out: string
  total_amount: number
  currency: string
  room_id: number
  total_nights: number
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        if (response.ok) {
          const data = await response.json()
          setBooking(data.booking)
        } else {
          setBooking(null)
        }
      } catch (error) {
        console.error("Error fetching booking:", error)
        setBooking(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
    } else if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4)
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2)
      }
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4)
    }

    setCardData((prev) => ({ ...prev, [name]: formattedValue }))
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return

    setProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setPaymentSuccess(true)

    // Redirect after 3 seconds
    setTimeout(() => {
      router.push(`/booking/${bookingId}/confirmation`)
    }, 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Booking Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find this booking.</p>
          <Link href="/rooms" className="btn-primary">
            Browse Rooms
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-primary hover:text-primary/80 mb-8 flex items-center gap-2">
            ← Back
          </Link>

          <BookingProgress currentStep={2} />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border bg-card p-8">
                <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Complete Payment</h1>
                <p className="text-muted-foreground mb-8">Secure payment for your booking</p>

                {paymentSuccess ? (
                  <div className="rounded-xl bg-green-50 border border-green-200 p-8 text-center">
                    <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</h2>
                    <p className="text-green-800">Redirecting to confirmation page...</p>
                  </div>
                ) : (
                  <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        value={cardData.cardName}
                        onChange={handleCardChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleCardChange}
                        required
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={cardData.expiryDate}
                          onChange={handleCardChange}
                          required
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          required
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <CreditCard className="h-5 w-5" />
                      {processing
                        ? "Processing..."
                        : `Pay ${booking.currency === "USD" ? "$" : "₦"}${booking.total_amount.toLocaleString()}`}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            <div className="rounded-2xl border bg-muted p-8 h-fit">
              <h2 className="font-semibold text-foreground mb-6">Booking Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Guest</span>
                  <span className="text-foreground font-medium">{booking.guest_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="text-foreground font-medium">{new Date(booking.check_in).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="text-foreground font-medium">
                    {new Date(booking.check_out).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nights</span>
                  <span className="text-foreground font-medium">{booking.total_nights}</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-serif text-2xl font-bold text-primary">
                    {booking.currency === "USD" ? "$" : "₦"}
                    {booking.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
