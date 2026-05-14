"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/loading"
import { useCurrency } from "@/contexts/currency"
import {
  DollarSign, ShoppingCart, Package, TrendingUp, Users,
  AlertTriangle, ArrowUp, ArrowDown, Clock
} from "lucide-react"

interface DashboardData {
  todaySales: number
  todayTransactions: number
  totalProducts: number
  lowStockCount: number
  salesChange: number
  topProducts: { name: string; total: number; quantity: number }[]
  recentSales: {
    id: string
    invoiceNumber: string
    total: number
    createdAt: string
    employee?: { name: string }
  }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { format: fmt } = useCurrency()

  useEffect(() => {
    fetch("/api/reports?type=dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const stats = [
    {
      label: "مبيعات اليوم",
      value: data?.todaySales ?? 0,
      currency: true,
      icon: DollarSign,
      color: "text-success",
      bg: "bg-green-50",
      change: data?.salesChange,
    },
    {
      label: "فواتير اليوم",
      value: data?.todayTransactions ?? 0,
      icon: ShoppingCart,
      color: "text-primary",
      bg: "bg-purple-50",
    },
    {
      label: "إجمالي المنتجات",
      value: data?.totalProducts ?? 0,
      icon: Package,
      color: "text-info",
      bg: "bg-blue-50",
    },
    {
      label: "منتجات منخفضة",
      value: data?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: "text-danger",
      bg: "bg-red-50",
      warning: (data?.lowStockCount ?? 0) > 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <Badge variant="warning">نسخة Beta</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold">
                    {stat.currency
                      ? fmt(stat.value as number)
                      : stat.value}
                  </p>
                </div>
              </div>
              {stat.change !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  stat.change >= 0 ? "text-success" : "text-danger"
                }`}>
                  {stat.change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  <span>{Math.abs(stat.change)}% عن أمس</span>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
          </CardHeader>
          {data?.topProducts?.length ? (
            <div className="space-y-3">
              {data.topProducts.slice(0, 5).map((product, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{fmt(product.total)}</p>
                    <p className="text-xs text-gray-500">({product.quantity} قطعة)</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4 text-center">لا توجد مبيعات بعد</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر المبيعات</CardTitle>
          </CardHeader>
          {data?.recentSales?.length ? (
            <div className="space-y-3">
              {data.recentSales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:bg-card-hover px-2 rounded-lg transition-colors"
                  onClick={() => router.push(`/sales/${sale.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium">{sale.invoiceNumber}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(sale.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{fmt(sale.total)}</p>
                    {sale.employee && (
                      <p className="text-xs text-gray-500">{sale.employee.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4 text-center">لا توجد مبيعات بعد</p>
          )}
        </Card>
      </div>
    </div>
  )
}
