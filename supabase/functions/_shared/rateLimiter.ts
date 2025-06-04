
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const key = identifier;
    const existing = this.requests.get(key);

    if (!existing || now > existing.resetTime) {
      const resetTime = now + this.windowMs;
      this.requests.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime
      };
    }

    if (existing.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.resetTime
      };
    }

    existing.count++;
    this.requests.set(key, existing);

    return {
      allowed: true,
      remaining: this.maxRequests - existing.count,
      resetTime: existing.resetTime
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();

export function checkRateLimit(req: Request, userId?: string): RateLimitResult {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const identifier = userId || clientIP;
  
  // Cleanup old entries periodically
  if (Math.random() < 0.1) {
    rateLimiter.cleanup();
  }
  
  return rateLimiter.check(identifier);
}
