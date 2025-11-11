"use client"

import Link from "next/link"
import { BedDouble, Users, Bath, Maximize2, Star, Heart, TrendingUp } from "lucide-react"
import { useState } from "react"

interface Room {
  id: number
  name: string
  type: string
  price_usd: number
  price_ngn: number
  description: string
  amenities: string[]
  images: { url: string; alt: string }[]
  max_guests: number
  beds: number
  bathrooms: number
  size_sqm: number
}

interface RoomCardProps {
  room: Room
  onCompareToggle?: (roomId: number) => void
  isComparing?: boolean
}

export function RoomCard({ room, onCompareToggle, isComparing }: RoomCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const mainImage = room.images?.[0] || { url: "/luxury-hotel-room.jpg", alt: room.name }

  const reviewCount = Math.floor(Math.random() * 200) + 50
  const recentBookings = Math.floor(Math.random() * 15) + 3
  const rating = (4.5 + Math.random() * 0.5).toFixed(1)

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-3">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={mainImage.url || "/placeholder.svg"}
          alt={mainImage.alt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite button */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${isFavorited ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </button>

        {/* Room type badge */}
        <div className="absolute left-4 top-4 rounded-lg bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground backdrop-blur-sm">
          {room.type}
        </div>

        <div className="absolute right-4 bottom-4 flex flex-col gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 backdrop-blur-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-foreground">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-green-500/90 px-2 py-1 backdrop-blur-sm">
            <TrendingUp className="h-3 w-3 text-white" />
            <span className="text-xs font-semibold text-white">{recentBookings} booked today</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="mb-1 text-balance font-serif text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
          {room.name}
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">{room.type}</p>

        <p className="mb-4 line-clamp-2 text-pretty text-muted-foreground leading-relaxed">{room.description}</p>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-primary/60" />
            <span>
              {room.beds} {room.beds === 1 ? "Bed" : "Beds"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary/60" />
            <span>
              {room.max_guests} Guest{room.max_guests !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-primary/60" />
            <span>{room.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize2 className="h-4 w-4 text-primary/60" />
            <span>{room.size_sqm}m²</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">From</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-3xl font-bold text-foreground">${room.price_usd}</span>
              <span className="text-sm text-muted-foreground">/ night</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">₦{room.price_ngn.toLocaleString()}</div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href={`/rooms/${room.id}`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
            >
              View Room
            </Link>
            {onCompareToggle && (
              <button
                onClick={() => onCompareToggle(room.id)}
                className={`text-xs font-medium transition-colors ${isComparing ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {isComparing ? "✓ Compare" : "+ Compare"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
