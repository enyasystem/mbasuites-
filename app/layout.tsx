import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "StayLux - Luxury Hotel Booking | Premium Accommodations Worldwide",
  description:
    "Discover and book luxury hotels worldwide. StayLux offers curated premium accommodations with multi-currency support and seamless booking experience.",
  keywords: ["luxury hotels", "hotel booking", "accommodations", "travel", "resorts"],
  openGraph: {
    title: "StayLux - Luxury Hotel Booking",
    description: "Discover premium accommodations worldwide with StayLux",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StayLux - Luxury Hotel Booking",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StayLux - Luxury Hotel Booking",
    description: "Discover premium accommodations worldwide",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#D4A574" />
      </head>
      <body className="font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
