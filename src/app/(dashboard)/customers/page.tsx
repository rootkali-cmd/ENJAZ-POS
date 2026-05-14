"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/search-input"
import { Spinner } from "@/components/ui/loading"
import { useCurrency } from "@/contexts/currency"
import { Plus, Users, Phone, MapPin, Edit, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

interface Customer {
  id: string
  name: string
  phone: string
  address: string
  totalPurchases: number
  lastPurchaseAt: string
  creditAmount: number
  notes: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" })
  const [saving, setSaving] = useState(false)

  const { format: fmt } = useCurrency()

  const load = async () => {
    const params = new URLSearchParams({ limit: "100" })
    if (search) params.set("search", search)
    const res = await fetch(`/api/customers?${params}`)
    const data = await res.json()
    if (data.customers) setCustomers(data.customers)
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search])

  const handleAdd = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success("تمت إضافة العميل"); setShowAdd(false); setForm({ name: "", phone: "", address: "", notes: "" }); load() }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
    finally { setSaving(false) }
  }

  const openEdit = (customer: Customer) => {
    setEditCustomer(customer)
    setForm({ name: customer.name, phone: customer.phone || "", address: customer.address || "", notes: customer.notes || "" })
    setShowEdit(true)
  }

  const handleEdit = async () => {
    if (!editCustomer) return
    setSaving(true)
    try {
      const res = await fetch(`/api/customers/${editCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success("تم تحديث العميل"); setShowEdit(false); setEditCustomer(null); setForm({ name: "", phone: "", address: "", notes: "" }); load() }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
    finally { setSaving(false) }
  }

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`هل أنت متأكد من حذف ${customer.name}؟`)) return
    try {
      const res = await fetch(`/api/customers/${customer.id}`, { method: "DELETE" })
      if (res.ok) { toast.success("تم حذف العميل"); load() }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">العملاء</h1>
        <Button onClick={() => setShowAdd(true)}><Plus size={18} />إضافة عميل</Button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="بحث باسم العميل أو رقم الهاتف..." />
      <Card noPadding>
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>العميل</TableHeader>
                <TableHeader>رقم الهاتف</TableHeader>
                <TableHeader>إجمالي المشتريات</TableHeader>
                <TableHeader>آخر عملية</TableHeader>
                <TableHeader>الديون</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-400"><Users size={40} className="mx-auto mb-3" />لا يوجد عملاء</TableCell></TableRow>
              ) : customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell><p className="font-medium">{c.name}</p></TableCell>
                  <TableCell dir="ltr" className="text-left">{c.phone || "-"}</TableCell>
                  <TableCell className="font-semibold">{fmt(c.totalPurchases)}</TableCell>
                  <TableCell className="text-xs text-gray-500">{c.lastPurchaseAt ? new Date(c.lastPurchaseAt).toLocaleDateString("ar-SA") : "-"}</TableCell>
                  <TableCell><Badge variant={c.creditAmount > 0 ? "danger" : "success"}>{fmt(c.creditAmount)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-info transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(c)} className="p-1.5 text-gray-400 hover:text-danger transition-colors">
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="إضافة عميل" size="sm">
        <div className="space-y-4">
          <Input label="اسم العميل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="العنوان" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button onClick={handleAdd} loading={saving} className="w-full">إضافة</Button>
        </div>
      </Modal>

      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setEditCustomer(null) }} title="تعديل عميل" size="sm">
        <div className="space-y-4">
          <Input label="اسم العميل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="العنوان" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button onClick={handleEdit} loading={saving} className="w-full">حفظ التغييرات</Button>
        </div>
      </Modal>
    </div>
  )
}
