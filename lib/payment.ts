// Payment processing utilities
import crypto from "crypto"

export interface PaymentIntent {
  reference: string
  amount: number
  currency: string
  email: string
  callback_url?: string
}

export function generatePaymentReference(): string {
  return `BK${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`
}

export function verifyPaystackSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex")
  return hash === signature
}

export async function initializePaystackPayment(data: PaymentIntent): Promise<any> {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

  if (!paystackSecretKey) {
    throw new Error("PAYSTACK_SECRET_KEY not configured")
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      amount: Math.round(data.amount * 100), // Paystack expects amount in kobo/cents
      currency: data.currency,
      reference: data.reference,
      callback_url: data.callback_url,
    }),
  })

  if (!response.ok) {
    throw new Error("Payment initialization failed")
  }

  return response.json()
}

export async function verifyPaystackPayment(reference: string): Promise<any> {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

  if (!paystackSecretKey) {
    throw new Error("PAYSTACK_SECRET_KEY not configured")
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
    },
  })

  if (!response.ok) {
    throw new Error("Payment verification failed")
  }

  return response.json()
}
