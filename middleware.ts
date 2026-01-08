import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const globalDayLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 d"),
  analytics: true,
  prefix: "ratelimit:global:day",
});

const chatMinuteLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:chat:minute",
});

const chatHourLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 h"),
  analytics: true,
  prefix: "ratelimit:chat:hour",
});

const modelsMinuteLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:models:minute",
});

const modelsHourLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  analytics: true,
  prefix: "ratelimit:models:hour",
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api/chat") && !pathname.startsWith("/api/models")) {
    return NextResponse.next();
  }

  const GLOBAL_KEY = "api-total-usage";

  const globalCheck = await globalDayLimit.limit(GLOBAL_KEY);

  if (!globalCheck.success) {
    const retryAfter = Math.floor((globalCheck.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "Global API rate limit exceeded. All endpoints temporarily unavailable.",
        retryAfter: retryAfter,
        limit: "50 requests per day (shared across all users)",
        remaining: 0
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Global-Limit": globalCheck.limit.toString(),
          "X-RateLimit-Global-Remaining": globalCheck.remaining.toString(),
          "X-RateLimit-Global-Reset": globalCheck.reset.toString(),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  const identifier = ip;

  let minuteCheck, hourCheck;

  if (pathname.startsWith("/api/chat")) {
    minuteCheck = await chatMinuteLimit.limit(identifier);
    hourCheck = await chatHourLimit.limit(identifier);
  } else {
    minuteCheck = await modelsMinuteLimit.limit(identifier);
    hourCheck = await modelsHourLimit.limit(identifier);
  }

  if (!minuteCheck.success) {
    const retryAfter = Math.floor((minuteCheck.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "API rate limit exceeded. Service temporarily unavailable.",
        retryAfter: retryAfter,
        limit: `${minuteCheck.limit} requests per minute`,
        remaining: 0
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": minuteCheck.limit.toString(),
          "X-RateLimit-Remaining": minuteCheck.remaining.toString(),
          "X-RateLimit-Reset": minuteCheck.reset.toString(),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  if (!hourCheck.success) {
    const retryAfter = Math.floor((hourCheck.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "API rate limit exceeded. Service temporarily unavailable.",
        retryAfter: retryAfter,
        limit: `${hourCheck.limit} requests per hour`,
        remaining: 0
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": hourCheck.limit.toString(),
          "X-RateLimit-Remaining": hourCheck.remaining.toString(),
          "X-RateLimit-Reset": hourCheck.reset.toString(),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Global-Limit", globalCheck.limit.toString());
  response.headers.set("X-RateLimit-Global-Remaining", globalCheck.remaining.toString());
  response.headers.set("X-RateLimit-Limit-Minute", minuteCheck.limit.toString());
  response.headers.set("X-RateLimit-Remaining-Minute", minuteCheck.remaining.toString());
  response.headers.set("X-RateLimit-Limit-Hour", hourCheck.limit.toString());
  response.headers.set("X-RateLimit-Remaining-Hour", hourCheck.remaining.toString());

  return response;
}

export const config = {
  matcher: [
    "/api/chat/:path*",
    "/api/models/:path*"
  ],
};
