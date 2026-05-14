"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, Lock, Bell, Moon, Sun, Maximize, Minimize } from "lucide-react"
import { useTheme } from "./theme-provider"
import toast from "react-hot-toast"

interface HeaderProps {
  userName: string
  role: string
  storeName?: string
}

type Notification = {
  id: string
  type: "warning" | "danger" | "info" | "success"
  title: string
  message: string
  time: string
}

export function Header({ userName, role, storeName }: HeaderProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [hasAlerts, setHasAlerts] = useState(false)
  const [loadingNotifs, setLoadingNotifs] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { theme, toggle } = useTheme()
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || [])
        setHasAlerts(data.hasAlerts || false)
      })
      .catch(() => {})
      .finally(() => setLoadingNotifs(false))
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showNotifications])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch {
      toast.error("حدث خطأ")
    }
  }

  const roleLabels: Record<string, string> = {
    owner: "صاحب المتجر",
    admin: "أدمن",
    employee: "موظف",
  }

  const notifIcons: Record<string, React.ReactNode> = {
    warning: <span className="text-warning">!</span>,
    danger: <span className="text-danger">!</span>,
    success: <span className="text-success">!</span>,
    info: <span className="text-info">!</span>,
  }

  const notifBg: Record<string, string> = {
    warning: "bg-warning/10",
    danger: "bg-danger/10",
    success: "bg-success/10",
    info: "bg-info/10",
  }

  return (
    <header className="h-16 bg-header-bg border-b border-border flex items-center justify-between px-4 lg:px-6 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold hidden sm:block text-foreground">
          {storeName || "ENJAZ"}
        </h2>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-all"
          title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-all"
          title={isFullscreen ? "تصغير الشاشة" : "تكبير الشاشة"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-all relative"
            title="الإشعارات"
          >
            <Bell size={18} />
            {hasAlerts && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-header-bg animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-30 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">الإشعارات</h3>
                {hasAlerts && <span className="w-2 h-2 rounded-full bg-danger" />}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {loadingNotifs ? (
                  <div className="p-4 text-center text-sm text-muted">جاري التحميل...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted">لا توجد إشعارات</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-card-hover transition-colors border-b border-border last:border-0">
                      <div className={`w-8 h-8 rounded-lg ${notifBg[n.type]} flex items-center justify-center shrink-0`}>
                        {notifIcons[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted mt-0.5">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-muted shrink-0">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-card-hover transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-tight">{userName}</p>
              <p className="text-[11px] text-muted">{roleLabels[role] || role}</p>
            </div>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute left-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted">{roleLabels[role] || role}</p>
                </div>
                <button
                  onClick={() => { setShowMenu(false); router.push("/settings") }}
                  className="w-full px-4 py-2.5 text-right text-sm text-foreground hover:bg-card-hover flex items-center gap-2.5 transition-colors"
                >
                  <Lock size={15} className="text-muted" />
                  الإعدادات
                </button>
                <hr className="border-border" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-right text-sm text-danger hover:bg-danger/5 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut size={15} />
                  تسجيل خروج
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
