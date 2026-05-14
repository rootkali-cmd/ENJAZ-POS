"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { OwnerGuard } from "@/components/layout/owner-guard"
import { Spinner } from "@/components/ui/loading"
import { Save, Store, Shield, Bot, MessageSquare, Trash2, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"

const currencies = [
  { value: "SAR", label: "ريال سعودي" },
  { value: "AED", label: "درهم إماراتي" },
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [store, setStore] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [form, setForm] = useState({
    name: "", phone: "", address: "", currency: "SAR",
    taxRate: "0", taxEnabled: false,
  })
  const [storeSettings, setStoreSettings] = useState({
    receiptFooter: "", returnPolicy: "", defaultPayment: "cash",
    lowStockAlert: true, lowStockThreshold: "5",
  })

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.store) {
        setStore(d.store)
        setForm({
          name: d.store.name || "",
          phone: d.store.phone || "",
          address: d.store.address || "",
          currency: d.store.currency || "SAR",
          taxRate: d.store.taxRate?.toString() || "0",
          taxEnabled: d.store.taxEnabled || false,
        })
        if (d.store.settings) {
          setStoreSettings({
            receiptFooter: d.store.settings.receiptFooter || "",
            returnPolicy: d.store.settings.returnPolicy || "",
            defaultPayment: d.store.settings.defaultPayment || "cash",
            lowStockAlert: d.store.settings.lowStockAlert ?? true,
            lowStockThreshold: d.store.settings.lowStockThreshold?.toString() || "5",
          })
        }
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, settings: storeSettings }),
      })
      if (res.ok) {
        toast.success("تم حفظ الإعدادات")
        const refresh = await fetch("/api/settings")
        const data = await refresh.json()
        if (data.store) {
          setForm({
            name: data.store.name || "",
            phone: data.store.phone || "",
            address: data.store.address || "",
            currency: data.store.currency || "SAR",
            taxRate: data.store.taxRate?.toString() || "0",
            taxEnabled: data.store.taxEnabled || false,
          })
        }
        router.refresh()
      } else toast.error("حدث خطأ")
    } catch { toast.error("حدث خطأ") }
    finally { setSaving(false) }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "حذف") return
    setDeleting(true)
    try {
      const res = await fetch("/api/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        toast.success("تم حذف الحساب نهائياً")
        document.cookie = "enjaz_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        router.push("/register")
      } else {
        const d = await res.json()
        toast.error(d.error || "حدث خطأ")
      }
    } catch { toast.error("حدث خطأ") }
    finally { setDeleting(false); setShowDelete(false); setDeleteConfirm("") }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-10 w-10" /></div>

  return (
    <OwnerGuard>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">الإعدادات</h1>

        <Card>
          <CardHeader>
            <CardTitle><Store size={20} className="inline ml-2" />معلومات المتجر</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="اسم المتجر" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <Input label="العنوان" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="العملة" options={currencies} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              <Input label="نسبة الضريبة (%)" type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><Shield size={20} className="inline ml-2" />إعدادات النظام</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input label="تذييل الفاتورة" value={storeSettings.receiptFooter} onChange={(e) => setStoreSettings({ ...storeSettings, receiptFooter: e.target.value })} />
            <Input label="سياسة الاستبدال والاسترجاع" value={storeSettings.returnPolicy} onChange={(e) => setStoreSettings({ ...storeSettings, returnPolicy: e.target.value })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="طريقة الدفع الافتراضية" options={[{ value: "cash", label: "كاش" }, { value: "card", label: "بطاقة" }, { value: "wallet", label: "محفظة" }, { value: "credit", label: "آجل" }]} value={storeSettings.defaultPayment} onChange={(e) => setStoreSettings({ ...storeSettings, defaultPayment: e.target.value })} />
              <Input label="حد التنبيه للمخزون" type="number" value={storeSettings.lowStockThreshold} onChange={(e) => setStoreSettings({ ...storeSettings, lowStockThreshold: e.target.value })} />
            </div>
          </div>
        </Card>

        <Button onClick={handleSave} loading={saving}><Save size={18} />حفظ الإعدادات</Button>

        <hr className="border-border my-8" />

        <Card className="border-danger/20 bg-danger/[0.02]">
          <CardHeader>
            <CardTitle className="text-danger"><AlertTriangle size={20} className="inline ml-2" />منطقة الخطر</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted">
              حذف الحساب يؤدي إلى حذف المتجر وجميع البيانات المرتبطة به نهائياً.
              <br />
              هذه العملية غير قابلة للتراجع.
            </p>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 size={18} />حذف الحساب نهائياً
            </Button>
          </div>
        </Card>
      </div>

      <Modal isOpen={showDelete} onClose={() => { setShowDelete(false); setDeleteConfirm("") }} title="حذف الحساب" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-danger/5 border border-danger/20">
            <AlertTriangle size={24} className="text-danger shrink-0" />
            <div>
              <p className="text-sm font-bold text-danger">تحذير! هذه العملية نهائية</p>
              <p className="text-xs text-muted mt-1">
                سيتم حذف المتجر وجميع المنتجات والفواتير والموظفين والبيانات نهائياً.
                لا يمكن استرجاعها بعد الحذف.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted">
            لتأكيد الحذف، اكتب <strong>"حذف"</strong> في الحقل أدناه:
          </p>

          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='اكتب "حذف" للتأكيد'
          />

          <Button
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== "حذف"}
            loading={deleting}
            variant="danger"
            className="w-full"
          >
            <Trash2 size={18} />نعم، احذف حسابي نهائياً
          </Button>
        </div>
      </Modal>
    </OwnerGuard>
  )
}
