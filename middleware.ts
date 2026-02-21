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

const ALLOWED_ORIGINS = [
  'https://www.aichixia.xyz',
  'https://aichixia.xyz',
  'https://api.aichixia.xyz',
];

const globalDayLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, "1 d"),
  analytics: true,
  prefix: "ratelimit:global:day",
});

const globalDayLimitExternal = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 d"),
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

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function isInternalRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  if (referer && ALLOWED_ORIGINS.some(o => referer.startsWith(o))) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get("origin");

  if (!pathname.startsWith("/api/chat") && !pathname.startsWith("/api/models")) {
    return NextResponse.next();
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
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
      { status: 403, headers: getCorsHeaders(origin) }
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
        { status: 401, headers: getCorsHeaders(origin) }
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
        { status: 401, headers: getCorsHeaders(origin) }
      );
    }

    if (verifyResult.error) {
      console.log(`[${timestamp}] BLOCKED - API Key Error: User ${verifyResult.key.user_id}, Path: ${pathname}, Reason: ${verifyResult.error}`);
      return NextResponse.json(
        {
          error: verifyResult.error,
          code: "api_key_error"
        },
        { status: 429, headers: getCorsHeaders(origin) }
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
            ...getCorsHeaders(origin),
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
    Object.entries(getCorsHeaders(origin)).forEach(([k, v]) => response.headers.set(k, v));

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
          ...getCorsHeaders(origin),
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
          ...getCorsHeaders(origin),
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
          ...getCorsHeaders(origin),
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
  Object.entries(getCorsHeaders(origin)).forEach(([k, v]) => response.headers.set(k, v));

  return response;
}

export const config = {
  matcher: [
    "/api/chat/:path*",
    "/api/models/:path*"
  ],
};
