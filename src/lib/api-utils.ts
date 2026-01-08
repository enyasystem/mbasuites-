import { toast } from "@/hooks/use-toast";

interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Handle Supabase API errors with user-friendly messages
 */
export function handleApiError(error: unknown, context?: string): ApiError {
  console.error(`API Error${context ? ` (${context})` : ""}:`, error);

  // Supabase error
  if (error && typeof error === "object" && "code" in error) {
    const supabaseError = error as { code: string; message: string; details?: string };
    
    // Common Supabase error codes
    switch (supabaseError.code) {
      case "PGRST116":
        return { message: "No data found", code: supabaseError.code };
      case "23505":
        return { message: "This record already exists", code: supabaseError.code };
      case "23503":
        return { message: "Related data not found", code: supabaseError.code };
      case "42501":
        return { message: "You don't have permission to perform this action", code: supabaseError.code };
      case "PGRST301":
        return { message: "Row-level security policy violation", code: supabaseError.code };
      default:
        return { 
          message: supabaseError.message || "An error occurred", 
          code: supabaseError.code,
          details: supabaseError.details
        };
    }
  }

  // Supabase storage / HTTP-style error objects sometimes come back with
  // `statusCode`, `error` and `message` rather than a `code` property.
  if (error && typeof error === "object" && ("statusCode" in error || "error" in error)) {
    const e = error as any;
    const msg = e.message || e.error || JSON.stringify(e);
    return { message: msg };
  }

  // Network error
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return { message: "Network error. Please check your internet connection." };
  }

  // Generic Error
  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "An unexpected error occurred" };
}

/**
 * Show a toast notification for API errors
 */
export function showApiError(error: unknown, context?: string) {
  const apiError = handleApiError(error, context);
  toast({
    title: "Error",
    description: apiError.message,
    variant: "destructive",
  });
  return apiError;
}

/**
 * Wrapper for async API calls with error handling
 */
export async function apiCall<T>(
  fn: () => Promise<T>,
  options?: {
    context?: string;
    showToast?: boolean;
    onError?: (error: ApiError) => void;
    // Optional simple client-side rate limiting key. If omitted, uses global limiter.
    rateLimitKey?: string;
  }
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    // Enforce a simple client-side token-bucket rate limiter before calling the API.
    await consumeRateLimitToken(options?.rateLimitKey ?? "__global__");

    const data = await fn();
    return { data, error: null };
  } catch (err) {
    const error = handleApiError(err, options?.context);
    
    if (options?.showToast !== false) {
      showApiError(err, options?.context);
    }
    
    options?.onError?.(error);
    
    return { data: null, error };
  }
}

/**
 * Retry an API call with exponential backoff
 */
export async function retryApiCall<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on permission or validation errors
      if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code: string }).code;
        if (["42501", "23505", "23503", "PGRST301"].includes(code)) {
          throw error;
        }
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
}

// ----------------------
// Simple client-side rate limiter
// ----------------------

type Bucket = {
  tokens: number;
  lastRefill: number;
};

const RATE_LIMIT_CAPACITY = 30; // tokens
const RATE_LIMIT_REFILL_TOKENS = 30; // tokens per interval
const RATE_LIMIT_REFILL_INTERVAL_MS = 60_000; // 1 minute

const buckets = new Map<string, Bucket>();

function getBucket(key: string): Bucket {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_CAPACITY, lastRefill: now };
    buckets.set(key, bucket);
    return bucket;
  }

  // refill
  const elapsed = now - bucket.lastRefill;
  if (elapsed > 0) {
    const refillAmount = (elapsed / RATE_LIMIT_REFILL_INTERVAL_MS) * RATE_LIMIT_REFILL_TOKENS;
    if (refillAmount > 0) {
      bucket.tokens = Math.min(RATE_LIMIT_CAPACITY, bucket.tokens + refillAmount);
      bucket.lastRefill = now;
    }
  }

  return bucket;
}

/**
 * Attempt to consume a token for the given key. Rejects with an object shaped like an API error on limit exceeded.
 */
export async function consumeRateLimitToken(key = "__global__") {
  const bucket = getBucket(key);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return;
  }

  // No tokens available — reject immediately with a 429-like error
  const err = { message: "Too many requests. Please try again later.", code: "429" } as any;
  throw err;
}
