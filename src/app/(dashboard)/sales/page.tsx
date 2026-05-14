"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/table"
import { SearchInput } from "@/components/ui/search-input"
import { Spinner } from "@/components/ui/loading"
import { useCurrency } from "@/contexts/currency"
import {
  Receipt, Search, Filter, Printer, RotateCcw, XCircle, Eye
} from "lucide-react"
import toast from "react-hot-toast"

interface Sale {
  id: string
  invoiceNumber: string
  total: number
  discount: number
  paymentMethod: string
  status: string
  createdAt: string
  customer?: { id: string; name: string }
  employee?: { id: string; name: string }
  items: { product: { name: string }; quantity: number; price: number }[]
}

export default function SalesPage() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const { format: fmt } = useCurrency()

  const loadSales = async () => {
    const params = new URLSearchParams({ limit: "100" })
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    const res = await fetch(`/api/sales?${params}`)
    const data = await res.json()
    if (data.sales) setSales(data.sales)
    setLoading(false)
  }

  useEffect(() => { loadSales() }, [])
  useEffect(() => { const t = setTimeout(loadSales, 300); return () => clearTimeout(t) }, [search, statusFilter])

  const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    completed: { label: "مكتملة", variant: "success" },
    partial_return: { label: "مرتجع جزئي", variant: "warning" },
    full_return: { label: "مرتجع كامل", variant: "danger" },
    suspended: { label: "معلقة", variant: "info" },
    cancelled: { label: "ملغية", variant: "danger" },
  }

  const paymentLabels: Record<string, string> = {
    cash: "كاش", card: "بطاقة", wallet: "محفظة", credit: "آجل", mixed: "مختلط",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المبيعات</h1>
        <Button onClick={() => router.push("/pos")}>
          <Receipt size={18} />فاتورة جديدة
        </Button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="بحث برقم الفاتورة أو اسم العميل..." />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-input-bg px-3 py-2 text-sm"
        >
          <option value="">كل الحالات</option>
          <option value="completed">مكتملة</option>
          <option value="suspended">معلقة</option>
          <option value="cancelled">ملغية</option>
        </select>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>رقم الفاتورة</TableHeader>
                <TableHeader>التاريخ</TableHeader>
                <TableHeader>العميل</TableHeader>
                <TableHeader>طريقة الدفع</TableHeader>
                <TableHeader>الإجمالي</TableHeader>
                <TableHeader>الحالة</TableHeader>
                <TableHeader>الكاشير</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                    <Receipt size={40} className="mx-auto mb-3" />
                    لا توجد مبيعات
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => {
                  const st = statusLabels[sale.status] || { label: sale.status, variant: "default" as const }
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                      <TableCell className="text-gray-500 text-xs">
                        {new Date(sale.createdAt).toLocaleString("ar-SA")}
                      </TableCell>
                      <TableCell>{sale.customer?.name || "-"}</TableCell>
                      <TableCell>{paymentLabels[sale.paymentMethod] || sale.paymentMethod}</TableCell>
                      <TableCell className="font-semibold">{fmt(sale.total)}</TableCell>
                      <TableCell>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">{sale.employee?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <button
                            onClick={() => router.push(`/sales/${sale.id}`)}
                            className="p-1.5 text-gray-400 hover:text-info transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {/* print */ }}
                            className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
