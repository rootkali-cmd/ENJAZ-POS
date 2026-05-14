"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTheme } from "@/components/layout/theme-provider"
import {
  ShoppingCart, Package, Users, BarChart3, Bot, Shield, ArrowLeft, CheckCircle,
  Sun, Moon, Menu, X,   Barcode, Printer, Camera, Scale,
  AlertTriangle, TrendingUp, UserCheck, DollarSign, Star,
  Target, Lock, FileText, Truck, Gift, Archive,
} from "lucide-react"

const PROBLEMS = [
  { icon: Package, title: "مخزون بيتناقص من غير تنبيه", desc: "مش عارف امتى المنتجات بتخلص؟ التنبيهات اليدوية بتتأخر والخسارة بتكبر." },
  { icon: FileText, title: "فواتير ومبيعات مش واضحة", desc: "الفواتير في ورق أو إكسل؟ مش عارف إجمالي مبيعات النهاردة بالظبط؟" },
  { icon: Users, title: "موظفين وصلاحيات بدون رقابة", desc: "أي موظف يشوف الأرباح والتكاليف؟ ولو حصل خطأ مين المسؤول؟" },
  { icon: BarChart3, title: "تقارير بتاخد وقت ومجهود", desc: "كل شهر تجمع فواتير وتحسب مصاريف وتقارن بالأرقام — فيه وقت أسهل." },
]

const SOLUTIONS = [
  { icon: ShoppingCart, title: "نقطة بيع متكاملة", desc: "واجهة كاشير سريعة مع دعم الباركود والطابعة الحرارية وطرق دفع متعددة.", href: "#" },
  { icon: Package, title: "إدارة المنتجات والمخزون", desc: "تتبّع المخزون لحظة بلحظة مع تنبيهات تلقائية عند نفاد الكمية أو انخفاضها.", href: "#" },
  { icon: Truck, title: "العملاء والموردين", desc: "سجل كامل للعملاء والموردين مع المديونيات وسجل المشتريات والمبيعات.", href: "#" },
  { icon: Users, title: "الموظفين والرواتب والحوافز", desc: "صلاحيات دقيقة لكل موظف، تتبع أداء المبيعات، العمولات والرواتب.", href: "#" },
  { icon: BarChart3, title: "التقارير والتحليلات", desc: "تقارير مبيعات وأرباح ومصروفات مع رسوم بيانية تفاعلية قابلة للتصدير.", href: "#" },
  { icon: Bot, title: "AI Agent للرؤى التشغيلية", desc: "مساعد ذكي يحلل بيانات متجرك ويقدم تنبيهات ومهام مقترحة.", href: "#" },
]

const DEVICES = [
  { icon: Barcode, name: "قارئ الباركود", note: "يدعم أجهزة HID/Keyboard wedge" },
  { icon: Printer, name: "طابعة الفواتير 58mm / 80mm", note: "طباعة من المتصفح مباشر" },
  { icon: Printer, name: "طابعة ملصقات الباركود", note: "عبر متصفح أو Device Helper" },
  { icon: Archive, name: "درج الكاشير", note: "عبر Device Helper" },
  { icon: Camera, name: "الكاميرا و QR", note: "مسح QR عبر الكاميرا" },
  { icon: Scale, name: "الميزان الإلكتروني", note: "قريباً" },
]

const AI_EXAMPLES = [
  { icon: TrendingUp, text: "المبيعات أعلى من أمس بنسبة 18%" },
  { icon: AlertTriangle, text: "3 منتجات قربت تخلص من المخزون" },
  { icon: UserCheck, text: "5 عملاء مرشحين لإعادة الشراء" },
  { icon: Gift, text: "اقتراح: حملة خصم للمنتجات بطيئة الحركة" },
]

const SECURITY_POINTS = [
  { title: "حسابات وجلسات آمنة", desc: "جلسات مشفرة مع صلاحية محدودة وتجديد تلقائي." },
  { title: "صلاحيات موظفين", desc: "تحديد صلاحية كل موظف: بيع، مخزون، تقارير، إعدادات." },
  { title: "Owner PIN للمناطق الحساسة", desc: "حماية إضافية بالإعدادات والتقارير المالية." },
  { title: "Audit Logs للعمليات المهمة", desc: "سجل كامل لكل عملية: مين، إمتى، إيه." },
  { title: "بيانات كل متجر معزولة", desc: "فصل تام بين المتاجر — لا يطلع متجر على بيانات غيره." },
  { title: "اتصال بقاعدة البيانات عبر SSL", desc: "جميع البيانات مشفرة أثناء النقل والتخزين." },
]

const FAQS = [
  {
    q: "هل ENJAZ مجاني؟",
    a: "حالياً متاح كتجربة مجانية محدودة أثناء مرحلة Beta. بعد انتهاء المرحلة التجريبية، سيتم الإعلان عن سعر اشتراك واحد واضح يشمل جميع المميزات الأساسية.",
  },
  {
    q: "هل يعمل من المتصفح؟",
    a: "نعم، ENJAZ Web App يعمل من أي متصفح حديث على الكمبيوتر أو التابلت أو الجوال. لا يحتاج تثبيت برنامج في النسخة الحالية.",
  },
  {
    q: "هل يدعم الباركود؟",
    a: "نعم، يدعم قارئات الباركود التي تعمل ككيبورد (HID). ويوجد صفحة مخصصة لاختبار الأجهزة والتعرف عليها.",
  },
  {
    q: "هل يدعم طباعة الفواتير؟",
    a: "نعم، يدعم طباعة الفواتير الحرارية مباشرة من المتصفح. مع تجهيز لدعم طابعات ESC/POS بكامل الميزات لاحقاً عبر ENJAZ Device Helper.",
  },
  {
    q: "هل يعمل بدون إنترنت؟",
    a: "النسخة الحالية تحتاج اتصال إنترنت لأنها Web App. سيتم تحسين وضع الاتصال الضعيف ودعم المزامنة في التحديثات القادمة.",
  },
  {
    q: "هل يستطيع الموظف رؤية الأرباح والرواتب؟",
    a: "لا، المناطق الحساسة زي التقارير المالية وإعدادات المتجر وبيانات الموظفين محمية بصلاحيات دقيقة وOwner PIN.",
  },
  {
    q: "هل AI ينفذ إجراءات تلقائياً؟",
    a: "لا. AI Agent يقدم رؤى واقتراحات فقط بناءً على تحليل بيانات متجرك. أي إجراء تنفيذي يحتاج موافقتك ودخولك بصلاحيات كافية.",
  },
]

const PLANS = [
  "نقطة البيع",
  "إدارة المخزون",
  "المنتجات",
  "العملاء والموردين",
  "الموظفين والرواتب",
  "التقارير",
  "AI Agent محدود",
  "مركز الأجهزة",
]

const NAV_LINKS = [
  { href: "#features", label: "المميزات" },
  { href: "#hardware", label: "الأجهزة" },
  { href: "#ai-agent", label: "AI Agent" },
  { href: "#security", label: "الأمان" },
  { href: "#faq", label: "الأسئلة الشائعة" },
]

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
}

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
}

export default function LandingPage() {
  const [menu, setMenu] = useState(false)
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ===== Navbar ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <img src="/brand/enjaz-icon.png" alt="ENJAZ" className="w-12 h-12 object-contain" />
              <span className="font-bold text-xl">ENJAZ</span>
            </Link>

            <div className="hidden md:flex items-center justify-center flex-1 gap-6">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <button onClick={toggle} className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-all" aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">تسجيل الدخول</Link>
              <Link href="/register" className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
                ابدأ مجاناً
              </Link>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button onClick={toggle} className="p-2 rounded-lg text-muted hover:text-foreground transition-colors" aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setMenu(!menu)} className="p-2 text-muted">
                {menu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {menu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-4 space-y-1 border-t border-border pt-3"
            >
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenu(false)} className="block text-sm py-2 text-muted hover:text-foreground transition-colors">
                  {link.label}
                </a>
              ))}
              <Link href="/login" onClick={() => setMenu(false)} className="block text-sm py-2 text-muted hover:text-foreground transition-colors">تسجيل الدخول</Link>
              <Link href="/register" onClick={() => setMenu(false)} className="block text-sm py-2 text-primary font-semibold">ابدأ مجاناً</Link>
            </motion.div>
          )}
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <motion.div className="text-center max-w-4xl mx-auto relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-center mx-auto mb-8 w-20 h-20 rounded-2xl bg-card border border-border shadow-sm">
            <img src="/brand/enjaz-icon.png" alt="ENJAZ" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            منصة عربية لإدارة{" "}
            <span className="text-primary">متجرك بالكامل</span>
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            نقطة بيع، مخزون، موظفين، فواتير، تقارير، وذكاء تشغيلي في مكان واحد — بتصميم عربي سهل وبدون تعقيد.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="px-8 py-3 rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/25 inline-flex items-center gap-2">
              ابدأ تجربة مجانية <ArrowLeft size={16} />
            </Link>
            <a href="#preview" className="px-8 py-3 rounded-xl border border-border text-base text-muted hover:text-foreground hover:border-primary/30 transition-colors">
              شاهد كيف يعمل
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 mt-10">
            {["بدون بطاقة دفع", "مناسب للمحلات الصغيرة والمتوسطة", "يدعم الباركود والطباعة", "نسخة تجريبية مجانية"].map((text) => (
              <span key={text} className="flex items-center gap-1.5 text-sm text-muted">
                <CheckCircle size={14} className="text-success shrink-0" />
                {text}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== Problem ===== */}
      <motion.section {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">بتدير متجرك بإكسل أو دفتر؟</h2>
            <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
              المبيعات، المخزون، الموظفين، المرتجعات، والرواتب لما يبقوا متفرقين في أكتر من مكان، القرارات بتتأخر والأخطاء بتزيد.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROBLEMS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="border border-border rounded-xl p-5 hover:bg-card-hover hover:border-danger/20 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-danger/10 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-danger" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">{p.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ===== Solution / Features ===== */}
      <motion.section id="features" {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">ENJAZ يجمع كل شغل متجرك في نظام واحد</h2>
            <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
              أدوات متكاملة — من البيع للمخزون للموظفين والتقارير — في لوحة تحكم واحدة.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOLUTIONS.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="group border border-border rounded-xl p-5 hover:bg-card-hover hover:border-primary/20 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ===== Product Preview ===== */}
      <motion.section id="preview" {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">شوف ENJAZ قبل ما تبدأ</h2>
            <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
              واجهة بسيطة للكاشير، ولوحة تحكم واضحة لصاحب المتجر، وتقارير تساعدك تاخد قرار أسرع.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { img: "/screenshots/pos.png", title: "نقطة البيع (POS)", desc: "واجهة كاشير سريعة مع بحث وباركود وسلة مشتريات وطرق دفع متعددة." },
              { img: "/screenshots/dashboard.png", title: "لوحة التحكم (Dashboard)", desc: "نظرة عامة على المبيعات اليومية والمخزون والأرباح في لمحة." },
              { img: "/screenshots/ai-agent.png", title: "AI Agent", desc: "تحليلات ورؤى تشغيلية ذكية عن متجرك باقتراحات وتنبيهات." },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="border border-border rounded-xl overflow-hidden hover:border-primary/20 transition-all group"
              >
                <div className="bg-card-hover/50 flex items-center justify-center min-h-[240px] border-b border-border relative overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  <a
                    href="/register"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-semibold hover:underline"
                  >
                    جرّب الآن <ArrowLeft size={13} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ===== Hardware Support ===== */}
      <motion.section id="hardware" {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">جاهز لأجهزة المتجر</h2>
            <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
              ENJAZ مصمم لدعم أجهزة نقطة البيع الأساسية، مع خطة للتوسع عبر مركز الأجهزة و ENJAZ Device Helper.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {DEVICES.map((d, i) => {
              const Icon = d.icon
              return (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="border border-border rounded-xl p-4 text-center hover:bg-card-hover hover:border-primary/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{d.name}</h3>
                  <p className="text-xs text-muted">{d.note}</p>
                </motion.div>
              )
            })}
          </div>
          <p className="text-sm text-muted text-center mt-8 max-w-xl mx-auto leading-relaxed">
            بعض الأجهزة المتقدمة قد تحتاج <strong className="text-foreground">ENJAZ Device Helper</strong> للتحكم الكامل. يدعم ما يمكن دعمه من المتصفح، ويجهز للتكامل المتقدم لاحقاً.
          </p>
        </div>
      </motion.section>

      {/* ===== AI Agent ===== */}
      <motion.section id="ai-agent" {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">AI Agent مش شات بوت... ده مساعد تشغيلي</h2>
            <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
              بدل ما تسأل الذكاء الاصطناعي، ENJAZ يحلل بيانات متجرك ويعرض لك رؤى وتنبيهات ومهام مقترحة.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {AI_EXAMPLES.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-3 border border-border rounded-xl p-4 hover:bg-card-hover hover:border-primary/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              )
            })}
          </div>
          <p className="text-sm text-muted text-center mt-8 max-w-xl mx-auto leading-relaxed border border-border rounded-xl p-4">
            الـ AI يقدّم اقتراحات فقط، ولا ينفّذ أي إجراء بدون موافقتك وصلاحياتك.
          </p>
        </div>
      </motion.section>

      {/* ===== Security ===== */}
      <motion.section id="security" {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">بيانات متجرك محمية</h2>
            <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
              كل متجر له بياناته المنفصلة، ويتم تحديد المتجر من الخادم وليس من المتصفح. العمليات الحساسة محمية بصلاحيات و Owner PIN.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY_POINTS.map((s, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="border border-border rounded-xl p-5 hover:bg-card-hover transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-success shrink-0" />
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed pr-7">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-muted text-center mt-8 max-w-xl mx-auto leading-relaxed">
            مصمم بمعايير أمان عملية تناسب أنظمة SaaS.
          </p>
        </div>
      </motion.section>

      {/* ===== Beta Pricing ===== */}
      <motion.section {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">النسخة التجريبية مجانية</h2>
            <p className="text-base text-muted leading-relaxed">
              نبحث عن عدد محدود من أصحاب المتاجر لتجربة ENJAZ مجاناً مقابل الملاحظات وتحسين النظام.
            </p>
          </div>
          <div className="border border-primary/20 rounded-2xl p-8 bg-gradient-to-b from-primary/[0.03] to-transparent">
            <div className="text-center mb-6">
              <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">Private Beta</span>
              <h3 className="text-3xl font-bold mb-1">مجاني مؤقتاً</h3>
              <p className="text-sm text-muted">اشترك الآن — الدفع لاحقاً</p>
            </div>
            <ul className="space-y-3 mb-6">
              {PLANS.map((plan, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle size={16} className="text-success shrink-0" />
                  {plan}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full text-center px-5 py-3 rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              انضم للتجربة المجانية
            </Link>
            <p className="text-xs text-muted text-center mt-4">
              بعد انتهاء المرحلة التجريبية سيتم الإعلان عن سعر اشتراك واحد واضح يشمل المميزات الأساسية.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ===== Beta Trust ===== */}
      <motion.section {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">نطوره مع أصحاب المحلات الحقيقيين</h2>
            <p className="text-base text-muted leading-relaxed">
              نستقبل حاليًا ملاحظات أصحاب المتاجر لتحسين النظام قبل الإطلاق الرسمي. هدفنا بناء نظام عملي يناسب السوق العربي.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Target, title: "نسخة تجريبية", desc: "مطلوب 3 متاجر للتجربة" },
              { icon: Star, title: "مجاني بالكامل", desc: "تجربة مجانية بدون التزام" },
              { icon: Users, title: "ملاحظاتك تهمنا", desc: "تساعد في تطوير المنتج" },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="border border-border rounded-xl p-5 text-center hover:bg-card-hover transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={19} className="text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ===== FAQ ===== */}
      <motion.section id="faq" {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">الأسئلة الشائعة</h2>
            <p className="text-base text-muted max-w-xl mx-auto">
              إجابات سريعة لأكثر الأسئلة تكراراً عن ENJAZ.
            </p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="group border border-border rounded-xl overflow-hidden transition-colors hover:border-primary/20">
                <summary className="px-5 py-4 cursor-pointer text-sm font-semibold flex items-center justify-between gap-3 hover:bg-card-hover transition-colors select-none marker:hidden">
                  <span>{faq.q}</span>
                  <svg className="w-4 h-4 shrink-0 text-muted transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-muted leading-relaxed border-t border-border pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ===== Final CTA ===== */}
      <motion.section {...fadeUp} className="px-4 pb-24" dir="rtl">
        <div className="max-w-lg mx-auto border border-border rounded-xl p-8 text-center bg-gradient-to-b from-primary/[0.03] to-transparent">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">جاهز تجرب ENJAZ على متجرك؟</h3>
          <p className="text-sm text-muted mb-6 max-w-sm mx-auto leading-relaxed">
            ابدأ بحساب مجاني، أضف منتجاتك، وجرب نقطة البيع والمخزون والتقارير.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            ابدأ تجربة مجانية <ArrowLeft size={16} />
          </Link>
        </div>
      </motion.section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/brand/enjaz-icon.png" alt="ENJAZ" className="w-10 h-10 object-contain" />
                <span className="font-bold text-base">ENJAZ</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">منصة عربية لإدارة وتشغيل المتاجر — نقطة بيع، مخزون، موظفين، تقارير، و AI Agent.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">ENJAZ</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">الرئيسية</Link></li>
                <li><Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="text-sm text-muted hover:text-foreground transition-colors">إنشاء حساب</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">المميزات</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted hover:text-foreground transition-colors">نقطة البيع</a></li>
                <li><a href="#features" className="text-sm text-muted hover:text-foreground transition-colors">إدارة المنتجات</a></li>
                <li><a href="#features" className="text-sm text-muted hover:text-foreground transition-colors">التقارير</a></li>
                <li><a href="#ai-agent" className="text-sm text-muted hover:text-foreground transition-colors">AI Agent</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">الدعم</h4>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-sm text-muted hover:text-foreground transition-colors">الأسئلة الشائعة</Link></li>
                <li><Link href="/contact" className="text-sm text-muted hover:text-foreground transition-colors">تواصل معنا</Link></li>
                <li><Link href="/terms" className="text-sm text-muted hover:text-foreground transition-colors">الشروط والأحكام</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted hover:text-foreground transition-colors">سياسة الخصوصية</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted text-center sm:text-right">
              © {new Date().getFullYear()} ENJAZ. كل الحقوق محفوظة. |{" "}
              <a href="mailto:support@enjaz.one" className="hover:text-foreground transition-colors">support@enjaz.one</a>
            </p>
            <p className="text-xs text-muted">
              مصمم في مصر
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
