"use client"

import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [currency, setCurrency] = useState("USD")
  const [favorites, setFavorites] = useState<number[]>([])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Rooms", href: "/rooms" },
    { name: "Amenities", href: "/#features" },
    { name: "Contact", href: "/contact" },
  ]

  const MenuIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )

  const XIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  const HeartIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )

  const GlobeIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )

  const BookIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )

  const UserIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/95 backdrop-blur-lg shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src="/logo.jpg" alt="StayLux" className="h-10 w-auto rounded-xl shadow-md" />
          <div className="hidden sm:flex flex-col">
            <span className="font-serif text-xl font-bold text-gray-900 leading-none">StayLux</span>
            <span className="text-xs font-medium text-gray-500">Premium Hotels</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-gray-700 transition-all duration-200 hover:text-primary relative group py-1"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Favorites - Desktop */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setFavoritesOpen(!favoritesOpen)}
              className="rounded-full p-2.5 text-gray-600 transition-all hover:bg-gray-100 hover:text-primary"
            >
              <HeartIcon />
            </button>
            {favoritesOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-2xl border border-gray-200 z-50">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Saved Properties ({favorites.length})</h3>
                  {favorites.length > 0 ? (
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                      {favorites.map((id) => (
                        <li
                          key={id}
                          className="text-sm text-gray-700 flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <span>Room #{id}</span>
                          <button
                            onClick={() => setFavorites((prev) => prev.filter((fid) => fid !== id))}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
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

          {/* Currency - Desktop */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="rounded-full p-2.5 text-gray-600 transition-all hover:bg-gray-100 hover:text-primary"
            >
              <GlobeIcon />
            </button>
            {languageOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-gray-200 z-50">
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
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                          currency === curr ? "bg-primary text-white shadow-md" : "hover:bg-gray-100 text-gray-700"
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

          {/* CTA Buttons - Desktop */}
          <Link
            href="/rooms"
            className="hidden items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-semibold text-white text-sm transition-all hover:bg-primary/90 hover:shadow-lg shadow-md shadow-primary/20 lg:flex"
          >
            <BookIcon />
            <span>Book Now</span>
          </Link>
          <Link
            href="/staff"
            className="hidden items-center gap-2 rounded-full border-2 border-gray-300 px-5 py-2.5 font-medium text-gray-700 text-sm transition-all hover:border-gray-400 hover:bg-gray-50 lg:flex"
          >
            <UserIcon />
            <span>Staff</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2.5 text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
          >
            {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="my-3 border-t border-gray-200" />
            <Link
              href="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <BookIcon />
              <span>Book Now</span>
            </Link>
            <Link
              href="/staff"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UserIcon />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
