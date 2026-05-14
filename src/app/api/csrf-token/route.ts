import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { generateCsrfToken } from "@/lib/csrf"

export async function GET() {
  const token = generateCsrfToken()
  const cookieStore = await cookies()
  cookieStore.set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })
  return NextResponse.json({ token })
}
