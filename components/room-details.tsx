"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BedDouble, Users, Bath, Maximize2, Check } from "lucide-react"

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

export function RoomDetails({ room }: { room: Room }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const images = room.images || [{ url: "/placeholder.svg?key=room1", alt: room.name }]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
          <img
            src={images[selectedImage]?.url || "/placeholder.svg"}
            alt={images[selectedImage]?.alt || room.name}
            className="h-full w-full object-cover"
          />
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all ${
                  selectedImage === index ? "border-primary" : "border-transparent hover:border-border"
                }`}
              >
                <img src={image.url || "/placeholder.svg"} alt={image.alt} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="mb-2 inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {room.type}
        </div>
        <h1 className="mb-4 font-serif text-4xl font-bold text-foreground">{room.name}</h1>
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{room.description}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-4"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BedDouble className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{room.beds}</div>
            <div className="text-sm text-muted-foreground">{room.beds === 1 ? "Bed" : "Beds"}</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{room.max_guests}</div>
            <div className="text-sm text-muted-foreground">Guests</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bath className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{room.bathrooms}</div>
            <div className="text-sm text-muted-foreground">Bath</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Maximize2 className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{room.size_sqm}m²</div>
            <div className="text-sm text-muted-foreground">Size</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border bg-card p-6"
      >
        <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">Amenities</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {room.amenities?.map((amenity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-foreground">{amenity}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
