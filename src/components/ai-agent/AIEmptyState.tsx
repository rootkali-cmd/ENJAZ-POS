"use client"

import { Package, ShoppingCart, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export function AIEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
        <BarChart3 size={28} className="text-violet-300" />
      </div>
      <h3 className="text-lg font-bold mb-2">لا توجد بيانات كافية بعد</h3>
      <p className="text-sm text-white/50 max-w-md mb-6">
        ابدأ بإضافة المنتجات وتسجيل بعض المبيعات حتى يتمكن ENJAZ AI من توليد رؤى دقيقة.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/products" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm hover:bg-violet-500/20 transition">
          <Package size={16} />
          أضف منتجاتك
        </Link>
        <Link href="/pos" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm hover:bg-emerald-500/20 transition">
          <ShoppingCart size={16} />
          جرّب عملية بيع
        </Link>
        <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm hover:bg-blue-500/20 transition">
          <Users size={16} />
          أضف عملاء
        </Link>
        <Link href="/reports" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm hover:bg-amber-500/20 transition">
          <BarChart3 size={16} />
          راجع التقارير
        </Link>
      </div>
    </div>
  )
}
