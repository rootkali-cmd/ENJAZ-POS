"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/table"
import { SearchInput } from "@/components/ui/search-input"
import { Spinner } from "@/components/ui/loading"
import { useCurrency } from "@/contexts/currency"
import { Edit, Plus, Trash2, Truck } from "lucide-react"
import toast from "react-hot-toast"

type Supplier = {
  id: string
  name: string
  phone?: string | null
  notes?: string | null
  totalPaid: number
  totalDue: number
  _count?: { products: number }
}

const emptyForm = { name: "", phone: "", notes: "" }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const { format: fmt } = useCurrency()

  const load = async () => {
    const params = new URLSearchParams({ limit: "100" })
    if (search) params.set("search", search)
    const res = await fetch(`/api/suppliers?${params}`)
    const data = await res.json()
    if (data.suppliers) setSuppliers(data.suppliers)
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search])

  const openAdd = () => {
    setEditingSupplier(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setForm({ name: supplier.name, phone: supplier.phone || "", notes: supplier.notes || "" })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingSupplier(null)
    setForm(emptyForm)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(editingSupplier ? `/api/suppliers/${editingSupplier.id}` : "/api/suppliers", {
        method: editingSupplier ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success(editingSupplier ? "تم تعديل المورد" : "تمت إضافة المورد"); closeForm(); load() }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
    finally { setSaving(false) }
  }

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`حذف المورد ${supplier.name}؟ سيتم إزالة ربطه من المنتجات المرتبطة به.`)) return
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, { method: "DELETE" })
      if (res.ok) { toast.success("تم حذف المورد"); load() }
      else { const d = await res.json(); toast.error(d.error || "تعذر حذف المورد") }
    } catch { toast.error("حدث خطأ") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الموردين</h1>
        <Button onClick={openAdd}><Plus size={18} />إضافة مورد</Button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="بحث باسم المورد..." />
      <Card noPadding>
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>المورد</TableHeader>
                <TableHeader>رقم الهاتف</TableHeader>
                <TableHeader>عدد المنتجات</TableHeader>
                <TableHeader>المدفوع</TableHeader>
                <TableHeader>المستحق</TableHeader>
                <TableHeader>إجراءات</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-400"><Truck size={40} className="mx-auto mb-3" />لا يوجد موردين</TableCell></TableRow>
              ) : suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><p className="font-medium">{s.name}</p></TableCell>
                  <TableCell dir="ltr" className="text-left">{s.phone || "-"}</TableCell>
                  <TableCell>{s._count?.products || 0}</TableCell>
                  <TableCell className="font-semibold text-success">{fmt(s.totalPaid)}</TableCell>
                  <TableCell className="font-semibold text-danger">{fmt(s.totalDue)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-info transition-colors" title="تعديل">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(s)} className="p-1.5 text-gray-400 hover:text-danger transition-colors" title="حذف">
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

      <Modal isOpen={showForm} onClose={closeForm} title={editingSupplier ? "تعديل مورد" : "إضافة مورد"} size="sm">
        <div className="space-y-4">
          <Input label="اسم المورد" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button onClick={handleSave} loading={saving} className="w-full">{editingSupplier ? "حفظ التعديل" : "إضافة"}</Button>
        </div>
      </Modal>
    </div>
  )
}
