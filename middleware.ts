import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const chatMinuteLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"),
  analytics: true,
  prefix: "ratelimit:chat:minute",
});

const chatHourLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(150, "1 h"),
  analytics: true,
  prefix: "ratelimit:chat:hour",
});

const chatDayLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(200, "1 d"),
  analytics: true,
  prefix: "ratelimit:chat:day",
});

const modelsMinuteLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit:models:minute",
});

const modelsHourLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, "1 h"),
  analytics: true,
  prefix: "ratelimit:models:hour",
});

const modelsDayLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "1 d"),
  analytics: true,
  prefix: "ratelimit:models:day",
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api/chat") && !pathname.startsWith("/api/models")) {
    return NextResponse.next();
  }

  const GLOBAL_KEY = "api-total-usage";

  let minuteCheck, hourCheck, dayCheck;

  if (pathname.startsWith("/api/chat")) {
    minuteCheck = await chatMinuteLimit.limit(GLOBAL_KEY);
    hourCheck = await chatHourLimit.limit(GLOBAL_KEY);
    dayCheck = await chatDayLimit.limit(GLOBAL_KEY);
  } else {
    minuteCheck = await modelsMinuteLimit.limit(GLOBAL_KEY);
    hourCheck = await modelsHourLimit.limit(GLOBAL_KEY);
    dayCheck = await modelsDayLimit.limit(GLOBAL_KEY);
  }

  if (!minuteCheck.success) {
    const retryAfter = Math.floor((minuteCheck.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "API rate limit exceeded. Service temporarily unavailable.",
        retryAfter: retryAfter,
        limit: `${minuteCheck.limit} requests per minute (global)`,
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
        limit: `${hourCheck.limit} requests per hour (global)`,
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

  if (!dayCheck.success) {
    const retryAfter = Math.floor((dayCheck.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "API rate limit exceeded. Service temporarily unavailable.",
        retryAfter: retryAfter,
        limit: `${dayCheck.limit} requests per day (global)`,
        remaining: 0
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": dayCheck.limit.toString(),
          "X-RateLimit-Remaining": dayCheck.remaining.toString(),
          "X-RateLimit-Reset": dayCheck.reset.toString(),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit-Minute", minuteCheck.limit.toString());
  response.headers.set("X-RateLimit-Remaining-Minute", minuteCheck.remaining.toString());
  response.headers.set("X-RateLimit-Limit-Hour", hourCheck.limit.toString());
  response.headers.set("X-RateLimit-Remaining-Hour", hourCheck.remaining.toString());
  response.headers.set("X-RateLimit-Limit-Day", dayCheck.limit.toString());
  response.headers.set("X-RateLimit-Remaining-Day", dayCheck.remaining.toString());

  return response;
}

export const config = {
  matcher: [
    "/api/chat/:path*",
    "/api/models/:path*"
  ],
};
