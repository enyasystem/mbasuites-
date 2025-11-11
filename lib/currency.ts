// Multi-currency handling with caching
export const SUPPORTED_CURRENCIES = ["USD", "NGN", "EUR", "GBP"] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

// Exchange rates (in production, fetch from external API and cache in Redis)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  NGN: 1550, // 1 USD = 1550 NGN
  EUR: 0.92,
  GBP: 0.79,
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  // Convert to USD first, then to target currency
  const amountInUSD = amount / EXCHANGE_RATES[from]
  return amountInUSD * EXCHANGE_RATES[to]
}

export function getExchangeRate(from: Currency, to: Currency): number {
  return EXCHANGE_RATES[to] / EXCHANGE_RATES[from]
}

export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  })
  return formatter.format(amount)
}
