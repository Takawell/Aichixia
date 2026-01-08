import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const VALID_API_KEYS = new Set(
  process.env.VALID_API_KEYS?.split(",").map(k => k.trim()).filter(Boolean) || []
);

const publicDayLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 d"),
  analytics: true,
  prefix: "ratelimit:public:day",
});

const publicMinuteLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit:public:minute",
});

const premiumDayLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "1 d"),
  analytics: true,
  prefix: "ratelimit:premium:day",
});

const premiumMinuteLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "ratelimit:premium:minute",
});

const premiumHourLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
  prefix: "ratelimit:premium:hour",
});

const premiumLoginAttempts = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  analytics: true,
  prefix: "ratelimit:premium:login",
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/key/")) {
    const apiKey = 
      request.headers.get("x-api-key") || 
      request.headers.get("authorization")?.replace("Bearer ", "");
    
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous";
    
    const loginAttemptCheck = await premiumLoginAttempts.limit(ip);
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: "Missing API key",
          message: "x-api-key header or Authorization Bearer token required"
        },
        { status: 401 }
      );
    }

    if (!VALID_API_KEYS.has(apiKey)) {
      if (!loginAttemptCheck.success) {
        return NextResponse.json(
          {
            error: "Too many invalid attempts",
            message: "Temporarily blocked. Try again later.",
            retryAfter: Math.floor((loginAttemptCheck.reset - Date.now()) / 1000)
          },
          { 
            status: 429,
            headers: {
              "Retry-After": Math.floor((loginAttemptCheck.reset - Date.now()) / 1000).toString()
            }
          }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Invalid API key",
          message: "The provided API key is not valid"
        },
        { status: 401 }
      );
    }

    const keyDayCheck = await premiumDayLimit.limit(apiKey);
    if (!keyDayCheck.success) {
      return NextResponse.json(
        {
          error: "Daily limit exceeded",
          limit: "200 requests per day",
          resetAt: new Date(keyDayCheck.reset).toISOString(),
          remaining: 0
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "200",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": keyDayCheck.reset.toString(),
            "Retry-After": Math.floor((keyDayCheck.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const keyMinuteCheck = await premiumMinuteLimit.limit(apiKey);
    if (!keyMinuteCheck.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit: "30 requests per minute",
          resetAt: new Date(keyMinuteCheck.reset).toISOString(),
          remaining: 0
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": keyMinuteCheck.reset.toString(),
            "Retry-After": Math.floor((keyMinuteCheck.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const keyHourCheck = await premiumHourLimit.limit(apiKey);
    if (!keyHourCheck.success) {
      return NextResponse.json(
        {
          error: "Hourly limit exceeded",
          limit: "100 requests per hour",
          resetAt: new Date(keyHourCheck.reset).toISOString(),
          remaining: 0
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": keyHourCheck.reset.toString(),
            "Retry-After": Math.floor((keyHourCheck.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Tier", "premium");
    response.headers.set("X-RateLimit-Day-Remaining", keyDayCheck.remaining.toString());
    response.headers.set("X-RateLimit-Day-Limit", "200");
    response.headers.set("X-RateLimit-Minute-Remaining", keyMinuteCheck.remaining.toString());
    response.headers.set("X-RateLimit-Minute-Limit", "30");
    response.headers.set("X-RateLimit-Hour-Remaining", keyHourCheck.remaining.toString());
    response.headers.set("X-RateLimit-Hour-Limit", "100");
    return response;
  }

  if (!pathname.startsWith("/api/chat") && !pathname.startsWith("/api/models")) {
    return NextResponse.next();
  }

  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous";

  const dayCheck = await publicDayLimit.limit(ip);
  if (!dayCheck.success) {
    return NextResponse.json(
      {
        error: "Daily rate limit exceeded",
        message: "Public API limit reached. Consider using premium endpoints for higher limits.",
        limit: "100 requests per day",
        resetAt: new Date(dayCheck.reset).toISOString(),
        remaining: 0
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Tier": "public",
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": dayCheck.reset.toString(),
          "Retry-After": Math.floor((dayCheck.reset - Date.now()) / 1000).toString()
        }
      }
    );
  }

  const minuteCheck = await publicMinuteLimit.limit(ip);
  if (!minuteCheck.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        limit: "20 requests per minute",
        resetAt: new Date(minuteCheck.reset).toISOString(),
        remaining: 0
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": minuteCheck.reset.toString(),
          "Retry-After": Math.floor((minuteCheck.reset - Date.now()) / 1000).toString()
        }
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Tier", "public");
  response.headers.set("X-RateLimit-Day-Remaining", dayCheck.remaining.toString());
  response.headers.set("X-RateLimit-Day-Limit", "100");
  response.headers.set("X-RateLimit-Minute-Remaining", minuteCheck.remaining.toString());
  response.headers.set("X-RateLimit-Minute-Limit", "20");
  
  return response;
}

export const config = {
  matcher: [
    "/api/chat/:path*",
    "/api/models/:path*",
    "/key/:path*"
  ],
};
