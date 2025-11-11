"use client"

import { motion } from "framer-motion"
import { Calendar, Users, DollarSign, Home } from "lucide-react"

interface Stats {
  totalBookings: number
  confirmedBookings: number
  totalRevenue: number
  availableRooms: number
}

export function DashboardStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Confirmed",
      value: stats.confirmedBookings,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Available Rooms",
      value: stats.availableRooms,
      icon: Home,
      color: "bg-orange-100 text-orange-600",
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-foreground">{card.value}</div>
          <div className="text-sm text-muted-foreground">{card.title}</div>
        </motion.div>
      ))}
    </div>
  )
}
