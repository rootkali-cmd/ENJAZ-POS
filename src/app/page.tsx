"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "@/components/layout/theme-provider"
import { Store, ArrowLeft, ShoppingCart, Package, BarChart3, Users, Shield, Bot, Sun, Moon, Star } from "lucide-react"

const FEATURES = [
  { icon: ShoppingCart, title: "نقطة بيع متكاملة", desc: "واجهة كاشير سريعة مع دعم الباركود والطابعة الحرارية وطرق دفع متعددة." },
  { icon: Package, title: "إدارة المخزون", desc: "تتبّع المخزون لحظة بلحظة مع تنبيهات تلقائية عند نفاد الكمية أو انخفاضها." },
  { icon: Users, title: "الموظفين والصلاحيات", desc: "صلاحيات دقيقة لكل موظف، تتبع أداء المبيعات، والعمولات والرواتب." },
  { icon: BarChart3, title: "تقارير وتحليلات", desc: "تقارير مبيعات وأرباح ومصروفات مع رسوم بيانية تفاعلية وقابلة للتصدير." },
  { icon: Bot, title: "AI Agent ذكي", desc: "مساعد ذكي لمتجرك. حلّل مبيعاتك، راجع المخزون، واحصل على اقتراحات." },
  { icon: Shield, title: "آمن ومحمي", desc: "نظام PIN للمناطق الحساسة، صلاحيات متعددة، وسجل أحداث كامل." },
]

const FOOTER_LINKS = {
  "ENJAZ": [
    { href: "/", label: "الرئيسية" },
    { href: "/login", label: "تسجيل الدخول" },
    { href: "/register", label: "إنشاء حساب" },
  ],
  "المميزات": [
    { href: "/pos", label: "نقطة البيع" },
    { href: "/products", label: "إدارة المنتجات" },
    { href: "/reports", label: "التقارير" },
    { href: "/ai-agent", label: "AI Agent" },
  ],
  "الدعم": [
    { href: "#", label: "الأسئلة الشائعة" },
    { href: "#", label: "تواصل معنا" },
    { href: "#", label: "الشروط والأحكام" },
    { href: "#", label: "سياسة الخصوصية" },
  ],
}

export default function LandingPage() {
  const [menu, setMenu] = useState(false)
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/brand/enjaz-icon.png" alt="ENJAZ" className="w-10 h-10 object-contain" />
            <span className="font-bold text-lg">ENJAZ</span>
          </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-xs text-muted hover:text-foreground transition-colors">المميزات</a>
              <Link href="/login" className="text-xs text-muted hover:text-foreground transition-colors">تسجيل الدخول</Link>
              <Link href="/register" className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors">ابدأ مجاناً</Link>
              <button onClick={toggle} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-all" aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={toggle} className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors" aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button onClick={() => setMenu(!menu)} className="p-1.5">
                <div className="w-4 h-0.5 bg-foreground mb-1" />
                <div className="w-4 h-0.5 bg-foreground mb-1" />
                <div className="w-4 h-0.5 bg-foreground" />
              </button>
            </div>
          </div>
          {menu && (
            <div className="md:hidden pb-3 space-y-2 border-t border-border pt-2">
              <a href="#features" onClick={() => setMenu(false)} className="block text-xs py-1.5">المميزات</a>
              <Link href="/login" onClick={() => setMenu(false)} className="block text-xs py-1.5">تسجيل الدخول</Link>
              <Link href="/register" onClick={() => setMenu(false)} className="block text-xs py-1.5 text-primary font-medium">ابدأ مجاناً</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center mx-auto mb-6 w-16 h-16 rounded-2xl bg-card border border-border shadow-sm">
            <img src="/brand/enjaz-icon.png" alt="ENJAZ" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3">
            منصة عربية لإدارة{" "}
            <span className="text-primary">متجرك بالكامل</span>
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-xl mx-auto mb-7 leading-relaxed">
            ENJAZ هي منصة متكاملة تدير بها متجرك — من المبيعات والمخزون للموظفين والتقارير.
            كل حاجة في مكان واحد، بتصميم عربي وبدون تعقيد.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors inline-flex items-center gap-1.5">
              ابدأ مجاناً <ArrowLeft size={14} />
            </Link>
            <Link href="/login" className="px-6 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-colors">تسجيل الدخول</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 pb-20" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold mb-1.5">ماذا توفر ENJAZ؟</h2>
            <p className="text-sm text-muted">أدوات متكاملة لإدارة وتشغيل متجرك بكل سهولة</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="border border-border rounded-xl p-4 hover:bg-card-hover transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon size={17} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
                </div>
              )
            })}

            <div className="border border-dashed border-border rounded-xl p-4 flex items-center justify-center bg-card-hover/30 sm:col-span-2 lg:col-span-3">
              <p className="text-xs text-muted text-center">
                والمزيد من المميزات قيد التطوير — تقارير متقدمة، فواتير إلكترونية، تكامل مع منصات التوصيل، وتطبيق جوال قريباً.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="max-w-lg mx-auto border border-border rounded-xl p-6 text-center">
          <h3 className="text-sm font-bold mb-1.5">ابدأ الآن مجاناً</h3>
          <p className="text-xs text-muted mb-4">أنشئ حسابك خلال دقيقة وابدأ بإدارة متجرك.</p>
          <Link href="/register" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors">
            إنشاء حساب مجاني <ArrowLeft size={13} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-semibold mb-2">{title}</h4>
                <ul className="space-y-1.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[11px] text-muted hover:text-foreground transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="text-xs font-semibold mb-2">التواصل</h4>
              <ul className="space-y-1.5">
                <li className="text-[11px] text-muted">contact@enjaz.one</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/brand/enjaz-icon.png" alt="ENJAZ" className="w-10 h-10 object-contain" />
              <span className="text-base font-semibold">ENJAZ</span>
            </div>
            <p className="text-[10px] text-muted">© {new Date().getFullYear()} ENJAZ. كل الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
