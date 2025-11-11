"use client"

import { useState } from "react"
import Link from "next/link"
import { RoomCard } from "@/components/room-card"
import { Scale, X } from "lucide-react"

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
  available: boolean
}

interface RoomsClientWrapperProps {
  rooms: Room[]
  allRoomsCount: number
}

export function RoomsClientWrapper({ rooms, allRoomsCount }: RoomsClientWrapperProps) {
  const [compareList, setCompareList] = useState<number[]>([])
  const [showComparison, setShowComparison] = useState(false)

  const comparedRooms = rooms.filter((room) => compareList.includes(room.id))

  const toggleCompare = (roomId: number) => {
    setCompareList((prev) => {
      if (prev.includes(roomId)) {
        return prev.filter((id) => id !== roomId)
      } else if (prev.length < 3) {
        return [...prev, roomId]
      } else {
        alert("You can compare up to 3 rooms at a time")
        return prev
      }
    })
  }

  return (
    <>
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full shadow-2xl border px-6 py-3 flex items-center gap-4 animate-fade-in-up">
          <Scale className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">
            {compareList.length} room{compareList.length !== 1 ? "s" : ""} selected
          </span>
          {compareList.length >= 2 && (
            <button
              onClick={() => setShowComparison(true)}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Compare Now
            </button>
          )}
          <button onClick={() => setCompareList([])} className="rounded-full p-1 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Rooms Grid */}
      {rooms.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onCompareToggle={() => toggleCompare(room.id)}
              isComparing={compareList.includes(room.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed bg-muted/50 p-16 text-center">
          <p className="text-lg text-muted-foreground font-medium">
            {allRoomsCount === 0 ? "No rooms available yet" : "No rooms match your search criteria"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {allRoomsCount === 0
              ? "Database setup is needed. Run the setup scripts to populate rooms."
              : "Try adjusting your dates or guest count."}
          </p>
        </div>
      )}

      {showComparison && comparedRooms.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">Compare Rooms</h2>
              <button
                onClick={() => setShowComparison(false)}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparedRooms.map((room) => (
                  <div key={room.id} className="border rounded-xl p-6">
                    <img
                      src={room.images?.[0]?.url || "/luxury-hotel-room.jpg"}
                      alt={room.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-serif text-xl font-bold mb-2">{room.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{room.type}</p>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price (USD)</span>
                        <span className="font-semibold">${room.price_usd}/night</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Guests</span>
                        <span className="font-semibold">{room.max_guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Beds</span>
                        <span className="font-semibold">{room.beds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bathrooms</span>
                        <span className="font-semibold">{room.bathrooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size</span>
                        <span className="font-semibold">{room.size_sqm}m²</span>
                      </div>
                    </div>

                    <Link
                      href={`/rooms/${room.id}`}
                      className="mt-6 w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
