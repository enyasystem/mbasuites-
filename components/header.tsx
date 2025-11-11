"use client"

import Link from "next/link"
import { Menu, X, User, Heart, Globe, BookOpen } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [currency, setCurrency] = useState("USD")
  const [favorites, setFavorites] = useState<number[]>([])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Rooms", href: "/#rooms" },
    { name: "Amenities", href: "/#features" },
    { name: "Contact", href: "/contact" },
  ]

  const toggleFavorite = (roomId: number) => {
    setFavorites((prev) => (prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]))
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8F5E] shadow-lg shadow-[#FF6B35]/20">
            <span className="font-serif text-2xl font-bold text-white">L</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold leading-tight text-gray-900">Luxury Hotel</span>
            <span className="text-xs text-gray-500">Premium Experience</span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative font-medium text-gray-700 transition-colors hover:text-[#FF6B35] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#FF6B35] after:transition-all hover:after:w-full"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setFavoritesOpen(!favoritesOpen)}
              className="hidden rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 lg:block hover:text-[#FF6B35]"
            >
              <Heart className="h-5 w-5" />
            </button>
            {favoritesOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border z-50">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Saved Properties ({favorites.length})</h3>
                  {favorites.length > 0 ? (
                    <ul className="space-y-2">
                      {favorites.map((id) => (
                        <li key={id} className="text-sm text-gray-700 flex justify-between items-center">
                          <span>Room #{id}</span>
                          <button onClick={() => toggleFavorite(id)} className="text-red-500 hover:text-red-700">
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No saved properties yet</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="hidden rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 lg:block hover:text-[#FF6B35]"
            >
              <Globe className="h-5 w-5" />
            </button>
            {languageOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border z-50">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Currency</h3>
                  <div className="space-y-2">
                    {["USD", "NGN", "EUR", "GBP"].map((curr) => (
                      <button
                        key={curr}
                        onClick={() => {
                          setCurrency(curr)
                          setLanguageOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                          currency === curr ? "bg-[#FF6B35] text-white" : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/rooms"
            className="hidden items-center gap-2 rounded-full bg-[#FF6B35] px-6 py-2.5 font-medium text-white transition-all hover:bg-[#FF5520] hover:shadow-lg shadow-lg shadow-[#FF6B35]/30 lg:flex"
          >
            <BookOpen className="h-4 w-4" />
            <span>Book Now</span>
          </Link>
          <Link
            href="/staff"
            className="hidden items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 font-medium text-white transition-all hover:bg-gray-800 hover:shadow-lg lg:flex"
          >
            <User className="h-4 w-4" />
            <span>Staff Login</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-background md:hidden"
          >
            <div className="container mx-auto space-y-2 px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-2 font-medium text-foreground hover:bg-accent"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-[#FF6B35] px-4 py-2 font-medium text-white hover:bg-[#FF5520]"
              >
                <BookOpen className="h-4 w-4" />
                <span>Book Now</span>
              </Link>
              <Link
                href="/staff"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 font-medium text-foreground hover:bg-accent"
              >
                <User className="h-4 w-4" />
                <span>Staff Login</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
