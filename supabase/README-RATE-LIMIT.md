Server-side rate limiting example

This repository contains a Supabase Edge Function example implementing server-side rate limiting. It uses Upstash Redis REST API as a backing store for counters and falls back to a simple in-memory map for local testing (not suitable for production multi-instance deployments).

How it works

- The function increments a counter per key (by default per IP) for a 1-minute window.
- If the counter exceeds the configured `RATE_LIMIT_CAPACITY` (default 60), the function responds with HTTP 429 and `X-RateLimit-*` headers.

Setup (recommended for production)

1. Create an Upstash Redis instance and copy the REST URL and token.
2. In Supabase dashboard, add environment variables for the function:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Deploy the function from the `supabase/functions/rate_limited_example` folder.

Notes and next steps

- For authenticated endpoints, prefer using a per-user key (e.g., `rl:user:${userId}`) instead of IP.
- For higher accuracy and sliding window behaviour, switch to a proper Redis Lua script implementing a token bucket or sliding window log.
- If deploying behind a reverse proxy or CDN (Vercel, Cloudflare), use their built-in rate limiting as the authoritative enforcement.

Files

- `supabase/functions/rate_limited_example/index.ts`: Edge Function with rate limiting logic.

If you'd like, I can:
- Add a more accurate sliding window/token-bucket Lua script for Redis and wire it into the function.
- Create a Vercel middleware example for projects deployed on Vercel.
- Add server-side handling in Supabase Edge Functions for per-user limits (using Supabase auth).
