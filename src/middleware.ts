import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { ratelimit } from "@/lib/rate-limit"

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1"

  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.redirect(new URL("/blocked", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|blocked).*)",
}
