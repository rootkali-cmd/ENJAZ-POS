import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.redirect(new URL("/login", request.url))
    if (!user.storeId) return NextResponse.redirect(new URL("/onboarding", request.url))
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
