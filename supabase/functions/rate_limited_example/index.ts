// Supabase Edge Function: rate_limited_example
// This function demonstrates server-side rate limiting per IP or per user using Redis (Upstash) as a backing store.
// If you don't have Redis, the function falls back to a simple in-memory limiter (not suitable for multi-instance deployments).

import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

// Configure via environment variables in the Supabase function settings or .env during local dev
// Use globalThis access to avoid TypeScript "Cannot find name 'Deno'" when analyzing locally.
type DenoEnvShape = { Deno?: { env?: { get?: (k: string) => string | undefined } } };
const _global = (globalThis as unknown) as DenoEnvShape;
const REDIS_URL = _global.Deno?.env?.get?.("UPSTASH_REDIS_REST_URL") ?? "";
const REDIS_TOKEN = _global.Deno?.env?.get?.("UPSTASH_REDIS_REST_TOKEN") ?? "";

// Rate limit settings
const RATE_LIMIT_CAPACITY = 60; // requests
const RATE_LIMIT_WINDOW_SEC = 60; // window in seconds

// In-memory fallback storage (only for single-instance/local dev)
const localBuckets = new Map<string, { tokens: number; resetAt: number }>();

async function redisIncrKey(key: string, ttlSec: number) {
  // Upstash REST API simple INCR with expiry behaviour simulated via GET/SET
  // Prefer using Redis commands via official client when available.
  // This function increments a counter and ensures it expires after ttlSec.
  const baseUrl = REDIS_URL.replace(/\/+$/, '');
  if (!baseUrl || !REDIS_TOKEN) throw new Error('no-redis');

  const url = `${baseUrl}/incr/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });

  if (!res.ok) throw new Error('redis-fail');
  const body = await res.json();
  // Upstash returns { result: <number> }
  const value = body.result;

  // Ensure TTL is set (SETEX-like) using the TTL command if needed
  const ttlUrl = `${baseUrl}/ttl/${encodeURIComponent(key)}`;
  const ttlRes = await fetch(ttlUrl, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } });
  if (ttlRes.ok) {
    const ttlBody = await ttlRes.json();
    const ttlVal = ttlBody.result;
    if (ttlVal === -1) {
      // set expiry
      await fetch(`${baseUrl}/expire/${encodeURIComponent(key)}/${ttlSec}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      });
    }
  }

  return value;
}

type RateLimitResult = { used: number; limit: number; resetAt?: number };

async function getRateLimit(key: string): Promise<RateLimitResult> {
  // Try Redis first
  try {
    if (REDIS_URL && REDIS_TOKEN) {
      const value = await redisIncrKey(key, RATE_LIMIT_WINDOW_SEC);
      return { used: Number(value), limit: RATE_LIMIT_CAPACITY };
    }
  } catch (unknownErr) {
    // Narrow unknown to preserve diagnostics
    const errMsg = unknownErr instanceof Error ? unknownErr.message : String(unknownErr);
    console.warn('Redis rate limiter error, falling back to memory:', errMsg);
  }

  // Memory fallback
  const now = Date.now();
  const bucket = localBuckets.get(key) || { tokens: 0, resetAt: now + RATE_LIMIT_WINDOW_SEC * 1000 };
  if (now > bucket.resetAt) {
    bucket.tokens = 1;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_SEC * 1000;
  } else {
    bucket.tokens += 1;
  }
  localBuckets.set(key, bucket);
  return { used: bucket.tokens, limit: RATE_LIMIT_CAPACITY, resetAt: bucket.resetAt };
}

serve(async (req: Request) => {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.headers.get('host') || 'unknown';
  // You may also use user ID when authenticated: e.g., `user:${userId}`
  const key = `rl:${ip}`;

  try {
    const { used, limit, resetAt } = await getRateLimit(key);

    const remaining = Math.max(0, limit - used);
    const headers = new Headers();
    headers.set('x-ratelimit-limit', String(limit));
    headers.set('x-ratelimit-remaining', String(remaining));
    if (resetAt) {
      headers.set('x-ratelimit-reset', String(Math.floor((resetAt as number) / 1000)));
    }

    if (used > limit) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
    }

    // Normal handler: return some demo data
    return new Response(JSON.stringify({ message: 'OK', now: Date.now() }), { status: 200, headers });
  } catch (unknownErr) {
    const errMsg = unknownErr instanceof Error ? unknownErr.message : String(unknownErr);
    console.error('Rate limiter error', errMsg);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
