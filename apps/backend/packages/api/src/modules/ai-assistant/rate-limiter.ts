export interface RateLimitCheckResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds: number;
}

export class SlidingWindowRateLimiter {
  private readonly buckets = new Map<string, number[]>();

  public constructor(
    private readonly maxRequests: number,
    private readonly windowMs = 60_000
  ) {}

  public consume(
    clientKey: string,
    nowMs = Date.now()
  ): RateLimitCheckResult {
    const cutoff = nowMs - this.windowMs;
    const existing = this.buckets.get(clientKey) ?? [];
    const active = existing.filter((ts) => ts > cutoff);

    if (active.length >= this.maxRequests) {
      const oldest = active[0] ?? nowMs;
      const waitMs = Math.max(1000, oldest + this.windowMs - nowMs);
      this.buckets.set(clientKey, active);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(waitMs / 1000),
      };
    }

    active.push(nowMs);
    this.buckets.set(clientKey, active);

    if (this.buckets.size > 2000) {
      for (const [key, timestamps] of this.buckets.entries()) {
        if (timestamps.every((ts) => ts <= cutoff)) {
          this.buckets.delete(key);
        }
      }
    }

    return {
      allowed: true,
      remaining: Math.max(0, this.maxRequests - active.length),
      retryAfterSeconds: 0,
    };
  }
}
