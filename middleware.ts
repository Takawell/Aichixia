import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { verifyApiKey } from "@/lib/console-utils";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const BLOCKED_IPS = process.env.BLOCKED_IPS 
  ? process.env.BLOCKED_IPS.split(',').map(ip => ip.trim())
  : [];

const globalDayLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 d"),
  analytics: true,
  prefix: "ratelimit:global:day",
});

const globalDayLimitExternal = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(80, "1 d"),
  analytics: true,
  prefix: "ratelimit:global:day:external",
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

function isInternalRequest(request: NextRequest): boolean {
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  
  if (referer && referer.includes(host || "")) {
    return true;
  }
  
  if (origin && origin.includes(host || "")) {
    return true;
  }
  
  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api/chat") && !pathname.startsWith("/api/models")) {
    return NextResponse.next();
  }

  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  const timestamp = new Date().toISOString();

  if (BLOCKED_IPS.includes(ip)) {
    console.log(`[${timestamp}] PERMANENTLY BLOCKED - IP: ${ip}, Path: ${pathname}, Reason: IP Blacklisted`);
    return NextResponse.json(
      { 
        error: "Access denied. Your IP has been blocked due to policy violation.",
        blocked: true 
      },
      { status: 403 }
    );
  }

  const isInternal = isInternalRequest(request);

  if (!isInternal) {
    const apiKey = request.headers.get("authorization")?.replace('Bearer ', '') || 
                   request.headers.get("x-api-key");

    if (!apiKey) {
      console.log(`[${timestamp}] BLOCKED - Missing API Key (External) - IP: ${ip}, Path: ${pathname}`);
      return NextResponse.json(
        {
          error: "Missing API key. Provide via Authorization header (Bearer token) or X-API-Key header",
          code: "missing_api_key"
        },
        { status: 401 }
      );
    }

    const verifyResult = await verifyApiKey(apiKey);

    if (!verifyResult || !verifyResult.key) {
      console.log(`[${timestamp}] BLOCKED - Invalid API Key - IP: ${ip}, Path: ${pathname}`);
      return NextResponse.json(
        {
          error: "Invalid API key",
          code: "invalid_api_key"
        },
        { status: 401 }
      );
    }

    if (verifyResult.error) {
      console.log(`[${timestamp}] BLOCKED - API Key Error: User ${verifyResult.key.user_id}, Path: ${pathname}, Reason: ${verifyResult.error}`);
      return NextResponse.json(
        {
          error: verifyResult.error,
          code: "api_key_error"
        },
        { status: 429 }
      );
    }

    const apiKeyData = verifyResult.key;
    console.log(`[${timestamp}] API KEY VERIFIED (External) - User: ${apiKeyData.user_id}, Key: ${apiKeyData.name}, Path: ${pathname}`);

    const GLOBAL_KEY = "api-total-usage-external";
    const globalCheck = await globalDayLimitExternal.limit(GLOBAL_KEY);

    if (!globalCheck.success) {
      const retryAfter = Math.floor((globalCheck.reset - Date.now()) / 1000);
      console.log(`[${timestamp}] BLOCKED - Global Rate Limit (External): User ${apiKeyData.user_id}, Path: ${pathname}, Retry After: ${retryAfter}s`);
      return NextResponse.json(
        {
          error: "Global API rate limit exceeded. All endpoints temporarily unavailable.",
          retryAfter: retryAfter,
          limit: "60 requests per day (shared across all users)",
          remaining: 0
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": globalCheck.limit.toString(),
            "X-RateLimit-Remaining": globalCheck.remaining.toString(),
            "X-RateLimit-Reset": globalCheck.reset.toString(),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    console.log(`[${timestamp}] ALLOWED (External) - User: ${apiKeyData.user_id}, Path: ${pathname}, Global Remaining: ${globalCheck.remaining}`);

    const response = NextResponse.next();
    response.headers.set("x-api-key-id", apiKeyData.id);
    response.headers.set("x-user-id", apiKeyData.user_id);
    response.headers.set("X-RateLimit-Limit", globalCheck.limit.toString());
    response.headers.set("X-RateLimit-Remaining", globalCheck.remaining.toString());
    response.headers.set("X-RateLimit-Reset", globalCheck.reset.toString());

    return response;
  }

  console.log(`[${timestamp}] API Access (Internal) - IP: ${ip}, Path: ${pathname}`);

  const GLOBAL_KEY = "api-total-usage";

  const globalCheck = await globalDayLimit.limit(GLOBAL_KEY);

  if (!globalCheck.success) {
    const retryAfter = Math.floor((globalCheck.reset - Date.now()) / 1000);
    console.log(`[${timestamp}] BLOCKED (Global Limit) - IP: ${ip}, Path: ${pathname}, Retry After: ${retryAfter}s`);
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
    console.log(`[${timestamp}] BLOCKED (Minute Limit) - IP: ${ip}, Path: ${pathname}, Retry After: ${retryAfter}s`);
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
    console.log(`[${timestamp}] BLOCKED (Hour Limit) - IP: ${ip}, Path: ${pathname}, Retry After: ${retryAfter}s`);
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

  console.log(`[${timestamp}] ALLOWED - IP: ${ip}, Path: ${pathname}, Global Remaining: ${globalCheck.remaining}, Minute Remaining: ${minuteCheck.remaining}, Hour Remaining: ${hourCheck.remaining}`);

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
