import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { openCashDrawer, type CashDrawerProvider } from "@/services/cash-drawer"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { action, data } = await request.json()

    if (action === "suspend") {
      const suspended = await prisma.suspendedSale.create({
        data: {
          storeId: session.storeId,
          label: data?.label || "فاتورة معلقة",
          data: JSON.stringify(data?.cart || []),
        },
      })
      return NextResponse.json({ suspended })
    }

    if (action === "get-suspended") {
      const sales = await prisma.suspendedSale.findMany({
        where: { storeId: session.storeId },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json({
        sales: sales.map((s: { id: string; storeId: string; label: string | null; data: string; createdAt: Date }) => ({
          ...s,
          data: JSON.parse(s.data),
        })),
      })
    }

    if (action === "delete-suspended") {
      await prisma.suspendedSale.deleteMany({
        where: { id: data?.id, storeId: session.storeId },
      })
      return NextResponse.json({ success: true })
    }

    if (action === "search-products") {
      const query = data?.query || ""
      const products = await prisma.product.findMany({
        where: {
          storeId: session.storeId,
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { barcodes: { some: { barcode: { contains: query, mode: "insensitive" } } } },
          ],
        },
        include: {
          barcodes: { select: { barcode: true } },
          category: { select: { name: true } },
        },
        take: 20,
      })
      return NextResponse.json({ products })
    }

    if (action === "cash-drawer-settings") {
      const settings = await prisma.storeSettings.findUnique({
        where: { storeId: session.storeId },
        select: {
          cashDrawerEnabled: true,
          cashDrawerRequiresOwnerPin: true,
          cashDrawerProvider: true,
        },
      })
      const store = await prisma.store.findUnique({
        where: { id: session.storeId },
        select: { ownerPin: true },
      })
      return NextResponse.json({
        settings: settings || {
          cashDrawerEnabled: false,
          cashDrawerRequiresOwnerPin: true,
          cashDrawerProvider: "browser",
        },
        hasOwnerPin: !!store?.ownerPin,
      })
    }

    if (action === "cash-drawer-open") {
      const settings = await prisma.storeSettings.findUnique({
        where: { storeId: session.storeId },
      })
      const provider = (settings?.cashDrawerProvider || "browser") as CashDrawerProvider
      const requiresPin = settings?.cashDrawerRequiresOwnerPin ?? true

      if (provider === "disabled") {
        await prisma.auditLog.create({
          data: {
            storeId: session.storeId,
            action: "CASH_DRAWER_OPEN_ATTEMPT",
            entity: "cash_drawer",
            entityId: null,
            details: JSON.stringify({
              status: "blocked",
              reason: data?.reason || null,
              reasonText: data?.reasonText || null,
              saleId: data?.saleId || null,
              usedOwnerPin: false,
            }),
            userId: session.id,
            userType: session.role === "owner" ? "owner" : "employee",
          },
        })
        return NextResponse.json({
          success: false,
          status: "blocked",
          message: "فتح الخزنة معطل في إعدادات المتجر",
        })
      }

      if (requiresPin && !data?.skipOwnerPin) {
        const store = await prisma.store.findUnique({
          where: { id: session.storeId },
          select: { ownerPin: true },
        })
        if (store?.ownerPin) {
          if (!data?.ownerPin) {
            return NextResponse.json({
              success: false,
              status: "pin_required",
              message: "الرجاء إدخال PIN",
            })
          }
          const pinValid = await bcrypt.compare(data.ownerPin, store.ownerPin)
          if (!pinValid) {
            await prisma.auditLog.create({
              data: {
                storeId: session.storeId,
                action: "CASH_DRAWER_OPEN_ATTEMPT",
                entity: "cash_drawer",
                entityId: null,
                details: JSON.stringify({
                  status: "blocked",
                  reason: "PIN غير صحيح",
                  usedOwnerPin: true,
                }),
                userId: session.id,
                userType: session.role === "owner" ? "owner" : "employee",
              },
            })
            return NextResponse.json({
              success: false,
              status: "blocked",
              message: "PIN غير صحيح",
            })
          }
        }
      }

      const result = await openCashDrawer({
        storeId: session.storeId,
        userId: session.id,
        saleId: data?.saleId,
        reason: data?.reason,
        reasonText: data?.reasonText,
        provider,
      })

      await prisma.auditLog.create({
        data: {
          storeId: session.storeId,
          action: "CASH_DRAWER_OPEN_ATTEMPT",
          entity: "cash_drawer",
          entityId: data?.saleId || null,
          details: JSON.stringify({
            status: result.status,
            reason: data?.reason || null,
            reasonText: data?.reasonText || null,
            saleId: data?.saleId || null,
            usedOwnerPin: !!(data?.ownerPin || (requiresPin && data?.skipOwnerPin === false)),
          }),
          userId: session.id,
          userType: session.role === "owner" ? "owner" : "employee",
        },
      })

      return NextResponse.json(result)
    }

    if (action === "verify-owner-pin") {
      const store = await prisma.store.findUnique({
        where: { id: session.storeId },
        select: { ownerPin: true },
      })
      if (!store?.ownerPin) {
        return NextResponse.json({ valid: true, message: "لا يوجد PIN" })
      }
      const valid = await bcrypt.compare(data?.pin || "", store.ownerPin)
      return NextResponse.json({ valid, message: valid ? "PIN صحيح" : "PIN غير صحيح" })
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
