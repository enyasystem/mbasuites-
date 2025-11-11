"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StaffLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Redirect to dashboard
      window.location.href = "/staff/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <ShieldCheck className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="mb-2 font-serif text-3xl font-bold text-foreground">Staff Login</h1>
        <p className="text-muted-foreground">Access the hotel management dashboard</p>
      </div>

      <div className="rounded-2xl border bg-card p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hotel.com"
              className="h-12 w-full rounded-lg border bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lock className="h-4 w-4" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12 w-full rounded-lg border bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <div className="mb-1 font-medium text-foreground">Demo Credentials:</div>
          <div>Email: admin@hotel.com</div>
          <div>Password: admin123</div>
        </div>
      </div>
    </motion.div>
  )
}
