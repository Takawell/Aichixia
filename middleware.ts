import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const BLOCKED_IPS = process.env.BLOCKED_IPS
  ? process.env.BLOCKED_IPS.split(",").map((ip) => ip.trim())
  : [];

const apiMinuteLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:api:v1:minute",
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api/v1")) {
    return NextResponse.next();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    request.ip ??
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  const timestamp = new Date().toISOString();

  if (BLOCKED_IPS.includes(ip)) {
    console.log(
      `[${timestamp}] BLOCKED IP - IP: ${ip}, Path: ${pathname}`
    );

    return NextResponse.json(
      {
        error: "Access denied. Your IP has been blocked.",
        blocked: true,
      },
      { status: 403 }
    );
  }

  const rateLimit = await apiMinuteLimit.limit(ip);

  if (!rateLimit.success) {
    const retryAfter = Math.max(
      1,
      Math.floor((rateLimit.reset - Date.now()) / 1000)
    );

    console.log(
      `[${timestamp}] RATE LIMITED - IP: ${ip}, Path: ${pathname}, Retry After: ${retryAfter}s`
    );

    return NextResponse.json(
      {
        error: "API rate limit exceeded.",
        code: "rate_limit_exceeded",
        retryAfter,
        limit: "20 requests per minute",
        remaining: 0,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.reset.toString(),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  console.log(
    `[${timestamp}] ALLOWED - IP: ${ip}, Path: ${pathname}, Remaining: ${rateLimit.remaining}`
  );

  const response = NextResponse.next();

  response.headers.set(
    "X-RateLimit-Limit",
    rateLimit.limit.toString()
  );
  response.headers.set(
    "X-RateLimit-Remaining",
    rateLimit.remaining.toString()
  );
  response.headers.set(
    "X-RateLimit-Reset",
    rateLimit.reset.toString()
  );

  return response;
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
