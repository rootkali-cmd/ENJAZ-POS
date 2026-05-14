"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { OwnerGuard } from "@/components/layout/owner-guard"
import { Spinner } from "@/components/ui/loading"
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Package, AlertTriangle, ArrowUp, ArrowDown
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useCurrency } from "@/contexts/currency"

const COLORS = ["#7c3aed", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#94a3b8"]

export default function ReportsPage() {
  const [period, setPeriod] = useState("today")
  const [summary, setSummary] = useState<any>(null)
  const [productReport, setProductReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { format: fmt } = useCurrency()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/reports?type=sales_summary&period=${period}`).then(r => r.json()),
      fetch("/api/reports?type=products").then(r => r.json()),
    ]).then(([s, p]) => {
      setSummary(s)
      setProductReport(p)
    }).finally(() => setLoading(false))
  }, [period])

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-10 w-10" /></div>

  const paymentData = summary?.paymentMethods
    ? Object.entries(summary.paymentMethods).map(([key, value]) => ({
        name: key === "cash" ? "كاش" : key === "card" ? "بطاقة" : key === "wallet" ? "محفظة" : key === "credit" ? "آجل" : key,
        value,
      }))
    : []

  return (
    <OwnerGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">التقارير</h1>
          <Select
            options={[
              { value: "today", label: "اليوم" },
              { value: "week", label: "هذا الأسبوع" },
              { value: "month", label: "هذا الشهر" },
            ]}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <DollarSign className="text-success" size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-500">إجمالي المبيعات</p>
                <p className="text-xl font-bold">{fmt(summary?.totalSales || 0)}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <TrendingUp className="text-primary" size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-500">صافي الربح</p>
                <p className="text-xl font-bold">{fmt(summary?.totalProfit || 0)}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShoppingCart className="text-info" size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-500">عدد العمليات</p>
                <p className="text-xl font-bold">{summary?.transactionCount || 0}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Package className="text-warning" size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-500">متوسط الفاتورة</p>
                <p className="text-xl font-bold">{fmt(summary?.averageOrder || 0)}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>طرق الدفع</CardTitle></CardHeader>
            {paymentData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-gray-400 text-sm py-8 text-center">لا توجد بيانات</p>}
          </Card>

          <Card>
            <CardHeader><CardTitle>المخزون</CardTitle></CardHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">قيمة المخزون</span>
                <span className="font-semibold">{fmt(productReport?.totalValue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">تكلفة المخزون</span>
                <span className="font-semibold">{fmt(productReport?.totalCost || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">الربح المتوقع</span>
                <span className="font-semibold text-success">{fmt(productReport?.potentialProfit || 0)}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <AlertTriangle size={14} className="text-danger" />
                  منتجات منخفضة
                </span>
                <Badge variant="danger">{productReport?.lowStockCount || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <AlertTriangle size={14} className="text-warning" />
                  منتجات نفذت
                </span>
                <Badge variant="warning">{productReport?.outOfStockCount || 0}</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </OwnerGuard>
  )
}
