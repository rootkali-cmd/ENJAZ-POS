"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/table"
import { SearchInput } from "@/components/ui/search-input"
import { Spinner } from "@/components/ui/loading"
import { useCurrency } from "@/contexts/currency"
import { Plus, Wallet, Filter, Edit, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

const expenseCategories = [
  { value: "rent", label: "إيجار" },
  { value: "salaries", label: "رواتب" },
  { value: "utilities", label: "فواتير" },
  { value: "maintenance", label: "صيانة" },
  { value: "supplies", label: "مستلزمات" },
  { value: "marketing", label: "تسويق" },
  { value: "transport", label: "نقل" },
  { value: "other", label: "أخرى" },
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editExpense, setEditExpense] = useState<any | null>(null)
  const [form, setForm] = useState({ category: "", amount: "", description: "", date: "" })
  const [saving, setSaving] = useState(false)
  const [total, setTotal] = useState(0)

  const { format: fmt } = useCurrency()

  const load = async () => {
    const params = new URLSearchParams()
    if (categoryFilter) params.set("category", categoryFilter)
    const res = await fetch(`/api/expenses?${params}`)
    const d = await res.json()
    if (d.expenses) setExpenses(d.expenses)
    setTotal(d.total || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [categoryFilter])

  const handleAdd = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/expenses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success("تمت إضافة المصروف"); setShowAdd(false); setForm({ category: "", amount: "", description: "", date: "" }); load() }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
    finally { setSaving(false) }
  }

  const openEdit = (expense: any) => {
    setEditExpense(expense)
    setForm({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || "",
      date: expense.date ? expense.date.split("T")[0] : "",
    })
    setShowEdit(true)
  }

  const handleEdit = async () => {
    if (!editExpense) return
    setSaving(true)
    try {
      const res = await fetch(`/api/expenses/${editExpense.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success("تم تحديث المصروف"); setShowEdit(false); setEditExpense(null); setForm({ category: "", amount: "", description: "", date: "" }); load() }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
    finally { setSaving(false) }
  }

  const handleDelete = async (expense: any) => {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" })
      if (res.ok) { toast.success("تم حذف المصروف"); load() }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المصروفات</h1>
        <Button onClick={() => setShowAdd(true)}><Plus size={18} />إضافة مصروف</Button>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <div className="flex items-center justify-between">
          <span className="font-medium text-amber-800">إجمالي المصروفات</span>
          <span className="text-2xl font-bold text-amber-800">{fmt(total)}</span>
        </div>
      </Card>

      <div className="flex gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-input-bg px-3 py-2 text-sm"
        >
          <option value="">كل المصروفات</option>
          {expenseCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <Card noPadding>
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>التاريخ</TableHeader>
                <TableHeader>النوع</TableHeader>
                <TableHeader>الوصف</TableHeader>
                <TableHeader>المبلغ</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-400"><Wallet size={40} className="mx-auto mb-3" />لا توجد مصروفات</TableCell></TableRow>
              ) : expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString("ar-SA")}</TableCell>
                  <TableCell>{expenseCategories.find(c => c.value === e.category)?.label || e.category}</TableCell>
                  <TableCell className="text-gray-500">{e.description || "-"}</TableCell>
                  <TableCell className="font-semibold text-danger">{fmt(e.amount)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-info transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(e)} className="p-1.5 text-gray-400 hover:text-danger transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="إضافة مصروف" size="sm">
        <div className="space-y-4">
          <Select label="نوع المصروف" options={expenseCategories} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="اختر النوع" />
          <Input label="المبلغ" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <Input label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="التاريخ" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Button onClick={handleAdd} loading={saving} className="w-full">إضافة</Button>
        </div>
      </Modal>

      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setEditExpense(null) }} title="تعديل مصروف" size="sm">
        <div className="space-y-4">
          <Select label="نوع المصروف" options={expenseCategories} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="اختر النوع" />
          <Input label="المبلغ" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <Input label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="التاريخ" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Button onClick={handleEdit} loading={saving} className="w-full">حفظ التغييرات</Button>
        </div>
      </Modal>
    </div>
  )
}
