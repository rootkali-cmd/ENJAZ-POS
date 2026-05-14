"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/table"
import { Spinner } from "@/components/ui/loading"
import { Printer, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"
import { useCurrency } from "@/contexts/currency"

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [sale, setSale] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { format: fmt } = useCurrency()

  useEffect(() => {
    fetch(`/api/sales/${id}`)
      .then(r => r.json())
      .then(d => setSale(d.sale))
      .catch(() => toast.error("الفاتورة غير موجودة"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-10 w-10" /></div>
  if (!sale) return <div className="text-center py-20 text-gray-400">الفاتورة غير موجودة</div>

  const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    completed: { label: "مكتملة", variant: "success" },
    partial_return: { label: "مرتجع جزئي", variant: "warning" },
    full_return: { label: "مرتجع كامل", variant: "danger" },
    suspended: { label: "معلقة", variant: "info" },
    cancelled: { label: "ملغية", variant: "danger" },
  }

  const st = statusLabels[sale.status] || { label: sale.status, variant: "default" as const }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const itemsHtml = sale.items.map((item: any) => `
      <tr>
        <td style="text-align:right;padding:4px 8px">${item.product?.name || "منتج"}</td>
        <td style="text-align:center;padding:4px 8px">${item.quantity}</td>
        <td style="text-align:left;padding:4px 8px">${item.price.toLocaleString()}</td>
        <td style="text-align:left;padding:4px 8px">${item.total.toLocaleString()}</td>
      </tr>
    `).join("")

    printWindow.document.write(`
      <html dir="rtl">
      <head>
        <title>فاتورة ${sale.invoiceNumber}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; direction: rtl; }
          .header { text-align: center; margin-bottom: 10px; }
          .header h2 { margin: 0; font-size: 16px; }
          .header p { margin: 2px 0; font-size: 11px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border-bottom: 1px dashed #ccc; padding: 4px 8px; }
          th { font-size: 11px; color: #666; }
          .totals { margin-top: 10px; text-align: left; }
          .totals div { display: flex; justify-content: space-between; padding: 2px 0; }
          .footer { text-align: center; margin-top: 15px; font-size: 11px; color: #666; border-top: 1px dashed #ccc; padding-top: 10px; }
          .barcode { text-align: center; margin: 10px 0; font-family: 'Libre Barcode 39', monospace; font-size: 32px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${sale.store?.name || "ENJAZ"}</h2>
          <p>فاتورة رقم: ${sale.invoiceNumber}</p>
          <p>${new Date(sale.createdAt).toLocaleString("ar-SA")}</p>
          <p>الكاشير: ${sale.employee?.name || "-"}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align:right">المنتج</th>
              <th style="text-align:center">الكمية</th>
              <th style="text-align:left">السعر</th>
              <th style="text-align:left">الإجمالي</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="totals">
          <div><span>الإجمالي الفرعي</span><span>${sale.subtotal.toLocaleString()}</span></div>
          ${sale.discount > 0 ? `<div><span>الخصم</span><span>-${sale.discount.toLocaleString()}</span></div>` : ""}
          <div style="font-size:16px;font-weight:bold;border-top:2px solid #000;padding-top:4px"><span>الإجمالي</span><span>${sale.total.toLocaleString()}</span></div>
        </div>
        <p style="text-align:center;margin-top:8px">طريقة الدفع: ${sale.paymentMethod === "cash" ? "كاش" : sale.paymentMethod === "card" ? "بطاقة" : sale.paymentMethod === "wallet" ? "محفظة" : sale.paymentMethod}</p>
        <div class="footer">
          <p>شكراً لتسوقكم معنا</p>
          <p>يمكن استبدال المنتجات خلال 7 أيام</p>
        </div>
        <script>
          window.print();
          window.onafterprint = () => window.close();
        <\/script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-card-hover rounded-lg">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-2xl font-bold">فاتورة {sale.invoiceNumber}</h1>
          <Badge variant={st.variant}>{st.label}</Badge>
        </div>
        <Button onClick={handlePrint}>
          <Printer size={18} />طباعة
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>معلومات الفاتورة</CardTitle></CardHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">رقم الفاتورة</span><span className="font-medium">{sale.invoiceNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">التاريخ</span><span>{new Date(sale.createdAt).toLocaleString("ar-SA")}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">طريقة الدفع</span><span>{sale.paymentMethod === "cash" ? "كاش" : sale.paymentMethod === "card" ? "بطاقة" : sale.paymentMethod === "wallet" ? "محفظة" : sale.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">الحالة</span><Badge variant={st.variant}>{st.label}</Badge></div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>العميل</CardTitle></CardHeader>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{sale.customer?.name || "زائر"}</p>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>الكاشير</CardTitle></CardHeader>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{sale.employee?.name || "-"}</p>
          </div>
        </Card>
      </div>

      <Card noPadding>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>المنتج</TableHeader>
              <TableHeader>الكمية</TableHeader>
              <TableHeader>السعر</TableHeader>
              <TableHeader>الخصم</TableHeader>
              <TableHeader>الإجمالي</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {sale.items?.map((item: any, i: number) => (
              <TableRow key={i}>
                <TableCell>{item.product?.name || "منتج"}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{fmt(item.price)}</TableCell>
                <TableCell>{fmt(item.discount)}</TableCell>
                <TableCell className="font-semibold">{fmt(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-end">
        <Card className="w-full lg:w-80">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">الإجمالي الفرعي</span><span>{fmt(sale.subtotal)}</span></div>
            {sale.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">الخصم</span><span className="text-danger">-{fmt(sale.discount)}</span></div>}
            {sale.tax > 0 && <div className="flex justify-between"><span className="text-gray-500">الضريبة</span><span>{fmt(sale.tax)}</span></div>}
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2"><span>الإجمالي</span><span className="text-primary">{fmt(sale.total)}</span></div>
          </div>
        </Card>
      </div>
    </div>
  )
}
