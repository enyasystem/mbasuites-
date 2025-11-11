"use client"

import { Sparkles, MapPin, Calendar, Users, Search } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams({
      location: location || "all",
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      adults: adults.toString(),
      children: children.toString(),
      rooms: rooms.toString(),
    })
    router.push(`/rooms?${params.toString()}`)
  }

  const guestSummary = `${adults} adult${adults !== 1 ? "s" : ""}, ${children} child${children !== 1 ? "ren" : ""}, ${rooms} room${rooms !== 1 ? "s" : ""}`

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/luxury-hotel-lobby-modern-elegant-spacious-marble.jpg"
          alt="Luxury hotel interior"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="container relative mx-auto flex h-full items-center px-6 lg:px-8">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-xl animate-scale-in animation-delay-200">
            <Sparkles className="h-4 w-4 text-[#FFD700]" />
            <span>Save on amazing places to stay</span>
          </div>

          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:mb-12 lg:text-7xl animate-fade-in-up animation-delay-300">
            Hotels
          </h1>

          <p className="mb-8 text-balance text-base text-gray-100 sm:text-lg md:text-xl lg:mb-12 lg:text-2xl animate-fade-in-up animation-delay-400">
            Save on amazing places to stay and explore unique experiences
          </p>

          <div className="rounded-2xl bg-white p-2 shadow-2xl sm:p-3 animate-fade-in-up animation-delay-500">
            <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {/* Location input */}
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-all hover:bg-gray-100">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700">Destination</label>
                  <input
                    type="text"
                    placeholder="City, area, landmark"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border-none bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Check-in date */}
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-all hover:bg-gray-100">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700">Check In</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full border-none bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Check-out date */}
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-all hover:bg-gray-100">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700">Check Out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full border-none bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Guests and rooms dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                  className="w-full flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-all hover:bg-gray-100"
                >
                  <Users className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 text-left">
                    <label className="block text-xs font-semibold text-gray-700">Guests & Rooms</label>
                    <span className="text-sm text-gray-900">{guestSummary}</span>
                  </div>
                </button>

                {showGuestDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white shadow-lg border z-10">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Adults</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-4 text-center">{adults}</span>
                          <button
                            onClick={() => setAdults(adults + 1)}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Children</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-4 text-center">{children}</span>
                          <button
                            onClick={() => setChildren(children + 1)}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Rooms</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-4 text-center">{rooms}</span>
                          <button
                            onClick={() => setRooms(rooms + 1)}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowGuestDropdown(false)}
                        className="w-full bg-[#FF6B35] text-white rounded py-2 font-medium hover:bg-[#FF5520]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-8 py-3 font-semibold text-white transition-all hover:bg-[#FF5722] hover:shadow-lg hover:shadow-[#FF6B35]/30 active:scale-95"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-300 animate-fade-in animation-delay-700">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-xl" />
              <span>Special savings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-xl" />
              <span>Reliable customer support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-xl" />
              <span>23 languages supported</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
