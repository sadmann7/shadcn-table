import { NextResponse, type NextRequest } from "next/server"
import { betterFetch } from "@better-fetch/fetch"
import type { Session } from "better-auth/types"

export default async function authMiddleware(request: NextRequest) {
  // console.log(6666, request)
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        //get the cookie from the request
        cookie: request.headers.get("cookie") || "",
      },
    }
  )

  console.log(9999, session)

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard"],
}
