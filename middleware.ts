// Vercel Edge Middleware (TypeScript)
// Implements a simple per-IP token-bucket rate limiter.
// NOTE: This in-memory store only works per-edge instance and is suitable for
// low-volume testing. For production use, replace the backing store with a
// centralized store (Redis, Upstash Redis, or Cloudflare Workers KV) so limits
// are enforced globally across instances.

// NOTE: This project isn't a Next.js app, so avoid importing `next/server` here.
// Use standard Web `Response` objects so the file type-checks in this workspace.

// Configurable via environment variables at deploy time. Guard access to `process`
// because Edge runtimes may not provide a Node `process` global.
const safeEnv = (typeof process !== 'undefined' && process.env) ? process.env : undefined;
const MAX_REQUESTS = parseInt(safeEnv?.RATE_LIMIT_MAX ?? '100', 10); // tokens
const WINDOW_SECONDS = parseInt(safeEnv?.RATE_LIMIT_WINDOW_SECONDS ?? '60', 10); // refill window
const BLOCKED_IPS = (safeEnv?.VERCEL_BLOCKED_IPS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const WHITELIST_IPS = (safeEnv?.VERCEL_WHITELIST_IPS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

type Bucket = { tokens: number; last: number };

// Use a global map so the limiter survives across requests on the same instance
declare global {
  var __RATE_LIMIT_MAP__: Map<string, Bucket> | undefined;
}

if (!global.__RATE_LIMIT_MAP__) {
  global.__RATE_LIMIT_MAP__ = new Map();
}

const RATE_MAP = global.__RATE_LIMIT_MAP__ as Map<string, Bucket>;

function getIpFromRequest(req: Request) {
  // Prefer standard headers; Vercel will pass through `x-forwarded-for`.
  const xf = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (xf) return xf.split(',')[0].trim();
  // Fallback: Next.js Request has `ip` in some contexts, but not in Edge runtime.
  return 'unknown';
}

export function middleware(req: Request): Response {
  const ip = getIpFromRequest(req);

  // Quick allow/deny lists
  if (WHITELIST_IPS.includes(ip)) return new Response(null, { status: 200 });
  if (BLOCKED_IPS.includes(ip)) return new Response('Blocked', { status: 403 });

  // Token bucket: refill rate = MAX_REQUESTS per WINDOW_SECONDS
  const now = Date.now();
  const bucket = RATE_MAP.get(ip) ?? { tokens: MAX_REQUESTS, last: now };

  // Refill tokens based on elapsed time
  const elapsed = Math.max(0, now - bucket.last) / 1000; // seconds
  const refill = (MAX_REQUESTS / WINDOW_SECONDS) * elapsed;
  bucket.tokens = Math.min(MAX_REQUESTS, bucket.tokens + refill);
  bucket.last = now;

  if (bucket.tokens < 1) {
    // No tokens left — reject
    RATE_MAP.set(ip, bucket);
    const retryAfter = Math.ceil(1 / (MAX_REQUESTS / WINDOW_SECONDS));
    const headers: Record<string, string> = {
      'Retry-After': String(retryAfter),
      'Content-Type': 'text/plain',
    };
    return new Response('Too Many Requests', { status: 429, headers });
  }

  // Consume a token and continue
  bucket.tokens -= 1;
  RATE_MAP.set(ip, bucket);

  // Optionally add rate-limit headers for visibility
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(Math.max(0, Math.floor(bucket.tokens))),
    'X-RateLimit-Reset': String(Math.floor((bucket.last + WINDOW_SECONDS * 1000) / 1000)),
  };
  return new Response(null, { status: 200, headers });
}

// Match all routes
export const config = {
  matcher: '/:path*',
};
