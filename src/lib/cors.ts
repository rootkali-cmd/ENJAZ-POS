import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const allowedOrigins = [
  "https://www.enjaz.one",
  "https://enjaz.one",
  "http://localhost:3000",
]

export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get("origin")

  if (!origin) return NextResponse.next()

  if (allowedOrigins.includes(origin)) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Max-Age", "86400")
    return response
  }

  // Block disallowed origins
  return NextResponse.json({ error: "Origin غير مسموح" }, { status: 403 })
}
