"use client"

import Link from "next/link"
import { Home, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/50 flex items-center justify-center">
      <div className="text-center px-4 py-8">
        {/* 404 Text */}
        <div className="mb-8">
          <div className="inline-block">
            <div className="text-9xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              404
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Page Not Found</h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          Oops! The page you're looking for has checked out. Don't worry, we'll help you find your way back to comfort
          and convenience.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
          <Link
            href="/rooms"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors"
          >
            Browse Rooms
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="bg-card border rounded-2xl p-8 max-w-md mx-auto">
          <h2 className="font-semibold text-foreground mb-6">Need Help?</h2>
          <div className="space-y-3">
            <Link
              href="/rooms"
              className="block text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              → Explore Our Rooms
            </Link>
            <Link
              href="/help"
              className="block text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              → Check Our FAQ
            </Link>
            <Link
              href="/contact"
              className="block text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              → Contact Support
            </Link>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 opacity-10">
          <p className="text-sm text-muted-foreground">Error Code: 404 - Resource Not Found</p>
        </div>
      </div>
    </div>
  )
}
