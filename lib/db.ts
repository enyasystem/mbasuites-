import { neon } from "@neondatabase/serverless"

/**
 * Get database connection string from available environment variables
 * Checks multiple possible Neon env var names for compatibility
 */
function getDatabaseUrl(): string {
  const url =
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_POSTGRES_PRISMA_URL ||
    ""

  if (!url) {
    throw new Error(
      "No database connection string found. Please set NEON_DATABASE_URL or NEON_POSTGRES_URL environment variable.",
    )
  }

  return url
}

/**
 * Get a Neon SQL client instance
 * @returns Neon SQL client for executing queries
 */
export function getDb() {
  const url = getDatabaseUrl()
  return neon(url)
}

/**
 * Centralized database client
 * Use this singleton throughout the app for consistency
 */
export const db = getDb()
