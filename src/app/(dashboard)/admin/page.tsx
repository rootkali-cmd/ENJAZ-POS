"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { OwnerGuard } from "@/components/layout/owner-guard"
import { Spinner } from "@/components/ui/loading"
import {
  Shield, Store, Bot, MessageSquare, Package, ShoppingCart, Users, DollarSign,
  Sparkles, ExternalLink, Send, Bug, Lightbulb, CheckCircle, Clock
} from "lucide-react"
import toast from "react-hot-toast"

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState("")
  const [feedbackType, setFeedbackType] = useState("feedback")
  const [sendingFeedback, setSendingFeedback] = useState(false)

  useEffect(() => {
    fetch("/api/admin").then(r => r.json()).then(d => {
      setData(d)
    }).finally(() => setLoading(false))
  }, [])

  const handleSendFeedback = async () => {
    if (!feedback) return
    setSendingFeedback(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: feedbackType, message: feedback }),
      })
      if (res.ok) { toast.success("تم إرسال الملاحظات ✓"); setFeedback("") }
      else { const d = await res.json(); toast.error(d.error) }
    } catch { toast.error("حدث خطأ") }
    finally { setSendingFeedback(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-10 w-10" /></div>

  const stats = [
    { label: "المنتجات", value: data?.stats?.totalProducts || 0, icon: Package, color: "text-primary", bg: "bg-purple-50" },
    { label: "المبيعات", value: data?.stats?.totalSales || 0, icon: ShoppingCart, color: "text-success", bg: "bg-green-50" },
    { label: "العملاء", value: data?.stats?.totalCustomers || 0, icon: Users, color: "text-info", bg: "bg-blue-50" },
    { label: "الموظفين", value: data?.stats?.totalEmployees || 0, icon: Users, color: "text-warning", bg: "bg-amber-50" },
  ]

  return (
    <OwnerGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
          <Badge variant={data?.store?.isBeta ? "warning" : "success"}>
            {data?.store?.isBeta ? "نسخة Beta" : "نشط"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={stat.color} size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="ai-agent-admin-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Agent</h3>
                <p className="text-sm text-gray-500">مساعد إدارة المتجر الذكي</p>
              </div>
            </div>
            <Button onClick={() => router.push("/ai-agent")}>
              <Bot size={16} />فتح AI Agent
              <ExternalLink size={14} />
            </Button>
          </div>
          {data?.aiUsage && (
            <div className="mt-3 text-xs text-gray-500 flex gap-4">
              <span>إجمالي الاستخدام: {data.aiUsage.totalUsed} رسالة</span>
              <span>آخر استخدام: {data.aiUsage.lastUsedAt ? new Date(data.aiUsage.lastUsedAt).toLocaleString("ar-SA") : "لم يستخدم"}</span>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <MessageSquare size={20} className="inline ml-2" />
              ساعدنا في تحسين ENJAZ
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              رسائلك توصلني على تيليجرام مباشرة. أرسل اقتراحاتك أو المشاكل اللي وجهتك.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFeedbackType("feedback")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  feedbackType === "feedback"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-card-hover text-muted hover:bg-border"
                }`}
              >
                <Lightbulb size={16} />
                اقتراح
              </button>
              <button
                onClick={() => setFeedbackType("bug")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  feedbackType === "bug"
                    ? "bg-danger text-white shadow-sm"
                    : "bg-card-hover text-muted hover:bg-border"
                }`}
              >
                <Bug size={16} />
                مشكلة
              </button>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={feedbackType === "feedback" ? "اكتب اقتراحك هنا..." : "صِف المشكلة اللي وجهتها..."}
              className="w-full rounded-xl border border-border bg-input-bg px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                <Send size={12} className="inline ml-1" />
                سيتم إرسال الرسالة إلى تيليجرام فريق ENJAZ
              </span>
              <Button onClick={handleSendFeedback} loading={sendingFeedback}>
                <Send size={16} />إرسال
              </Button>
            </div>
          </div>
        </Card>

        {data?.feedback?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock size={20} className="inline ml-2" />
                سجل الملاحظات المرسلة
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {data.feedback.map((f: any) => (
                <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl bg-card-hover border border-border">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    f.type === "bug" ? "bg-red-100" : "bg-primary/10"
                  }`}>
                    {f.type === "bug" ? (
                      <Bug size={16} className="text-danger" />
                    ) : (
                      <Lightbulb size={16} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={f.type === "bug" ? "danger" : "info"} className="text-xs">
                        {f.type === "bug" ? "مشكلة" : "اقتراح"}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(f.createdAt).toLocaleString("ar-SA")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{f.message}</p>
                  </div>
                  <CheckCircle size={16} className="text-success shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </OwnerGuard>
  )
}
