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
  metadataBase: new URL("https://staylux.vercel.app"),
  openGraph: {
    title: "StayLux - Luxury Hotel Booking",
    description: "Discover premium accommodations worldwide with StayLux",
    url: "https://staylux.vercel.app",
    siteName: "StayLux",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StayLux - Luxury Hotel Booking Platform",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@staylux",
    title: "StayLux - Luxury Hotel Booking",
    description: "Discover premium accommodations worldwide",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  robots: "index, follow",
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
        <link rel="canonical" href="https://staylux.vercel.app" />
        <meta name="theme-color" content="#D4A574" />
        <meta property="og:type" content="website" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
