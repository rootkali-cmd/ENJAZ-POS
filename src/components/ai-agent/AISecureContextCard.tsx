"use client"

import { Shield } from "lucide-react"

export function AISecureContextCard() {
  return (
    <div className="rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={16} className="text-violet-300" />
        <p className="text-sm font-semibold">سياق AI مؤمن للمتجر</p>
      </div>
      <p className="text-xs text-white/60 leading-relaxed">
        جلسة الذكاء الاصطناعي متصلة فقط بمتجرك الموثق. يتم تحديد بيانات المتجر بأمان من الخادم
        ولا يمكن تغييرها من المتصفح. أي تنفيذ مستقبلي لإجراء حقيقي يجب أن يمر بفحص صلاحيات
        وتقييد بيانات المتجر من الخادم مرة أخرى.
      </p>
    </div>
  )
}
