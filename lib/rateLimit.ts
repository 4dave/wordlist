// Simple in-memory rate limiter for API requests
const requestCounts = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100 // requests per minute

/**
 * Simple rate limiter to prevent API spam
 * @param ip - Client IP address or identifier
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  // If no record exists or window has expired, create new record
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    })
    return true
  }

  // Check if limit exceeded
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  // Increment count
  record.count++
  return true
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"
  return ip
}
