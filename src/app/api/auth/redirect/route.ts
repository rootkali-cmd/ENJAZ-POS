import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.redirect(new URL("/login", "http://localhost:3000"))
    if (!user.storeId) return NextResponse.redirect(new URL("/onboarding", "http://localhost:3000"))
    return NextResponse.redirect(new URL("/dashboard", "http://localhost:3000"))
  } catch {
    return NextResponse.redirect(new URL("/login", "http://localhost:3000"))
  }
}
