import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname
  const ip = req.ip || "unknown"

  if (p === "/api/chat") {
    const key = `ratelimit:/api/chat:${ip}`
    const current = await kv.incr(key)
    if (current === 1) await kv.expire(key, 3600)
    if (current > 100) return new Response("Rate limit exceeded", { status: 429 })
    return NextResponse.next()
  }

  if (p === "/api/aichixia") {
    const key = `ratelimit:/api/aichixia:${ip}`
    const current = await kv.incr(key)
    if (current === 1) await kv.expire(key, 3600)
    if (current > 1000) return new Response("Rate limit exceeded", { status: 429 })
    return NextResponse.next()
  }

  if (p.startsWith("/api/models")) {
    const key = `ratelimit:/api/models:${ip}`
    const current = await kv.incr(key)
    if (current === 1) await kv.expire(key, 3600)
    if (current > 100) return new Response("Rate limit exceeded", { status: 429 })
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/chat", "/api/aichixia", "/api/models/:path*"]
}
