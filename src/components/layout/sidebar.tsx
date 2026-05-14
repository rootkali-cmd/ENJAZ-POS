"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ShoppingCart, Package, FileText, Users, Truck,
  Users2, BarChart3, Wallet, Settings, Shield, ChevronLeft, ChevronRight,
  Menu, X, Bot, Store, Receipt, Sparkles, Monitor
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/pos", label: "نقطة البيع", icon: ShoppingCart },
  { href: "/products", label: "المنتجات", icon: Package },
  { href: "/sales", label: "المبيعات", icon: Receipt },
  { href: "/customers", label: "العملاء", icon: Users },
  { href: "/suppliers", label: "الموردين", icon: Truck },
  { href: "/employees", label: "الموظفين", icon: Users2 },
  { href: "/expenses", label: "المصروفات", icon: Wallet },
  { href: "/ai-agent", label: "AI Agent", icon: Sparkles },
  { href: "/devices", label: "الأجهزة", icon: Monitor },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
]

interface SidebarProps {
  role: string
  storeName?: string
}

export function Sidebar({ role, storeName }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isOwner = role === "owner"

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 right-0 z-40 flex flex-col bg-sidebar-bg border-l border-border
          transition-all duration-300 ${
            collapsed ? "w-16" : "w-64"
          } ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md shrink-0">
            <Store size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg text-primary">ENJAZ</h1>
              {storeName && (
                <p className="text-[11px] text-muted truncate">{storeName}</p>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-card-hover"
                  } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={19} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}

          {isOwner && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-2
                ${pathname === "/admin"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-card-hover"
                } ${collapsed ? "justify-center" : ""}`}
            >
              <Shield size={19} className="shrink-0" />
              {!collapsed && <span>لوحة الإدارة</span>}
            </Link>
          )}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-12 border-t border-border text-muted hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
