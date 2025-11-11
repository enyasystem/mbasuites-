"use client"

import { Wifi, Coffee, Utensils, Waves, Car, Dumbbell } from "lucide-react"

const features = [
  {
    icon: Wifi,
    title: "Free WiFi",
    description: "High-speed internet throughout the property",
  },
  {
    icon: Coffee,
    title: "Breakfast Included",
    description: "Complimentary gourmet breakfast buffet",
  },
  {
    icon: Utensils,
    title: "Fine Dining",
    description: "On-site restaurant with world-class cuisine",
  },
  {
    icon: Waves,
    title: "Swimming Pool",
    description: "Heated outdoor pool with ocean views",
  },
  {
    icon: Car,
    title: "Free Parking",
    description: "Complimentary valet parking service",
  },
  {
    icon: Dumbbell,
    title: "Fitness Center",
    description: "24/7 access to modern gym equipment",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative bg-gradient-to-b from-background to-muted py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mb-16 text-center animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            World-Class Amenities
          </span>
          <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold text-foreground">
            Everything for Your Perfect Stay
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Enjoy premium facilities and services designed for your comfort and relaxation
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/50 bg-white/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-all group-hover:from-primary/30 group-hover:to-primary/10 group-hover:scale-110">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
