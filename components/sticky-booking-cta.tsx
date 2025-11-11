"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"

interface Room {
  id: number
  name: string
  price_usd: number
}

export function StickyBookingCTA({ room }: { room: Room }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t bg-white/95 backdrop-blur-lg shadow-xl animate-fade-in-up">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-serif text-2xl font-bold text-foreground">${room.price_usd}</p>
            <p className="text-xs text-muted-foreground">per night</p>
          </div>
          <button
            onClick={() => {
              // Scroll to booking form
              const bookingForm = document.querySelector("[data-booking-form]")
              bookingForm?.scrollIntoView({ behavior: "smooth", block: "start" })
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            <Calendar className="h-5 w-5" />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}
