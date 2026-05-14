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
import { Select } from "@/components/ui/select"
import { OwnerGuard } from "@/components/layout/owner-guard"
import { useCurrency } from "@/contexts/currency"
import { Edit, Plus, Trash2, Users2 } from "lucide-react"
import toast from "react-hot-toast"

const roleOptions = [
  { value: "cashier", label: "كاشير" },
  { value: "branch_manager", label: "مدير فرع" },
  { value: "warehouse", label: "مخزن" },
  { value: "accountant", label: "محاسب" },
  { value: "manager", label: "مدير" },
]

const salaryTypeOptions = [
  { value: "monthly", label: "شهري" },
  { value: "daily", label: "يومي" },
  { value: "hourly", label: "بالساعة" },
]

const roleLabels: Record<string, string> = {
  cashier: "كاشير", branch_manager: "مدير فرع", warehouse: "مخزن", accountant: "محاسب", manager: "مدير",
}

type Employee = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  role: string
  salary: number
  salaryType: string
  canGiveDiscount: boolean
  canProcessReturns: boolean
  canAccessProtected: boolean
  _count?: { sales: number }
}

const emptyForm = { name: "", phone: "", email: "", role: "cashier", salary: "", salaryType: "monthly", password: "" }
const emptyPermissions = { canGiveDiscount: false, canProcessReturns: false, canAccessProtected: false }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [permissions, setPermissions] = useState(emptyPermissions)
  const [saving, setSaving] = useState(false)

  const { format: fmt } = useCurrency()

  const load = async () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    const res = await fetch(`/api/employees?${params}`)
    const d = await res.json()
    if (d.employees) setEmployees(d.employees)
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search])

  const openAdd = () => {
    setEditingEmployee(null)
    setForm(emptyForm)
    setPermissions(emptyPermissions)
    setShowForm(true)
  }

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setForm({
      name: employee.name,
      phone: employee.phone || "",
      email: employee.email || "",
      role: employee.role,
      salary: String(employee.salary || ""),
      salaryType: employee.salaryType || "monthly",
      password: "",
    })
    setPermissions({
      canGiveDiscount: employee.canGiveDiscount,
      canProcessReturns: employee.canProcessReturns,
      canAccessProtected: employee.canAccessProtected,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingEmployee(null)
    setForm(emptyForm)
    setPermissions(emptyPermissions)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        ...permissions,
        salary: parseFloat(form.salary || "0"),
        ...(editingEmployee || !form.password ? {} : { password: form.password }),
        ...(editingEmployee && form.password ? { password: form.password } : {}),
      }
      const res = await fetch(editingEmployee ? `/api/employees/${editingEmployee.id}` : "/api/employees", {
        method: editingEmployee ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) { toast.success(editingEmployee ? "تم تعديل الموظف" : "تمت إضافة الموظف"); closeForm(); load() }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
    finally { setSaving(false) }
  }

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`حذف الموظف ${employee.name}؟ سيتم تعطيله ولن يظهر في القائمة.`)) return
    try {
      const res = await fetch(`/api/employees/${employee.id}`, { method: "DELETE" })
      if (res.ok) { toast.success("تم حذف الموظف"); load() }
      else { const d = await res.json(); toast.error(d.error || "تعذر حذف الموظف") }
    } catch { toast.error("حدث خطأ") }
  }

  return (
    <OwnerGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">الموظفين</h1>
          <Button onClick={openAdd}><Plus size={18} />إضافة موظف</Button>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث باسم الموظف..." />
        <Card noPadding>
          {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>الموظف</TableHeader>
                  <TableHeader>الدور</TableHeader>
                  <TableHeader>الراتب</TableHeader>
                  <TableHeader>المبيعات</TableHeader>
                  <TableHeader>الصلاحيات</TableHeader>
                  <TableHeader>إجراءات</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-400"><Users2 size={40} className="mx-auto mb-3" />لا يوجد موظفين</TableCell></TableRow>
                ) : employees.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell><p className="font-medium">{e.name}</p></TableCell>
                    <TableCell><Badge variant="info">{roleLabels[e.role] || e.role}</Badge></TableCell>
                    <TableCell className="font-semibold">{fmt(e.salary)}</TableCell>
                    <TableCell>{e._count?.sales || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {e.canGiveDiscount && <Badge variant="success">خصم</Badge>}
                        {e.canProcessReturns && <Badge variant="warning">مرتجع</Badge>}
                        {e.canAccessProtected && <Badge variant="info">محمي</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-info transition-colors" title="تعديل">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(e)} className="p-1.5 text-gray-400 hover:text-danger transition-colors" title="حذف">
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

        <Modal isOpen={showForm} onClose={closeForm} title={editingEmployee ? "تعديل موظف" : "إضافة موظف"} size="lg">
          <div className="space-y-4">
            <Input label="اسم الموظف" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="الدور" options={roleOptions} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              <Select label="نوع الراتب" options={salaryTypeOptions} value={form.salaryType} onChange={(e) => setForm({ ...form, salaryType: e.target.value })} />
            </div>
            <Input label="الراتب" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            <Input label={editingEmployee ? "كلمة مرور جديدة" : "كلمة مرور الموظف"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="اختياري" />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">الصلاحيات</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={permissions.canGiveDiscount} onChange={(e) => setPermissions({ ...permissions, canGiveDiscount: e.target.checked })} className="rounded border-border bg-input-bg text-primary" />
                  السماح بالخصم
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={permissions.canProcessReturns} onChange={(e) => setPermissions({ ...permissions, canProcessReturns: e.target.checked })} className="rounded border-border bg-input-bg text-primary" />
                  السماح بالمرتجعات
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={permissions.canAccessProtected} onChange={(e) => setPermissions({ ...permissions, canAccessProtected: e.target.checked })} className="rounded border-border bg-input-bg text-primary" />
                  الوصول للمناطق المحمية
                </label>
              </div>
            </div>
            <Button onClick={handleSave} loading={saving} className="w-full">{editingEmployee ? "حفظ التعديل" : "إضافة"}</Button>
          </div>
        </Modal>
      </div>
    </OwnerGuard>
  )
}
