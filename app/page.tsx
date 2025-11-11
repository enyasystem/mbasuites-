import Link from "next/link"
import { neon } from "@neondatabase/serverless"
import { RoomCard } from "@/components/room-card"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"

export const runtime = "edge"

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

async function getRooms(): Promise<Room[]> {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)
    const rooms = await sql`SELECT * FROM rooms WHERE available = true ORDER BY price_usd ASC LIMIT 6`
    return rooms as Room[]
  } catch (error) {
    console.error("[v0] Error fetching rooms:", error)
    return []
  }
}

export default async function HomePage() {
  const rooms = await getRooms()

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <FeaturesSection />

      {/* Featured Rooms Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            Our Rooms
          </span>
          <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold text-foreground">Featured Accommodations</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Handpicked luxury rooms offering the perfect blend of comfort, elegance, and exceptional value for your stay
          </p>
        </div>

        {rooms.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed bg-muted/50 p-16 text-center">
            <p className="text-lg text-muted-foreground font-medium">Loading available rooms...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Our database is being set up. Run the setup script to see rooms.
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-lg hover:shadow-xl"
          >
            View All Rooms →
          </Link>
        </div>
      </section>

      <section className="bg-gradient-to-br from-secondary/10 via-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">
              Limited Time Deals
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Special Offers We Love</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Exclusive packages and deals for the perfect getaway
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Hotel Chain Offers",
                description: "Get up to 40% off on selected hotel chains and earn double rewards",
                badge: "40% OFF",
                image: "/luxury-hotel-pool-resort.jpg",
              },
              {
                title: "Family Getaway",
                description: "Perfect packages for families with kids welcome programs and activities",
                badge: "FAMILY",
                image: "/family-beach-resort.png",
              },
            ].map((offer) => (
              <div
                key={offer.title}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg hover:shadow-xl transition-all duration-300 h-72"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                <img
                  src={offer.image || "/placeholder.svg"}
                  alt={offer.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="relative z-20 p-8 h-full flex flex-col justify-between">
                  <div className="inline-block w-fit rounded-lg bg-primary/90 px-4 py-2 text-xs font-bold text-primary-foreground">
                    {offer.badge}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{offer.title}</h3>
                    <p className="text-white/90 text-sm mb-6">{offer.description}</p>
                    <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-all active:scale-95">
                      Explore Now →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-background to-muted py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              Questions?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about booking and our services
            </p>
          </div>

          <div className="space-y-3 mb-12">
            {[
              {
                q: "How do I make a hotel booking?",
                a: "Browse available rooms, select your dates, fill in guest details, and proceed to payment. You'll receive confirmation immediately.",
              },
              {
                q: "What is your cancellation policy?",
                a: "Most bookings can be cancelled up to 48 hours before check-in for a full refund. Some special rates may have different policies.",
              },
              {
                q: "How will I get my booking confirmation?",
                a: "You'll receive a confirmation email immediately after successful payment with all booking details and check-in information.",
              },
              {
                q: "Are there cancellation charges?",
                a: "Cancellation charges depend on the room's cancellation policy. Standard rooms offer free cancellation up to 48 hours prior.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border/50 bg-white/50 backdrop-blur-sm hover:border-primary/30 transition-all"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-semibold text-foreground hover:text-primary transition-colors">
                  {item.q}
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="border-t border-border/30 px-6 py-4 text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg border-2 border-primary bg-transparent text-primary font-semibold hover:bg-primary/5 transition-all"
            >
              View Help Center →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary/95 via-primary to-primary/90 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-5xl font-bold mb-6 leading-tight">Exclusive deals on the app</h2>
              <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                Download our mobile app and get exclusive access to special offers, easier booking management, and
                priority customer support.
              </p>

              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-lg text-primary-foreground/95">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30">✓</span>
                  Up to 15% additional app-only discounts
                </li>
                <li className="flex items-center gap-3 text-lg text-primary-foreground/95">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30">✓</span>
                  Save and manage all your bookings in one place
                </li>
                <li className="flex items-center gap-3 text-lg text-primary-foreground/95">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30">✓</span>
                  Instant notifications for deals and updates
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm border border-white/20"
                />
                <button className="px-8 py-3 rounded-xl bg-white text-primary font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-lg">
                  Send Link
                </button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div
                className="h-96 rounded-2xl bg-cover bg-center shadow-2xl"
                style={{
                  backgroundImage: "url('/family-using-mobile-app-booking-hotel.jpg')",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
