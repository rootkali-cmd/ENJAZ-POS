"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Lock, LockKeyhole, ShieldAlert } from "lucide-react"
import toast from "react-hot-toast"

interface OwnerGuardProps {
  children: React.ReactNode
  onVerified?: () => void
}

const OWNER_VERIFIED_KEY = "enjaz_owner_verified"
const OWNER_VERIFIED_UNTIL_KEY = "enjaz_owner_verified_until"
const OWNER_UNLOCK_DURATION = 15 * 60 * 1000

export function OwnerGuard({ children, onVerified }: OwnerGuardProps) {
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [checking, setChecking] = useState(true)

  const lockProtectedArea = useCallback((silent = false) => {
    sessionStorage.removeItem(OWNER_VERIFIED_KEY)
    sessionStorage.removeItem(OWNER_VERIFIED_UNTIL_KEY)
    setVerified(false)
    setPin("")
    setShowPassword(false)
    if (!silent) toast.success("تم قفل المنطقة المحمية")
  }, [])

  useEffect(() => {
    const cached = sessionStorage.getItem(OWNER_VERIFIED_KEY)
    const expiresAt = Number(sessionStorage.getItem(OWNER_VERIFIED_UNTIL_KEY) || "0")
    if (cached === "true" && expiresAt > Date.now()) {
      setVerified(true)
      onVerified?.()
    } else {
      sessionStorage.removeItem(OWNER_VERIFIED_KEY)
      sessionStorage.removeItem(OWNER_VERIFIED_UNTIL_KEY)
    }
    setChecking(false)
  }, [onVerified])

  useEffect(() => {
    if (!verified) return

    const expiresAt = Number(sessionStorage.getItem(OWNER_VERIFIED_UNTIL_KEY) || "0")
    const remaining = expiresAt - Date.now()
    if (remaining <= 0) {
      lockProtectedArea(true)
      return
    }

    const timeout = window.setTimeout(() => {
      lockProtectedArea(true)
      toast("تم قفل المنطقة المحمية تلقائياً بعد 15 دقيقة")
    }, remaining)

    return () => window.clearTimeout(timeout)
  }, [lockProtectedArea, verified])

  const handleVerify = async () => {
    if (!pin) {
      toast.error("يرجى إدخال كلمة مرور الإدارة")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (res.ok && data.verified) {
        const expiresAt = Date.now() + OWNER_UNLOCK_DURATION
        setVerified(true)
        setPin("")
        sessionStorage.setItem(OWNER_VERIFIED_KEY, "true")
        sessionStorage.setItem(OWNER_VERIFIED_UNTIL_KEY, String(expiresAt))
        onVerified?.()
        toast.success("تم التحقق بنجاح")
      } else {
        toast.error("كلمة المرور غير صحيحة")
        setPin("")
      }
    } catch {
      toast.error("حدث خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (verified) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => lockProtectedArea(false)}>
            <LockKeyhole size={16} />
            قفل المنطقة المحمية
          </Button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
          <ShieldAlert size={40} className="text-primary" />
        </div>

        <h2 className="text-xl font-bold mb-2">منطقة محمية</h2>
        <p className="text-gray-500 text-sm mb-6">
          هذه المنطقة خاصة بصاحب المتجر. يرجى إدخال كلمة مرور الإدارة للمتابعة.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="أدخل كلمة مرور الإدارة"
              className="w-full rounded-xl border-2 border-border bg-card pr-10 pl-10 py-3 text-sm text-center
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button onClick={handleVerify} loading={loading} className="w-full py-3 text-base">
            فتح المنطقة المحمية
          </Button>
        </div>
      </div>
    </div>
  )
}
