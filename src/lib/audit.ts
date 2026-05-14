import { prisma } from "@/lib/prisma"

interface AuditLogInput {
  storeId: string | null
  action: string
  entity: string
  entityId: string | null
  details?: Record<string, unknown>
  userId: string | null
}

export async function auditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        storeId: input.storeId || "",
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: input.details ? JSON.stringify(input.details) : null,
        userId: input.userId,
        userType: "owner",
      },
    })
  } catch (error) {
    console.error("[AuditLog] Error:", error)
  }
}
