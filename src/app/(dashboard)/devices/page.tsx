"use client"

import { useEffect, useState } from "react"
import { OwnerGuard } from "@/components/layout/owner-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"
import { Monitor, Plus, RefreshCw, Wifi, WifiOff, HelpCircle, Printer, Camera, Barcode, Scale, Usb, Cpu, Eye, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

const STATUS_LABELS: Record<string, string> = {
  connected: "متصل", disconnected: "غير متصل", unknown: "غير معروف",
  unsupported: "غير مدعوم من المتصفح", needs_setup: "يحتاج إعداد", needs_helper: "يحتاج ENJAZ Device Helper", error: "خطأ",
}

const STATUS_COLORS: Record<string, string> = {
  connected: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  disconnected: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  unsupported: "bg-red-500/10 text-red-400 border-red-500/20",
  needs_helper: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  needs_setup: "bg-blue-500/10 text-blue-400 border-blue-500/20",
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  barcode_scanner: <Barcode size={16} />, receipt_printer: <Printer size={16} />, camera: <Camera size={16} />,
  scale: <Scale size={16} />, cash_drawer: <Cpu size={16} />,
}

interface Device {
  id: string; name: string; type: string; connectionType: string; status: string
  vendorId?: string; productId?: string; manufacturer?: string; productName?: string
  requiresHelper: boolean; lastSeenAt?: string; lastTestAt?: string; aiAnalysis?: any
  _count?: { eventLogs: number }
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [summary, setSummary] = useState({ total: 0, connected: 0, needsSetup: 0, unsupported: 0 })
  const [loading, setLoading] = useState(true)
  const [showManual, setShowManual] = useState(false)
  const [manualForm, setManualForm] = useState({ name: "", type: "unknown", connectionType: "manual" })
  const [saving, setSaving] = useState(false)

  const loadDevices = async () => {
    try {
      const res = await fetch("/api/devices")
      const d = await res.json()
      if (d.devices) setDevices(d.devices)
      if (d.summary) setSummary(d.summary)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { loadDevices() }, [])

  const handleAddManual = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/devices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualForm),
      })
      if (res.ok) { toast.success("تم إضافة الجهاز"); setShowManual(false); setManualForm({ name: "", type: "unknown", connectionType: "manual" }); loadDevices() }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`حذف ${name}؟`)) return
    try {
      await fetch(`/api/devices/${id}`, { method: "DELETE" })
      toast.success("تم حذف الجهاز"); loadDevices()
    } catch { toast.error("حدث خطأ") }
  }

  const handleTest = async (deviceId: string, type: string) => {
    try {
      await fetch("/api/devices/test", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, deviceType: type, success: true, message: "اختبار يدوي" }),
      })
      toast.success(`تم اختبار ${type === "barcode_scanner" ? "قارئ الباركود" : "الجهاز"}`)
      loadDevices()
    } catch { toast.error("حدث خطأ") }
  }

  const handleAnalyze = async (deviceId: string) => {
    try {
      const res = await fetch("/api/devices/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      })
      const d = await res.json()
      if (d.analysis) toast.success(d.analysis.reason)
      loadDevices()
    } catch { toast.error("حدث خطأ") }
  }

  return (
    <OwnerGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">مركز الأجهزة</h1>
            <p className="text-sm text-muted mt-1">تابع الأجهزة المتصلة بمتجرك، اختبر حالتها، واضبط إعدادات نقطة البيع.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadDevices}><RefreshCw size={16} />فحص الأجهزة</Button>
            <Button onClick={() => setShowManual(true)}><Plus size={16} />إضافة جهاز يدويًا</Button>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300">
          بعض الأجهزة لا يمكن التحكم فيها مباشرة من المتصفح وتحتاج إلى ENJAZ Device Helper.
          سيقوم ENJAZ بمحاولة التعرف على الجهاز واقتراح أفضل طريقة تشغيل.
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "الأجهزة المتصلة", value: summary.connected, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <Wifi size={18} /> },
            { label: "تحتاج إعداد", value: summary.needsSetup, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: <HelpCircle size={18} /> },
            { label: "غير مدعومة", value: summary.unsupported, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: <WifiOff size={18} /> },
            { label: "إجمالي الأجهزة", value: summary.total, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: <Monitor size={18} /> },
          ].map((card, i) => (
            <div key={i} className={`rounded-2xl border ${card.bg} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={card.color}>{card.icon}</span>
                <span className={`text-xs ${card.color}`}>{card.label}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Detection Tools */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "اختبار قارئ الباركود", action: () => { const el = document.createElement("input"); el.type = "text"; el.placeholder = "امسح باركود..."; el.className = "fixed -top-10"; document.body.appendChild(el); el.focus(); el.onblur = () => document.body.removeChild(el); el.onkeydown = (e) => { if (e.key === "Enter" && el.value) { handleTest("", "barcode_scanner"); document.body.removeChild(el) } } } },
            { label: "اختبار الطابعة", action: () => { window.print(); handleTest("", "receipt_printer") } },
            { label: "اختبار الكاميرا", action: () => { navigator.mediaDevices?.getUserMedia({ video: true }).then(() => { toast.success("الكاميرا تعمل"); handleTest("", "camera") }).catch(() => toast.error("تم رفض الوصول للكاميرا")) } },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm hover:bg-violet-500/20 transition">
              {btn.label}
            </button>
          ))}
        </div>

        {/* Devices List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="rounded-2xl border border-white/10 bg-[#111114]/80 p-5 animate-pulse"><div className="h-4 w-48 bg-white/5 rounded" /></div>)}
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-20">
            <Monitor size={48} className="mx-auto mb-4 text-muted" />
            <h3 className="text-lg font-bold mb-2">لم يتم اكتشاف أجهزة بعد</h3>
            <p className="text-sm text-muted mb-6">ابدأ باختبار قارئ الباركود أو الطابعة، أو أضف جهازًا يدويًا.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="rounded-2xl border border-white/10 bg-[#111114]/80 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-300">
                      {TYPE_ICONS[device.type] || <Monitor size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{device.name}</p>
                      <p className="text-xs text-muted">{device.type === "barcode_scanner" ? "قارئ باركود" : device.type === "receipt_printer" ? "طابعة فواتير" : device.type}</p>
                    </div>
                  </div>
                  <Badge variant={device.status === "connected" ? "success" : device.status === "error" ? "danger" : "info"} className="text-[10px]">
                    {STATUS_LABELS[device.status] || device.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted mb-4">
                  {device.connectionType && <span>الاتصال: {device.connectionType}</span>}
                  {device.manufacturer && <span>الشركة: {device.manufacturer}</span>}
                  {device.requiresHelper && <span className="text-amber-400">يحتاج Desktop Helper</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleTest(device.id, device.type)} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition">اختبار</button>
                  <button onClick={() => handleAnalyze(device.id)} className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition">تحليل AI</button>
                  <button onClick={() => handleDelete(device.id, device.name)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition"><Trash2 size={12} /></button>
                </div>
                {device.aiAnalysis && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-xs text-white/50">
                    <p>تحليل AI: {device.aiAnalysis.reason}</p>
                    {device.aiAnalysis.requiresDesktopHelper && <p className="text-amber-400 mt-1">يحتاج ENJAZ Device Helper</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Manual Add Modal */}
        <Modal isOpen={showManual} onClose={() => setShowManual(false)} title="إضافة جهاز يدويًا" size="sm">
          <div className="space-y-4">
            <Input label="اسم الجهاز" value={manualForm.name} onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">نوع الجهاز</label>
              <select value={manualForm.type} onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })} className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm">
                {["barcode_scanner","receipt_printer","label_printer","cash_drawer","scale","camera","customer_display","keyboard","unknown"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleAddManual} loading={saving} className="w-full">إضافة</Button>
          </div>
        </Modal>
      </div>
    </OwnerGuard>
  )
}
