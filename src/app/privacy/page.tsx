import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "سياسة الخصوصية - ENJAZ",
  description: "سياسة الخصوصية لكيفية جمع واستخدام وحماية بياناتك في منصة ENJAZ",
}

const SECTIONS = [
  {
    title: "مقدمة",
    content: "نحن في ENJAZ نلتزم بحماية خصوصيتك وأمان بياناتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام منصتنا. باستخدامك للمنصة، فإنك توافق على الممارسات الموضحة في هذه السياسة.",
  },
  {
    title: "المعلومات التي نجمعها",
    points: [
      "معلومات الحساب: الاسم، البريد الإلكتروني، رقم الجوال، كلمة المرور (مشفرة بالكامل)",
      "بيانات المتجر: اسم المتجر، النشاط التجاري، العنوان، العملة",
      "بيانات المنتجات: أسماء المنتجات، الأسعار، الكميات، الباركود، الصور",
      "بيانات المبيعات: سجل الفواتير، طرق الدفع، العملاء، المرتجعات",
      "بيانات الموظفين: الأسماء، الصلاحيات، الرواتب، سجل الأداء",
      "المعلومات التقنية: نوع الجهاز، المتصفح، نظام التشغيل، عنوان IP (للأغراض الأمنية فقط)",
    ],
  },
  {
    title: "كيف نستخدم معلوماتك",
    points: [
      "تقديم خدمات المنصة: تشغيل نظام نقاط البيع، إدارة المخزون، التقارير",
      "تحسين الخدمة: تطوير الميزات وتحسين تجربة المستخدم بناءً على أنماط الاستخدام",
      "الدعم الفني: الرد على استفساراتك وحل المشكلات التقنية",
      "الإشعارات: إرسال تنبيهات المخزون والمبيعات والتحديثات",
      "الأمان: حماية حسابك من الاختراق واكتشاف الأنشطة المشبوهة",
    ],
  },
  {
    title: "مشاركة المعلومات",
    content: "نحن لا نبيع أو نؤجر معلوماتك الشخصية لأي طرف ثالث. قد نشارك معلوماتك في الحالات التالية فقط:",
    points: [
      "بموافقتك الصريحة",
      "لامتثال لأمر قضائي أو قانوني",
      "لحماية حقوقنا القانونية",
      "مع مزودي الخدمة الذين يساعدوننا في تشغيل المنصة (مثل CockroachDB) بموجب اتفاقيات سرية صارمة",
    ],
  },
  {
    title: "تشفير البيانات وأمانها",
    content: "نستخدم أحدث تقنيات الأمان لحماية بياناتك:",
    points: [
      "تشفير جميع البيانات أثناء النقل باستخدام SSL/TLS",
      "تشفير كلمات المرور باستخدام bcrypt مع ١٢ جولة (salt rounds)",
      "تشفير رموز الجلسات باستخدام SHA-256",
      "تخزين قاعدة البيانات على CockroachDB مع تشفير متقدم",
      "الفصل التام بين بيانات كل متجر (Multi-tenant Isolation)",
      "مراقبة مستمرة للأنشطة المشبوهة وتسجيل جميع الأحداث",
    ],
  },
  {
    title: "ملفات تعريف الارتباط (Cookies)",
    content: "نستخدم ملفات تعريف الارتباط الضرورية فقط لتشغيل المنصة:",
    points: [
      "ملف جلسة العمل (Session Cookie): للاحتفاظ بتسجيل الدخول",
      "ملف تفضيلات المظهر (Theme): لحفظ اختيارك للوضع الداكن أو الفاتح",
      "لا نستخدم ملفات تتبع إعلانية أو تسويقية",
    ],
  },
  {
    title: "حقوقك فيما يخص بياناتك",
    content: "لك كامل الحقوق التالية فيما يخص بياناتك الشخصية:",
    points: [
      "حق الوصول: يمكنك طلب نسخة من جميع بياناتك",
      "حق التصحيح: يمكنك تعديل أي معلومات غير دقيقة",
      "حق الحذف: يمكنك حذف حسابك وجميع بياناتك نهائياً عبر الإعدادات",
      "حق التصدير: يمكنك تصدير بياناتك بصيغ Excel و CSV",
      "حق الاعتراض: يمكنك الاعتراض على معالجة بياناتك لأغراض معينة",
    ],
  },
  {
    title: "الاحتفاظ بالبيانات",
    content: "نحتفظ ببياناتك طالما حسابك نشط. عند حذف حسابك، نحتفظ بنسخة احتياطية لمدة ٣٠ يوماً قبل الحذف النهائي. بعض البيانات قد تُحتفظ بها لمدة أطول لأغراض قانونية أو تنظيمية.",
  },
  {
    title: "أمان الأطفال",
    content: "خدماتنا ليست موجهة للأطفال تحت سن ١٨ عاماً. نحن لا نجمع عن قصد معلومات من أشخاص تحت هذا السن. إذا اكتشفنا أننا جمعنا معلومات عن طفل، سنقوم بحذفها فوراً.",
  },
  {
    title: "التعديلات على سياسة الخصوصية",
    content: "نحتفظ بالحق في تعديل سياسة الخصوصية في أي وقت. سنقوم بإشعار المستخدمين المسجلين بالتغييرات الجوهرية عبر البريد الإلكتروني. نشجعك على مراجعة هذه الصفحة دورياً.",
  },
  {
    title: "التواصل",
    content: "للاستفسارات المتعلقة بسياسة الخصوصية أو ممارسات التعامل مع البيانات، تواصل معنا على:",
    contact: true,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">ENJAZ</Link>
          <Link href="/" className="text-xs text-muted hover:text-foreground transition-colors">الرئيسية</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12" dir="rtl">
        <div className="text-center mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">سياسة الخصوصية</h1>
          <p className="text-xs text-muted">آخر تحديث: ١٥ مايو ٢٠٢٦</p>
        </div>

        <div className="border-t border-border pt-8 mt-8 space-y-8">
          {SECTIONS.map((section, i) => (
            <section key={i}>
              <h2 className="text-sm font-bold mb-2">
                {i + 1}. {section.title}
              </h2>
              {section.content && (
                <p className="text-xs text-muted leading-relaxed mb-3">{section.content}</p>
              )}
              {section.points && (
                <ul className="space-y-1.5 pr-4">
                  {section.points.map((point, j) => (
                    <li key={j} className="text-xs text-muted leading-relaxed list-disc list-inside pr-0">
                      {point}
                    </li>
                  ))}
                </ul>
              )}
              {section.contact && (
                <a
                  href="mailto:support@enjaz.one"
                  className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors"
                >
                  support@enjaz.one
                </a>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10 border border-border rounded-xl p-5 text-center">
          <p className="text-xs text-muted">
            خصوصيتك مسؤوليتنا. لأي استفسار، تواصل معنا على{" "}
            <a href="mailto:support@enjaz.one" className="text-primary hover:underline">support@enjaz.one</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        <div className="max-w-4xl mx-auto px-4">© {new Date().getFullYear()} ENJAZ. كل الحقوق محفوظة.</div>
      </footer>
    </div>
  )
}
