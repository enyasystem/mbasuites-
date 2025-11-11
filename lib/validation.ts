// Input validation schemas and utilities
export interface CreateBookingInput {
  room_id: number
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  guests: number
  currency: string
  special_requests?: string
}

export interface CreateRoomInput {
  name: string
  type: string
  description: string
  price_usd: number
  price_ngn: number
  max_guests: number
  beds: number
  bathrooms: number
  size_sqm: number
  amenities: string[]
  images: Array<{ url: string; alt: string }>
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
}

export function validateDateRange(checkIn: string, checkOut: string): boolean {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return checkInDate >= today && checkOutDate > checkInDate
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public code = "VALIDATION_ERROR",
  ) {
    super(message)
    this.name = "ValidationError"
  }
}
