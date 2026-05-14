"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Check, Store, ShoppingCart, Package, Gift, Phone, Lock, Sparkles, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import toast from "react-hot-toast"

const currencies = [
  { value: "SAR", label: "ريال سعودي (SAR)" },
  { value: "AED", label: "درهم إماراتي (AED)" },
  { value: "EGP", label: "جنيه مصري (EGP)" },
  { value: "QAR", label: "ريال قطري (QAR)" },
  { value: "KWD", label: "دينار كويتي (KWD)" },
  { value: "USD", label: "دولار أمريكي (USD)" },
]

const countryCodes = [
  { value: "+966", label: "🇸🇦 +966", country: "SA" },
  { value: "+20", label: "🇪🇬 +20", country: "EG" },
  { value: "+971", label: "🇦🇪 +971", country: "AE" },
  { value: "+974", label: "🇶🇦 +974", country: "QA" },
  { value: "+965", label: "🇰🇼 +965", country: "KW" },
  { value: "+973", label: "🇧🇭 +973", country: "BH" },
  { value: "+968", label: "🇴🇲 +968", country: "OM" },
  { value: "+962", label: "🇯🇴 +962", country: "JO" },
  { value: "+961", label: "🇱🇧 +961", country: "LB" },
  { value: "+249", label: "🇸🇩 +249", country: "SD" },
  { value: "+963", label: "🇸🇾 +963", country: "SY" },
  { value: "+967", label: "🇾🇪 +967", country: "YE" },
  { value: "+218", label: "🇱🇾 +218", country: "LY" },
  { value: "+216", label: "🇹🇳 +216", country: "TN" },
  { value: "+213", label: "🇩🇿 +213", country: "DZ" },
  { value: "+212", label: "🇲🇦 +212", country: "MA" },
  { value: "+1", label: "🇺🇸 +1", country: "US" },
  { value: "+44", label: "🇬🇧 +44", country: "GB" },
]

const activities = [
  { value: "supermarket", label: "سوبر ماركت" },
  { value: "restaurant", label: "مطعم" },
  { value: "clothing", label: "ملابس" },
  { value: "electronics", label: "إلكترونيات" },
  { value: "pharmacy", label: "صيدلية" },
  { value: "hardware", label: "أجهزة ومنزلية" },
  { value: "other", label: "أخرى" },
]

const successSteps = [
  {
    icon: Store,
    title: "مرحباً بك في ENJAZ",
    description: "نظام إدارة المتاجر الذكي. تم إنشاء متجرك بنجاح!",
  },
  {
    icon: Package,
    title: "أضف منتجاتك",
    description: "ابدأ بإضافة منتجاتك مع الباركود والأسعار والكميات.",
  },
  {
    icon: ShoppingCart,
    title: "جهز نقطة البيع",
    description: "شاشة الكاشير جاهزة. قم بتوصيل قارئ الباركود وطابعة الفواتير.",
  },
  {
    icon: Gift,
    title: "beta مجاني",
    description: "المتجر في وضع Beta. استمتع بجميع المميزات مجاناً!",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [storeCreated, setStoreCreated] = useState(false)
  const [successStep, setSuccessStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [form, setForm] = useState({
    storeName: "",
    activity: "",
    countryCode: "+966",
    phone: "",
    currency: "SAR",
    address: "",
    ownerPin: "",
  })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) { router.push("/login"); return }
        if (data.user.storeId) { router.push("/dashboard"); return }
        setChecking(false)
      })
      .catch(() => router.push("/login"))
  }, [router])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = "0"
      containerRef.current.style.transform = "translateY(20px)"
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = "all 0.4s ease-out"
            containerRef.current.style.opacity = "1"
            containerRef.current.style.transform = "translateY(0)"
          }
        }, 50)
      })
    }
  }, [step, storeCreated, successStep])

  const handleCreateStore = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone ? `${form.countryCode}${form.phone}` : "",
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("تم إنشاء المتجر!")
        setStoreCreated(true)
      } else {
        toast.error(data.error || "حدث خطأ")
      }
    } catch {
      toast.error("حدث خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (storeCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
        <div className="w-full max-w-lg" ref={containerRef}>
          <div className="bg-card rounded-2xl border border-border shadow-xl p-8 text-center">
            {successStep < successSteps.length ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 animate-fadeIn">
                  {(() => {
                    const Icon = successSteps[successStep].icon
                    return <Icon size={40} className="text-primary" />
                  })()}
                </div>

                <h2 className="text-xl font-bold mb-2">{successSteps[successStep].title}</h2>
                <p className="text-gray-500 mb-6">{successSteps[successStep].description}</p>

                <div className="flex justify-center gap-2 mb-6">
                  {successSteps.map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === successStep ? "bg-primary scale-125" : "bg-gray-200"}`} />
                  ))}
                </div>

                <Button
                  onClick={() => {
                    if (successStep < successSteps.length - 1) {
                      setSuccessStep(successStep + 1)
                    } else {
                      router.push("/dashboard")
                    }
                  }}
                  className="w-full"
                >
                  {successStep < successSteps.length - 1 ? "التالي" : "ابدأ الآن"}
                </Button>
                <button onClick={() => router.push("/dashboard")} className="mt-3 text-sm text-gray-400 hover:text-foreground">
                  تخطي
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
      <div className="w-full max-w-lg" ref={containerRef}>
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 mb-4">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">إعداد المتجر</h1>
          <p className="text-gray-500 mt-1">أهلاً بك! خطوات بسيطة لتجهيز متجرك</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                s <= step ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" : "bg-card-hover text-muted"
              }`}>
                {s < step ? <Check size={18} /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 rounded transition-all duration-500 ${s < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 space-y-4">
          {/* Step 1: Store Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Store size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">معلومات المتجر</h2>
                  <p className="text-xs text-muted">البيانات الأساسية لمتجرك</p>
                </div>
              </div>
              <Input label="اسم المتجر" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} icon={<Store size={18} />} placeholder="متجر ENJAZ" />
              <Select label="نوع النشاط" options={activities} value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} placeholder="اختر النشاط" />
              <Select label="العملة" options={currencies} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              <Button onClick={() => setStep(2)} className="w-full group">
                التالي
                <ArrowLeft size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">معلومات الاتصال</h2>
                  <p className="text-xs text-muted">كيف يتواصل معك العملاء</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 opacity-80">رقم الهاتف</label>
                <div className="flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                    className="w-28 rounded-lg border border-border bg-input-bg px-2 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-primary"
                  >
                    {countryCodes.map((cc) => (
                      <option key={cc.value} value={cc.value}>{cc.label}</option>
                    ))}
                  </select>
                  <div className="flex-1">
                    <Input
                      type="tel"
                      placeholder="5X XXX XXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <Input label="العنوان" placeholder="المدينة، الشارع" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">السابق</Button>
                <Button onClick={() => setStep(3)} className="flex-1 group">
                  التالي
                  <ArrowLeft size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Security */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Lock size={20} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">كلمة مرور الإدارة</h2>
                  <p className="text-xs text-muted">حماية المناطق الحساسة في النظام</p>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <p className="text-sm text-amber-600">
                  <strong>كلمة مرور الإدارة (PIN)</strong> - تستخدم للوصول إلى:
                </p>
                <ul className="text-xs text-amber-500 mt-2 space-y-1 list-disc list-inside">
                  <li>الإعدادات الحساسة للمتجر</li>
                  <li>التقارير المالية والأرباح</li>
                  <li>إدارة الرواتب والموظفين</li>
                  <li>الموافقة على المرتجعات والخصومات الكبيرة</li>
                </ul>
              </div>

              <Input
                label="كلمة مرور الإدارة (PIN)"
                type="password"
                placeholder="أدخل رقماً سرياً للمناطق المحمية"
                value={form.ownerPin}
                onChange={(e) => setForm({ ...form, ownerPin: e.target.value })}
                icon={<Lock size={18} />}
              />

              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center gap-2">
                <Sparkles size={14} />
                نظام ENJAZ حالياً في مرحلة Beta. التسجيل مجاني بالكامل مع حد يومي لاستخدام AI.
              </p>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">السابق</Button>
                <Button onClick={handleCreateStore} loading={loading} className="flex-1">
                  <Sparkles size={18} />
                  إنشاء المتجر
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out both; }
      `}</style>
    </div>
  )
}
