import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Lora } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "MBA Suites - Coming Soon | Premium Business Accommodations",
  description:
    "MBA Suites - Premium business accommodations and professional services. We're building something extraordinary. Coming soon.",
  keywords: ["business accommodations", "corporate housing", "professional services", "coming soon"],
  metadataBase: new URL("https://mbasuites.com"),
  openGraph: {
    title: "MBA Suites - Coming Soon",
    description: "Premium business accommodations. We're building something extraordinary.",
    url: "https://mbasuites.com",
    siteName: "MBA Suites",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MBA Suites - Coming Soon",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MBA Suites - Coming Soon",
    description: "Premium business accommodations",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
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
    <html lang="en" className={`${playfair.variable} ${lora.variable}`}>
      <head>
        <link rel="canonical" href="https://mbasuites.com" />
        <meta name="theme-color" content="#0F172A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
