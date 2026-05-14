import { NextResponse } from "next/server"
import { deleteSession, getCurrentUser } from "@/lib/auth/session"
import { auditLog } from "@/lib/audit"

export async function POST() {
  try {
    const user = await getCurrentUser()

    if (user) {
      await auditLog({
        storeId: user.storeId || null,
        action: "USER_LOGGED_OUT",
        entity: "user",
        entityId: user.id,
        userId: user.id,
      })
    }

    await deleteSession()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
