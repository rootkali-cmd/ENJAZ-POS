import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const barcode = searchParams.get("code")

    if (!barcode) {
      return NextResponse.json({ error: "الباركود مطلوب" }, { status: 400 })
    }

    const product = await prisma.product.findFirst({
      where: {
        storeId: session.storeId,
        isActive: true,
        barcodes: { some: { barcode } },
      },
      include: {
        barcodes: { where: { barcode } },
        category: { select: { name: true } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
